"""
analytics/main.py
=================
Servizio FastAPI dedicato all'analisi del traffico del sito BlendStudio.

Architettura:
  - FastAPI  → espone le API REST consumate dall'AdminAnalytics del frontend
  - MongoDB  → sorgente dati; legge la collection "telemetry" scritta dal backend .NET
  - MLflow   → traccia i run di training dei modelli predittivi
  - pandas   → aggregazioni e trasformazioni dati per il training

Porta: 8000 (container), esposta su 8001 dell'host via docker-compose.

Endpoint disponibili:
  GET  /              → health check
  GET  /stats         → KPI aggregati (totale, oggi, settimana, sessioni uniche)
  GET  /trends        → serie temporale giornaliera (eventi + sessioni)
  GET  /top-pages     → classifica pagine più visitate
  GET  /top-actions   → classifica azioni più frequenti
  GET  /events        → log eventi paginato con filtri opzionali
  POST /train         → avvia un ciclo di training MLflow (sincrono via thread pool)
"""

import os
from datetime import datetime, timedelta, timezone

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import mlflow
import mlflow.sklearn
from pymongo import MongoClient
import pandas as pd
from dotenv import load_dotenv

# Carica le variabili d'ambiente dal file .env (solo in sviluppo locale)
load_dotenv()

# ─────────────────────────────────────────────────────────────────────────────
# App FastAPI
# ─────────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Blend Analytics Service",
    description="API di analisi del traffico per BlendStudio. Legge da MongoDB e registra i modelli su MLflow.",
    version="1.0.0",
)

# CORS aperto: il frontend React (porta 5173) e l'AdminPanel devono poter chiamare
# questi endpoint direttamente dal browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────────────────
# Configurazione
# ─────────────────────────────────────────────────────────────────────────────

# URI MongoDB: di default punta al container Docker "mongodb".
# In sviluppo locale sovrascrivere con MONGO_CONNECTION_STRING=mongodb://localhost:27017/blendstudio
MONGO_URI = os.getenv("MONGO_CONNECTION_STRING", "mongodb://mongodb:27017/blendstudio")

# URI MLflow tracking server (container "mlflow", porta 5000)
MLFLOW_URI = os.getenv("MLFLOW_TRACKING_URI", "http://mlflow:5000")

# Connette MLflow al tracking server e imposta l'esperimento di riferimento.
# Tutti i run di training verranno raggruppati sotto "blend_user_trends".
mlflow.set_tracking_uri(MLFLOW_URI)
mlflow.set_experiment("blend_user_trends")


# ─────────────────────────────────────────────────────────────────────────────
# Helper
# ─────────────────────────────────────────────────────────────────────────────

def get_col():
    """Restituisce la collection MongoDB 'telemetry'.

    Ogni documento ha la struttura inserita dal backend .NET:
      {
        "action":    string,    # es. "page_view", "click_cta"
        "page":      string,    # es. "/projects"
        "sessionId": string,    # ID sessione browser (8 char hex)
        "timestamp": datetime,
        "userAgent": string,    # (opzionale) browser dell'utente
        "screenW":   int,       # (opzionale) larghezza schermo
        "screenH":   int,       # (opzionale) altezza schermo
        "referrer":  string,    # (opzionale) pagina di provenienza
      }
    """
    client = MongoClient(MONGO_URI)
    db = client.get_default_database()
    return db["telemetry"]


# ─────────────────────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
async def root():
    """Health check. Restituisce lo stato del servizio e l'URI MLflow configurato."""
    return {"message": "Blend Analytics Service is running", "mlflow_uri": MLFLOW_URI}


@app.get("/stats", tags=["Analytics"])
async def get_stats():
    """KPI aggregati in tempo reale.

    Esegue 3 count su MongoDB + 1 distinct per le sessioni:
      - total_events:    tutti gli eventi nella collection
      - today_events:    eventi registrati dalla mezzanotte UTC di oggi
      - week_events:     eventi degli ultimi 7 giorni
      - unique_sessions: numero di sessionId distinti (esclude null/empty)

    Usato dai widget KPI della dashboard AdminAnalytics e dalla Dashboard principale.
    """
    col = get_col()

    # Conta tutti gli eventi senza filtro
    total = col.count_documents({})

    # Mezzanotte UTC corrente come riferimento per "oggi"
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_count = col.count_documents({"timestamp": {"$gte": today}})

    # Ultimi 7 giorni (dall'inizio di 7 giorni fa)
    week_ago = today - timedelta(days=7)
    week_count = col.count_documents({"timestamp": {"$gte": week_ago}})

    # Sessioni uniche: distinct sul campo sessionId, escludi valori falsy
    sessions = col.distinct("sessionId")
    sessions = [s for s in sessions if s]

    return {
        "total_events":    total,
        "today_events":    today_count,
        "week_events":     week_count,
        "unique_sessions": len(sessions),
        "timestamp":       datetime.now(timezone.utc).isoformat(),
    }


@app.get("/trends", tags=["Analytics"])
async def get_trends(days: int = Query(default=30, ge=1, le=365)):
    """Serie temporale giornaliera: eventi e sessioni per ogni giorno.

    Args:
        days: quanti giorni indietro guardare (default 30, max 365).

    Pipeline MongoDB:
      1. $match    → filtra solo i documenti più recenti di `from_date`
      2. $group    → raggruppa per data (stringa "YYYY-MM-DD"), conta eventi
                     e raccoglie i sessionId unici con $addToSet
      3. $sort     → ordine cronologico ascendente

    I giorni senza eventi vengono riempiti con 0 nel loop Python,
    così il grafico sul frontend non ha buchi.

    Restituisce una lista di oggetti: [{ date, events, sessions }, ...]
    """
    col = get_col()

    # Data di inizio: mezzanotte UTC di `days` giorni fa
    from_date = (
        datetime.now(timezone.utc)
        .replace(hour=0, minute=0, second=0, microsecond=0)
        - timedelta(days=days - 1)
    )

    pipeline = [
        # Filtra solo documenti nel range temporale richiesto
        {"$match": {"timestamp": {"$gte": from_date}}},
        # Raggruppa per giorno: conta gli eventi e raccoglie le sessioni uniche
        {"$group": {
            "_id":      {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}},
            "events":   {"$sum": 1},
            "sessions": {"$addToSet": "$sessionId"},  # set → deduplica automaticamente
        }},
        {"$sort": {"_id": 1}},  # ordine cronologico
    ]

    # Indicizza i risultati per data per accesso O(1) nel loop successivo
    raw = {doc["_id"]: doc for doc in col.aggregate(pipeline)}

    # Costruisce la serie completa, inserendo 0 per i giorni senza dati
    result = []
    for i in range(days):
        date_str = (from_date + timedelta(days=i)).strftime("%Y-%m-%d")
        doc = raw.get(date_str)
        result.append({
            "date":     date_str,
            "events":   doc["events"] if doc else 0,
            # Filtra i sessionId null prima di contarli
            "sessions": len([s for s in doc["sessions"] if s]) if doc else 0,
        })

    return result


@app.get("/top-pages", tags=["Analytics"])
async def get_top_pages(limit: int = Query(default=10, ge=1, le=50)):
    """Classifica delle pagine più visitate.

    Args:
        limit: quante pagine restituire (default 10, max 50).

    Pipeline:
      - $group per `page` → somma le visualizzazioni e raccoglie le sessioni
      - $sort  discendente per views
      - $limit

    Il campo `sessions` conta le sessioni uniche per pagina (utenti distinti).
    Usato dal grafico a barre orizzontali in AdminAnalytics.
    """
    col = get_col()
    pipeline = [
        {"$group": {
            "_id":      "$page",
            "views":    {"$sum": 1},
            "sessions": {"$addToSet": "$sessionId"},
        }},
        {"$sort":  {"views": -1}},
        {"$limit": limit},
    ]
    docs = list(col.aggregate(pipeline))
    return [
        {
            "page":     d["_id"] or "/",  # fallback "/" se il campo è null
            "views":    d["views"],
            "sessions": len([s for s in d["sessions"] if s]),
        }
        for d in docs
    ]


@app.get("/top-actions", tags=["Analytics"])
async def get_top_actions(limit: int = Query(default=10, ge=1, le=50)):
    """Classifica delle azioni più frequenti (es. page_view, click_cta, form_submit).

    Args:
        limit: quante azioni restituire (default 10, max 50).

    Utile per capire quali interazioni sono più comuni sul sito.
    """
    col = get_col()
    pipeline = [
        {"$group": {
            "_id":   "$action",
            "count": {"$sum": 1},
        }},
        {"$sort":  {"count": -1}},
        {"$limit": limit},
    ]
    docs = list(col.aggregate(pipeline))
    return [{"action": d["_id"] or "unknown", "count": d["count"]} for d in docs]


@app.get("/events", tags=["Analytics"])
async def get_events(
    page:      int = Query(default=1,   ge=1),
    limit:     int = Query(default=50,  ge=1, le=200),
    action:    str = Query(default=""),
    page_path: str = Query(default="", alias="pagePath"),
):
    """Log eventi paginato con filtri opzionali.

    Args:
        page:      numero di pagina (1-based).
        limit:     eventi per pagina (max 200).
        action:    filtra per tipo di azione (es. "page_view").
        page_path: filtra per percorso pagina (es. "/projects").

    Ordinamento: dal più recente al più vecchio.
    I timestamp MongoDB (datetime) vengono convertiti in ISO string per JSON.

    Usato dalla tabella eventi in AdminAnalytics.
    """
    col = get_col()

    # Costruisce il filtro dinamicamente solo se i parametri sono presenti
    query: dict = {}
    if action:
        query["action"] = action
    if page_path:
        query["page"] = page_path

    total = col.count_documents(query)

    # Proietta via _id (ObjectId non è JSON-serializzabile nativamente),
    # esclude il campo con {"_id": 0}
    docs = list(
        col.find(query, {"_id": 0})
        .sort("timestamp", -1)
        .skip((page - 1) * limit)
        .limit(limit)
    )

    # Converte i datetime MongoDB in stringhe ISO 8601 per la risposta JSON
    for doc in docs:
        if isinstance(doc.get("timestamp"), datetime):
            doc["timestamp"] = doc["timestamp"].isoformat()

    return {"total": total, "page": page, "limit": limit, "data": docs}


# ─────────────────────────────────────────────────────────────────────────────
# Statistiche avanzate
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/device-stats", tags=["Analytics"])
async def get_device_stats():
    """Distribuzione dei dispositivi basata sulla larghezza dello schermo (screenW).

    Classi:
      - mobile:  screenW < 768  (smartphone)
      - tablet:  768 ≤ screenW < 1024
      - desktop: screenW ≥ 1024

    Analizza un screenW per sessione per non contare lo stesso device più volte.
    Utile per decidere dove concentrare gli sforzi di ottimizzazione UI.
    """
    col = get_col()
    pipeline = [
        {"$match": {"screenW": {"$exists": True, "$ne": None}}},
        # Un solo screenW per sessione
        {"$group": {
            "_id":    "$sessionId",
            "screenW": {"$first": "$screenW"},
        }},
    ]
    sessions = list(col.aggregate(pipeline))

    mobile  = sum(1 for s in sessions if (s.get("screenW") or 0) < 768)
    tablet  = sum(1 for s in sessions if 768 <= (s.get("screenW") or 0) < 1024)
    desktop = sum(1 for s in sessions if (s.get("screenW") or 0) >= 1024)
    total   = len(sessions) or 1

    return {
        "mobile":          {"count": mobile,  "pct": round(mobile  / total * 100, 1)},
        "tablet":          {"count": tablet,  "pct": round(tablet  / total * 100, 1)},
        "desktop":         {"count": desktop, "pct": round(desktop / total * 100, 1)},
        "total_sessions":  len(sessions),
    }


@app.get("/session-stats", tags=["Analytics"])
async def get_session_stats():
    """Statistiche di qualità delle sessioni.

    Calcola:
      - avg_events_per_session: media degli eventi per sessione
      - bounce_rate:            % sessioni con un solo evento (rimbalzo)
      - avg_pages_per_session:  media delle pagine distinte per sessione

    Un bounce rate alto indica che molti utenti arrivano e vanno via subito.
    """
    col = get_col()
    pipeline = [
        {"$match": {"sessionId": {"$ne": None}}},
        {"$group": {
            "_id":    "$sessionId",
            "events": {"$sum": 1},
            "pages":  {"$addToSet": "$page"},
        }},
    ]
    sessions = list(col.aggregate(pipeline))
    if not sessions:
        return {"avg_events_per_session": 0, "bounce_rate": 0, "avg_pages_per_session": 0, "total_sessions": 0}

    total_s = len(sessions)
    bounces    = sum(1 for s in sessions if s["events"] == 1)
    avg_events = round(sum(s["events"]      for s in sessions) / total_s, 2)
    avg_pages  = round(sum(len(s["pages"])  for s in sessions) / total_s, 2)

    return {
        "avg_events_per_session": avg_events,
        "bounce_rate":            round(bounces / total_s * 100, 1),
        "avg_pages_per_session":  avg_pages,
        "total_sessions":         total_s,
    }


@app.get("/referrer-stats", tags=["Analytics"])
async def get_referrer_stats(limit: int = Query(default=10, ge=1, le=50)):
    """Top sorgenti di traffico (domini referrer).

    Conta una sola volta per sessione il referrer di ingresso.
    I valori vuoti/null vengono classificati come "direct" (traffico diretto).

    Args:
        limit: quante sorgenti restituire (default 10, max 50).
    """
    col = get_col()
    pipeline = [
        # Un solo referrer per sessione (il primo evento della sessione)
        {"$group": {
            "_id":      "$sessionId",
            "referrer": {"$first": "$referrer"},
        }},
        # Normalizza null/vuoto a "direct"
        {"$addFields": {
            "source": {
                "$cond": [
                    {"$or": [
                        {"$eq": ["$referrer", None]},
                        {"$eq": ["$referrer", ""]},
                    ]},
                    "direct",
                    "$referrer",
                ]
            }
        }},
        {"$group": {
            "_id":   "$source",
            "count": {"$sum": 1},
        }},
        {"$sort":  {"count": -1}},
        {"$limit": limit},
    ]
    docs = list(col.aggregate(pipeline))
    return [{"source": d["_id"], "count": d["count"]} for d in docs]


@app.get("/funnel", tags=["Analytics"])
async def get_funnel():
    """Imbuto di conversione: dalla visita all'invio del form contatti.

    Fasi:
      1. Visitatori totali     → sessionId con almeno un page_view
      2. Visitano /contact     → sessionId con page_view su /contact
      3. Aprono il form        → sessionId con action = contact_form_start
      4. Inviano il form       → sessionId con action = contact_form_submit

    Ogni step usa sessionId distinti per misurare utenti unici, non eventi.
    """
    col = get_col()

    def distinct_sessions(query: dict) -> int:
        result = col.distinct("sessionId", query)
        return len([s for s in result if s])

    total_visitors   = distinct_sessions({"action": "page_view"})
    contact_visitors = distinct_sessions({"action": "page_view", "page": "/contact"})
    form_started     = distinct_sessions({"action": "contact_form_start"})
    form_submitted   = distinct_sessions({"action": "contact_form_submit"})

    def rate(num: int, denom: int) -> float:
        return round(num / denom * 100, 1) if denom > 0 else 0.0

    return {
        "steps": [
            {"step": "Visitatori",        "count": total_visitors,   "rate": 100.0},
            {"step": "Visitano /contact", "count": contact_visitors, "rate": rate(contact_visitors, total_visitors)},
            {"step": "Aprono il form",    "count": form_started,     "rate": rate(form_started,     total_visitors)},
            {"step": "Inviano il form",   "count": form_submitted,   "rate": rate(form_submitted,   total_visitors)},
        ],
        "conversion_rate": rate(form_submitted, total_visitors),
    }


# ─────────────────────────────────────────────────────────────────────────────
# Training MLflow
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/train", tags=["ML"])
async def train_model():
    """Avvia un ciclo di training e lo registra su MLflow.

    Esegue `run_training_cycle` in un thread separato (non blocca l'event loop).
    Quando il servizio di analytics ha dati sufficienti, qui si potrà addestrare
    un vero modello predittivo (es. regressione lineare sul traffico giornaliero).
    """
    from fastapi.concurrency import run_in_threadpool
    await run_in_threadpool(run_training_cycle)
    return {"status": "Training completed"}


def run_training_cycle():
    """Ciclo di training: carica i dati da MongoDB, li aggrega e logga le metriche su MLflow.

    Flusso:
      1. Recupera tutti gli eventi dalla collection "telemetry"
      2. Converte in DataFrame pandas
      3. Aggrega per giorno → conta gli eventi giornalieri
      4. Apre un MLflow run e logga parametri e metriche

    TODO:
      - Aggiungere un vero modello sklearn (es. LinearRegression sui giorni)
      - Loggare il modello con mlflow.sklearn.log_model()
      - Implementare previsione a 7/30 giorni
    """
    col = get_col()

    # Recupera solo i campi necessari per il training, esclude _id
    docs = list(col.find({}, {"_id": 0, "timestamp": 1, "sessionId": 1, "page": 1}))
    if not docs:
        print("No data to train on — collection telemetry is empty.")
        return

    df = pd.DataFrame(docs)

    # Normalizza il timestamp in UTC-aware per evitare problemi di timezone
    df["timestamp"] = pd.to_datetime(df["timestamp"], utc=True)
    df["day"] = df["timestamp"].dt.date

    # Aggregazione giornaliera: conta eventi per giorno
    daily = df.groupby("day").size().reset_index(name="events")

    # Registra il run su MLflow con parametri e metriche di base
    with mlflow.start_run():
        mlflow.log_param("model_type",   "linear_regression")  # tipo modello pianificato
        mlflow.log_param("n_samples",    len(daily))            # numero di giorni con dati
        mlflow.log_metric("total_events",        len(docs))
        mlflow.log_metric("total_days",          len(daily))
        mlflow.log_metric(
            "avg_events_per_day",
            float(daily["events"].mean()) if len(daily) > 0 else 0
        )

    print(f"Training cycle complete: {len(docs)} events across {len(daily)} days — logged to MLflow.")


# ─────────────────────────────────────────────────────────────────────────────
# Entrypoint (sviluppo locale)
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    # In produzione viene avviato da Docker: uvicorn main:app --host 0.0.0.0 --port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
