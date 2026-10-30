"""
CIVISENSE Centralized Explainable Risk Engine
Decision-Support Scoring Engine for Urban Waterlogging & Drainage Risk

Illustrative Weighted Formula:
    Risk = 0.5 * RainfallRisk + 0.3 * DrainageRisk + 0.2 * TerrainRisk

Thresholds:
    - Critical: >= 80.0
    - High:     >= 60.0 and < 80.0
    - Medium:   >= 35.0 and < 60.0
    - Low:      < 35.0

All inputs are scaled between 0 and 100.
Higher DrainageRisk means greater drainage-related risk (e.g. choked/compromised drain throughput).
Higher TerrainRisk means greater topographical pooling hazard (e.g. low-lying sink bowl).
Higher RainfallRisk means greater precipitation stress.
NOTE: This is a rule-based multi-criteria weighted calculation for decision support,
NOT a machine learning model.
"""

def calculate_risk_score(rainfall_risk: float, drainage_risk: float, terrain_risk: float) -> dict:
    """
    Centralized, testable calculation:
    Risk = 0.5 * RainfallRisk + 0.3 * DrainageRisk + 0.2 * TerrainRisk
    """
    # Clamp inputs strictly between 0.0 and 100.0
    rain = max(0.0, min(100.0, float(rainfall_risk)))
    drain = max(0.0, min(100.0, float(drainage_risk)))
    terrain = max(0.0, min(100.0, float(terrain_risk)))
    
    # Calculate weighted contributions
    rain_weight = 0.5
    drain_weight = 0.3
    terrain_weight = 0.2
    
    rain_contrib = round(rain * rain_weight, 2)
    drain_contrib = round(drain * drain_weight, 2)
    terrain_contrib = round(terrain * terrain_weight, 2)
    
    final_score = round(rain_contrib + drain_contrib + terrain_contrib, 1)
    # Ensure final score stays within [0.0, 100.0]
    final_score = max(0.0, min(100.0, final_score))
    
    # Consistent risk thresholds
    if final_score >= 80.0:
        category = "Critical"
        priority_label = "P1 - Immediate Intervention"
    elif final_score >= 60.0:
        category = "High"
        priority_label = "P2 - High Priority"
    elif final_score >= 35.0:
        category = "Medium"
        priority_label = "P3 - Moderate Watch"
    else:
        category = "Low"
        priority_label = "P4 - Low / Routine"
        
    # Contributing factors breakdown
    factors = [
        {
            "name": "Rainfall Risk",
            "key": "rainfall_risk",
            "input_value": rain,
            "weight": rain_weight,
            "weight_pct": int(rain_weight * 100),
            "contribution": rain_contrib,
            "role": "Precipitation influx volume (50% formula weight)."
        },
        {
            "name": "Drainage Risk",
            "key": "drainage_risk",
            "input_value": drain,
            "weight": drain_weight,
            "weight_pct": int(drain_weight * 100),
            "contribution": drain_contrib,
            "role": "Drainage deficit, silt choke & inadequate conduit conveyance (30% formula weight)."
        },
        {
            "name": "Terrain Risk",
            "key": "terrain_risk",
            "input_value": terrain,
            "weight": terrain_weight,
            "weight_pct": int(terrain_weight * 100),
            "contribution": terrain_contrib,
            "role": "Elevation depression, natural slope ponding & runoff sink tendency (20% formula weight)."
        }
    ]
    # Sort factors by highest contribution
    factors.sort(key=lambda x: x["contribution"], reverse=True)
    
    # Synthesize plain-language explanation of primary risk drivers
    top_factor = factors[0]
    second_factor = factors[1]
    
    explanation_parts = []
    if rain >= 70.0:
        explanation_parts.append(f"intense rainfall stress ({rain}/100)")
    elif rain >= 40.0:
        explanation_parts.append(f"moderate precipitation ({rain}/100)")
        
    if drain >= 70.0:
        explanation_parts.append(f"severe drainage impairment ({drain}/100)")
    elif drain >= 40.0:
        explanation_parts.append(f"moderate drain conveyance deficit ({drain}/100)")
        
    if terrain >= 70.0:
        explanation_parts.append(f"low-lying basin topography ({terrain}/100)")
    elif terrain >= 40.0:
        explanation_parts.append(f"mild terrain depression ({terrain}/100)")
        
    if not explanation_parts:
        explanation_parts.append("favorable drainage slope and nominal rainfall conditions")
        
    civisense_explanation = (
        f"Zone evaluated at {final_score}% ({category} Risk). "
        f"Primary risk drivers: {', '.join(explanation_parts)}. "
        f"Highest weighted contributor is {top_factor['name']} adding +{top_factor['contribution']} points."
    )
    
    # Recommended preventive & inspection measures (without claiming automated dispatch)
    if category == "Critical":
        if drain >= 65.0:
            rec_action = "Urgent culvert inspection & mechanical desilting; pre-position standby mobile suction units."
            rec_reason = "Drainage conveyance is severely impaired (DrainageRisk >= 65), risking rapid road underpass inundation."
        elif terrain >= 65.0:
            rec_action = "Inspect low-lying highway underpasses; erect water-depth warning signage & prepare traffic diversions."
            rec_reason = "Depression basin topography funnels runoff directly onto roadway surfaces."
        else:
            rec_action = "Intensify real-time rain gauge observation & alert municipal field teams for active pumping."
            rec_reason = "Precipitation volume overwhelms normal stormwater conduits."
    elif category == "High":
        if drain >= 50.0:
            rec_action = "Inspect primary storm conduit grates and clear surface debris bottlenecks."
            rec_reason = "Moderate-to-high drainage choke will throttle water evacuation during sustained rain."
        else:
            rec_action = "Monitor water levels along transit corridors and verify drainage outfall readiness."
            rec_reason = "Combined rainfall and slope accumulation poses potential road ponding."
    elif category == "Medium":
        rec_action = "Routine catchment inspection and verify roadside storm drain inlets are unobstructed."
        rec_reason = "Moderate risk margin allows preventive maintenance to avoid escalation."
    else:
        rec_action = "Standard periodic maintenance; baseline drainage capacity is operating within safe design limits."
        rec_reason = "Zone maintains favorable terrain slope and adequate drainage conveyance."
        
    # Projected waterlogging depth in cm (illustrative decision support metric)
    predicted_depth_cm = round(max(0.0, (final_score - 20.0) * 0.75), 1)
    time_to_peak_mins = int(max(15, round(120.0 - (final_score * 0.9))))
    
    return {
        "final_risk_score": final_score,
        "risk_percentage": final_score,     # Consistent alias
        "risk_category": category,
        "priority_level": priority_label,
        "inputs": {
            "rainfall_risk": rain,
            "drainage_risk": drain,
            "terrain_risk": terrain
        },
        "weights": {
            "rainfall_weight": rain_weight,
            "drainage_weight": drain_weight,
            "terrain_weight": terrain_weight
        },
        "contributions": {
            "rainfall_contribution": rain_contrib,
            "drainage_contribution": drain_contrib,
            "terrain_contribution": terrain_contrib
        },
        "contributing_factors": factors,
        "explanation": civisense_explanation,
        "recommended_action": rec_action,
        "action_rationale": rec_reason,
        "predicted_depth_cm": predicted_depth_cm,
        "time_to_peak_mins": time_to_peak_mins,
        "methodology": "Explainable Weighted Decision Support Formula: 0.5*RainfallRisk + 0.3*DrainageRisk + 0.2*TerrainRisk"
    }

class RiskEngine:
    """Centralized singleton risk engine wrapper"""
    def __init__(self):
        self.formula_str = "Risk = 0.5 * RainfallRisk + 0.3 * DrainageRisk + 0.2 * TerrainRisk"
        
    def evaluate(self, rainfall_risk, drainage_risk, terrain_risk):
        return calculate_risk_score(rainfall_risk, drainage_risk, terrain_risk)
        
    def evaluate_zone(self, zone_dict):
        """
        Accepts zone record and extracts or maps the 3 core risk inputs:
        - rainfall_risk
        - drainage_risk
        - terrain_risk
        """
        # If rainfall_risk not explicitly present, compute from rainfall_mm_hr:
        if "rainfall_risk" in zone_dict:
            r_risk = float(zone_dict["rainfall_risk"])
        elif "rainfall_mm_hr" in zone_dict:
            r_risk = min(100.0, max(0.0, (float(zone_dict["rainfall_mm_hr"]) / 75.0) * 100.0))
        else:
            r_risk = 50.0
            
        # Higher DrainageRisk means greater drainage-related risk:
        if "drainage_risk" in zone_dict:
            d_risk = float(zone_dict["drainage_risk"])
        elif "drainage_capacity_pct" in zone_dict:
            # Lower capacity = higher risk
            cap = float(zone_dict.get("drainage_capacity_pct", 60.0))
            silt = float(zone_dict.get("drainage_siltation_pct", 25.0))
            eff_cap = cap * (1.0 - (silt / 150.0))
            d_risk = min(100.0, max(0.0, 100.0 - eff_cap))
        else:
            d_risk = 45.0
            
        # Higher TerrainRisk means greater pooling / depression hazard:
        if "terrain_risk" in zone_dict:
            t_risk = float(zone_dict["terrain_risk"])
        elif "elevation_depression_m" in zone_dict:
            dep = float(zone_dict.get("elevation_depression_m", 0.0))
            # Negative depression = sink bowl = high terrain risk
            if dep < 0:
                t_risk = min(100.0, 45.0 + abs(dep) * 12.0)
            else:
                t_risk = max(10.0, 45.0 - dep * 6.0)
        else:
            t_risk = 40.0
            
        return calculate_risk_score(r_risk, d_risk, t_risk)

risk_engine = RiskEngine()

