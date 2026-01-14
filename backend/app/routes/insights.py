from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from openai import OpenAI

from .. import models, database

# Load environment variables
load_dotenv()

router = APIRouter(
    prefix="/insights",
    tags=["Insights"]
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic model for explain request
class ExplainRequest(BaseModel):
    stats: dict

@router.get("/")
def get_insights(
    start: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end: date = Query(..., description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    insights = {
        "top_products_by_profit": [],
        "declining_products": [],
        "average_profit_margin": 0.0,
        "messages": []
    }
    
    # ============ 13.1: Top 5 Products by Profit ============
    top_products = (
        db.query(
            models.Product.id,
            models.Product.name,
            func.sum((models.Sale.sale_price - models.Product.cost_price) * models.Sale.quantity).label("profit")
        )
        .join(models.Sale, models.Product.id == models.Sale.product_id)
        .filter(models.Sale.sale_date.between(start, end))
        .group_by(models.Product.id, models.Product.name)
        .order_by(func.sum((models.Sale.sale_price - models.Product.cost_price) * models.Sale.quantity).desc())
        .limit(5)
        .all()
    )
    
    insights["top_products_by_profit"] = [
        {
            "product_id": p.id,
            "product_name": p.name,
            "profit": round(float(p.profit), 2)
        }
        for p in top_products
    ]
    
    if top_products:
        insights["messages"].append({
            "type": "success",
            "message": f"🏆 Top performer: {top_products[0].name} generated ${top_products[0].profit:.2f} in profit!"
        })
    
    # ============ 13.2: Declining Sales Products ============
    # Compare current period with previous period
    days_diff = (end - start).days
    previous_start = start - timedelta(days=days_diff)
    previous_end = start - timedelta(days=1)
    
    # Get sales for current period
    current_sales = (
        db.query(
            models.Product.id,
            models.Product.name,
            func.sum(models.Sale.quantity).label("quantity")
        )
        .join(models.Sale, models.Product.id == models.Sale.product_id)
        .filter(models.Sale.sale_date.between(start, end))
        .group_by(models.Product.id, models.Product.name)
        .all()
    )
    
    # Get sales for previous period
    previous_sales = (
        db.query(
            models.Product.id,
            func.sum(models.Sale.quantity).label("quantity")
        )
        .join(models.Sale, models.Product.id == models.Sale.product_id)
        .filter(models.Sale.sale_date.between(previous_start, previous_end))
        .group_by(models.Product.id)
        .all()
    )
    
    # Create dict for easy lookup
    prev_dict = {p.id: p.quantity for p in previous_sales}
    
    declining = []
    for current in current_sales:
        prev_qty = prev_dict.get(current.id, 0)
        if prev_qty > 0 and current.quantity < prev_qty:
            decline_pct = ((prev_qty - current.quantity) / prev_qty) * 100
            declining.append({
                "product_id": current.id,
                "product_name": current.name,
                "current_quantity": int(current.quantity),
                "previous_quantity": int(prev_qty),
                "decline_percentage": round(decline_pct, 2)
            })
    
    insights["declining_products"] = sorted(declining, key=lambda x: x["decline_percentage"], reverse=True)
    
    if declining:
        worst = declining[0]
        insights["messages"].append({
            "type": "warning",
            "message": f"⚠️ {worst['product_name']} sales declined by {worst['decline_percentage']:.1f}% - needs attention!"
        })
    
    # ============ 13.3: Average Profit Margin ============
    sales_with_profit = (
        db.query(
            models.Sale.sale_price,
            models.Product.cost_price,
            models.Sale.quantity
        )
        .join(models.Product, models.Sale.product_id == models.Product.id)
        .filter(models.Sale.sale_date.between(start, end))
        .all()
    )
    
    if sales_with_profit:
        total_revenue = sum(s.sale_price * s.quantity for s in sales_with_profit)
        total_cost = sum(s.cost_price * s.quantity for s in sales_with_profit)
        
        if total_revenue > 0:
            avg_margin = ((total_revenue - total_cost) / total_revenue) * 100
            insights["average_profit_margin"] = round(avg_margin, 2)
            
            if avg_margin < 20:
                insights["messages"].append({
                    "type": "warning",
                    "message": f"💰 Average profit margin is {avg_margin:.1f}% - consider reviewing pricing strategy"
                })
            elif avg_margin > 40:
                insights["messages"].append({
                    "type": "success",
                    "message": f"💰 Excellent profit margin of {avg_margin:.1f}%!"
                })
    
    # ============ 13.4: Additional Insights ============
    if not insights["messages"]:
        insights["messages"].append({
            "type": "info",
            "message": "📊 No significant trends detected for this period"
        })
    
    return insights


# ============ 19.3: OpenAI Explain Endpoint ============
@router.post("/explain")
def explain_insights(request: ExplainRequest):
    """
    Generate AI-powered business insights using OpenAI GPT
    """
    # Check if API key exists
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="OpenAI API key not configured. Please add OPENAI_API_KEY to .env file"
        )
    
    try:
        # Initialize OpenAI client
        client = OpenAI(api_key=api_key)
        
        # Prepare the prompt with business data
        prompt = f"""
You are a business analyst AI assistant. Analyze the following business statistics and provide actionable insights.

Business Statistics:
{request.stats}

Please provide:
1. A brief summary of the overall business performance
2. Key strengths and opportunities
3. Areas of concern or risk
4. 3-5 specific, actionable recommendations to improve profitability

Keep your response concise, professional, and focused on actionable advice. Format your response with clear sections.
"""
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Using cost-effective model
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert business analyst who provides clear, actionable insights based on sales data."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=800
        )
        
        # Extract the explanation
        explanation = response.choices[0].message.content
        
        return {
            "status": "success",
            "explanation": explanation,
            "model_used": "gpt-4o-mini",
            "tokens_used": response.usage.total_tokens
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate insights: {str(e)}"
        )
    # Add this to backend/app/routes/insights.py

from datetime import datetime, timedelta
import re

# ============ 21.1 & 21.2: Keyword Mapping & Query Endpoint ============

def parse_natural_query(query: str, db: Session):
    """
    Parse natural language query and map to backend data
    """
    query_lower = query.lower()
    today = datetime.now().date()
    
    # Default date range (last 30 days)
    start_date = today - timedelta(days=30)
    end_date = today
    
    # Detect time periods in query
    if "today" in query_lower:
        start_date = today
        end_date = today
    elif "this week" in query_lower or "past week" in query_lower:
        start_date = today - timedelta(days=7)
    elif "this month" in query_lower or "past month" in query_lower:
        start_date = today - timedelta(days=30)
    elif "this year" in query_lower or "past year" in query_lower:
        start_date = today - timedelta(days=365)
    
    # Match date patterns (YYYY-MM-DD)
    date_pattern = r'\d{4}-\d{2}-\d{2}'
    dates = re.findall(date_pattern, query)
    if len(dates) >= 2:
        start_date = datetime.strptime(dates[0], '%Y-%m-%d').date()
        end_date = datetime.strptime(dates[1], '%Y-%m-%d').date()
    elif len(dates) == 1:
        end_date = datetime.strptime(dates[0], '%Y-%m-%d').date()
    
    result = {
        "query": query,
        "interpreted_as": "",
        "data": {},
        "date_range": {
            "start": start_date.isoformat(),
            "end": end_date.isoformat()
        }
    }
    
    # ============ Query Type Detection ============
    
    # 1. Top/Best Selling Products
    if any(word in query_lower for word in ["top", "best", "most sold", "highest selling", "popular"]):
        if "product" in query_lower:
            result["interpreted_as"] = "Top selling products"
            
            top_products = (
                db.query(
                    models.Product.name,
                    func.sum(models.Sale.quantity).label("total_sold"),
                    func.sum(models.Sale.sale_price * models.Sale.quantity).label("revenue")
                )
                .join(models.Sale, models.Product.id == models.Sale.product_id)
                .filter(models.Sale.sale_date.between(start_date, end_date))
                .group_by(models.Product.name)
                .order_by(func.sum(models.Sale.quantity).desc())
                .limit(5)
                .all()
            )
            
            result["data"]["top_products"] = [
                {
                    "name": p.name,
                    "quantity_sold": int(p.total_sold),
                    "revenue": round(float(p.revenue), 2)
                }
                for p in top_products
            ]
    
    # 2. Profit/Revenue Queries
    elif any(word in query_lower for word in ["profit", "revenue", "sales", "earning"]):
        result["interpreted_as"] = "Total profit and revenue"
        
        sales_data = (
            db.query(
                models.Sale.sale_price,
                models.Product.cost_price,
                models.Sale.quantity
            )
            .join(models.Product, models.Sale.product_id == models.Product.id)
            .filter(models.Sale.sale_date.between(start_date, end_date))
            .all()
        )
        
        total_revenue = sum(s.sale_price * s.quantity for s in sales_data)
        total_cost = sum(s.cost_price * s.quantity for s in sales_data)
        total_profit = total_revenue - total_cost
        
        result["data"]["financial_summary"] = {
            "total_revenue": round(float(total_revenue), 2),
            "total_cost": round(float(total_cost), 2),
            "total_profit": round(float(total_profit), 2),
            "profit_margin": round((total_profit / total_revenue * 100) if total_revenue > 0 else 0, 2)
        }
    
    # 3. Product Performance
    elif "performance" in query_lower or "how is" in query_lower or "doing" in query_lower:
        result["interpreted_as"] = "Overall business performance"
        
        # Get all sales
        all_sales = (
            db.query(
                func.count(models.Sale.id).label("total_sales_count"),
                func.sum(models.Sale.quantity).label("total_quantity"),
                func.sum(models.Sale.sale_price * models.Sale.quantity).label("revenue")
            )
            .filter(models.Sale.sale_date.between(start_date, end_date))
            .first()
        )
        
        # Get expenses
        expenses = (
            db.query(func.sum(models.Expense.amount).label("total_expenses"))
            .filter(models.Expense.date.between(start_date, end_date))
            .first()
        )
        
        total_expenses = float(expenses.total_expenses) if expenses.total_expenses else 0
        
        result["data"]["performance"] = {
            "total_transactions": int(all_sales.total_sales_count) if all_sales.total_sales_count else 0,
            "total_items_sold": int(all_sales.total_quantity) if all_sales.total_quantity else 0,
            "total_revenue": round(float(all_sales.revenue), 2) if all_sales.revenue else 0,
            "total_expenses": round(total_expenses, 2)
        }
    
    # 4. Expense Queries
    elif "expense" in query_lower or "cost" in query_lower or "spending" in query_lower:
        result["interpreted_as"] = "Expense breakdown"
        
        expenses = (
            db.query(
                models.Expense.description,
                models.Expense.amount,
                models.Expense.date
            )
            .filter(models.Expense.date.between(start_date, end_date))
            .order_by(models.Expense.amount.desc())
            .limit(10)
            .all()
        )
        
        total_expenses = sum(e.amount for e in expenses)
        
        result["data"]["expenses"] = {
            "total_expenses": round(float(total_expenses), 2),
            "expense_list": [
                {
                    "description": e.description,
                    "amount": round(float(e.amount), 2),
                    "date": e.date.isoformat()
                }
                for e in expenses
            ]
        }
    
    # 5. Declining/Struggling Products
    elif any(word in query_lower for word in ["declining", "worst", "struggling", "low", "bottom"]):
        result["interpreted_as"] = "Declining products"
        
        # Get current period
        current_sales = (
            db.query(
                models.Product.name,
                func.sum(models.Sale.quantity).label("quantity")
            )
            .join(models.Sale, models.Product.id == models.Sale.product_id)
            .filter(models.Sale.sale_date.between(start_date, end_date))
            .group_by(models.Product.name)
            .all()
        )
        
        result["data"]["low_performing"] = [
            {
                "name": p.name,
                "quantity_sold": int(p.quantity)
            }
            for p in sorted(current_sales, key=lambda x: x.quantity)[:5]
        ]
    
    # 6. Inventory/Products
    elif "inventory" in query_lower or "stock" in query_lower or "products" in query_lower:
        result["interpreted_as"] = "Product inventory"
        
        products = db.query(models.Product).all()
        
        result["data"]["inventory"] = [
            {
                "name": p.name,
                "category": p.category,
                "cost_price": round(float(p.cost_price), 2),
                "sell_price": round(float(p.sell_price), 2)
            }
            for p in products
        ]
    
    # Default: Summary
    else:
        result["interpreted_as"] = "Business summary"
        result["data"]["message"] = "I'm not sure what you're asking. Try queries like: 'show top products', 'what's my profit', 'show expenses', etc."
    
    return result


@router.post("/query")
def natural_language_query(
    query: str = Query(..., description="Natural language query"),
    db: Session = Depends(get_db)
):
    """
    21.2 & 21.3: Natural language query endpoint
    Parse user input → retrieve data → return JSON
    """
    try:
        result = parse_natural_query(query, db)
        return {
            "status": "success",
            **result
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process query: {str(e)}"
        )