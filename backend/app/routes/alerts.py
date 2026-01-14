# Create new file: backend/app/routes/alerts.py

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from typing import List

from .. import models, database

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ============ 22.1: Low Stock Alert ============
def check_low_stock(db: Session, threshold: int = 10):
    """
    Alert when product sales velocity suggests stock might run out soon
    """
    alerts = []
    
    # Get sales in last 30 days for each product
    thirty_days_ago = date.today() - timedelta(days=30)
    
    sales_velocity = (
        db.query(
            models.Product.id,
            models.Product.name,
            func.sum(models.Sale.quantity).label("total_sold")
        )
        .join(models.Sale, models.Product.id == models.Sale.product_id)
        .filter(models.Sale.sale_date >= thirty_days_ago)
        .group_by(models.Product.id, models.Product.name)
        .all()
    )
    
    for product in sales_velocity:
        # Calculate average daily sales
        avg_daily_sales = product.total_sold / 30
        
        # If selling more than threshold per day, create alert
        if avg_daily_sales > threshold:
            alerts.append({
                "type": "low_stock",
                "severity": "warning",
                "product_id": product.id,
                "product_name": product.name,
                "message": f"⚠️ {product.name} is selling fast! Average {avg_daily_sales:.1f} units/day",
                "details": {
                    "total_sold_30_days": int(product.total_sold),
                    "avg_daily_sales": round(avg_daily_sales, 2)
                }
            })
    
    return alerts

# ============ 22.2: Profit Drop Alert ============
def check_profit_drop(db: Session, threshold_percent: float = 20):
    """
    Alert when profit drops significantly compared to previous period
    """
    alerts = []
    today = date.today()
    
    # Current week
    week_start = today - timedelta(days=7)
    
    # Previous week
    prev_week_start = today - timedelta(days=14)
    prev_week_end = week_start - timedelta(days=1)
    
    # Calculate current week profit
    current_sales = (
        db.query(
            func.sum((models.Sale.sale_price - models.Product.cost_price) * models.Sale.quantity).label("profit")
        )
        .join(models.Product, models.Sale.product_id == models.Product.id)
        .filter(models.Sale.sale_date >= week_start)
        .first()
    )
    
    # Calculate previous week profit
    previous_sales = (
        db.query(
            func.sum((models.Sale.sale_price - models.Product.cost_price) * models.Sale.quantity).label("profit")
        )
        .join(models.Product, models.Sale.product_id == models.Product.id)
        .filter(models.Sale.sale_date.between(prev_week_start, prev_week_end))
        .first()
    )
    
    current_profit = float(current_sales.profit) if current_sales.profit else 0
    previous_profit = float(previous_sales.profit) if previous_sales.profit else 0
    
    if previous_profit > 0:
        profit_change = ((current_profit - previous_profit) / previous_profit) * 100
        
        if profit_change < -threshold_percent:
            alerts.append({
                "type": "profit_drop",
                "severity": "critical",
                "message": f"🚨 Profit dropped {abs(profit_change):.1f}% this week!",
                "details": {
                    "current_week_profit": round(current_profit, 2),
                    "previous_week_profit": round(previous_profit, 2),
                    "change_percent": round(profit_change, 2)
                }
            })
        elif profit_change > threshold_percent:
            alerts.append({
                "type": "profit_increase",
                "severity": "success",
                "message": f"🎉 Profit increased {profit_change:.1f}% this week!",
                "details": {
                    "current_week_profit": round(current_profit, 2),
                    "previous_week_profit": round(previous_profit, 2),
                    "change_percent": round(profit_change, 2)
                }
            })
    
    return alerts

# ============ 22.3: Sales Anomaly Alert ============
def check_sales_anomaly(db: Session):
    """
    Detect unusual sales patterns (very high or very low)
    """
    alerts = []
    today = date.today()
    
    # Get last 7 days of sales
    week_start = today - timedelta(days=7)
    
    daily_sales = (
        db.query(
            models.Sale.sale_date,
            func.sum(models.Sale.quantity).label("quantity"),
            func.sum(models.Sale.sale_price * models.Sale.quantity).label("revenue")
        )
        .filter(models.Sale.sale_date >= week_start)
        .group_by(models.Sale.sale_date)
        .all()
    )
    
    if len(daily_sales) >= 3:
        # Calculate average daily sales
        quantities = [s.quantity for s in daily_sales]
        avg_quantity = sum(quantities) / len(quantities)
        
        # Check each day for anomalies
        for sale in daily_sales:
            # If sales are 2x above average
            if sale.quantity > avg_quantity * 2:
                alerts.append({
                    "type": "sales_spike",
                    "severity": "info",
                    "message": f"📈 Unusual sales spike on {sale.sale_date}!",
                    "details": {
                        "date": sale.sale_date.isoformat(),
                        "quantity": int(sale.quantity),
                        "revenue": round(float(sale.revenue), 2),
                        "average_daily": round(avg_quantity, 2)
                    }
                })
            # If sales are 50% below average
            elif sale.quantity < avg_quantity * 0.5 and avg_quantity > 0:
                alerts.append({
                    "type": "sales_drop",
                    "severity": "warning",
                    "message": f"📉 Low sales on {sale.sale_date}",
                    "details": {
                        "date": sale.sale_date.isoformat(),
                        "quantity": int(sale.quantity),
                        "revenue": round(float(sale.revenue), 2),
                        "average_daily": round(avg_quantity, 2)
                    }
                })
    
    return alerts

# ============ Additional Alert: High Expense Day ============
def check_high_expenses(db: Session, threshold: float = 1000):
    """
    Alert when daily expenses exceed threshold
    """
    alerts = []
    week_start = date.today() - timedelta(days=7)
    
    daily_expenses = (
        db.query(
            models.Expense.date,
            func.sum(models.Expense.amount).label("total")
        )
        .filter(models.Expense.date >= week_start)
        .group_by(models.Expense.date)
        .all()
    )
    
    for expense in daily_expenses:
        if expense.total > threshold:
            alerts.append({
                "type": "high_expense",
                "severity": "warning",
                "message": f"💰 High expenses on {expense.date}: ${expense.total:.2f}",
                "details": {
                    "date": expense.date.isoformat(),
                    "amount": round(float(expense.total), 2),
                    "threshold": threshold
                }
            })
    
    return alerts

# ============ Main Alerts Endpoint ============
@router.get("/")
def get_all_alerts(db: Session = Depends(get_db)):
    """
    22.4: Get all active alerts
    """
    all_alerts = []
    
    # Collect all alerts
    all_alerts.extend(check_low_stock(db, threshold=10))
    all_alerts.extend(check_profit_drop(db, threshold_percent=20))
    all_alerts.extend(check_sales_anomaly(db))
    all_alerts.extend(check_high_expenses(db, threshold=1000))
    
    # Sort by severity: critical > warning > info > success
    severity_order = {"critical": 0, "warning": 1, "info": 2, "success": 3}
    all_alerts.sort(key=lambda x: severity_order.get(x["severity"], 4))
    
    return {
        "status": "success",
        "total_alerts": len(all_alerts),
        "alerts": all_alerts,
        "summary": {
            "critical": len([a for a in all_alerts if a["severity"] == "critical"]),
            "warning": len([a for a in all_alerts if a["severity"] == "warning"]),
            "info": len([a for a in all_alerts if a["severity"] == "info"]),
            "success": len([a for a in all_alerts if a["severity"] == "success"])
        }
    }

@router.get("/summary")
def get_alerts_summary(db: Session = Depends(get_db)):
    """
    Get quick summary of alert counts
    """
    alerts = get_all_alerts(db)
    return alerts["summary"]