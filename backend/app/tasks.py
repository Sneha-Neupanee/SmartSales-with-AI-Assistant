from app import database
from app.ml_utils import predict_sales
from app.services.ai_service import generate_ai_explanation
from app.celery_app import celery_app


@celery_app.task(name="app.tasks.generate_ml_prediction_task")
def generate_ml_prediction_task(product_id: int, days: int = 7):
    db = database.SessionLocal()
    try:
        return predict_sales(db, product_id=product_id, days=days)
    finally:
        db.close()


@celery_app.task(name="app.tasks.generate_ai_explanation_task")
def generate_ai_explanation_task(stats: dict):
    return generate_ai_explanation(stats)
