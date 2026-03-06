"""
analytics/routers/stats.py
==========================
Endpoint di analytics di base:

  GET /stats        → KPI aggregati (totale, oggi, settimana, sessioni uniche)  
  GET /trends       → serie temporale giornaliera (eventi + sessioni per giorno)
  GET /top-pages    → classifica pagine più visitate
  GET /top-actions  → classifica azioni più frequenti
  GET /events       → log eventi paginato con filtri opzionali
"""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Query

from database import get_col

router = APIRouter(tags=["Analytics"])


@router.get("/stats")
async def get_stats():
    """KPI aggregati in tempo reale.

    Esegue 3 count su MongoDB + 1 distinct per le sessioni:
      - total_events:    tutti gli eventi nella collection
      - today_events:    eventi registrati dalla mezzanotte UTC di oggi
      - week_events:     eventi degli ultimi 7 giorni
      - unique_sessions: numero di sessionId distinti (esclude null/empty)
    """
    col = get_col()

    # Conta tutti gli eventi senza filtro
    total = col.count_documents({})

    # Mezzanotte UTC corrente come riferimento per "oggi"
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_count = col.count_documents({"Timestamp": {"$gte": today}})

    # Ultimi 7 giorni (dall'inizio di 7 giorni fa)
    week_ago = today - timedelta(days=7)
    week_count = col.count_documents({"Timestamp": {"$gte": week_ago}})

    # Sessioni uniche: distinct sul campo SessionId, escludi valori falsy
    sessions = [s for s in col.distinct("SessionId") if s]

    return {
        "total_events":    total,
        "today_events":    today_count,
        "week_events":     week_count,
        "unique_sessions": len(sessions),
        "timestamp":       datetime.now(timezone.utc).isoformat(),
    }


@router.get("/trends")
async def get_trends(days: int = Query(default=30, ge=1, le=365)):
    """Serie temporale giornaliera: eventi e sessioni per ogni giorno.

    Args:
        days: quanti giorni indietro guardare (default 30, max 365).

    Pipeline MongoDB:
      1. $match  → filtra i documenti più recenti di `from_date`
      2. $group  → raggruppa per data "YYYY-MM-DD", conta eventi,
                   raccoglie sessionId unici con $addToSet
      3. $sort   → ordine cronologico ascendente

    I giorni senza eventi vengono riempiti con 0 così il grafico
    sul frontend non ha buchi nella serie temporale.
    """
    col = get_col()

    from_date = (
        datetime.now(timezone.utc)
        .replace(hour=0, minute=0, second=0, microsecond=0)
        - timedelta(days=days - 1)
    )

    pipeline = [
        {"$match": {"Timestamp": {"$gte": from_date}}},
        {"$group": {
            "_id":      {"$dateToString": {"format": "%Y-%m-%d", "date": "$Timestamp"}},
            "events":   {"$sum": 1},
            "sessions": {"$addToSet": "$SessionId"},
        }},
        {"$sort": {"_id": 1}},
    ]

    # Indicizza per data → accesso O(1) nel loop di gap-fill
    raw = {doc["_id"]: doc for doc in col.aggregate(pipeline)}

    result = []
    for i in range(days):
        date_str = (from_date + timedelta(days=i)).strftime("%Y-%m-%d")
        doc = raw.get(date_str)
        result.append({
            "date":     date_str,
            "events":   doc["events"] if doc else 0,
            "sessions": len([s for s in doc["sessions"] if s]) if doc else 0,
        })

    return result


@router.get("/top-pages")
async def get_top_pages(limit: int = Query(default=10, ge=1, le=50)):
    """Classifica delle pagine più visitate.

    Args:
        limit: quante pagine restituire (default 10, max 50).

    Raggruppa per `page`, conta le visualizzazioni e raccoglie le sessioni
    uniche ($addToSet) per misurare utenti distinti per pagina.
    """
    col = get_col()
    pipeline = [
        {"$group": {
            "_id":      "$Page",
            "views":    {"$sum": 1},
            "sessions": {"$addToSet": "$SessionId"},
        }},
        {"$sort":  {"views": -1}},
        {"$limit": limit},
    ]
    docs = list(col.aggregate(pipeline))
    return [
        {
            "page":     d["_id"] or "/",
            "views":    d["views"],
            "sessions": len([s for s in d["sessions"] if s]),
        }
        for d in docs
    ]


@router.get("/top-actions")
async def get_top_actions(limit: int = Query(default=10, ge=1, le=50)):
    """Classifica delle azioni più frequenti (es. page_view, scroll_depth, contact_form_submit).

    Args:
        limit: quante azioni restituire (default 10, max 50).
    """
    col = get_col()
    pipeline = [
        {"$group": {
            "_id":   "$Action",
            "count": {"$sum": 1},
        }},
        {"$sort":  {"count": -1}},
        {"$limit": limit},
    ]
    docs = list(col.aggregate(pipeline))
    return [{"action": d["_id"] or "unknown", "count": d["count"]} for d in docs]


@router.get("/events")
async def get_events(
    page:      int = Query(default=1,  ge=1),
    limit:     int = Query(default=50, ge=1, le=200),
    action:    str = Query(default=""),
    page_path: str = Query(default="", alias="pagePath"),
):
    """Log eventi paginato con filtri opzionali.

    Args:
        page:      numero di pagina 1-based.
        limit:     eventi per pagina (max 200).
        action:    filtra per tipo azione (es. "page_view").
        page_path: filtra per path pagina (es. "/projects").

    Ordinamento: dal più recente al più vecchio.
    I timestamp MongoDB (datetime) vengono serializzati come ISO 8601.
    """
    col = get_col()

    query: dict = {}
    if action:
        query["Action"] = action
    if page_path:
        query["Page"] = page_path

    total = col.count_documents(query)

    # {"_id": 0} esclude ObjectId non serializzabile in JSON
    docs = list(
        col.find(query, {"_id": 0})
        .sort("Timestamp", -1)
        .skip((page - 1) * limit)
        .limit(limit)
    )

    # Normalizza PascalCase → camelCase per il frontend
    normalized = []
    for doc in docs:
        ts = doc.get("Timestamp")
        normalized.append({
            "action":    doc.get("Action"),
            "page":      doc.get("Page"),
            "elementId": doc.get("ElementId"),
            "metadata":  doc.get("Metadata"),
            "sessionId": doc.get("SessionId"),
            "referrer":  doc.get("Referrer"),
            "userAgent": doc.get("UserAgent"),
            "language":  doc.get("Language"),
            "screenW":   doc.get("ScreenW"),
            "screenH":   doc.get("ScreenH"),
            "timestamp": ts.isoformat() if isinstance(ts, datetime) else ts,
        })

    return {"total": total, "page": page, "limit": limit, "data": normalized}


@router.get("/scroll-depth")
async def get_scroll_depth():
    """Distribuzione della profondità di scroll per milestone (25/50/75/100%).

    Conta quante sessioni uniche hanno raggiunto ciascun milestone di scroll.
    I dati provengono dagli eventi "scroll_depth" tracciati da useScrollDepth.

    Il risultato mostra quanti utenti hanno effettivamente letto il contenuto
    della pagina oltre la prima schermata.
    """
    col = get_col()
    milestones = [25, 50, 75, 100]
    result = []
    for m in milestones:
        count = len([s for s in col.distinct("SessionId", {
            "Action":           "scroll_depth",
            "Metadata.depth":   str(m),
        }) if s])
        result.append({"depth": m, "sessions": count, "label": f"{m}%"})
    return result


@router.get("/hourly-traffic")
async def get_hourly_traffic():
    """Distribuzione oraria del traffico — quanti eventi per ora del giorno (UTC+1).

    Utile per capire in quale fascia oraria il sito riceve più visite.
    Raggruppa tutti gli eventi per ora (0-23) e restituisce il conteggio.
    """
    col = get_col()
    pipeline = [
        {"$match": {"Timestamp": {"$ne": None}}},
        {"$addFields": {
            "hour": {
                "$hour": {
                    "date":     "$Timestamp",
                    "timezone": "Europe/Rome",
                }
            }
        }},
        {"$group": {
            "_id":   "$hour",
            "count": {"$sum": 1},
        }},
        {"$sort": {"_id": 1}},
    ]
    raw = {doc["_id"]: doc["count"] for doc in col.aggregate(pipeline)}
    return [{"hour": h, "label": f"{h:02d}:00", "count": raw.get(h, 0)} for h in range(24)]
