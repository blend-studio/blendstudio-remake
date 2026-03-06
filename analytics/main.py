"""
analytics/main.py
=================
Entry point del servizio FastAPI Blend Analytics.

Responsabilità di questo file:
  - Creare l'app FastAPI e configurare il middleware CORS
  - Registrare i router dei vari moduli
  - Esporre l'health check su GET /
  - Avviare uvicorn in sviluppo locale

Struttura del progetto:
  config.py           → variabili d'ambiente e setup MLflow
  database.py         → helper get_col() per MongoDB
  routers/stats.py    → /stats /trends /top-pages /top-actions /events
  routers/advanced.py → /device-stats /session-stats /referrer-stats /funnel
  routers/training.py → /train

Porta: 8000 (container), esposta su 8001 dell'host via docker-compose.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import MLFLOW_URI                  # noqa: F401 — inizializza MLflow come side-effect
from routers import advanced, stats, training, wrike

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Blend Analytics Service",
    description=(
        "API di analisi del traffico per BlendStudio. "
        "Legge da MongoDB e registra i modelli su MLflow."
    ),
    version="1.0.0",
)

# CORS aperto: il frontend React (porta 5173) chiama questi endpoint direttamente
# dal browser, quindi è necessario permettere qualsiasi origine.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Router registration ───────────────────────────────────────────────────────
app.include_router(stats.router)
app.include_router(advanced.router)
app.include_router(training.router)
app.include_router(wrike.router)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    """Verifica che il servizio sia attivo. Restituisce anche l'URI MLflow."""
    return {"message": "Blend Analytics Service is running", "mlflow_uri": MLFLOW_URI}


# ── Entrypoint (sviluppo locale) ──────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    # In produzione viene avviato da Docker:
    #   CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
    uvicorn.run(app, host="0.0.0.0", port=8000)

