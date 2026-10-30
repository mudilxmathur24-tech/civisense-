from fastapi import APIRouter
from database import get_db
from risk_engine import risk_engine, calculate_risk_score

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM wards ORDER BY id ASC")
    wards = [dict(row) for row in cursor.fetchall()]
    
    cursor.execute("SELECT * FROM sensors")
    sensors = [dict(row) for row in cursor.fetchall()]
    
    cursor.execute("SELECT * FROM dispatches WHERE status != 'RESOLVED'")
    active_dispatches = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    
    evaluated_wards = []
    total_risk = 0.0
    critical_count = 0
    high_count = 0
    medium_count = 0
    low_count = 0
    total_depth_cm = 0.0
    total_population_at_risk = 0
    
    for w in wards:
        # Evaluate each zone using the centralized risk formula:
        # Risk = 0.5 * RainfallRisk + 0.3 * DrainageRisk + 0.2 * TerrainRisk
        r_risk = float(w["rainfall_risk"])
        d_risk = float(w["drainage_risk"])
        t_risk = float(w["terrain_risk"])
        
        pred = calculate_risk_score(r_risk, d_risk, t_risk)
        w_eval = {**w, **pred}
        evaluated_wards.append(w_eval)
        
        score = pred["final_risk_score"]
        total_risk += score
        total_depth_cm += pred["predicted_depth_cm"]
        
        if score >= 80.0:
            critical_count += 1
            total_population_at_risk += w["population"]
        elif score >= 60.0:
            high_count += 1
            total_population_at_risk += int(w["population"] * 0.6)
        elif score >= 35.0:
            medium_count += 1
            total_population_at_risk += int(w["population"] * 0.2)
        else:
            low_count += 1
            
    avg_city_risk = round(total_risk / max(1, len(wards)), 1)
    online_sensors = sum(1 for s in sensors if s["status"] == "ONLINE")
    
    # 24-hr precipitation & risk forecast curve for Gharuan–Kharar corridor
    hourly_trend = [
        {"time": "-12h", "rainfall_mm": 6.0, "city_risk": 22.0},
        {"time": "-9h", "rainfall_mm": 12.0, "city_risk": 28.0},
        {"time": "-6h", "rainfall_mm": 25.0, "city_risk": 38.0},
        {"time": "-3h", "rainfall_mm": 52.0, "city_risk": 60.0},
        {"time": "NOW", "rainfall_mm": 58.0, "city_risk": avg_city_risk},
        {"time": "+1h (FCST)", "rainfall_mm": 72.0, "city_risk": min(98.0, round(avg_city_risk + 8.5, 1))},
        {"time": "+2h (FCST)", "rainfall_mm": 58.0, "city_risk": min(95.0, round(avg_city_risk + 4.0, 1))},
        {"time": "+3h (FCST)", "rainfall_mm": 40.0, "city_risk": max(25.0, round(avg_city_risk - 9.0, 1))},
        {"time": "+6h (FCST)", "rainfall_mm": 18.0, "city_risk": max(20.0, round(avg_city_risk - 22.0, 1))},
        {"time": "+12h (FCST)", "rainfall_mm": 5.0, "city_risk": 16.0},
    ]
    
    # Recent critical and high risk alerts
    alerts = []
    for w in evaluated_wards:
        if w["risk_category"] in ["Critical", "High"]:
            alerts.append({
                "id": f"ALT-{w['code']}",
                "zone_id": w["id"],
                "zone_code": w["code"],
                "zone_name": w["name"],
                "sub_region": w["sub_region"],
                "risk_category": w["risk_category"],
                "risk_percentage": w["risk_percentage"],
                "predicted_depth_cm": w["predicted_depth_cm"],
                "time_to_peak_mins": w["time_to_peak_mins"],
                "recommended_action": w["recommended_action"],
                "action_rationale": w["action_rationale"],
                "message": f"{w['name']} scored {w['risk_percentage']}% ({w['risk_category']}). {w['recommended_action']}",
                "timestamp": "Active Monitoring Cycle"
            })
            
    alerts.sort(key=lambda x: x["risk_percentage"], reverse=True)
    
    # Priority intervention list (All 16 zones ranked automatically by calculated risk)
    priority_list = []
    sorted_wards = sorted(evaluated_wards, key=lambda x: x["risk_percentage"], reverse=True)
    for idx, w in enumerate(sorted_wards):
        factors = w.get("contributing_factors", [])
        main_cause = factors[0]["name"] if factors else "Rainfall Influx"
        priority_list.append({
            "rank": idx + 1,
            "zone_id": w["id"],
            "zone_code": w["code"],
            "zone_name": w["name"],
            "sub_region": w["sub_region"],
            "elevation_m": w["elevation_m"],
            "rainfall_risk": w["rainfall_risk"],
            "drainage_risk": w["drainage_risk"],
            "terrain_risk": w["terrain_risk"],
            "predicted_risk": w["risk_percentage"],
            "risk_percentage": w["risk_percentage"],
            "risk_category": w["risk_category"],
            "main_cause": main_cause,
            "priority_level": w["priority_level"],
            "recommended_action": w["recommended_action"],
            "action_rationale": w["action_rationale"],
            "predicted_depth_cm": w["predicted_depth_cm"],
            "data_tag": w["data_tag"]
        })
        
    return {
        "kpis": {
            "total_monitored_zones": len(wards),
            "critical_risk_zones": critical_count,
            "high_risk_zones": high_count,
            "medium_risk_zones": medium_count,
            "low_risk_zones": low_count,
            "average_predicted_risk": avg_city_risk,
            "active_alerts_count": len(alerts),
            "population_at_risk": total_population_at_risk,
            "active_sensors_count": online_sensors,
            "total_sensors_count": len(sensors),
            "sensor_health_pct": round((online_sensors / max(1, len(sensors))) * 100, 1),
            "active_dispatches_count": len(active_dispatches),
            "pilot_corridor": "Gharuan–Kharar Pilot (Chandigarh University Corridor, NH-05)"
        },
        "risk_distribution": [
            {"name": "Critical", "count": critical_count, "color": "#f43f5e"},
            {"name": "High", "count": high_count, "color": "#f97316"},
            {"name": "Medium", "count": medium_count, "color": "#eab308"},
            {"name": "Low", "count": low_count, "color": "#10b981"},
        ],
        "hourly_trend": hourly_trend,
        "recent_alerts": alerts[:8],
        "priority_interventions": priority_list,
        "model_transparency": {
            "methodology": "Centralized Deterministic Risk Weighting",
            "formula": "Risk = 0.5 * RainfallRisk + 0.3 * DrainageRisk + 0.2 * TerrainRisk",
            "weights": {"RainfallRisk": 0.5, "DrainageRisk": 0.3, "TerrainRisk": 0.2},
            "thresholds": {"Critical": ">= 80.0", "High": ">= 60.0 and < 80.0", "Medium": ">= 35.0 and < 60.0", "Low": "< 35.0"},
            "classification": "Rule-based decision support system; transparent calculation, not unverified ML.",
            "pilot_region": "Gharuan–Kharar Corridor (Chandigarh University, NH-05 Punjab)"
        },
        "data_notice": "DATA TRANSPARENCY NOTICE: All zone metrics, sensor feeds, and boundaries are synthetic demonstration data for the Gharuan–Kharar pilot corridor."
    }
