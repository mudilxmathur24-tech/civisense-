"""
CIVISENSE Risk Engine Compatibility Wrapper
Preserves interface for existing routes while routing all calculations through
the centralized, testable formula:
    Risk = 0.5 * RainfallRisk + 0.3 * DrainageRisk + 0.2 * TerrainRisk
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from risk_engine import risk_engine, calculate_risk_score

RISK_LABELS = ["Low", "Medium", "High", "Critical"]

FEATURE_NAMES = [
    "rainfall_risk",
    "drainage_risk",
    "terrain_risk"
]

class CivisenseMLEngineWrapper:
    def __init__(self):
        self.formula = "Risk = 0.5 * RainfallRisk + 0.3 * DrainageRisk + 0.2 * TerrainRisk"
        self.metrics = {
            "validation_method": "Centralized Deterministic Risk Weighting",
            "model_type": "Multi-Criteria Decision Support Formula (0.5 Rainfall + 0.3 Drainage + 0.2 Terrain)",
            "transparency": "Deterministic, transparent, rule-based; not an unverified black-box model",
            "weights": {"rainfall": 0.5, "drainage": 0.3, "terrain": 0.2},
            "synthetic_disclaimer": "All baseline zone ratings and sensor figures are illustrative synthetic demo data."
        }
        
    def predict(self, input_dict):
        """
        Calculates risk using the centralized formula:
        Risk = 0.5 * RainfallRisk + 0.3 * DrainageRisk + 0.2 * TerrainRisk
        """
        # Determine rainfall_risk (0-100)
        if "rainfall_risk" in input_dict:
            rain_risk = float(input_dict["rainfall_risk"])
        elif "rainfall_mm_hr" in input_dict:
            rain_risk = min(100.0, max(0.0, (float(input_dict["rainfall_mm_hr"]) / 75.0) * 100.0))
        else:
            rain_risk = 50.0
            
        # Determine drainage_risk (0-100) - Higher DrainageRisk means greater risk
        if "drainage_risk" in input_dict:
            drain_risk = float(input_dict["drainage_risk"])
        elif "drainage_capacity_pct" in input_dict:
            cap = float(input_dict.get("drainage_capacity_pct", 60.0))
            silt = float(input_dict.get("drainage_siltation_pct", 25.0))
            eff_cap = cap * (1.0 - (silt / 150.0))
            drain_risk = min(100.0, max(0.0, 100.0 - eff_cap))
        else:
            drain_risk = 45.0
            
        # Determine terrain_risk (0-100) - Higher TerrainRisk means greater pooling hazard
        if "terrain_risk" in input_dict:
            terrain_risk = float(input_dict["terrain_risk"])
        elif "elevation_depression_m" in input_dict:
            dep = float(input_dict.get("elevation_depression_m", 0.0))
            if dep < 0:
                terrain_risk = min(100.0, 45.0 + abs(dep) * 12.0)
            else:
                terrain_risk = max(10.0, 45.0 - dep * 6.0)
        else:
            terrain_risk = 40.0
            
        res = calculate_risk_score(rain_risk, drain_risk, terrain_risk)
        
        # Provide compatible fields for all frontend views
        return {
            "risk_percentage": res["final_risk_score"],
            "risk_index": res["final_risk_score"],
            "final_risk_score": res["final_risk_score"],
            "risk_category": res["risk_category"],
            "risk_level": res["risk_category"],
            "priority_level": res["priority_level"],
            "predicted_depth_cm": res["predicted_depth_cm"],
            "time_to_peak_mins": res["time_to_peak_mins"],
            "recommended_action": res["recommended_action"],
            "action_rationale": res["action_rationale"],
            "contributing_factors": res["contributing_factors"],
            "feature_attributions": [
                {
                    "factor": f["name"],
                    "attribution_pct": f["weight_pct"],
                    "contribution": f["contribution"],
                    "direction": "Risk Escalator" if f["input_value"] >= 50 else "Protective Buffer"
                }
                for f in res["contributing_factors"]
            ],
            "inputs": res["inputs"],
            "weights": res["weights"],
            "contributions": res["contributions"],
            "explanation": res["explanation"]
        }

ml_engine = CivisenseMLEngineWrapper()
