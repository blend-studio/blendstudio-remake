import os
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import mlflow
import mlflow.sklearn
from pymongo import MongoClient
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Blend Analytics Service")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
MONGO_URI = os.getenv("MONGO_CONNECTION_STRING", "mongodb://admin:Blend2024!@mongodb:27017/blendstudio?authSource=admin")
MLFLOW_URI = os.getenv("MLFLOW_TRACKING_URI", "http://mlflow:5000")

# Setup MLflow
mlflow.set_tracking_uri(MLFLOW_URI)
mlflow.set_experiment("blend_user_trends")

@app.get("/")
async def root():
    return {"message": "Blend Analytics Service is running", "mlflow_uri": MLFLOW_URI}

@app.get("/stats")
async def get_stats():
    client = MongoClient(MONGO_URI)
    db = client.get_default_database()
    
    # Esempio di aggregazione semplice
    events_count = db.telemetry.count_documents({})
    
    return {
        "total_events": events_count,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/train")
async def train_model(background_tasks: BackgroundTasks):
    # Logica di training in background
    background_tasks.add_task(run_training_cycle)
    return {"status": "Training started in background"}

def run_training_cycle():
    with mlflow.start_run():
        # Qui andrà la logica reale di caricamento dati da Mongo e regressione
        # Per ora facciamo un log di test
        mlflow.log_param("model_type", "linear_regression")
        mlflow.log_metric("dummy_accuracy", 0.85)
        print("Training cycle completed and logged to MLflow")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
