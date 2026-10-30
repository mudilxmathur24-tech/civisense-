from fastapi import APIRouter
from fastapi.responses import PlainTextResponse
from database import get_db
from risk_engine import calculate_risk_score
import csv
import io

router = APIRouter(prefix="/api/reports", tags=["Reports & Analytics"])

@router.get("/export/csv")
def export_zones_csv():
    """
    Exports a clean CSV file of all 16 monitored pilot demonstration zones
    in the Gharuan–Kharar corridor with risk scores, inputs, and recommended actions.
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM wards ORDER BY id ASC")
    wards = [dict(r) for r in cursor.fetchall()]
    conn.close()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "Zone ID", "Zone Code", "Zone Name", "Sub-Region", "Pilot Corridor",
        "Elevation (m)", "Population", "Rainfall Risk (0-100)", "Drainage Risk (0-100)",
        "Terrain Risk (0-100)", "Formula Calculation", "Calculated Risk Score (%)",
        "Risk Category", "Priority Level", "Predicted Depth (cm)", "Time to Peak (mins)",
        "Recommended Preventive Measure", "Action Rationale", "Data Classification"
    ])
    
    for w in wards:
        r_risk = float(w["rainfall_risk"])
        d_risk = float(w["drainage_risk"])
        t_risk = float(w["terrain_risk"])
        pred = calculate_risk_score(r_risk, d_risk, t_risk)
        
        writer.writerow([
            w["id"],
            w["code"],
            w["name"],
            w["sub_region"],
            w["pilot_corridor"],
            w["elevation_m"],
            w["population"],
            r_risk,
            d_risk,
            t_risk,
            f"0.5*{r_risk} + 0.3*{d_risk} + 0.2*{t_risk}",
            pred["final_risk_score"],
            pred["risk_category"],
            pred["priority_level"],
            pred["predicted_depth_cm"],
            pred["time_to_peak_mins"],
            pred["recommended_action"],
            pred["action_rationale"],
            "Synthetic Demonstration Zone (Illustrative Pilot Data)"
        ])
        
    csv_content = output.getvalue()
    
    return PlainTextResponse(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=civisense_gharuan_kharar_pilot_risk_report.csv"}
    )
