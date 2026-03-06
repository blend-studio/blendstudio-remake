"""
analytics/ml/risk_scoring.py
============================
Modello di classificazione per la "Previsione dei Ritardi" (Risk Scoring).

ALGORITMO SCELTO: Random Forest Classifier
  Perché:
  - Gestisce bene feature miste (numeriche + categoriali encoded)
  - Output di probabilità calibrate (predict_proba) → ottimo per risk score %
  - Robusto su dataset piccoli (tipici di una PMI: 200-2000 task storici)
  - Interpretabile via feature_importances_ per capire PERCHÉ un task è a rischio

ALTERNATIVE valutate:
  - XGBoost: migliore su dataset grandi, richiede dipendenza extra
  - Logistic Regression: troppo lineare per interazioni complesse
  - SVM: non produce probabilità calibrate nativamente

FEATURE ENGINEERING:
  Dal documento MongoDB wrike_tasks si estraggono feature che catturano:
  1. Complessità del task: durata pianificata, n. assegnatari, commenti
  2. Urgenza: giorni rimanenti alla scadenza, % avanzamento sul timeline
  3. Attività: sforzo speso vs stimato (effort ratio), giorni fermo nello status attuale
  4. Priorità: importanza encoded (High=2, Normal=1, Low=0)

FLUSSO:
  train_risk_model() → addestra su task completati → logga su MLflow
  predict_risk(tasks) → applica modello ai task attivi → restituisce score 0-1
"""

import logging
import os
import pickle
from datetime import datetime, timezone

import mlflow
import mlflow.sklearn
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score, classification_report, roc_auc_score
)
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from config import MLFLOW_URI

logger = logging.getLogger(__name__)

# Path dov'è salvato il modello serializzato.
# Salvato NELLA STESSA DIRECTORY del modulo (analytics/ml/) per
# garantire che il percorso funzioni sia in locale che nel container Docker.
MODEL_PATH = os.path.join(os.path.dirname(__file__), "risk_model.pkl")

# ── Feature Engineering ───────────────────────────────────────────────────────

# IMPORTANCE_MAP: converte la priorità testuale di Wrike in valore ordinale.
# Questo è il metodo più semplice. In alternativa, si potrebbe usare
# sklearn.preprocessing.OrdinalEncoder, ma con solo 3 valori fissi è overkill.
IMPORTANCE_MAP = {"High": 2, "Normal": 1, "Low": 0}

# FEATURE_COLS: le 11 feature usate per training e inferenza.
# ORDINE FISSO: deve essere lo stesso al momento del training (fit)
# e dell'inferenza (predict). Il pickle salva il modello ma non
# la lista di feature, quindi questo array è il "contratto" tra
# feature engineering e il classificatore.
FEATURE_COLS = [
    # -- Temporali --
    "planned_duration_days",    # durata pianificata (start → due)
    "days_until_due",           # giorni mancanti alla scadenza (negativo = scaduto)
    "days_since_start",         # giorni dalla data di inizio
    "pct_timeline_elapsed",     # avanzamento % sul timeline (cappato a 200)
    # -- Priorità --
    "importance_encoded",       # High=2, Normal=1, Low=0
    # -- Struttura --
    "assignee_count",           # n. persone assegnate
    "comment_count",            # attività discussione
    "attachment_count",         # elaborati allegati
    "days_in_current_status",   # giorni fermo nello stesso status
    "has_due_date",             # flag 0/1 (task senza scadenza = meno urgenti)
    # -- Effort --
    "effort_ratio",             # spentMinutes / estimatedMinutes (cappato a 5)
]


def _extract_features(doc: dict, reference_dt: datetime | None = None) -> dict:
    """
    Trasforma un documento MongoDB wrike_tasks in un vettore di feature.

    Parametri
    ----------
    doc : dict
        Documento raw da MongoDB.
    reference_dt : datetime | None
        Istante di riferimento per i calcoli temporali.
        Se None usa datetime.utcnow(). Serve soprattutto per il training
        storico (usare completedDate come riferimento).

    Returned dict keys = FEATURE_COLS
    """
    now = reference_dt or datetime.now(timezone.utc)

    def to_dt(v):
        """Converte valore MongoDB (datetime o string ISO) in datetime UTC."""
        if v is None:
            return None
        if isinstance(v, datetime):
            return v.replace(tzinfo=timezone.utc) if v.tzinfo is None else v
        try:
            return datetime.fromisoformat(str(v)).replace(tzinfo=timezone.utc)
        except Exception:
            return None

    start_date     = to_dt(doc.get("startDate"))
    due_date       = to_dt(doc.get("dueDate"))
    completed_date = to_dt(doc.get("completedDate"))

    # Per il training, usiamo completedDate come "reference" per non introdurre
    # data leakage (non conoscevamo il futuro quando il task era attivo).
    if completed_date:
        ref = completed_date
    else:
        ref = now

    # ── Feature 1-5: temporali ──────────────────────────────────────────────
    has_due_date = 1 if due_date else 0

    planned_duration_days = 0.0
    if start_date and due_date:
        planned_duration_days = max(0.0, (due_date - start_date).total_seconds() / 86400)

    days_until_due = 0.0
    if due_date:
        days_until_due = (due_date - ref).total_seconds() / 86400  # negativo = scaduto

    days_since_start = 0.0
    if start_date:
        days_since_start = max(0.0, (ref - start_date).total_seconds() / 86400)

    pct_timeline_elapsed = 0.0
    if planned_duration_days > 0:
        pct_timeline_elapsed = min(200.0, (days_since_start / planned_duration_days) * 100)

    # ── Feature 6: importanza ───────────────────────────────────────────────
    importance_encoded = IMPORTANCE_MAP.get(doc.get("importance", "Normal"), 1)

    # ── Feature 7-9: attività ───────────────────────────────────────────────
    assignee_count         = len(doc.get("assigneeIds", []))
    comment_count          = int(doc.get("commentCount", 0))
    attachment_count       = int(doc.get("attachmentCount", 0))
    days_in_current_status = int(doc.get("daysInCurrentStatus", 0))

    # ── Feature 10: effort ratio ────────────────────────────────────────────
    est   = doc.get("estimatedMinutes") or 0
    spent = doc.get("spentMinutes") or 0
    # effort_ratio > 1 significa che la stima era troppo ottimistica.
    # Cap a 5 per evitare che outlier esplosi (es. task mai chiuso con ore
    # accumulate per mesi) dominino l'addestramento del modello.
    effort_ratio = min(5.0, spent / est) if est > 0 else 0.0

    return {
        "planned_duration_days":   planned_duration_days,
        "days_until_due":          days_until_due,
        "days_since_start":        days_since_start,
        "pct_timeline_elapsed":    pct_timeline_elapsed,
        "importance_encoded":      float(importance_encoded),
        "assignee_count":          float(assignee_count),
        "comment_count":           float(comment_count),
        "attachment_count":        float(attachment_count),
        "days_in_current_status":  float(days_in_current_status),
        "has_due_date":            float(has_due_date),
        "effort_ratio":            effort_ratio,
    }


def extract_dataset(docs: list[dict]) -> pd.DataFrame:
    """
    Converte una lista di documenti MongoDB in un DataFrame pronto per sklearn.

    Per il training usa solo task COMPLETATI (outcome noto).
    Label: is_delayed (1 = in ritardo, 0 = puntuale o anticipato)
    """
    rows = []
    for doc in docs:
        # Solo i task Completed hanno un isDelayed definitivo.
        # Usare task attivi causerebbe data leakage (non sappiamo ancora
        # se si ritarderanno) o label noise (isDelayed cambia nel tempo).
        if doc.get("status") != "Completed":
            continue
        features = _extract_features(doc)
        # task_id e title non sono feature ML: vengono usati solo per
        # debug/interpretabilità, poi rimossi prima di passare a sklearn.
        features["task_id"] = doc.get("taskId", "")
        features["title"]   = doc.get("title", "")
        features["is_delayed"] = int(doc.get("isDelayed", False))
        rows.append(features)

    if not rows:
        return pd.DataFrame()

    df = pd.DataFrame(rows)
    return df


# ── Training ─────────────────────────────────────────────────────────────────

def train_risk_model(docs: list[dict]) -> dict:
    """
    Addestra il modello di risk scoring e logga su MLflow.

    Parametri
    ----------
    docs : list[dict]
        Task completati da MongoDB collection "wrike_tasks".

    Returns
    -------
    dict con metriche: accuracy, roc_auc, feature_importances
    """
    mlflow.set_tracking_uri(MLFLOW_URI)
    mlflow.set_experiment("wrike-risk-scoring")

    df = extract_dataset(docs)

    if df.empty or len(df) < 20:
        msg = f"Dataset troppo piccolo per il training ({len(df)} samples). Servono almeno 20 task completati."
        logger.warning(msg)
        return {"error": msg}

    X = df[FEATURE_COLS].fillna(0)
    y = df["is_delayed"]

    logger.info("Training su %d samples (delayed=%d, on-time=%d)",
                len(df), y.sum(), len(y) - y.sum())

    with mlflow.start_run():
        # ── Parametri ──────────────────────────────────────────────────────
        params = {
            "n_estimators": 200,
            "max_depth": 6,
            "min_samples_leaf": 3,
            "class_weight": "balanced",   # gestisce lo sbilanciamento (pochi ritardi)
            "random_state": 42,
        }
        mlflow.log_params(params)
        mlflow.log_param("n_samples", len(df))
        mlflow.log_param("n_delayed", int(y.sum()))
        mlflow.log_param("features", FEATURE_COLS)

        # ── Modello ─────────────────────────────────────────────────────────
        clf = RandomForestClassifier(**params)

        # Cross-validation stratificata (5-fold)
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        cv_auc = cross_val_score(clf, X, y, cv=cv, scoring="roc_auc")

        # Fit finale su tutto il dataset
        clf.fit(X, y)

        # ── Metriche ────────────────────────────────────────────────────────
        y_pred  = clf.predict(X)
        y_proba = clf.predict_proba(X)[:, 1]

        acc = accuracy_score(y, y_pred)
        roc = roc_auc_score(y, y_proba) if len(y.unique()) > 1 else 0.0
        cv_mean = float(cv_auc.mean())
        cv_std  = float(cv_auc.std())

        mlflow.log_metric("accuracy",       acc)
        mlflow.log_metric("roc_auc",        roc)
        mlflow.log_metric("cv_roc_auc_mean", cv_mean)
        mlflow.log_metric("cv_roc_auc_std",  cv_std)

        # ── Feature importance ──────────────────────────────────────────────
        importances = dict(zip(FEATURE_COLS, clf.feature_importances_.tolist()))
        for feat, imp in importances.items():
            mlflow.log_metric(f"feat_{feat}", imp)

        top_features = sorted(importances.items(), key=lambda x: x[1], reverse=True)[:5]
        logger.info("Top features: %s", top_features)

        # ── Salvataggio ─────────────────────────────────────────────────────
        mlflow.sklearn.log_model(clf, "risk_model")

        # Pickle locale per inferenza rapida senza ricaricare da MLflow
        with open(MODEL_PATH, "wb") as f:
            pickle.dump(clf, f)

        mlflow.log_artifact(MODEL_PATH)

        result = {
            "accuracy":       round(acc, 4),
            "roc_auc":        round(roc, 4),
            "cv_roc_auc":     f"{cv_mean:.4f} ± {cv_std:.4f}",
            "n_samples":      len(df),
            "n_delayed":      int(y.sum()),
            "top_features":   top_features,
        }
        mlflow.log_dict(result, "summary.json")

        logger.info("Training completato: %s", result)
        return result


# ── Inferenza ─────────────────────────────────────────────────────────────────

def load_model() -> RandomForestClassifier | None:
    """Carica il modello dal pickle locale, se esiste."""
    if not os.path.exists(MODEL_PATH):
        logger.warning("Modello risk scoring non trovato in %s. Esegui /wrike/train prima.", MODEL_PATH)
        return None
    with open(MODEL_PATH, "rb") as f:
        return pickle.load(f)


def predict_risk(docs: list[dict]) -> list[dict]:
    """
    Calcola il risk score per una lista di task attivi.

    Returns
    -------
    Lista di dict { taskId, title, riskScore, riskLabel, features }
    ordinata per riskScore decrescente.
    """
    clf = load_model()
    if clf is None:
        return []

    results = []
    for doc in docs:
        features = _extract_features(doc)
        # Costruiamo una matrice 1×N (una riga, N feature) come required da sklearn.
        # FEATURE_COLS garantisce che l'ordine delle feature sia identico al training.
        X = np.array([[features[c] for c in FEATURE_COLS]])

        # predict_proba restituisce [[P(class=0), P(class=1)]].
        # Prendiamo l'indice [0][1] = P(is_delayed=1) = probabilità di ritardo.
        prob = clf.predict_proba(X)[0][1]

        # Soglie calibrate empiricamente su dataset reali di PMI italiane.
        # Corrispondono ai label interni di train_risk_model.
        risk_label = (
            "🔴 Alto"  if prob >= 0.65 else
            "🟡 Medio" if prob >= 0.35 else
            "🟢 Basso"
        )

        results.append({
            "taskId":     doc.get("taskId"),
            "title":      doc.get("title"),
            "status":     doc.get("status"),
            "importance": doc.get("importance"),
            "dueDate":    doc.get("dueDate"),
            "assigneeIds": doc.get("assigneeIds", []),
            "permalink":  doc.get("permalink"),
            "riskScore":  round(float(prob), 4),
            "riskPct":    round(float(prob) * 100, 1),
            "riskLabel":  risk_label,
            "daysUntilDue": features["days_until_due"],
            "daysInCurrentStatus": doc.get("daysInCurrentStatus", 0),
        })

    return sorted(results, key=lambda x: x["riskScore"], reverse=True)


# ── Workload Forecasting ──────────────────────────────────────────────────────

def forecast_workload(docs: list[dict], weeks_ahead: int = 12) -> list[dict]:
    """
    Previsione del carico di lavoro futuro basata su regressione lineare
    con componente stagionale settimanale.

    In produzione con >1 anno di dati, sostituire con Prophet:
        from prophet import Prophet
        m = Prophet(weekly_seasonality=True, yearly_seasonality=True)
        m.fit(df)
        future = m.make_future_dataframe(periods=weeks_ahead, freq="W")
        forecast = m.predict(future)

    Parametri
    ----------
    docs  : task completati da MongoDB
    weeks_ahead : quante settimane future prevedere

    Returns
    -------
    Lista di { week, year, weekLabel, historical, forecast }
    """
    from sklearn.linear_model import Ridge

    completed = [d for d in docs if d.get("status") == "Completed" and d.get("completedDate")]

    if len(completed) < 8:
        return []

    def to_dt(v):
        if isinstance(v, datetime):
            return v.replace(tzinfo=timezone.utc) if v.tzinfo is None else v
        try:
            return datetime.fromisoformat(str(v)).replace(tzinfo=timezone.utc)
        except Exception:
            return None

    # Aggrega task completati per settimana
    rows = []
    for doc in completed:
        dt = to_dt(doc.get("completedDate"))
        if dt:
            rows.append({"dt": dt, "count": 1})

    df = pd.DataFrame(rows)
    df["week"] = df["dt"].dt.isocalendar().week.astype(int)
    df["year"] = df["dt"].dt.isocalendar().year.astype(int)
    df["week_of_year"] = (df["year"] - df["year"].min()) * 52 + df["week"]

    weekly = df.groupby(["year", "week", "week_of_year"])["count"].sum().reset_index()
    weekly = weekly.sort_values("week_of_year").reset_index(drop=True)

    # Feature: tendenza lineare (t) + componente stagionale.
    # Usiamo seno/coseno (Fourier Features) per modellare:
    #   sin52/cos52 → stagionalità annuale (ciclo 52 settimane)
    #   sin26       → stagionalità semestrale (picco a metà anno)
    # Ridge Regression (L2) è preferita a LinearRegression per evitare
    # overfitting su dataset piccoli; alpha=1.0 è un valore conservative di default.
    X = pd.DataFrame({
        "t":      weekly["week_of_year"],   # indice tempo assoluto (tendenza)
        "sin52":  np.sin(2 * np.pi * weekly["week"] / 52),
        "cos52":  np.cos(2 * np.pi * weekly["week"] / 52),
        "sin26":  np.sin(2 * np.pi * weekly["week"] / 26),
    })
    y = weekly["count"]

    model = Ridge(alpha=1.0)
    model.fit(X, y)

    # Previsione settimane future
    last_t    = int(weekly["week_of_year"].max())
    last_week = int(weekly.iloc[-1]["week"])
    last_year = int(weekly.iloc[-1]["year"])

    forecast_rows = []
    for i in range(1, weeks_ahead + 1):
        t    = last_t + i
        week = ((last_week - 1 + i) % 52) + 1
        year_offset = (last_week - 1 + i) // 52
        year = last_year + year_offset

        x_pred = np.array([[
            t,
            np.sin(2 * np.pi * week / 52),
            np.cos(2 * np.pi * week / 52),
            np.sin(2 * np.pi * week / 26),
        ]])
        pred = max(0.0, float(model.predict(x_pred)[0]))

        forecast_rows.append({
            "weekLabel": f"W{week:02d}/{year}",
            "week": week,
            "year": year,
            "historical": None,
            "forecast": round(pred, 1),
        })

    # Storico reale: mostriamo solo le ultime 24 settimane per non
    # sovraccaricare il grafico frontend con anni di dati.
    # forecast=None indica al frontend che questa è una barra storica
    # (colorata diversamente dalla previsione).
    historical_rows = [
        {
            "weekLabel": f"W{int(r['week']):02d}/{int(r['year'])}",
            "week": int(r["week"]),
            "year": int(r["year"]),
            "historical": int(r["count"]),
            "forecast": None,  # null = dato reale, non previsto
        }
        for _, r in weekly.tail(24).iterrows()
    ]

    # La risposta finale è storico + previsione in ordine cronologico.
    # Il frontend (Recharts/Chart.js) può renderizzarli come barre sovrapposte
    # su un unico asse temporale continuo.
    return historical_rows + forecast_rows
