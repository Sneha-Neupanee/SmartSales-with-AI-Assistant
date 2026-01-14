from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from typing import Optional

from backend.app.database import get_db
from backend.app import models
router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

@router.get("/")
def dashboard(
    start: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end: date = Query(..., description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    # ---------------- Total Sales ----------------
    total_sales_result = (
        db.query(func.sum(models.Sale.sale_price * models.Sale.quantity))
        .filter(models.Sale.sale_date.between(start, end))
        .scalar()
    )
    total_sales = float(total_sales_result) if total_sales_result else 0.0

    # ---------------- Total Cost ----------------
    total_cost_result = (
        db.query(func.sum(models.Product.cost_price * models.Sale.quantity))
        .join(models.Sale, models.Product.id == models.Sale.product_id)
        .filter(models.Sale.sale_date.between(start, end))
        .scalar()
    )
    total_cost = float(total_cost_result) if total_cost_result else 0.0

    total_profit = total_sales - total_cost

    # ---------------- Product-wise Sales Count ----------------
    product_sales = (
        db.query(
            models.Product.name,
            func.sum(models.Sale.quantity).label("total_quantity")
        )
        .join(models.Sale, models.Product.id == models.Sale.product_id)
        .filter(models.Sale.sale_date.between(start, end))
        .group_by(models.Product.name)
        .all()
    )

    product_wise = [
        {
            "product": name, 
            "quantity_sold": int(qty) if qty else 0
        }
        for name, qty in product_sales
    ]

    return {
        "date_range": {
            "start": start.isoformat(),
            "end": end.isoformat()
        },
        "metrics": {
            "total_sales": round(total_sales, 2),
            "total_profit_or_loss": round(total_profit, 2),
            "product_wise_sales": product_wise
        }
    }