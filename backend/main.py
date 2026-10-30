import os
import sys

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from seed_data import seed_database
from ml_engine import ml_engine

# Import routers
from routes.dashboard import router as dashboard_router
from routes.wards import router as wards_router
from routes.predict import router as predict_router
from routes.simulator import router as simulator_router
from routes.explain import router as explain_router
from routes.mitigation import router as mitigation_router
from routes.reports import router as reports_router

app = FastAPI(
    title="CIVISENSE API — Predict. Prioritize. Prevent.",
    description="AI-powered Smart City Urban Flood & Waterlogging Risk Intelligence System",
    version="2.5.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to ensure database is created and seeded
@app.on_event("startup")
def on_startup():
    print("Initializing CIVISENSE SQLite Database and Hydrology Models for Gharuan–Kharar Pilot...")
    init_db()
    seed_database()
    print("CIVISENSE Backend Ready with 16 Gharuan–Kharar Pilot Demonstration Zones!")

# Register routers
app.include_router(dashboard_router)
app.include_router(wards_router)
app.include_router(predict_router)
app.include_router(simulator_router)
app.include_router(explain_router)
app.include_router(mitigation_router)
app.include_router(reports_router)

@app.get("/")
def root():
    return {
        "system": "CIVISENSE AI Urban Flood & Waterlogging Platform",
        "motto": "Predict. Prioritize. Prevent.",
        "status": "ONLINE",
        "version": "4.0.0-Zinnovatio",
        "pilot_corridor": "Gharuan–Kharar Pilot (Chandigarh University Corridor, NH-05 Punjab)",
        "formula": "Risk = 0.5 * RainfallRisk + 0.3 * DrainageRisk + 0.2 * TerrainRisk",
        "thresholds": {"Critical": ">= 80.0", "High": ">= 60.0 and < 80.0", "Medium": ">= 35.0 and < 60.0", "Low": "< 35.0"},
        "data_notice": "Telemetry and inputs are calibrated synthetic demonstration data for the Gharuan–Kharar pilot corridor. Centralized deterministic rule-based calculation without fabricated machine learning claims.",
        "endpoints": [
            "/api/dashboard/summary",
            "/api/wards",
            "/api/wards/sensors/all",
            "/api/predict",
            "/api/simulator/presets",
            "/api/simulator/baseline",
            "/api/simulator/run",
            "/api/explain/global",
            "/api/explain/ward/{id}",
            "/api/mitigation/recommendations",
            "/api/mitigation/active-logs",
            "/api/reports/export/csv"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
