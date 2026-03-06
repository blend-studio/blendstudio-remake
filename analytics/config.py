"""
analytics/config.py
===================
Configurazione centralizzata del servizio analytics.

Carica le variabili d'ambiente e inizializza la connessione MLflow.
Importato da tutti gli altri moduli che necessitano di URI o client MLflow.
"""

import os

import mlflow
import mlflow.sklearn
from dotenv import load_dotenv

# Carica .env solo in sviluppo locale (in produzione le env sono iniettate da Docker)
load_dotenv()

# ── MongoDB ───────────────────────────────────────────────────────────────────
# Default: container Docker "mongodb" sulla porta standard.
# Sovrascrivere con MONGO_CONNECTION_STRING=mongodb://localhost:27017/blendstudio
# per lo sviluppo locale fuori Docker.
MONGO_URI: str = os.getenv(
    "MONGO_CONNECTION_STRING",
    "mongodb://mongodb:27017/blendstudio",
)

# ── MLflow ────────────────────────────────────────────────────────────────────
# Default: container Docker "mlflow" sulla porta 5000.
MLFLOW_URI: str = os.getenv("MLFLOW_TRACKING_URI", "http://mlflow:5000")

# Connette il client MLflow al tracking server e imposta l'esperimento.
# Tutti i run di training saranno raggruppati sotto "blend_user_trends".
mlflow.set_tracking_uri(MLFLOW_URI)
mlflow.set_experiment("blend_user_trends")
