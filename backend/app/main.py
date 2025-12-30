from fastapi import FastAPI

app = FastAPI(
    title="Smart Sales Assistant API",
    version="1.0.0"
)
@app.get("/ping")
def ping():
    return {"message": "pong"}