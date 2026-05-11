from celery.result import AsyncResult
from fastapi import APIRouter

from app.celery_app import celery_app


router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("/{task_id}")
def get_task_status(task_id: str):
    task_result = AsyncResult(task_id, app=celery_app)
    state = task_result.state

    if state == "PENDING":
        return {"status": "pending", "task_id": task_id}
    if state == "STARTED":
        return {"status": "started", "task_id": task_id}
    if state == "SUCCESS":
        return {
            "status": "success",
            "task_id": task_id,
            "result": task_result.result,
        }
    if state == "FAILURE":
        return {
            "status": "failure",
            "task_id": task_id,
            "error": str(task_result.result),
        }

    return {"status": state.lower(), "task_id": task_id}
