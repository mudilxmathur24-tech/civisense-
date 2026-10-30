from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional, List
from risk_engine import calculate_risk_score

router = APIRouter(prefix="/api/predict", tags=["Risk Engine Prediction"])

class PredictionInput(BaseModel):
    # Direct formula inputs (0 to 100)
    rainfall_risk: Optional[float] = Field(None, description="Direct rainfall risk index (0 to 100)", ge=0.0, le=100.0)
    drainage_risk: Optional[float] = Field(None, description="Direct drainage risk index (0 to 100)", ge=0.0, le=100.0)
    terrain_risk: Optional[float] = Field(None, description="Direct terrain pooling risk index (0 to 100)", ge=0.0, le=100.0)
    
    # Conventional municipal parameter inputs (mapped into 0 to 100)
    rainfall_intensity: Optional[float] = Field(None, description="Rainfall intensity in mm/hr", ge=0.0, le=250.0)
    rainfall_mm_hr: Optional[float] = Field(None, description="Alias for rainfall intensity", ge=0.0, le=250.0)
    drainage_capacity_pct: Optional[float] = Field(None, description="Drainage capacity (100% = clear, 0% = blocked)", ge=0.0, le=100.0)
    traffic_congestion_pct: Optional[float] = Field(None, description="Traffic congestion %", ge=0.0, le=100.0)
    elevation_m: Optional[float] = Field(None, description="Elevation in meters", ge=0.0, le=4000.0)
    public_complaints_count: Optional[int] = Field(None, description="Public citizen complaints / distress reports", ge=0, le=100)
    zone_name: Optional[str] = Field("Gharuan–Kharar Pilot Zone", description="Zone identifier")

@router.post("")
def run_prediction(data: PredictionInput):
    # Determine rainfall_risk (0 to 100)
    if data.rainfall_risk is not None:
        rain_risk = data.rainfall_risk
    elif data.rainfall_intensity is not None:
        rain_risk = min(100.0, max(0.0, (data.rainfall_intensity / 80.0) * 100.0))
    elif data.rainfall_mm_hr is not None:
        rain_risk = min(100.0, max(0.0, (data.rainfall_mm_hr / 80.0) * 100.0))
    else:
        rain_risk = 60.0
        
    # Determine drainage_risk (0 to 100): Higher DrainageRisk means greater drainage-related risk
    if data.drainage_risk is not None:
        drain_risk = data.drainage_risk
    elif data.drainage_capacity_pct is not None:
        # Invert capacity: 100% capacity = 0% risk, 0% capacity = 100% risk
        drain_risk = 100.0 - data.drainage_capacity_pct
        if data.traffic_congestion_pct is not None and data.traffic_congestion_pct > 60:
            drain_risk = min(100.0, drain_risk + (data.traffic_congestion_pct - 60) * 0.25)
    else:
        drain_risk = 50.0
        
    # Determine terrain_risk (0 to 100): Higher TerrainRisk means greater pooling hazard
    if data.terrain_risk is not None:
        ter_risk = data.terrain_risk
    elif data.elevation_m is not None:
        # Kharar-Gharuan baseline elevation is ~305m. Lower elevation = higher pooling risk
        if data.elevation_m < 300.0:
            ter_risk = min(100.0, 60.0 + (300.0 - data.elevation_m) * 4.0)
        elif data.elevation_m < 312.0:
            ter_risk = max(15.0, 60.0 - (data.elevation_m - 300.0) * 3.5)
        else:
            ter_risk = 15.0
    else:
        ter_risk = 40.0
        
    # Public complaints modifier: increases risk slightly if citizen reports are elevated
    if data.public_complaints_count and data.public_complaints_count > 5:
        drain_risk = min(100.0, drain_risk + min(15.0, (data.public_complaints_count - 5) * 1.5))
        
    # Execute centralized calculation:
    # Risk = 0.5 * RainfallRisk + 0.3 * DrainageRisk + 0.2 * TerrainRisk
    result = calculate_risk_score(rain_risk, drain_risk, ter_risk)
    
    return {
        "status": "success",
        "zone_name": data.zone_name,
        "predicted_risk_percentage": result["final_risk_score"],
        "final_risk_score": result["final_risk_score"],
        "risk_category": result["risk_category"],
        "priority_level": result["priority_level"],
        "predicted_depth_cm": result["predicted_depth_cm"],
        "time_to_peak_mins": result["time_to_peak_mins"],
        "risk_explanation": result["explanation"],
        "explanation": result["explanation"],
        "main_contributing_factors": result["contributing_factors"],
        "contributing_factors": result["contributing_factors"],
        "recommended_intervention": result["recommended_action"],
        "recommended_action": result["recommended_action"],
        "action_rationale": result["action_rationale"],
        "inputs": result["inputs"],
        "weights": result["weights"],
        "contributions": result["contributions"],
        "model_transparency": {
            "formula": "Risk = 0.5 * RainfallRisk + 0.3 * DrainageRisk + 0.2 * TerrainRisk",
            "scoring_type": "Transparent Deterministic Multi-Criteria Decision Support",
            "thresholds": {"Critical": ">= 80.0", "High": ">= 60.0 and < 80.0", "Medium": ">= 35.0 and < 60.0", "Low": "< 35.0"},
            "classification_notice": "Rule-based decision support system; transparent calculation, not unverified machine learning."
        }
    }
