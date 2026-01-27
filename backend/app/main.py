from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routes import dashboard, product, sales, expenses, insights, ml, alerts
from app import models

app = FastAPI(title="Smart Sales Assistant API", version="1.0.0")

# CORS CONFIGURATION
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5176", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()

# Include routers
app.include_router(product.router)
app.include_router(sales.router)
app.include_router(expenses.router)
app.include_router(dashboard.router)
app.include_router(insights.router)
app.include_router(ml.router)
app.include_router(alerts.router)  # Added alerts router

@app.get("/ping")
def ping():
    return {"message": "pong"}
