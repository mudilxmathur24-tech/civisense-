from fastapi import APIRouter, HTTPException
from database import get_db
from risk_engine import calculate_risk_score
import json

router = APIRouter(prefix="/api/wards", tags=["Wards & GIS"])

@router.get("")
def list_wards():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM wards ORDER BY id ASC")
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    evaluated = []
    for w in rows:
        try:
            poly = json.loads(w["polygon_geojson"]) if w["polygon_geojson"] else []
        except Exception:
            poly = []
            
        r_risk = float(w["rainfall_risk"])
        d_risk = float(w["drainage_risk"])
        t_risk = float(w["terrain_risk"])
        
        pred = calculate_risk_score(r_risk, d_risk, t_risk)
        
        # Color based on risk category
        score = pred["final_risk_score"]
        if score >= 80.0:
            color = "#f43f5e" # Red
        elif score >= 60.0:
            color = "#f97316" # Orange
        elif score >= 35.0:
            color = "#eab308" # Yellow
        else:
            color = "#10b981" # Green
            
        evaluated.append({
            **w,
            "polygon": poly,
            "risk_score": score,
            "risk_percentage": score,
            "risk_category": pred["risk_category"],
            "risk_color": color,
            "priority_level": pred["priority_level"],
            "predicted_depth_cm": pred["predicted_depth_cm"],
            "time_to_peak_mins": pred["time_to_peak_mins"],
            "contributing_factors": pred["contributing_factors"],
            "explanation": pred["explanation"],
            "recommended_action": pred["recommended_action"],
            "action_rationale": pred["action_rationale"],
            "prediction": pred
        })
        
    return {
        "count": len(evaluated),
        "pilot_corridor": "Gharuan–Kharar Pilot (Chandigarh University)",
        "wards": evaluated
    }

@router.get("/{ward_id}")
def get_ward_details(ward_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM wards WHERE id = ?", (ward_id,))
    row = cursor.fetchone()
    
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Zone with id {ward_id} not found")
        
    ward = dict(row)
    
    cursor.execute("SELECT * FROM sensors WHERE ward_id = ?", (ward_id,))
    sensors = [dict(s) for s in cursor.fetchall()]
    
    cursor.execute("SELECT * FROM dispatches WHERE ward_id = ?", (ward_id,))
    dispatches = [dict(d) for d in cursor.fetchall()]
    
    conn.close()
    
    try:
        poly = json.loads(ward["polygon_geojson"]) if ward["polygon_geojson"] else []
    except Exception:
        poly = []
        
    r_risk = float(ward["rainfall_risk"])
    d_risk = float(ward["drainage_risk"])
    t_risk = float(ward["terrain_risk"])
    
    pred = calculate_risk_score(r_risk, d_risk, t_risk)
    
    score = pred["final_risk_score"]
    if score >= 80.0:
        color = "#f43f5e"
    elif score >= 60.0:
        color = "#f97316"
    elif score >= 35.0:
        color = "#eab308"
    else:
        color = "#10b981"
        
    return {
        "ward": {
            **ward,
            "polygon": poly,
            "risk_score": score,
            "risk_percentage": score,
            "risk_category": pred["risk_category"],
            "risk_color": color,
            "priority_level": pred["priority_level"],
            "predicted_depth_cm": pred["predicted_depth_cm"],
            "time_to_peak_mins": pred["time_to_peak_mins"],
            "contributing_factors": pred["contributing_factors"],
            "explanation": pred["explanation"],
            "recommended_action": pred["recommended_action"],
            "action_rationale": pred["action_rationale"],
            "prediction": pred,
            "sensors": sensors,
            "dispatches": dispatches
        }
    }

@router.get("/sensors/all")
def list_sensors():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT s.*, w.name as ward_name, w.code as ward_code, w.sub_region
    FROM sensors s
    JOIN wards w ON s.ward_id = w.id
    ORDER BY s.id ASC
    """)
    sensors = [dict(s) for s in cursor.fetchall()]
    conn.close()
    return {
        "count": len(sensors),
        "sensors": sensors
    }
