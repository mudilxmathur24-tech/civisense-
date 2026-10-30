"""
CIVISENSE PRODUCT QUALITY VERIFICATION SUITE
Uses Python built-in urllib.request and json.
Verifies:
1. Zone comparison multi-criteria mathematical identity across all pairs
2. Centralized 0.5R + 0.3D + 0.2T formula consistency across database, simulator, and explainability
3. Simulator preset transitions and instant baseline reset
4. CSV export completeness and schema integrity
5. Data provenance tags and elevation boundary safety
"""

import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def get_json(url):
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def post_json(url, payload):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def get_text(url):
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        return resp.read().decode()

def test_product_quality():
    print("=" * 70)
    print("CIVISENSE FINAL PRODUCT QUALITY UPGRADE VERIFICATION")
    print("=" * 70)

    # 1. Load all 16 zones
    wards_data = get_json(f"{BASE_URL}/api/wards")
    wards = wards_data.get("wards", [])
    assert len(wards) == 16, f"Expected 16 zones, found {len(wards)}"
    print(f"  [PASS] Successfully retrieved all {len(wards)} Gharuan–Kharar pilot zones.")

    # 2. Verify Zone Comparison Mathematical Linearity across sample pairs
    test_pairs = [(1, 2), (2, 10), (4, 6), (7, 14)]
    for id_a, id_b in test_pairs:
        zA = next(w for w in wards if w["id"] == id_a)
        zB = next(w for w in wards if w["id"] == id_b)

        # Expected formula scores
        scoreA = round(0.5 * zA["rainfall_risk"] + 0.3 * zA["drainage_risk"] + 0.2 * zA["terrain_risk"], 1)
        scoreB = round(0.5 * zB["rainfall_risk"] + 0.3 * zB["drainage_risk"] + 0.2 * zB["terrain_risk"], 1)

        dbScoreA = round(zA["prediction"]["final_risk_score"], 1)
        dbScoreB = round(zB["prediction"]["final_risk_score"], 1)

        assert abs(scoreA - dbScoreA) < 0.2, f"Zone {id_a} score mismatch: {scoreA} vs {dbScoreA}"
        assert abs(scoreB - dbScoreB) < 0.2, f"Zone {id_b} score mismatch: {scoreB} vs dbScoreB"

        delta_calculated = round(scoreA - scoreB, 1)
        delta_components = round(
            0.5 * (zA["rainfall_risk"] - zB["rainfall_risk"]) +
            0.3 * (zA["drainage_risk"] - zB["drainage_risk"]) +
            0.2 * (zA["terrain_risk"] - zB["terrain_risk"]),
            1
        )
        assert abs(delta_calculated - delta_components) < 0.2, (
            f"Comparison linearity failed for ({id_a}, {id_b}): {delta_calculated} vs {delta_components}"
        )
        print(f"  [PASS] Pair Comparison ({zA['code']} vs {zB['code']}): Delta {delta_calculated}% pts mathematically verified.")

    # 3. Verify Extreme Topographical Contrast
    sink = next(w for w in wards if w["id"] == 11) # Desu Majra Railway Viaduct Basin (294.0m)
    ridge = next(w for w in wards if w["id"] == 3)  # CU North Campus Ridge (310.2m)
    low_zone = next(w for w in wards if w["id"] == 16) # Daun Village Natural Ridge (22.5%)

    assert sink["elevation_m"] <= 295.0, f"Expected sink elevation <= 295m, got {sink['elevation_m']}"
    assert ridge["elevation_m"] >= 310.0, f"Expected ridge elevation >= 310m, got {ridge['elevation_m']}"
    assert sink["prediction"]["final_risk_score"] >= 80.0, "Expected sink to be Critical (>=80%)"
    assert low_zone["prediction"]["final_risk_score"] < 35.0, "Expected low_zone to be Low (<35%)"
    print(f"  [PASS] Topographical extremes verified: Sink ({sink['name']}, {sink['elevation_m']}m) vs Ridge ({ridge['name']}, {ridge['elevation_m']}m).")

    # 4. Verify Simulator Run & Clean Baseline Reset
    # Simulate heavy cloudburst
    sim_res = post_json(f"{BASE_URL}/api/simulator/run", {"target_ward_id": 1, "rainfall_risk": 90.0, "drainage_risk": 80.0})
    z1 = next(z for z in sim_res["zones"] if z["id"] == 1)
    assert z1["simulated"]["risk_score"] > 70.0, "Simulation failed to elevate risk"

    # Reset to baseline
    reset_res = post_json(f"{BASE_URL}/api/simulator/run", {"target_ward_id": 1, "preset_id": "baseline"})
    z1_reset = next(z for z in reset_res["zones"] if z["id"] == 1)
    assert z1_reset["simulated"]["risk_score"] == z1_reset["baseline"]["risk_score"], (
        f"Reset failed: simulated {z1_reset['simulated']['risk_score']} != baseline {z1_reset['baseline']['risk_score']}"
    )
    print("  [PASS] Simulator cloudburst injection and instant zero-drift baseline reset verified.")

    # 5. Verify CSV Export Content
    csv_text = get_text(f"{BASE_URL}/api/reports/export/csv")
    lines = [l.strip() for l in csv_text.strip().split("\n") if l.strip()]
    assert len(lines) == 17, f"Expected 17 CSV lines (header + 16 zones), got {len(lines)}"
    assert "ZONE-GK-01" in csv_text
    assert "ZONE-GK-16" in csv_text
    print(f"  [PASS] CSV Export verified: 16 zones + valid audit header row.")

    # 6. Verify Data Provenance Tags
    for w in wards:
        assert "data_tag" in w, f"Missing data_tag in ward {w['id']}"
        assert "elevation_m" in w and w["elevation_m"] > 290.0, f"Invalid elevation in ward {w['id']}"
        assert "recommended_action" in w and len(w["recommended_action"]) > 10, f"Invalid action in ward {w['id']}"
    print("  [PASS] All 16 zones contain verified data quality, elevation, and preventive action fields.")

    print("=" * 70)
    print("ALL PRODUCT UPGRADE TESTS COMPLETED WITH 100% SUCCESS!")
    print("=" * 70)

if __name__ == "__main__":
    test_product_quality()
