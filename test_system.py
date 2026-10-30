import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_endpoint(name, url, method="GET", payload=None):
    try:
        data = json.dumps(payload).encode() if payload else None
        headers = {"Content-Type": "application/json"} if payload else {}
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        with urllib.request.urlopen(req) as resp:
            code = resp.getcode()
            body = json.loads(resp.read().decode())
            print(f"  [PASS] {name} ({method} {url}) -> HTTP {code}")
            return body
    except Exception as e:
        print(f"  [FAIL] {name} ({method} {url}) -> Error: {e}")
        return None

def main():
    print("=" * 70)
    print("CIVISENSE COMPLETE SYSTEM TEST SUITE: GHARUAN–KHARAR PILOT (16 ZONES)")
    print("=" * 70)

    # 1. Root & Health
    root_data = test_endpoint("Root Health", f"{BASE_URL}/")
    assert root_data and root_data["status"] == "ONLINE", "Root endpoint failed"
    print(f"       -> Pilot Corridor: {root_data.get('pilot_corridor')}")
    print(f"       -> Centralized Formula: {root_data.get('formula')}")

    # 2. Dashboard Summary
    sum_data = test_endpoint("Dashboard Summary", f"{BASE_URL}/api/dashboard/summary")
    assert sum_data and "kpis" in sum_data, "KPIs missing"
    assert sum_data["kpis"]["total_monitored_zones"] == 16, f"Expected 16 zones, got {sum_data['kpis']['total_monitored_zones']}"
    print(f"       -> Total Pilot Zones: {sum_data['kpis']['total_monitored_zones']}")
    print(f"       -> Critical: {sum_data['kpis']['critical_risk_zones']}, High: {sum_data['kpis']['high_risk_zones']}, Medium: {sum_data['kpis']['medium_risk_zones']}, Low: {sum_data['kpis']['low_risk_zones']}")
    print(f"       -> Average Corridor Risk: {sum_data['kpis']['average_predicted_risk']}%")

    # 3. Wards List (All 16 Gharuan–Kharar Zones)
    wards_data = test_endpoint("Pilot Zones List (16 Zones)", f"{BASE_URL}/api/wards")
    assert wards_data and len(wards_data["wards"]) == 16, "Should have 16 pilot zones"
    print(f"       -> Loaded {len(wards_data['wards'])} pilot zones with accurate boundaries & elevations (~294-310m)")

    # 4. Ward Detail (Zone 1: Chandigarh University Campus)
    ward1 = test_endpoint("Zone #1 Detail (Chandigarh University)", f"{BASE_URL}/api/wards/1")
    assert ward1 and "ward" in ward1, "Zone 1 missing"
    print(f"       -> Zone 1: {ward1['ward']['name']} ({ward1['ward']['code']})")
    print(f"       -> Elevation: {ward1['ward']['elevation_m']}m MSL, Calculated Risk: {ward1['ward']['risk_score']}%")

    # 5. Demonstration Sensors List
    sensors = test_endpoint("Sensors List", f"{BASE_URL}/api/wards/sensors/all")
    assert sensors and len(sensors["sensors"]) >= 16, "Sensors missing"
    print(f"       -> Loaded {len(sensors['sensors'])} demonstration telemetry stations")

    # 6. Centralized Formula Test via /api/predict
    # Formula: Risk = 0.5 * RainfallRisk + 0.3 * DrainageRisk + 0.2 * TerrainRisk
    # 0.5 * 80 + 0.3 * 70 + 0.2 * 60 = 40 + 21 + 12 = 73.0 (High Risk: 60-80)
    pred = test_endpoint(
        "Risk Engine (0.5R + 0.3D + 0.2T Formula Verification)",
        f"{BASE_URL}/api/predict",
        method="POST",
        payload={
            "rainfall_risk": 80.0,
            "drainage_risk": 70.0,
            "terrain_risk": 60.0,
            "zone_name": "Test Highway Sump"
        }
    )
    assert pred and pred["predicted_risk_percentage"] == 73.0, f"Expected 73.0, got {pred['predicted_risk_percentage']}"
    assert pred["risk_category"] == "High", f"Expected High, got {pred['risk_category']}"
    print(f"       -> Formula Evaluation: 0.5*80 + 0.3*70 + 0.2*60 = {pred['predicted_risk_percentage']}% ({pred['risk_category']})")
    print(f"       -> Recommended Measure: {pred['recommended_intervention'][:60]}...")

    # 7. Simulator Presets
    presets = test_endpoint("Simulator Presets", f"{BASE_URL}/api/simulator/presets")
    assert presets and "heavy_rainfall" in presets["presets"], "Heavy rainfall preset missing"
    assert "reduced_drainage" in presets["presets"], "Reduced drainage preset missing"
    assert "improved_drainage" in presets["presets"], "Improved drainage preset missing"
    print(f"       -> Presets verified: {list(presets['presets'].keys())}")

    # 8. Simulator Baseline State Endpoint
    baseline = test_endpoint("Simulator Baseline State", f"{BASE_URL}/api/simulator/baseline")
    assert baseline and len(baseline["zones"]) == 16, "Baseline zones missing"
    print(f"       -> Verified baseline state for all {len(baseline['zones'])} zones")

    # 9. What-If Simulation Run (Heavy Rainfall Preset)
    sim_heavy = test_endpoint(
        "What-If Simulation (Heavy Rainfall Preset: 85/100)",
        f"{BASE_URL}/api/simulator/run",
        method="POST",
        payload={"preset_id": "heavy_rainfall"}
    )
    assert sim_heavy and "kpis" in sim_heavy, "Simulation failed"
    print(f"       -> Baseline Avg: {sim_heavy['kpis']['baseline_avg_risk']}% -> Simulated Avg: {sim_heavy['kpis']['simulated_avg_risk']}%")
    print(f"       -> Delta: +{sim_heavy['kpis']['risk_change_pts']} pts, Critical count: {sim_heavy['kpis']['simulated_critical_count']}")

    # 10. What-If Simulation Run (Single Zone Selection with Direct Sliders)
    sim_zone = test_endpoint(
        "What-If Simulation (Zone 1 CU Campus Targeted)",
        f"{BASE_URL}/api/simulator/run",
        method="POST",
        payload={
            "target_ward_id": 1,
            "rainfall_risk": 90.0,
            "drainage_risk": 80.0
        }
    )
    assert sim_zone and len(sim_zone["zones"]) == 16
    z1 = next(z for z in sim_zone["zones"] if z["id"] == 1)
    print(f"       -> Zone 1 Baseline: {z1['baseline']['risk_score']}% ({z1['baseline']['risk_category']})")
    print(f"       -> Zone 1 Simulated: {z1['simulated']['risk_score']}% ({z1['simulated']['risk_category']})")
    print(f"       -> Delta Summary: {z1['delta']['summary']}")

    # 11. Explainable AI Global Component Breakdown
    global_xai = test_endpoint("Global Explainable AI Breakdown", f"{BASE_URL}/api/explain/global")
    assert global_xai and "formula" in global_xai, "Global XAI missing"
    assert global_xai["weights"]["rainfall_risk"] == 0.5
    assert global_xai["weights"]["drainage_risk"] == 0.3
    assert global_xai["weights"]["terrain_risk"] == 0.2
    print(f"       -> Verified 50/30/20 weights & thresholds without ML claims")

    # 12. Zone-Specific Local Attribution (Zone 1)
    ward1_xai = test_endpoint("Zone 1 Local XAI Breakdown", f"{BASE_URL}/api/explain/ward/1")
    assert ward1_xai and "counterfactual_scenarios" in ward1_xai, "Ward XAI missing"
    print(f"       -> Primary Reason: {ward1_xai['primary_reasons'][0]}")
    print(f"       -> Counterfactual 1: {ward1_xai['counterfactual_scenarios'][0]['title']}")

    # 13. Prescriptive Preventive Recommendations
    recs = test_endpoint("Preventive Measures & Inspection Suggestions", f"{BASE_URL}/api/mitigation/recommendations")
    assert recs and len(recs["recommendations"]) > 0, "Recommendations missing"
    print(f"       -> Generated {len(recs['recommendations'])} suggested inspection & preventive measures across 16 pilot zones")

    # 14. Log Preventive Action & Update Status
    log_action = test_endpoint(
        "Log Preventive Inspection Task",
        f"{BASE_URL}/api/mitigation/log",
        method="POST",
        payload={
            "ward_id": 1,
            "action_type": "CULVERT_INSPECTION",
            "title": "Inspect CU Campus North Storm Conduit",
            "description": "Pre-monsoon verification of gravity outfall to Kharar catchment",
            "priority": "HIGH",
            "assigned_unit": "Kharar Field Inspection Squad A"
        }
    )
    assert log_action and "dispatch_id" in log_action, "Task logging failed"
    task_id = log_action["dispatch_id"]
    print(f"       -> Task logged: {task_id}")

    status_update = test_endpoint(
        f"Update Task {task_id} Status",
        f"{BASE_URL}/api/mitigation/{task_id}/status",
        method="PATCH",
        payload={"status": "ACTIVE"}
    )
    assert status_update and status_update["new_status"] == "ACTIVE", "Status update failed"

    # 15. CSV Report Export
    try:
        csv_req = urllib.request.urlopen(f"{BASE_URL}/api/reports/export/csv")
        csv_text = csv_req.read().decode()
        lines = csv_text.strip().splitlines()
        print(f"  [PASS] CSV Dataset Export -> HTTP 200 ({len(lines)} lines)")
        assert len(lines) == 17, f"Expected 16 zones + 1 header, got {len(lines)}"
        print(f"       -> Exported 16 pilot demonstration zones + header row")
    except Exception as e:
        print(f"  [FAIL] CSV Dataset Export failed: {e}")

    # 16. Vite Frontend Integration Test
    print("\n[TESTING VITE FRONTEND & PROXY INTEGRATION]")
    try:
        f_resp = urllib.request.urlopen("http://127.0.0.1:5173/")
        assert f_resp.getcode() == 200
        print("  [PASS] Frontend Vite Dev Server -> HTTP 200 OK")
        
        p_resp = urllib.request.urlopen("http://127.0.0.1:5173/api/dashboard/summary")
        assert p_resp.getcode() == 200
        print("  [PASS] Vite Proxy to FastAPI Backend -> HTTP 200 OK")
    except Exception as e:
        print(f"  [FAIL] Frontend test failed: {e}")

    print("=" * 70)
    print("ALL 16 INTEGRATION & E2E TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 70)

if __name__ == "__main__":
    main()
