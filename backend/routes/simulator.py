from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from database import get_db
from risk_engine import calculate_risk_score

router = APIRouter(prefix="/api/simulator", tags=["What-If Simulator"])

class SimulationRequest(BaseModel):
    target_ward_id: Optional[int] = Field(None, description="Target specific zone ID or null for all zones")
    
    # Direct 0-100 controls (Required by Hackathon prompt)
    rainfall_risk: Optional[float] = Field(None, description="Direct rainfall risk override (0 to 100)", ge=0.0, le=100.0)
    drainage_risk: Optional[float] = Field(None, description="Direct drainage risk override (0 to 100)", ge=0.0, le=100.0)
    terrain_risk: Optional[float] = Field(None, description="Direct terrain risk override (0 to 100)", ge=0.0, le=100.0)
    
    # Delta controls
    rainfall_delta: Optional[float] = Field(0.0, description="Rainfall risk delta (-100 to +100)")
    drainage_delta: Optional[float] = Field(0.0, description="Drainage risk delta (-100 to +100)")
    
    # Sliders from prompt 2
    drainage_capacity_pct: Optional[float] = Field(None, description="Drainage capacity (100% = clear, 0% = blocked)", ge=0.0, le=100.0)
    traffic_delta_pct: Optional[float] = Field(0.0, description="Traffic increase % (0 to 100)")
    
    # Preset identifier
    preset_id: Optional[str] = Field(None, description="Selected preset key")

PRESETS = {
    "baseline": {
        "id": "baseline",
        "name": "Baseline Conditions (Reset)",
        "description": "Restores calibrated baseline rainfall, drainage, and terrain values across all pilot zones.",
        "rainfall_risk": None,
        "drainage_risk": None,
        "params": {"rainfall_delta": 0.0, "drainage_delta": 0.0}
    },
    "heavy_rainfall": {
        "id": "heavy_rainfall",
        "name": "Heavy Rainfall Stress",
        "description": "Simulates widespread intense monsoonal downpour setting rainfall risk to 85/100 across the corridor.",
        "rainfall_risk": 85.0,
        "drainage_risk": None,
        "params": {"rainfall_delta": 30.0, "drainage_delta": 0.0}
    },
    "reduced_drainage": {
        "id": "reduced_drainage",
        "name": "Reduced Drainage Capacity (Severe Choke)",
        "description": "Simulates clogged roadside drains, trash grate blockages, and silt choke setting drainage risk to 90/100.",
        "rainfall_risk": None,
        "drainage_risk": 90.0,
        "params": {"rainfall_delta": 0.0, "drainage_delta": 45.0}
    },
    "improved_drainage": {
        "id": "improved_drainage",
        "name": "Improved Drainage Conditions (Desilted & Cleared)",
        "description": "Simulates municipal desilting, cleared culverts, and cleared trash grates lowering drainage risk to 20/100.",
        "rainfall_risk": None,
        "drainage_risk": 20.0,
        "params": {"rainfall_delta": 0.0, "drainage_delta": -40.0}
    },
    "extreme_compound": {
        "id": "extreme_compound",
        "name": "Compound Storm + Drainage Choke",
        "description": "Severe compound stress test: 90/100 rainfall combined with 85/100 compromised drainage conveyance.",
        "rainfall_risk": 90.0,
        "drainage_risk": 85.0,
        "params": {"rainfall_delta": 35.0, "drainage_delta": 35.0}
    }
}

@router.get("/presets")
def get_presets():
    return {
        "presets": PRESETS,
        "formula": "Risk = 0.5 * RainfallRisk + 0.3 * DrainageRisk + 0.2 * TerrainRisk",
        "thresholds": {"Critical": ">= 80.0", "High": ">= 60.0 and < 80.0", "Medium": ">= 35.0 and < 60.0", "Low": "< 35.0"}
    }

@router.get("/baseline")
def get_baseline_state():
    """Returns baseline calculation for all zones for immediate comparison & reset."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM wards ORDER BY id ASC")
    wards = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    baseline_list = []
    for w in wards:
        pred = calculate_risk_score(w["rainfall_risk"], w["drainage_risk"], w["terrain_risk"])
        baseline_list.append({
            "id": w["id"],
            "code": w["code"],
            "name": w["name"],
            "sub_region": w["sub_region"],
            "elevation_m": w["elevation_m"],
            "rainfall_risk": w["rainfall_risk"],
            "drainage_risk": w["drainage_risk"],
            "terrain_risk": w["terrain_risk"],
            "risk_score": pred["final_risk_score"],
            "risk_percentage": pred["final_risk_score"],
            "risk_category": pred["risk_category"],
            "priority_level": pred["priority_level"],
            "predicted_depth_cm": pred["predicted_depth_cm"],
            "recommended_action": pred["recommended_action"],
            "action_rationale": pred["action_rationale"],
            "contributing_factors": pred["contributing_factors"],
            "explanation": pred["explanation"]
        })
    return {
        "status": "success",
        "zones": baseline_list,
        "total_zones": len(baseline_list)
    }

@router.post("/run")
def run_simulation(req: SimulationRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM wards ORDER BY id ASC")
    wards = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    results = []
    base_critical = 0
    sim_critical = 0
    base_high = 0
    sim_high = 0
    total_base_risk = 0.0
    total_sim_risk = 0.0
    
    # If a preset was requested, extract preset values
    preset_rain = None
    preset_drain = None
    if req.preset_id and req.preset_id in PRESETS:
        p = PRESETS[req.preset_id]
        preset_rain = p.get("rainfall_risk")
        preset_drain = p.get("drainage_risk")
        
    for w in wards:
        is_target = (req.target_ward_id is None) or (w["id"] == req.target_ward_id)
        
        # 1. Baseline Evaluation
        base_rain = float(w["rainfall_risk"])
        base_drain = float(w["drainage_risk"])
        base_ter = float(w["terrain_risk"])
        baseline_eval = calculate_risk_score(base_rain, base_drain, base_ter)
        
        # 2. Simulated Inputs
        if not is_target:
            # Leave non-targeted zone at baseline
            sim_rain = base_rain
            sim_drain = base_drain
            sim_ter = base_ter
        else:
            # Determine Simulated Rainfall Risk (0-100)
            if req.rainfall_risk is not None:
                sim_rain = req.rainfall_risk
            elif preset_rain is not None:
                sim_rain = preset_rain
            else:
                sim_rain = max(0.0, min(100.0, base_rain + (req.rainfall_delta or 0.0)))
                
            # Determine Simulated Drainage Risk (0-100)
            if req.drainage_risk is not None:
                sim_drain = req.drainage_risk
            elif preset_drain is not None:
                sim_drain = preset_drain
            elif req.drainage_capacity_pct is not None:
                # 100% capacity -> 0% risk, 0% capacity -> 100% risk
                sim_drain = 100.0 - req.drainage_capacity_pct
                if req.traffic_delta_pct and req.traffic_delta_pct > 0:
                    sim_drain = min(100.0, sim_drain + (req.traffic_delta_pct * 0.2))
            else:
                traffic_adj = (req.traffic_delta_pct or 0.0) * 0.2
                sim_drain = max(0.0, min(100.0, base_drain + (req.drainage_delta or 0.0) + traffic_adj))
                
            # Terrain risk remains zone characteristic unless explicitly overridden
            if req.terrain_risk is not None:
                sim_ter = req.terrain_risk
            else:
                sim_ter = base_ter
                
        sim_eval = calculate_risk_score(sim_rain, sim_drain, sim_ter)
        
        b_score = baseline_eval["final_risk_score"]
        s_score = sim_eval["final_risk_score"]
        delta_score = round(s_score - b_score, 1)
        
        total_base_risk += b_score
        total_sim_risk += s_score
        
        if b_score >= 80.0:
            base_critical += 1
        elif b_score >= 60.0:
            base_high += 1
            
        if s_score >= 80.0:
            sim_critical += 1
        elif s_score >= 60.0:
            sim_high += 1
            
        # Color coding for map and charts
        if s_score >= 80.0:
            sim_color = "#f43f5e"
        elif s_score >= 60.0:
            sim_color = "#f97316"
        elif s_score >= 35.0:
            sim_color = "#eab308"
        else:
            sim_color = "#10b981"
            
        # Explanation of delta
        if delta_score > 0:
            delta_summary = f"Risk escalated by +{delta_score} points ({baseline_eval['risk_category']} -> {sim_eval['risk_category']})."
        elif delta_score < 0:
            delta_summary = f"Risk reduced by {abs(delta_score)} points ({baseline_eval['risk_category']} -> {sim_eval['risk_category']})."
        else:
            delta_summary = "Risk score unchanged under simulated scenario."
            
        results.append({
            "id": w["id"],
            "code": w["code"],
            "name": w["name"],
            "sub_region": w["sub_region"],
            "is_simulated_target": is_target,
            "elevation_m": w["elevation_m"],
            
            # Baseline parameters & outcomes
            "baseline": {
                "rainfall_risk": base_rain,
                "drainage_risk": base_drain,
                "terrain_risk": base_ter,
                "risk_score": b_score,
                "risk_percentage": b_score,
                "risk_category": baseline_eval["risk_category"],
                "priority_level": baseline_eval["priority_level"],
                "predicted_depth_cm": baseline_eval["predicted_depth_cm"],
                "contributing_factors": baseline_eval["contributing_factors"],
                "recommended_action": baseline_eval["recommended_action"],
                "action_rationale": baseline_eval["action_rationale"]
            },
            
            # Simulated parameters & outcomes
            "simulated": {
                "rainfall_risk": round(sim_rain, 1),
                "drainage_risk": round(sim_drain, 1),
                "terrain_risk": round(sim_ter, 1),
                "risk_score": s_score,
                "risk_percentage": s_score,
                "risk_category": sim_eval["risk_category"],
                "priority_level": sim_eval["priority_level"],
                "predicted_depth_cm": sim_eval["predicted_depth_cm"],
                "color": sim_color,
                "contributing_factors": sim_eval["contributing_factors"],
                "recommended_action": sim_eval["recommended_action"],
                "action_rationale": sim_eval["action_rationale"],
                "explanation": sim_eval["explanation"]
            },
            
            # Delta comparison
            "delta": {
                "risk_score_diff": delta_score,
                "direction": "INCREASED" if delta_score > 0 else ("DECREASED" if delta_score < 0 else "NO_CHANGE"),
                "category_changed": baseline_eval["risk_category"] != sim_eval["risk_category"],
                "previous_category": baseline_eval["risk_category"],
                "new_category": sim_eval["risk_category"],
                "summary": delta_summary
            }
        })
        
    # Sort zones by simulated risk descending for updated priority rankings
    ranked_simulated_zones = sorted(results, key=lambda x: x["simulated"]["risk_score"], reverse=True)
    for idx, item in enumerate(ranked_simulated_zones):
        item["simulated"]["rank"] = idx + 1
        
    avg_base = round(total_base_risk / max(1, len(wards)), 1)
    avg_sim = round(total_sim_risk / max(1, len(wards)), 1)
    
    return {
        "status": "success",
        "scenario_metadata": {
            "target_ward_id": req.target_ward_id,
            "target_scope": "Single Zone" if req.target_ward_id else "All 16 Pilot Zones",
            "applied_preset": req.preset_id or "Custom Parameters",
            "formula_applied": "Risk = 0.5 * RainfallRisk + 0.3 * DrainageRisk + 0.2 * TerrainRisk",
            "thresholds": {"Critical": ">= 80.0", "High": ">= 60.0 and < 80.0", "Medium": ">= 35.0 and < 60.0", "Low": "< 35.0"}
        },
        "kpis": {
            "baseline_avg_risk": avg_base,
            "simulated_avg_risk": avg_sim,
            "risk_change_pts": round(avg_sim - avg_base, 1),
            "baseline_critical_count": base_critical,
            "simulated_critical_count": sim_critical,
            "baseline_high_count": base_high,
            "simulated_high_count": sim_high
        },
        "zones": results,
        "ranked_zones": ranked_simulated_zones
    }
