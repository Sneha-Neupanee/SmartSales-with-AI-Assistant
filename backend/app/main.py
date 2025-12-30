from fastapi import FastAPI
from .database import init_db

app = FastAPI(title="Smart Sales Assistant API", version="1.0.0")

@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/ping")
def ping():
    return {"message": "pong"}
