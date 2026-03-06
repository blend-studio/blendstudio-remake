"""
analytics/routers/advanced.py
==============================
Statistiche avanzate sul comportamento degli utenti:

  GET /device-stats   → distribuzione dispositivi (mobile / tablet / desktop)
  GET /session-stats  → qualità sessioni (bounce rate, profondità, eventi/sessione)
  GET /referrer-stats → top sorgenti di traffico
  GET /funnel         → imbuto di conversione verso il form contatti
"""

from fastapi import APIRouter, Query

from database import get_col

router = APIRouter(tags=["Advanced Analytics"])


@router.get("/device-stats")
async def get_device_stats():
    """Distribuzione dei dispositivi basata sulla larghezza schermo (screenW).

    Classi:
      - mobile:  screenW < 768
      - tablet:  768 ≤ screenW < 1024
      - desktop: screenW ≥ 1024

    Considera un solo screenW per sessionId per non contare lo stesso
    dispositivo più volte in una stessa sessione.
    """
    col = get_col()
    pipeline = [
        {"$match": {"screenW": {"$exists": True, "$ne": None}}},
        # Primo evento della sessione → un solo device per sessione
        {"$group": {
            "_id":     "$sessionId",
            "screenW": {"$first": "$screenW"},
        }},
    ]
    sessions = list(col.aggregate(pipeline))

    mobile  = sum(1 for s in sessions if (s.get("screenW") or 0) < 768)
    tablet  = sum(1 for s in sessions if 768 <= (s.get("screenW") or 0) < 1024)
    desktop = sum(1 for s in sessions if (s.get("screenW") or 0) >= 1024)
    total   = len(sessions) or 1  # evita divisione per zero

    return {
        "mobile":         {"count": mobile,  "pct": round(mobile  / total * 100, 1)},
        "tablet":         {"count": tablet,  "pct": round(tablet  / total * 100, 1)},
        "desktop":        {"count": desktop, "pct": round(desktop / total * 100, 1)},
        "total_sessions": len(sessions),
    }


@router.get("/session-stats")
async def get_session_stats():
    """Qualità delle sessioni utente.

    Metriche calcolate:
      - avg_events_per_session: media degli eventi generati per sessione
      - bounce_rate:            % sessioni con un solo evento (rimbalzo immediato)
      - avg_pages_per_session:  media delle pagine distinte visitate per sessione

    Un bounce rate elevato indica che molti utenti abbandonano dopo la prima pagina.
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
        return {
            "avg_events_per_session": 0,
            "bounce_rate":            0,
            "avg_pages_per_session":  0,
            "total_sessions":         0,
        }

    total_s    = len(sessions)
    bounces    = sum(1 for s in sessions if s["events"] == 1)
    avg_events = round(sum(s["events"]     for s in sessions) / total_s, 2)
    avg_pages  = round(sum(len(s["pages"]) for s in sessions) / total_s, 2)

    return {
        "avg_events_per_session": avg_events,
        "bounce_rate":            round(bounces / total_s * 100, 1),
        "avg_pages_per_session":  avg_pages,
        "total_sessions":         total_s,
    }


@router.get("/referrer-stats")
async def get_referrer_stats(limit: int = Query(default=10, ge=1, le=50)):
    """Top sorgenti di traffico (referrer).

    Conta una volta per sessione il referrer d'ingresso (primo evento).
    Valori vuoti o null vengono classificati come "direct" (traffico diretto).

    Args:
        limit: numero di sorgenti da restituire (default 10, max 50).
    """
    col = get_col()
    pipeline = [
        # Prende solo il primo referrer per sessione
        {"$group": {
            "_id":      "$sessionId",
            "referrer": {"$first": "$referrer"},
        }},
        # Sostituisce null/vuoto con "direct"
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


@router.get("/funnel")
async def get_funnel():
    """Imbuto di conversione: dalla visita all'invio del form contatti.

    Fasi (sessioni uniche per step):
      1. Visitatori totali   → almeno un page_view
      2. Visitano /contact   → page_view su /contact
      3. Aprono il form      → action = contact_form_start
      4. Inviano il form     → action = contact_form_submit

    Il campo `conversion_rate` è il rapporto step-4 / step-1.
    """
    col = get_col()

    def distinct_sessions(query: dict) -> int:
        """Conta sessioni uniche che soddisfano `query`."""
        result = col.distinct("sessionId", query)
        return len([s for s in result if s])

    def rate(num: int, denom: int) -> float:
        return round(num / denom * 100, 1) if denom > 0 else 0.0

    total_visitors   = distinct_sessions({"action": "page_view"})
    contact_visitors = distinct_sessions({"action": "page_view", "page": "/contact"})
    form_started     = distinct_sessions({"action": "contact_form_start"})
    form_submitted   = distinct_sessions({"action": "contact_form_submit"})

    return {
        "steps": [
            {"step": "Visitatori",        "count": total_visitors,   "rate": 100.0},
            {"step": "Visitano /contact", "count": contact_visitors, "rate": rate(contact_visitors, total_visitors)},
            {"step": "Aprono il form",    "count": form_started,     "rate": rate(form_started,     total_visitors)},
            {"step": "Inviano il form",   "count": form_submitted,   "rate": rate(form_submitted,   total_visitors)},
        ],
        "conversion_rate": rate(form_submitted, total_visitors),
    }
