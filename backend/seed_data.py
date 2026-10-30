import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from database import get_db, init_db

# 16 Geographically-Accurate Demonstration Zones for Gharuan–Kharar Pilot near Chandigarh University
# Center: ~30.755 N, 76.620 E (Punjab / SAS Nagar District)
GHARUAN_KHARAR_ZONES_16 = [
    {
        "id": 1,
        "code": "ZONE-GK-01",
        "name": "Chandigarh University Main Campus & Sports Arena",
        "sub_region": "Gharuan (CU Campus)",
        "population": 42000,
        "critical_infra": "CU Academic Blocks A-D, Central Library, University Sports Complex, Student Hostels",
        "latitude": 30.7695,
        "longitude": 76.5755,
        "polygon_geojson": json.dumps([
            [30.7650, 76.5710], [30.7735, 76.5705], [30.7740, 76.5805], [30.7655, 76.5810], [30.7650, 76.5710]
        ]),
        "elevation_m": 308.5,
        "rainfall_risk": 65.0,
        "drainage_risk": 40.0,
        "terrain_risk": 30.0,
        "data_tag": "Synthetic Demonstration Zone (Illustrative Pilot Data)"
    },
    {
        "id": 2,
        "code": "ZONE-GK-02",
        "name": "Gharuan Village NH-05 Lowlands & Pond Periphery",
        "sub_region": "Gharuan Village",
        "population": 18500,
        "critical_infra": "Gharuan Community Health Center, Village Main Road, Agriculture Drainage Sump",
        "latitude": 30.7635,
        "longitude": 76.5780,
        "polygon_geojson": json.dumps([
            [30.7590, 76.5730], [30.7650, 76.5725], [30.7660, 76.5835], [30.7595, 76.5840], [30.7590, 76.5730]
        ]),
        "elevation_m": 302.0,
        "rainfall_risk": 82.0,
        "drainage_risk": 88.0,
        "terrain_risk": 85.0,
        "data_tag": "Synthetic Demonstration Zone (Illustrative Pilot Data)"
    },
    {
        "id": 3,
        "code": "ZONE-GK-03",
        "name": "Chandigarh University North Campus & Hostel Grid",
        "sub_region": "Gharuan (CU North)",
        "population": 28000,
        "critical_infra": "North Gate Access Road, Faculty Residences, Solar Farm Periphery",
        "latitude": 30.7745,
        "longitude": 76.5725,
        "polygon_geojson": json.dumps([
            [30.7710, 76.5680], [30.7780, 76.5675], [30.7785, 76.5770], [30.7715, 76.5775], [30.7710, 76.5680]
        ]),
        "elevation_m": 310.2,
        "rainfall_risk": 45.0,
        "drainage_risk": 35.0,
        "terrain_risk": 25.0,
        "data_tag": "Synthetic Demonstration Zone (Illustrative Pilot Data)"
    },
    {
        "id": 4,
        "code": "ZONE-GK-04",
        "name": "NH-05 Highway Culvert & Gharuan Toll Perimeter",
        "sub_region": "NH-05 Highway Corridor",
        "population": 12000,
        "critical_infra": "NH-05 Ludhiana-Chandigarh Highway Culvert, Fuel Stations, Highway Service Lanes",
        "latitude": 30.7585,
        "longitude": 76.5950,
        "polygon_geojson": json.dumps([
            [30.7540, 76.5880], [30.7620, 76.5875], [30.7630, 76.6020], [30.7550, 76.6025], [30.7540, 76.5880]
        ]),
        "elevation_m": 304.0,
        "rainfall_risk": 75.0,
        "drainage_risk": 70.0,
        "terrain_risk": 65.0,
        "data_tag": "Synthetic Demonstration Zone (Illustrative Pilot Data)"
    },
    {
        "id": 5,
        "code": "ZONE-GK-05",
        "name": "Mamupur Agricultural Catchment & Drainage Siphon",
        "sub_region": "Rural Mohali Catchment",
        "population": 9500,
        "critical_infra": "Subsurface Irrigation Syphon, Rural Primary Link Road, Agricultural Retention Basin",
        "latitude": 30.7520,
        "longitude": 76.6120,
        "polygon_geojson": json.dumps([
            [30.7470, 76.6050], [30.7565, 76.6045], [30.7570, 76.6190], [30.7480, 76.6195], [30.7470, 76.6050]
        ]),
        "elevation_m": 301.2,
        "rainfall_risk": 60.0,
        "drainage_risk": 65.0,
        "terrain_risk": 55.0,
        "data_tag": "Synthetic Demonstration Zone (Illustrative Pilot Data)"
    },
    {
        "id": 6,
        "code": "ZONE-GK-06",
        "name": "Bhagomajra Industrial Hub & Freight Terminus",
        "sub_region": "Kharar West Industrial",
        "population": 22000,
        "critical_infra": "Industrial Freight Warehouses, Bhagomajra Feeder Road, Storm Sump B-1",
        "latitude": 30.7485,
        "longitude": 76.6285,
        "polygon_geojson": json.dumps([
            [30.7430, 76.6210], [30.7530, 76.6205], [30.7540, 76.6360], [30.7440, 76.6365], [30.7430, 76.6210]
        ]),
        "elevation_m": 300.0,
        "rainfall_risk": 78.0,
        "drainage_risk": 82.0,
        "terrain_risk": 70.0,
        "data_tag": "Synthetic Demonstration Zone (Illustrative Pilot Data)"
    },
    {
        "id": 7,
        "code": "ZONE-GK-07",
        "name": "Khanpur Chowk & Kharar-Kurali Bypass Junction",
        "sub_region": "Kharar Town Arterial",
        "population": 36000,
        "critical_infra": "Major Highway Interchange, Regional Hospital Link, Transit Junction Sump",
        "latitude": 30.7535,
        "longitude": 76.6430,
        "polygon_geojson": json.dumps([
            [30.7480, 76.6360], [30.7580, 76.6355], [30.7590, 76.6500], [30.7490, 76.6505], [30.7480, 76.6360]
        ]),
        "elevation_m": 299.0,
        "rainfall_risk": 85.0,
        "drainage_risk": 85.0,
        "terrain_risk": 80.0,
        "data_tag": "Synthetic Demonstration Zone (Illustrative Pilot Data)"
    },
    {
        "id": 8,
        "code": "ZONE-GK-08",
        "name": "Kharar Elevated Flyover Underpass & Bus Stand Sump",
        "sub_region": "Central Kharar",
        "population": 48000,
        "critical_infra": "Kharar Bus Stand Sub-surface Crossing, Municipal Fire Station Road, Commercial Underpass",
        "latitude": 30.7445,
        "longitude": 76.6495,
        "polygon_geojson": json.dumps([
            [30.7400, 76.6430], [30.7490, 76.6425], [30.7495, 76.6560], [30.7405, 76.6565], [30.7400, 76.6430]
        ]),
        "elevation_m": 296.2,
        "rainfall_risk": 92.0,
        "drainage_risk": 90.0,
        "terrain_risk": 95.0,
        "data_tag": "Synthetic Demonstration Zone (Illustrative Pilot Data)"
    },
    {
        "id": 9,
        "code": "ZONE-GK-09",
        "name": "Kharar Main Market & Arya College Road Lowlands",
        "sub_region": "Old Kharar Market",
        "population": 31000,
        "critical_infra": "Heritage Market Arterial, Civil Hospital Approach Drain, Educational Institutions",
        "latitude": 30.7410,
        "longitude": 76.6450,
        "polygon_geojson": json.dumps([
            [30.7360, 76.6390], [30.7450, 76.6385], [30.7455, 76.6510], [30.7365, 76.6515], [30.7360, 76.6390]
        ]),
        "elevation_m": 298.0,
        "rainfall_risk": 72.0,
        "drainage_risk": 75.0,
        "terrain_risk": 68.0,
        "data_tag": "Synthetic Demonstration Zone (Illustrative Pilot Data)"
    },
    {
        "id": 10,
        "code": "ZONE-GK-10",
        "name": "Sunny Enclave Sector 125 Drainage Sump & Nallah",
        "sub_region": "Sunny Enclave (Kharar East)",
        "population": 52000,
        "critical_infra": "Sector 125 Central Outfall Conduit, Primary Electrical Substation, Dense Residential Grid",
        "latitude": 30.7320,
        "longitude": 76.6680,
        "polygon_geojson": json.dumps([
            [30.7260, 76.6610], [30.7370, 76.6605], [30.7375, 76.6750], [30.7270, 76.6755], [30.7260, 76.6610]
        ]),
        "elevation_m": 295.4,
        "rainfall_risk": 88.0,
        "drainage_risk": 85.0,
        "terrain_risk": 82.0,
        "data_tag": "Synthetic Demonstration Zone (Illustrative Pilot Data)"
    },
    {
        "id": 11,
        "code": "ZONE-GK-11",
        "name": "Desu Majra Highway Culvert & Railway Viaduct Basin",
        "sub_region": "Desu Majra (NH-05)",
        "population": 29000,
        "critical_infra": "NH-05 Railway Overbridge Approach, Mohali Boundary Storm Drain, Commuter Arterial",
        "latitude": 30.7280,
        "longitude": 76.6780,
        "polygon_geojson": json.dumps([
            [30.7220, 76.6710], [30.7330, 76.6705], [30.7335, 76.6850], [30.7230, 76.6855], [30.7220, 76.6710]
        ]),
        "elevation_m": 294.0,
        "rainfall_risk": 90.0,
        "drainage_risk": 88.0,
        "terrain_risk": 92.0,
        "data_tag": "Synthetic Demonstration Zone (Illustrative Pilot Data)"
    },
    {
        "id": 12,
        "code": "ZONE-GK-12",
        "name": "Chajju Majra Road Residential Storm Conduit",
        "sub_region": "Kharar South",
        "population": 24000,
        "critical_infra": "Chajju Majra Link Road, Surface Water Culverts, Community Center Grid",
        "latitude": 30.7360,
        "longitude": 76.6570,
        "polygon_geojson": json.dumps([
            [30.7310, 76.6510], [30.7405, 76.6505], [30.7410, 76.6630], [30.7320, 76.6635], [30.7310, 76.6510]
        ]),
        "elevation_m": 298.5,
        "rainfall_risk": 55.0,
        "drainage_risk": 50.0,
        "terrain_risk": 45.0,
        "data_tag": "Synthetic Demonstration Zone (Illustrative Pilot Data)"
    },
    {
        "id": 13,
        "code": "ZONE-GK-13",
        "name": "Kharar-Landran Road Swara Junction Lowlands",
        "sub_region": "Landran Periphery",
        "population": 19000,
        "critical_infra": "Swara Bus Stop Culvert, Landran Technical Campus Connector, Fuel Station Sump",
        "latitude": 30.7180,
        "longitude": 76.6580,
        "polygon_geojson": json.dumps([
            [30.7120, 76.6510], [30.7230, 76.6505], [30.7235, 76.6650], [30.7130, 76.6655], [30.7120, 76.6510]
        ]),
        "elevation_m": 303.0,
        "rainfall_risk": 68.0,
        "drainage_risk": 62.0,
        "terrain_risk": 58.0,
        "data_tag": "Synthetic Demonstration Zone (Illustrative Pilot Data)"
    },
    {
        "id": 14,
        "code": "ZONE-GK-14",
        "name": "Radiala Rural Basin & Seasonal Stream Overflow",
        "sub_region": "North Gharuan Catchment",
        "population": 11000,
        "critical_infra": "Radiala Link Bridge, Seasonal Nallah Weir, Agricultural Siphon",
        "latitude": 30.7850,
        "longitude": 76.5850,
        "polygon_geojson": json.dumps([
            [30.7790, 76.5780], [30.7900, 76.5775], [30.7905, 76.5920], [30.7800, 76.5925], [30.7790, 76.5780]
        ]),
        "elevation_m": 309.0,
        "rainfall_risk": 42.0,
        "drainage_risk": 35.0,
        "terrain_risk": 30.0,
        "data_tag": "Synthetic Demonstration Zone (Illustrative Pilot Data)"
    },
    {
        "id": 15,
        "code": "ZONE-GK-15",
        "name": "Kurali Road Badala Agricultural Ridge",
        "sub_region": "North-East Kharar",
        "population": 14500,
        "critical_infra": "Badala Higher Ridge Link, Natural Permeable Soil Zone, State Highway Outflow",
        "latitude": 30.7680,
        "longitude": 76.6340,
        "polygon_geojson": json.dumps([
            [30.7620, 76.6270], [30.7730, 76.6265], [30.7735, 76.6410], [30.7630, 76.6415], [30.7620, 76.6270]
        ]),
        "elevation_m": 306.5,
        "rainfall_risk": 30.0,
        "drainage_risk": 25.0,
        "terrain_risk": 20.0,
        "data_tag": "Synthetic Demonstration Zone (Illustrative Pilot Data)"
    },
    {
        "id": 16,
        "code": "ZONE-GK-16",
        "name": "Daun Village Natural Drainage Infiltration Ridge",
        "sub_region": "Mohali-Kharar Border",
        "population": 16000,
        "critical_infra": "Daun Historic Temple Ridge, Natural Green Infiltration Area, Canal Distributary",
        "latitude": 30.7220,
        "longitude": 76.6850,
        "polygon_geojson": json.dumps([
            [30.7160, 76.6780], [30.7270, 76.6775], [30.7275, 76.6920], [30.7170, 76.6925], [30.7160, 76.6780]
        ]),
        "elevation_m": 304.8,
        "rainfall_risk": 25.0,
        "drainage_risk": 20.0,
        "terrain_risk": 20.0,
        "data_tag": "Synthetic Demonstration Zone (Illustrative Pilot Data)"
    }
]

def seed_database(force=False):
    init_db()
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM wards")
    count = cursor.fetchone()[0]
    
    if count > 0 and not force:
        conn.close()
        print(f"Database already contains {count} wards. Skipping re-seed.")
        return
        
    if force:
        cursor.execute("DROP TABLE IF EXISTS wards")
        cursor.execute("DROP TABLE IF EXISTS sensors")
        cursor.execute("DROP TABLE IF EXISTS dispatches")
        conn.commit()
        conn.close()
        init_db()
        conn = get_db()
        cursor = conn.cursor()
        
    for w in GHARUAN_KHARAR_ZONES_16:
        cursor.execute("""
        INSERT INTO wards (
            id, code, name, sub_region, pilot_corridor, population, critical_infra,
            latitude, longitude, polygon_geojson, elevation_m,
            rainfall_risk, drainage_risk, terrain_risk, data_tag
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            w["id"], w["code"], w["name"], w["sub_region"],
            "Gharuan–Kharar Pilot (Chandigarh University)",
            w["population"], w["critical_infra"],
            w["latitude"], w["longitude"], w["polygon_geojson"], w["elevation_m"],
            w["rainfall_risk"], w["drainage_risk"], w["terrain_risk"],
            w["data_tag"]
        ))
        
    # Seed 16 Illustrative Demonstration Sensor Telemetry Stations
    sensor_types = [
        "Acoustic Water Depth Sensor",
        "Tipping Bucket Rain Gauge",
        "IoT Silt Accumulation Sonar",
        "Storm Conduit Velocity Meter"
    ]
    for w in GHARUAN_KHARAR_ZONES_16:
        # Depth node
        cursor.execute("""
        INSERT INTO sensors (
            sensor_code, ward_id, sensor_type, latitude, longitude,
            current_value, unit, battery_level, status, data_source, last_reading_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            f"SNS-GK-DEP-{100+w['id']}", w["id"], "Acoustic Water Depth Sensor",
            w["latitude"] + 0.0006, w["longitude"] - 0.0005,
            round(max(0.5, (w["rainfall_risk"] * 0.45) - 10.0), 1),
            "cm", 95.0, "ONLINE", "Illustrative Demo Telemetry Node", "2 mins ago"
        ))
        # Rain gauge
        if w["id"] % 2 == 0:
            cursor.execute("""
            INSERT INTO sensors (
                sensor_code, ward_id, sensor_type, latitude, longitude,
                current_value, unit, battery_level, status, data_source, last_reading_time
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                f"SNS-GK-PLU-{200+w['id']}", w["id"], "Tipping Bucket Rain Gauge",
                w["latitude"] - 0.0006, w["longitude"] + 0.0005,
                round(w["rainfall_risk"] * 0.75, 1),
                "mm/h", 92.0, "ONLINE", "Illustrative Demo Telemetry Node", "1 min ago"
            ))
            
    # Seed representative suggested preventive action logs
    demo_actions = [
        ("ACT-2026-01", 8, "Kharar Elevated Flyover Underpass & Bus Stand Sump", "CRITICAL", "CULVERT_INSPECTION", "Inspect Sub-surface Flyover Drainage Pumps", "Underpass basin exhibits Critical risk (92.0%). Pre-position mobile suction pumps before evening commuter traffic.", "Kharar Municipal Field Squad A", "ACTIVE", 35.0),
        ("ACT-2026-02", 11, "Desu Majra Highway Culvert & Railway Viaduct Basin", "CRITICAL", "DESILT_DRAIN", "Clear Trash Grates at NH-05 Railway Culvert", "Critical accumulation risk (89.8%). Remove debris choke to ensure uninterrupted gravity flow.", "Highway Maintenance Unit Delta", "ACTIVE", 28.0),
        ("ACT-2026-03", 7, "Khanpur Chowk & Kharar-Kurali Bypass Junction", "CRITICAL", "TRAFFIC_PREEMPTION", "Coordinate Traffic Diversion Advisory at Khanpur", "Critical risk (84.0%). Heavy water accumulation could stall transit toward Kurali and Ropar.", "Traffic Advisory Cell", "SCHEDULED", 20.0),
        ("ACT-2026-04", 2, "Gharuan Village NH-05 Lowlands & Pond Periphery", "CRITICAL", "SUCTION_DEPLOYMENT", "Pre-position Standby Mobile Pump at Gharuan Village", "Low-lying rural basin adjacent to NH-05 (84.4%). Pre-position tractor-mounted pump.", "Gharuan Panchayat Facility Team", "ACTIVE", 30.0),
        ("ACT-2026-05", 1, "Chandigarh University Main Campus & Sports Arena", "MEDIUM", "PREVENTIVE_INSPECTION", "Verify Campus Stormwater Channels & Retention Basin", "Medium risk (50.5%). Inspect university sports complex drainage inlets prior to expected rain.", "CU Facilities Management", "RESOLVED", 25.0)
    ]
    for a in demo_actions:
        cursor.execute("""
        INSERT INTO dispatches (
            dispatch_id, ward_id, ward_name, priority, action_type,
            title, description, assigned_unit, status, estimated_water_reduction_pct
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, a)
        
    conn.commit()
    conn.close()
    print(f"Database successfully seeded with {len(GHARUAN_KHARAR_ZONES_16)} Gharuan–Kharar Pilot Demonstration Zones!")

if __name__ == "__main__":
    seed_database(force=True)
