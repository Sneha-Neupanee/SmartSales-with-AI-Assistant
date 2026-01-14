from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import database
from ..ml_utils import prepare_ml_data, train_model, predict_sales

router = APIRouter(
    prefix="/ml",
    tags=["Machine Learning"]
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/prepare-data")
def prepare_data(db: Session = Depends(get_db)):
    """Prepare sales data for machine learning"""
    result = prepare_ml_data(db)
    return result

@router.post("/train")
def train(epochs: int = 50, batch_size: int = 4, db: Session = Depends(get_db)):
    """Train the sales prediction model"""
    result = train_model(db, epochs=epochs, batch_size=batch_size)
    return result

@router.get("/predict")
def predict(product_id: int, days: int = 7, db: Session = Depends(get_db)):
    """Predict future sales for a product"""
    result = predict_sales(db, product_id=product_id, days=days)
    return result