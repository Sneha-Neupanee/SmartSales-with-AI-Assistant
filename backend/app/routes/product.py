from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date

from .. import crud, schemas, database, models

router = APIRouter(
    prefix="/product",
    tags=["Products"]
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# CREATE
@router.post("/", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    return crud.create_product(db, product)

# ⭐ LIST ALL PRODUCTS - NEW ENDPOINT ⭐
@router.get("/all", response_model=list[schemas.Product])
def list_all_products(db: Session = Depends(get_db)):
    return crud.get_all_products(db)

# READ SINGLE PRODUCT
@router.get("/{product_id}", response_model=schemas.Product)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# UPDATE
@router.put("/{product_id}", response_model=schemas.Product)
def update_product(product_id: int, product: schemas.ProductUpdate, db: Session = Depends(get_db)):
    updated = crud.update_product(db, product_id, product)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated

# DELETE
@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_product(db, product_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# STATS - Task 7: Product Stats Endpoint
@router.get("/{product_id}/stats")
def get_product_stats(
    product_id: int,
    start: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end: date = Query(..., description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    # Check if product exists
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get all sales for this product in the date range
    sales_data = (
        db.query(
            models.Sale.sale_date,
            func.sum(models.Sale.quantity).label("quantity"),
            func.sum(models.Sale.sale_price * models.Sale.quantity).label("revenue")
        )
        .filter(
            models.Sale.product_id == product_id,
            models.Sale.sale_date.between(start, end)
        )
        .group_by(models.Sale.sale_date)
        .order_by(models.Sale.sale_date)
        .all()
    )
    
    # Calculate totals
    total_quantity = sum(sale.quantity for sale in sales_data) if sales_data else 0
    total_revenue = sum(sale.revenue for sale in sales_data) if sales_data else 0.0
    total_cost = total_quantity * product.cost_price
    total_profit = total_revenue - total_cost
    profit_margin = (total_profit / total_revenue * 100) if total_revenue > 0 else 0.0
    
    # Format sales over time
    sales_over_time = [
        {
            "date": sale.sale_date.isoformat(),
            "quantity_sold": int(sale.quantity),
            "revenue": round(float(sale.revenue), 2)
        }
        for sale in sales_data
    ]
    
    return {
        "product_id": product_id,
        "product_name": product.name,
        "date_range": {
            "start": start.isoformat(),
            "end": end.isoformat()
        },
        "statistics": {
            "total_quantity_sold": int(total_quantity),
            "total_revenue": round(float(total_revenue), 2),
            "total_profit": round(float(total_profit), 2),
            "profit_margin_percentage": round(float(profit_margin), 2)
        },
        "sales_over_time": sales_over_time
    }