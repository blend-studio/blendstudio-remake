FROM python:3.12-slim

RUN pip install --no-cache-dir mlflow==2.20.2

# Crea le directory che MLflow usa per il DB SQLite e gli artifact.
# Devono essere sotto /mlruns perché il docker-compose monta
# il volume "mlflow_data" esattamente su quel path.
RUN mkdir -p /mlruns/artifacts

EXPOSE 5000

CMD ["mlflow", "server", \
     "--host", "0.0.0.0", \
     "--port", "5000", \
     "--backend-store-uri", "sqlite:////mlruns/mlflow.db", \
     "--default-artifact-root", "/mlruns/artifacts"]
