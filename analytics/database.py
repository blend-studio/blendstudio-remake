"""
analytics/database.py
=====================
Helper per l'accesso a MongoDB.

Espone `get_col()`, l'unica funzione necessaria per ottenere la collection
"telemetry" da qualsiasi router senza ripetere la logica di connessione.
"""

from urllib.parse import urlparse

from pymongo import MongoClient

from config import MONGO_URI


def get_col():
    """Restituisce la collection MongoDB 'telemetry'.

    Crea una nuova connessione ad ogni chiamata (sufficiente per il volume
    attuale; in futuro si può sostituire con un client singleton).

    Struttura di ogni documento inserito dal backend .NET:
      {
        "action":    str,       # es. "page_view", "contact_form_submit"
        "page":      str,       # es. "/projects"
        "sessionId": str,       # ID sessione browser, 8 char hex
        "timestamp": datetime,  # assegnato dal backend .NET in UTC
        "referrer":  str|None,  # URL di provenienza (opzionale)
        "userAgent": str|None,  # stringa browser (opzionale)
        "language":  str|None,  # lingua browser, es. "it-IT" (opzionale)
        "screenW":   int|None,  # larghezza schermo in px (opzionale)
        "screenH":   int|None,  # altezza schermo in px (opzionale)
        "elementId": str|None,  # elemento cliccato (opzionale)
        "metadata":  dict|None, # dati extra liberi (opzionale)
      }
    """
    client = MongoClient(MONGO_URI)
    # Prova a ricavare il nome del db dall'URI (es. mongodb://host/blendstudio),
    # altrimenti usa il default "blendstudio".
    db_name = urlparse(MONGO_URI).path.lstrip("/") or "blendstudio"
    db = client[db_name]
    return db["telemetry"]


def get_wrike_col(collection: str = "wrike_tasks"):
    """Restituisce una collection Wrike da MongoDB.

    Collezioni disponibili:
      - "wrike_tasks"    : snapshot dei task Wrike (popolato da .NET)
      - "wrike_contacts" : membri del team con ID e nome
    """
    client = MongoClient(MONGO_URI)
    db_name = urlparse(MONGO_URI).path.lstrip("/") or "blendstudio"
    db = client[db_name]
    return db[collection]
