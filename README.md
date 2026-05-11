# SmartSales Assistant

SmartSales Assistant is a full-stack sales analytics and intelligence platform. It helps you track performance, analyze data, and make decisions using dashboards, rule-based insights, machine learning forecasts, and optional AI-generated commentary via the OpenAI API.

The stack is a React frontend and a FastAPI backend with SQLAlchemy on SQLite, TensorFlow-based sales prediction, and Celery with Redis for asynchronous heavy workloads.

## Features

- Product, sales, and expense management with CRUD APIs
- Sales dashboard with metrics (totals, profit, product breakdown)
- Date-range filtering and chart-oriented UI (Recharts)
- Rule-based insights over a selected period
- ML pipeline: prepare data, train model, forecast demand (TensorFlow / scikit-learn helpers)
- AI explanations of statistics via OpenAI (queued as a background task)
- Natural language style query endpoint over your data
- Alerts for business monitoring
- Background jobs: sales prediction and AI explanation run in Celery workers; API returns a task id immediately

## Tech Stack

**Frontend**

- React
- Tailwind CSS
- Recharts
- Axios

**Backend**

- Python 3
- FastAPI
- Uvicorn (development server)
- SQLAlchemy
- SQLite (default database URL in `backend/app/database.py`)
- Pydantic
- Celery
- Redis (broker and result backend for Celery)

**AI / ML**

- TensorFlow / Keras
- scikit-learn
- OpenAI API (Python client)

## Project structure

```text
SmartSales-with-AI-Assistant/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app and router registration
│   │   ├── celery_app.py        # Celery application (Redis broker/backend)
│   │   ├── tasks.py             # Celery tasks (ML predict, AI explain)
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── crud.py
│   │   ├── ml_utils.py
│   │   ├── services/
│   │   │   └── ai_service.py    # Shared OpenAI explanation logic
│   │   └── routes/
│   │       ├── product.py
│   │       ├── sales.py
│   │       ├── expenses.py
│   │       ├── dashboard.py
│   │       ├── insights.py
│   │       ├── ml.py
│   │       ├── alerts.py
│   │       └── tasks.py         # GET /tasks/{task_id}
│   ├── requirements.txt
│   └── .env                     # optional; see Environment variables
│
├── frontend/
│   ├── src/
│   └── package.json
│
└── README.md
```

## Prerequisites

- Node.js and npm (frontend)
- Python 3 and a virtual environment (backend)
- Redis running locally (for example on `localhost:6379`) for Celery
- For AI explanations: an OpenAI API key in `backend/.env`

## Backend setup

From the repository root:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Confirm Redis is reachable (example):

```bash
redis-cli ping
```

Expected reply: `PONG`

### Run the API and worker (two terminals)

Both commands assume your current directory is `backend` and the virtual environment is activated.

**Terminal 1 – FastAPI**

```bash
uvicorn app.main:app --reload
```

API base URL: `http://127.0.0.1:8000`

**Terminal 2 – Celery worker**

```bash
celery -A app.celery_app.celery_app worker --loglevel=info
```

The worker must be running for queued ML and AI tasks to execute. Without it, tasks remain pending until a worker consumes them or they expire according to your Redis/Celery settings.

### Quick health check

```bash
curl http://127.0.0.1:8000/ping
```

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Default dev URL is often `http://localhost:5173` (see Vite output).

## Environment variables

Create `backend/.env` as needed:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

The default SQLite database file path is defined in `backend/app/database.py` (`sqlite:///./sales_assistant.db` relative to the process working directory when you start the app from `backend`). Adjust there if you need a different file or URL.

## API overview

Unless noted, routes are synchronous. Paths below are relative to the API root (for example `http://127.0.0.1:8000`).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/ping` | Health check |
| | `/product/...` | Product CRUD and listing |
| | `/sales/...` | Sales CRUD |
| | `/expenses/...` | Expense CRUD |
| GET | `/dashboard/` | Dashboard summary (query params for date range as defined in the route) |
| GET | `/insights/` | Rule-based insights for a date range |
| POST | `/insights/explain` | Enqueues AI explanation; returns `status` and `task_id` immediately |
| POST | `/insights/query` | Natural language style query |
| GET | `/ml/prepare-data` | ML data preparation summary |
| POST | `/ml/train` | Train the sales model |
| GET | `/ml/predict` | Enqueues prediction; returns `status` and `task_id` immediately |
| | `/alerts/...` | Alerts |
| GET | `/tasks/{task_id}` | Task state: `pending`, `started`, `success`, or `failure` with payload or error |

### Asynchronous endpoints

- `POST /insights/explain` – response shape immediately after enqueue:

```json
{
  "status": "queued",
  "task_id": "<celery-uuid>"
}
```

- `GET /ml/predict?product_id=1&days=7` – same queued response pattern.

Poll task status:

```bash
curl http://127.0.0.1:8000/tasks/<task_id>
```

Example shapes:

- Pending: `{"status": "pending", "task_id": "..."}`
- Started: `{"status": "started", "task_id": "..."}`
- Success: `{"status": "success", "task_id": "...", "result": { ... }}`  
  The `result` object for ML matches the previous synchronous prediction payload from `predict_sales`. For AI, it matches the structure returned by `generate_ai_explanation` in `app/services/ai_service.py` (including `explanation`, `model_used`, `tokens_used` on success).
- Failure: `{"status": "failure", "task_id": "...", "error": "..."}`

## Purpose

This project demonstrates full-stack development, REST API design, analytics and visualization, machine learning integration, optional AI-assisted reporting, and a small production-style pattern: offload slow work to Celery workers while keeping the HTTP API responsive.

It is suitable for learning, experimentation, and portfolio use.
