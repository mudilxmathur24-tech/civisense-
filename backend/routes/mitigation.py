from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from database import get_db
from risk_engine import calculate_risk_score
import datetime

router = APIRouter(prefix="/api/mitigation", tags=["Preventive Measures & Decision Support"])

class PreventiveActionLog(BaseModel):
    ward_id: int
    action_type: str = Field(..., description="CULVERT_INSPECTION, DESILT_DRAIN, TRAFFIC_PREEMPTION, SUCTION_DEPLOYMENT, MONITORING_ALERT")
    title: str
    description: str
    priority: str = Field("HIGH", description="CRITICAL, HIGH, MEDIUM, LOW")
    assigned_unit: str

class StatusUpdateRequest(BaseModel):
    status: str = Field(..., description="SCHEDULED, IN_PROGRESS, ACTIVE, RESOLVED")

@router.get("/recommendations")
def get_preventive_recommendations():
    """
    Synthesizes actionable, prioritized inspection and preventive measures
    based on calculated risk scores across all 16 pilot demonstration zones.
    Frames all measures as decision-support suggestions for municipal engineers.
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM wards ORDER BY id ASC")
    wards = [dict(w) for w in cursor.fetchall()]
    conn.close()
    
    recommendations = []
    
    for w in wards:
        pred = calculate_risk_score(w["rainfall_risk"], w["drainage_risk"], w["terrain_risk"])
        cat = pred["risk_category"]
        score = pred["final_risk_score"]
        drain = float(w["drainage_risk"])
        rain = float(w["rainfall_risk"])
        terrain = float(w["terrain_risk"])
        
        # 1. Drainage Cleaning / Desilting Measure
        if drain >= 65.0:
            recommendations.append({
                "id": f"REC-DESILT-{w['id']}",
                "ward_id": w["id"],
                "ward_code": w["code"],
                "ward_name": w["name"],
                "sub_region": w["sub_region"],
                "risk_score": score,
                "priority": "CRITICAL" if cat == "Critical" else "HIGH",
                "action_type": "DESILT_DRAIN",
                "title": f"Desilt Stormwater Conduits & Clear Debris in {w['name']}",
                "rationale": f"DrainageRisk is elevated ({drain}/100). Silt accumulation severely throttles hydraulic discharge capacity.",
                "suggested_unit": "Kharar–Mohali Municipal Drain Maintenance Division",
                "estimated_mitigation": "Estimated to lower localized water retention by up to 35% through restored conduit section.",
                "status": "SUGGESTED_INSPECTION"
            })
            
        # 2. Road & Underpass Inspection Measure
        if terrain >= 65.0 or (cat in ["Critical", "High"] and terrain >= 50.0):
            recommendations.append({
                "id": f"REC-INSPECT-{w['id']}",
                "ward_id": w["id"],
                "ward_code": w["code"],
                "ward_name": w["name"],
                "sub_region": w["sub_region"],
                "risk_score": score,
                "priority": "CRITICAL" if cat == "Critical" else "HIGH",
                "action_type": "CULVERT_INSPECTION",
                "title": f"Inspect Low-Lying Underpass & Sump Basin in {w['name']}",
                "rationale": f"Elevation depression bowl ({w['elevation_m']}m elev, TerrainRisk {terrain}/100) funnels highway runoff directly onto roadway surfaces.",
                "suggested_unit": "Punjab PWD & Municipal Engineering Inspection Wing",
                "estimated_mitigation": "Identifies early culvert obstructions and triggers manual sluice opening before pooling occurs.",
                "status": "SUGGESTED_INSPECTION"
            })
            
        # 3. Mobile Dewatering Pump Standby
        if cat == "Critical" or (cat == "High" and drain >= 60.0):
            recommendations.append({
                "id": f"REC-PUMP-{w['id']}",
                "ward_id": w["id"],
                "ward_code": w["code"],
                "ward_name": w["name"],
                "sub_region": w["sub_region"],
                "risk_score": score,
                "priority": "CRITICAL" if cat == "Critical" else "HIGH",
                "action_type": "SUCTION_DEPLOYMENT",
                "title": f"Pre-position Standby Mobile Dewatering Suction Unit at {w['name']}",
                "rationale": f"Risk score reached {score}% ({cat}). Projected water accumulation depth is {pred['predicted_depth_cm']}cm.",
                "suggested_unit": "Municipal Quick Response Suction Squad",
                "estimated_mitigation": "Pre-positioning mobile pumping ensures rapid discharge before road transit is severed.",
                "status": "SUGGESTED_INSPECTION"
            })
            
        # 4. Traffic Management Advisory
        if cat in ["Critical", "High"] and ("NH-05" in w["name"] or "Chowk" in w["name"] or "Flyover" in w["name"]):
            recommendations.append({
                "id": f"REC-TRAF-{w['id']}",
                "ward_id": w["id"],
                "ward_code": w["code"],
                "ward_name": w["name"],
                "sub_region": w["sub_region"],
                "risk_score": score,
                "priority": "HIGH",
                "action_type": "TRAFFIC_PREEMPTION",
                "title": f"Issue Highway Preemption Advisory for {w['name']}",
                "rationale": f"Key transit corridor at {score}% risk. Water accumulation threatens commuter gridlock on NH-05.",
                "suggested_unit": "SAS Nagar Traffic Advisory Cell",
                "estimated_mitigation": "Prevents gridlock from trapping vehicles in submerged low points.",
                "status": "SUGGESTED_INSPECTION"
            })
            
        # 5. Routine Rainfall Monitoring
        if cat in ["Medium", "Low"]:
            recommendations.append({
                "id": f"REC-MONITOR-{w['id']}",
                "ward_id": w["id"],
                "ward_code": w["code"],
                "ward_name": w["name"],
                "sub_region": w["sub_region"],
                "risk_score": score,
                "priority": "LOW" if cat == "Low" else "MEDIUM",
                "action_type": "MONITORING_ALERT",
                "title": f"Maintain Routine Hydrological Monitoring in {w['name']}",
                "rationale": f"Current risk ({score}%) is within operational margins. Continue telemetric rainfall tracking.",
                "suggested_unit": "Central Smart City Telemetry Control Cell",
                "estimated_mitigation": "Ensures baseline readiness without diverting field inspection squads unnecessarily.",
                "status": "MONITORING"
            })
            
    # Sort recommendations by risk score descending
    recommendations.sort(key=lambda x: x["risk_score"], reverse=True)
    
    return {
        "status": "success",
        "total_recommendations": len(recommendations),
        "pilot_corridor": "Gharuan–Kharar Pilot (Chandigarh University Corridor)",
        "disclaimer": "All actions are decision-support suggestions for field engineers; no automated emergency dispatch is executed.",
        "recommendations": recommendations
    }

@router.get("/active-logs")
def get_preventive_action_logs():
    """Returns active and scheduled municipal preventive action records."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM dispatches ORDER BY id DESC")
    logs = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return {
        "count": len(logs),
        "dispatches": logs,
        "logs": logs
    }

@router.post("/log")
def log_preventive_action(data: PreventiveActionLog):
    """Logs a preventive measure / inspection task in the municipal records."""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT name FROM wards WHERE id = ?", (data.ward_id,))
    row = cursor.fetchone()
    ward_name = row["name"] if row else f"Zone {data.ward_id}"
    
    dispatch_id = f"ACT-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    cursor.execute("""
    INSERT INTO dispatches (
        dispatch_id, ward_id, ward_name, priority, action_type,
        title, description, assigned_unit, status, estimated_water_reduction_pct
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        dispatch_id, data.ward_id, ward_name, data.priority, data.action_type,
        data.title, data.description, data.assigned_unit, "SCHEDULED", 25.0
    ))
    
    conn.commit()
    conn.close()
    
    return {
        "status": "success",
        "dispatch_id": dispatch_id,
        "message": f"Preventive inspection action {dispatch_id} scheduled for {ward_name}."
    }

@router.patch("/{dispatch_id}/status")
def update_action_status(dispatch_id: str, data: StatusUpdateRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM dispatches WHERE dispatch_id = ?", (dispatch_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Action record {dispatch_id} not found")
        
    cursor.execute("UPDATE dispatches SET status = ? WHERE dispatch_id = ?", (data.status, dispatch_id))
    conn.commit()
    conn.close()
    
    return {
        "status": "success",
        "dispatch_id": dispatch_id,
        "new_status": data.status
    }
