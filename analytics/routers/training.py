"""
analytics/routers/training.py
==============================
Endpoint e logica di training MLflow:

  POST /train → avvia `run_training_cycle()` in un thread separato

Il ciclo di training legge i dati di telemetria da MongoDB, costruisce un
DataFrame pandas con l'aggregazione giornaliera e logga parametri e metriche
su MLflow sotto l'esperimento "blend_user_trends".
"""

import mlflow
import pandas as pd
from fastapi import APIRouter
from fastapi.concurrency import run_in_threadpool

from database import get_col

router = APIRouter(tags=["ML"])


@router.post("/train")
async def train_model():
    """Avvia un ciclo di training MLflow (asincrono via thread pool).

    Esegue `run_training_cycle` in un thread separato per non bloccare
    l'event loop di FastAPI durante le operazioni pandas/MLflow.
    """
    await run_in_threadpool(run_training_cycle)
    return {"status": "Training completed"}


def run_training_cycle() -> None:
    """Ciclo completo di training: MongoDB → pandas → MLflow.

    Flusso:
      1. Carica tutti gli eventi dalla collection "telemetry"
      2. Converte in DataFrame pandas e normalizza i timestamp in UTC
      3. Aggrega per giorno → eventi giornalieri
      4. Apre un MLflow run e logga parametri e metriche di base

    TODO (quando i dati saranno sufficienti):
      - Aggiungere un modello sklearn (es. LinearRegression sul trend giorni)
      - Loggare il modello con mlflow.sklearn.log_model()
      - Implementare previsione a 7/30 giorni
      - Loggare feature importance o residuals come artefatti
    """
    col = get_col()

    # Carica solo i campi necessari, esclude _id (ObjectId non serializzabile)
    docs = list(col.find({}, {"_id": 0, "timestamp": 1, "sessionId": 1, "page": 1}))
    if not docs:
        print("[training] Nessun dato — la collection telemetry è vuota.")
        return

    df = pd.DataFrame(docs)

    # Forza UTC-aware per evitare errori di confronto timezone-naive/aware
    df["timestamp"] = pd.to_datetime(df["timestamp"], utc=True)
    df["day"] = df["timestamp"].dt.date

    # Aggregazione giornaliera
    daily = df.groupby("day").size().reset_index(name="events")

    # Registra il run su MLflow
    with mlflow.start_run():
        mlflow.log_param("model_type", "linear_regression")  # modello pianificato
        mlflow.log_param("n_samples",  len(daily))           # giorni con dati

        mlflow.log_metric("total_events",     len(docs))
        mlflow.log_metric("total_days",       len(daily))
        mlflow.log_metric(
            "avg_events_per_day",
            float(daily["events"].mean()) if len(daily) > 0 else 0.0,
        )

    print(
        f"[training] Completato: {len(docs)} eventi su {len(daily)} giorni "
        "→ loggato su MLflow."
    )
