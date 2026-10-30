import sqlite3
import os

DB_FILE = os.path.join(os.path.dirname(__file__), "civisense.db")

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS wards (
        id INTEGER PRIMARY KEY,
        code TEXT UNIQUE,
        name TEXT,
        sub_region TEXT,
        pilot_corridor TEXT DEFAULT 'Gharuan–Kharar Pilot (Chandigarh University)',
        population INTEGER,
        critical_infra TEXT,
        latitude REAL,
        longitude REAL,
        polygon_geojson TEXT,
        elevation_m REAL,
        rainfall_risk REAL,
        drainage_risk REAL,
        terrain_risk REAL,
        data_tag TEXT DEFAULT 'Synthetic Demonstration Zone',
        inspection_status TEXT DEFAULT 'Scheduled',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sensors (
        id INTEGER PRIMARY KEY,
        sensor_code TEXT UNIQUE,
        ward_id INTEGER,
        sensor_type TEXT,
        latitude REAL,
        longitude REAL,
        current_value REAL,
        unit TEXT,
        battery_level REAL,
        status TEXT,
        data_source TEXT DEFAULT 'Illustrative Demo Telemetry Node',
        last_reading_time TEXT,
        FOREIGN KEY (ward_id) REFERENCES wards(id)
    );
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS dispatches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dispatch_id TEXT UNIQUE,
        ward_id INTEGER,
        ward_name TEXT,
        priority TEXT,
        action_type TEXT,
        title TEXT,
        description TEXT,
        assigned_unit TEXT,
        status TEXT,
        estimated_water_reduction_pct REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP
    );
    """)
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("CIVISENSE Database schema initialized for Gharuan–Kharar Pilot!")
