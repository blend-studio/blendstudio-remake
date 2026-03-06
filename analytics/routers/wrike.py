"""
analytics/routers/wrike.py
==========================
Endpoint ML per la Dashboard Operativa Predittiva Wrike.

Tutti i dati vengono letti dalla collection MongoDB "wrike_tasks"
(popolata dal backend .NET ogni 15 minuti via WrikeSyncJob).

Endpoints:
    GET  /wrike/risk-scores         → risk score per ogni task attivo
    GET  /wrike/workload-forecast   → previsione del carico settimanale
    POST /wrike/train               → addestra il modello su dati storici
    GET  /wrike/status              → stato del modello (ultima training run)
"""

import logging
import os
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query

# get_wrike_col() è definita in database.py e apre una connessione MongoDB
# restituendo la collection richiesta (wrike_tasks o wrike_contacts).
from database import get_wrike_col

# Funzioni ML importate da ml/risk_scoring.py:
#   forecast_workload  → Ridge Regression con componenti stagionali
#   predict_risk       → inferenza Random Forest (richiede pickle locale)
#   train_risk_model   → training + log MLflow + salvataggio pickle
#   MODEL_PATH         → percorso del pickle sul filesystem del container
from ml.risk_scoring import (
    forecast_workload,
    predict_risk,
    train_risk_model,
    MODEL_PATH,
)

# Logger specifico per questo modulo — i messaggi appaiono nel log del container
# con prefisso "analytics.routers.wrike".
logger = logging.getLogger(__name__)

# Tutti gli endpoint di questo router sono raggiunti con prefisso /wrike
# (es. GET http://localhost:8001/wrike/risk-scores).
# Il tag "Wrike ML" li raggruppa nella UI di Swagger (/docs).
router = APIRouter(prefix="/wrike", tags=["Wrike ML"])


# ── Helpers ───────────────────────────────────────────────────────────────────

def _doc_to_dict(doc: dict) -> dict:
    """
    Converte un documento MongoDB in un dict JSON-serializzabile.

    I documenti MongoDB contengono due tipi di valori non serializzabili
    nativamente da FastAPI/json:
      - ObjectId  → rimosso tramite pop("_id")
      - datetime  → convertito in stringa ISO 8601 (es. "2026-03-06T10:30:00+00:00")

    Questa funzione viene applicata prima di restituire i documenti raw
    negli endpoint che non fanno mapping esplicito in un Pydantic model.
    """
    # Rimuove il campo _id di MongoDB (ObjectId non è JSON-serializzabile)
    doc.pop("_id", None)

    # Itera su tutti i campi e converte i datetime in stringa ISO 8601.
    # FastAPI serializza automaticamente i datetime nei Pydantic model,
    # ma qui stiamo restituendo dict raw quindi è necessario farlo a mano.
    for key, val in doc.items():
        if isinstance(val, datetime):
            doc[key] = val.isoformat()
    return doc


# ── GET /wrike/risk-scores ─────────────────────────────────────────────────────

@router.get("/risk-scores")
def get_risk_scores(
    min_risk: float = Query(default=0.0, ge=0.0, le=1.0,
                            description="Filtra task con riskScore >= min_risk"),
    limit: int = Query(default=20, ge=1, le=200),
):
    """
    Applica il modello di risk scoring ai task Wrike attualmente attivi.

    Per ogni task restituisce:
    - riskScore [0-1]: probabilità di ritardo
    - riskPct [%]: stessa probabilità in percentuale
    - riskLabel: 🔴 Alto / 🟡 Medio / 🟢 Basso
    - daysUntilDue: giorni alla scadenza (negativo = già scaduto)
    - daysInCurrentStatus: giorni fermi nello stato attuale

    Richiede che il modello sia già stato addestrato (POST /wrike/train).
    """
    # ── 1. Lettura task attivi da MongoDB ────────────────────────────────────
    # Recuperiamo solo i task con status Active o InProgress: questi sono
    # gli unici per cui ha senso calcolare la probabilità di ritardo futuro.
    # I task Completed/Cancelled hanno già un esito noto e non servono qui.
    col = get_wrike_col("wrike_tasks")
    active_docs = list(col.find(
        {"status": {"$in": ["Active", "InProgress"]}},
        {"_id": 0}  # escludiamo il campo _id di MongoDB dalla risposta
    ))

    # Se non ci sono task attivi (Wrike vuoto o sync non ancora avvenuta)
    # rispondiamo comunque 200 con lista vuota invece di 404.
    if not active_docs:
        return {
            "tasks": [],
            "model_available": os.path.exists(MODEL_PATH),
            "message": "Nessun task attivo trovato."
        }

    # ── 2. Inferenza ML ───────────────────────────────────────────────────────
    # predict_risk() carica il pickle locale (addestrato con POST /wrike/train),
    # estrae le feature da ogni doc e chiama clf.predict_proba().
    # Se il pickle non esiste, restituisce lista vuota con un warning nel log.
    predictions = predict_risk(active_docs)

    # ── 3. Filtraggio e limite ────────────────────────────────────────────────
    # Le predictions sono già ordinate per riskScore DESC da predict_risk().
    # Applichiamo prima il filtro soglia, poi il limite massimo di righe.
    filtered = [p for p in predictions if p["riskScore"] >= min_risk][:limit]

    # ── 4. Arricchimento con nomi assegnatari ─────────────────────────────────
    # I task in MongoDB memorizzano solo gli ID degli assegnatari (es. "USER_A").
    # Leggiamo wrike_contacts per costruire una mappa ID → nome completo
    # e aggiungiamo assigneeNames a ogni task nel risultato.
    contact_col = get_wrike_col("wrike_contacts")
    contacts = {
        c["contactId"]: f"{c.get('firstName', '')} {c.get('lastName', '')}".strip()
        for c in contact_col.find(
            {},
            {"_id": 0, "contactId": 1, "firstName": 1, "lastName": 1}
        )
    }

    for task in filtered:
        # Se un ID non è presente in wrike_contacts (es. utente esterno),
        # usiamo direttamente l'ID come fallback.
        task["assigneeNames"] = [contacts.get(uid, uid) for uid in task.get("assigneeIds", [])]

    # ── 5. Risposta ───────────────────────────────────────────────────────────
    # total_high_risk viene calcolato PRIMA del filtro min_risk,
    # così è sempre il numero reale di task ad alto rischio nel sistema.
    return {
        "tasks": filtered,
        "total_active": len(active_docs),
        "total_high_risk": sum(1 for p in predictions if p["riskScore"] >= 0.65),
        "model_available": os.path.exists(MODEL_PATH),
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


# ── GET /wrike/workload-forecast ──────────────────────────────────────────────

@router.get("/workload-forecast")
def get_workload_forecast(
    weeks_ahead: int = Query(default=12, ge=1, le=52),
):
    """
    Previsione del carico di lavoro per le prossime N settimane.

    Utilizza regressione lineare con componenti stagionali (sinusoide 52/26 sett.)
    sullo storico dei task completati.

    Restituisce:
    - historical: ultimi 24 settimane di dati reali
    - forecast: N settimane previste
    - peak_week: settimana con il picco di carico previsto
    """
    # ── 1. Estrazione storico completamenti ───────────────────────────────────
    # Abbiamo bisogno SOLO di completedDate e status per aggregare per settimana.
    # Proiettiamo solo questi due campi per ridurre il traffico MongoDB.
    col = get_wrike_col("wrike_tasks")
    completed_docs = list(col.find(
        {"status": "Completed"},
        {"_id": 0, "completedDate": 1, "status": 1}
    ))

    # Soglia minima: il modello stagionale richiede almeno 2 mesi di storia
    # (≈8 settimane) per identificare anche un solo ciclo di stagionalità.
    # Con <8 dati il modello produrrebbe previsioni inaffidabili.
    if len(completed_docs) < 8:
        return {
            "data": [],
            "message": (
                f"Dati storici insufficienti ({len(completed_docs)} task completati). "
                "Servono almeno 8."
            ),
        }

    # ── 2. Calcolo della serie storica + previsione ───────────────────────────
    # forecast_workload() aggrega i task completati per settimana ISO,
    # addestra un modello Ridge con feature sinusoidali (stagionalità 52/26 sett.)
    # e restituisce una lista mista: dati reali (historical) + previsioni (forecast).
    series = forecast_workload(completed_docs, weeks_ahead=weeks_ahead)

    # ── 3. Identificazione del picco ─────────────────────────────────────────
    # Troviamo la settimana futura con il carico massimo previsto.
    # Utile per pianificare assunzioni temporanee o freelancer in anticipo.
    forecast_only = [r for r in series if r["forecast"] is not None]
    peak = max(forecast_only, key=lambda r: r["forecast"]) if forecast_only else None

    return {
        "data": series,
        "peak_week": peak,                      # settimana con picco di carico previsto
        "weeks_ahead": weeks_ahead,             # quante settimane future sono incluse
        "historical_points": sum(1 for r in series if r["historical"] is not None),
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


# ── POST /wrike/train ─────────────────────────────────────────────────────────

@router.post("/train")
def trigger_training(
    min_samples: int = Query(default=20, ge=10,
                             description="Numero minimo di task completati richiesti")
):
    """
    Addestra il modello di risk scoring sui task completati in MongoDB.

    - Usa Random Forest Classifier con class_weight='balanced'
    - Logga metriche, parametri e modello serializzato su MLflow
    - Salva un pickle locale per inferenza rapida (MODEL_PATH)

    Esegui questo endpoint:
    1. La prima volta dopo aver accumulato ~20 task completati
    2. Ogni mese per refreshare il modello con i nuovi dati storici
    """
    # ── 1. Caricamento dati di training da MongoDB ────────────────────────────
    # Per il training usiamo SOLO i task completati perché hanno outcome noto
    # (isDelayed=True/False). I task attivi sono il target dell'inferenza,
    # non del training: usarli causerebbe data leakage.
    col = get_wrike_col("wrike_tasks")
    completed_docs = list(col.find({"status": "Completed"}, {"_id": 0}))

    # ── 2. Guardia sul dataset minimo ─────────────────────────────────────────
    # Con meno di min_samples il modello andrebbe in overfitting estremo
    # (K-fold cross-validation con 5 fold richiede almeno ~15-20 campioni).
    # L'errore HTTP 422 Unprocessable Entity indica che i dati in ingresso
    # non soddisfano i requisiti, non un errore del server (5xx).
    if len(completed_docs) < min_samples:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Solo {len(completed_docs)} task completati in MongoDB. "
                f"Servono almeno {min_samples} per addestrare il modello."
            )
        )

    # ── 3. Training + logging MLflow ──────────────────────────────────────────
    # train_risk_model() esegue:
    #   a. Feature engineering (extract_dataset)
    #   b. RandomForestClassifier con 5-fold StratifiedKFold
    #   c. Log parametri, metriche e modello su MLflow
    #   d. Salvataggio pickle locale in MODEL_PATH per inferenza rapida
    # Il training può richiedere qualche secondo con dataset grandi.
    logger.info(
        "[/wrike/train] Avvio training su %d task completati.", len(completed_docs)
    )
    result = train_risk_model(completed_docs)

    # Se train_risk_model ha incontrato un errore interno (es. dataset ancora
    # troppo sbilanciato dopo il filtro interno), ritorna un dict con chiave "error".
    if "error" in result:
        raise HTTPException(status_code=422, detail=result["error"])

    logger.info("[/wrike/train] Training completato. ROC-AUC: %s", result.get("roc_auc"))

    return {
        "status": "success",
        "training_result": result,   # contiene accuracy, roc_auc, top_features, ecc.
        "model_path": MODEL_PATH,    # percorso del pickle salvato nel container
        "trained_at": datetime.now(timezone.utc).isoformat(),
    }


# ── GET /wrike/status ─────────────────────────────────────────────────────────

@router.get("/status")
def get_status():
    """
    Panoramica dello stato del sistema ML Wrike.

    Utile come health-check dalla AdminDashboard per mostrare all'admin:
    - Se il modello è pronto per fare previsioni
    - Quanti task ci sono nel database (e se ne bastano per un nuovo training)
    - Quando è stato addestrato l'ultimo modello
    """
    col = get_wrike_col("wrike_tasks")

    # ── Statistiche MongoDB ───────────────────────────────────────────────────
    # Queste query usano i contatori interni di MongoDB (O(1)) e non
    # caricano i documenti in memoria — sono quindi molto veloci.
    active_count    = col.count_documents({"status": {"$in": ["Active", "InProgress"]}})
    completed_count = col.count_documents({"status": "Completed"})

    # isDelayed=True: task attivi la cui dueDate è già passata (calcolato dal .NET al sync)
    delayed_count   = col.count_documents({"isDelayed": True})

    # scored_count: task che hanno già un riskScore assegnato dal modello ML.
    # Un valore $ne None indica che predict_risk() è già stato eseguito su quel task
    # e il punteggio è stato persistito in MongoDB (funzionalità futura — ora il
    # punteggio viene calcolato live ad ogni chiamata a /risk-scores).
    scored_count    = col.count_documents({"riskScore": {"$ne": None}})

    # ── Stato del modello ─────────────────────────────────────────────────────
    # Il modello è considerato "pronto" se esiste il pickle sul filesystem.
    # os.path.getmtime restituisce il timestamp Unix dell'ultima modifica del file,
    # che corrisponde all'ultimo training eseguito con POST /wrike/train.
    model_ready = os.path.exists(MODEL_PATH)
    model_mtime = None
    if model_ready:
        ts = os.path.getmtime(MODEL_PATH)
        model_mtime = datetime.fromtimestamp(ts, tz=timezone.utc).isoformat()

    return {
        "model_ready":      model_ready,       # True → inferenza disponibile
        "model_updated_at": model_mtime,       # ISO timestamp dell'ultimo training
        "active_tasks":     active_count,      # task attivi in MongoDB
        "completed_tasks":  completed_count,   # task completati (storico pentru training)
        "delayed_tasks":    delayed_count,     # task già in ritardo oggi
        "scored_tasks":     scored_count,      # task con riskScore persistito
        "min_samples_for_training": 20,        # soglia sotto la quale il training fallisce
        "can_train": completed_count >= 20,    # True = si può lanciare POST /wrike/train
    }
