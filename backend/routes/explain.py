from fastapi import APIRouter, HTTPException
from database import get_db
from risk_engine import calculate_risk_score

router = APIRouter(prefix="/api/explain", tags=["Explainable Risk Engine"])

@router.get("/global")
def get_global_engine_explanation():
    """
    Returns transparent breakdown of the deterministic decision-support risk formula:
    Risk = 0.5 * RainfallRisk + 0.3 * DrainageRisk + 0.2 * TerrainRisk
    """
    return {
        "engine_type": "Transparent Deterministic Multi-Criteria Decision Support System (MCDSS)",
        "formula": "Risk = 0.5 * RainfallRisk + 0.3 * DrainageRisk + 0.2 * TerrainRisk",
        "description": "Deterministic, explainable civic intelligence formula for urban waterlogging prioritization.",
        "ml_disclaimer": "This is a rule-based multi-criteria weighted scoring engine for municipal decision support, not an unverified black-box machine learning model.",
        "weights": {
            "rainfall_risk": 0.5,
            "drainage_risk": 0.3,
            "terrain_risk": 0.2
        },
        "thresholds": [
            {"category": "Critical", "range": ">= 80.0", "color": "#f43f5e", "priority": "P1 - Immediate Intervention", "description": "Severe waterlogging hazard threatening transit corridors or academic facilities."},
            {"category": "High", "range": ">= 60.0 and < 80.0", "color": "#f97316", "priority": "P2 - High Priority", "description": "High risk of street pooling and underpass impedance requiring preventive inspection."},
            {"category": "Medium", "range": ">= 35.0 and < 60.0", "color": "#eab308", "priority": "P3 - Moderate Watch", "description": "Localized gutter accumulation within nominal stormwater absorption capacity."},
            {"category": "Low", "range": "< 35.0", "color": "#10b981", "priority": "P4 - Low / Routine", "description": "Favorable slope drainage and normal runoff conditions."}
        ],
        "factors_breakdown": [
            {
                "key": "rainfall_risk",
                "name": "Rainfall Risk (50% Weight)",
                "weight_pct": 50,
                "role": "Hydraulic precipitation influx. Intense downpours rapidly overload surface conveyance gutters and road storm drains.",
                "mitigation_focus": "Intensified monitoring, early weather alert broadcasts, stormwater detention pond readiness."
            },
            {
                "key": "drainage_risk",
                "name": "Drainage Risk (30% Weight)",
                "weight_pct": 30,
                "role": "Drainage deficit and conduit compromise. Higher drainage risk represents siltation, trash grate blockage, or insufficient cross-sectional conduit area.",
                "mitigation_focus": "Immediate culvert desilting, trash screen clearance, pre-positioning mobile suction pumps."
            },
            {
                "key": "terrain_risk",
                "name": "Terrain Risk (20% Weight)",
                "weight_pct": 20,
                "role": "Topographical elevation depression and gravity pooling. Low-lying sink basins naturally gather runoff from surrounding highway embankments.",
                "mitigation_focus": "Underpass water-depth gauge checks, barrier warnings, traffic diversion preemption."
            }
        ]
    }

@router.get("/ward/{ward_id}")
def explain_ward_prediction(ward_id: int):
    """
    Decomposes why a specific zone was categorized at its risk level, showing exact inputs,
    weights, contributions, and counterfactual mitigation scenarios.
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM wards WHERE id = ?", (ward_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        raise HTTPException(status_code=404, detail="Zone not found")
        
    ward = dict(row)
    r_risk = float(ward["rainfall_risk"])
    d_risk = float(ward["drainage_risk"])
    t_risk = float(ward["terrain_risk"])
    
    baseline = calculate_risk_score(r_risk, d_risk, t_risk)
    
    # Counterfactual Scenario 1: Preventive desilting of drains (DrainageRisk reduced to 25.0)
    cf_drain_improved = calculate_risk_score(r_risk, max(15.0, d_risk - 45.0), t_risk)
    
    # Counterfactual Scenario 2: Severe compound downpour (RainfallRisk escalated to 90.0)
    cf_rain_escalated = calculate_risk_score(90.0, d_risk, t_risk)
    
    # Generate transparent explanation bullet points
    reasons = []
    if r_risk >= 70.0:
        reasons.append(f"Heavy rainfall stress ({r_risk}/100) generates high volume surface runoff along NH-05.")
    elif r_risk >= 40.0:
        reasons.append(f"Moderate rainfall conditions ({r_risk}/100) contribute steady hydraulic influx.")
    else:
        reasons.append(f"Low precipitation stress ({r_risk}/100) provides favorable inflow margin.")
        
    if d_risk >= 70.0:
        reasons.append(f"Severe drainage impairment ({d_risk}/100) significantly throttles stormwater evacuation.")
    elif d_risk >= 40.0:
        reasons.append(f"Moderate drainage deficit ({d_risk}/100) with minor debris choke.")
    else:
        reasons.append(f"Unimpaired drainage conduit conveyance ({d_risk}/100) facilitates gravity discharge.")
        
    if t_risk >= 70.0:
        reasons.append(f"Low-lying depression topography ({ward['elevation_m']}m elev, {t_risk}/100 terrain risk) funnels runoff into roadway underpass.")
    elif t_risk >= 40.0:
        reasons.append(f"Moderate terrain slope ({ward['elevation_m']}m elev) with mild water retention tendencies.")
    else:
        reasons.append(f"Elevated ridge topography ({ward['elevation_m']}m elev) allows rapid natural gravity drainage.")
        
    return {
        "zone_id": ward["id"],
        "zone_code": ward["code"],
        "zone_name": ward["name"],
        "sub_region": ward["sub_region"],
        "elevation_m": ward["elevation_m"],
        "baseline_evaluation": baseline,
        "primary_reasons": reasons,
        "contributing_factors": baseline["contributing_factors"],
        "counterfactual_scenarios": [
            {
                "title": "Preventive Drain Desilting & Trash Screen Clearing",
                "action": "Lower DrainageRisk by 45 points through mechanical silt removal",
                "simulated_score": cf_drain_improved["final_risk_score"],
                "simulated_category": cf_drain_improved["risk_category"],
                "risk_reduction_pts": round(baseline["final_risk_score"] - cf_drain_improved["final_risk_score"], 1),
                "new_priority": cf_drain_improved["priority_level"],
                "outcome": f"Reduces risk from {baseline['final_risk_score']}% to {cf_drain_improved['final_risk_score']}% ({baseline['risk_category']} -> {cf_drain_improved['risk_category']})."
            },
            {
                "title": "Convective Cloudburst Surge (90/100 Rain)",
                "action": "Test resilience against sudden severe monsoon downpour",
                "simulated_score": cf_rain_escalated["final_risk_score"],
                "simulated_category": cf_rain_escalated["risk_category"],
                "risk_increase_pts": round(cf_rain_escalated["final_risk_score"] - baseline["final_risk_score"], 1),
                "new_priority": cf_rain_escalated["priority_level"],
                "outcome": f"Escalates risk to {cf_rain_escalated['final_risk_score']}% ({baseline['risk_category']} -> {cf_rain_escalated['risk_category']})."
            }
        ]
    }
