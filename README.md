# SmartSales Assistant

SmartSales Assistant is a full-stack sales analytics and intelligence platform designed to help businesses track performance, analyze data, and make informed decisions using real-time insights and AI-assisted analysis.

It combines a React.js frontend with a Python FastAPI backend, along with machine learning models and AI integration for predictive analytics and automated insights.

## Features

- Product, Sales, and Expense management with full CRUD functionality
- Sales dashboard with key performance metrics (total sales, profit, loss)
- Date-range filtering for analysis
- CSV export functionality
- Interactive charts and data visualization
- Rule-based business insights
- Sales prediction using machine learning models
- AI-generated explanations using OpenAI API
- Natural language query interface for data insights
- Alert system for business monitoring
- Responsive and modern UI design

## Tech Stack

Frontend:
- React.js
- TailwindCSS
- Recharts
- Axios

Backend:
- Python
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- Uvicorn

AI / Machine Learning:
- Scikit-learn / TensorFlow
- OpenAI API

## Project Structure

smart-sales-assistant/
│
├── backend/
│ ├── app/
│ │ ├── main.py
│ │ ├── models.py
│ │ ├── schemas.py
│ │ ├── crud.py
│ │ ├── routes/
│ │ └── database.py
│ │
│ ├── requirements.txt
│ └── .env
│
├── frontend/
│ ├── src/
│ │ ├── pages/
│ │ ├── components/
│ │ ├── services/
│ │ └── App.jsx
│ │
│ └── package.json
│
└── README.md


---

## Setup Instructions

Backend Setup:

cd backend
python -m venv venv
# Activate virtual environment:
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload

Backend runs at:
http://localhost:8000

Test endpoint:
GET /ping

Frontend Setup:

cd frontend
npm install
npm run dev

Frontend runs at:
http://localhost:5173

## Environment Variables

Create a .env file inside backend/ directory:

OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=sqlite:///./smartsales.db

## API Overview

/ping              -> Health check
/products          -> Product CRUD operations
/sales             -> Sales management
/expenses          -> Expense tracking
/dashboard         -> Analytics summary
/product/{id}/stats -> Product-level metrics
/predict           -> Sales forecasting
/explain           -> AI-generated insights
/query             -> Natural language queries

## Purpose

This project demonstrates:

- Full-stack application development
- REST API architecture design
- Data analytics and visualization
- Machine learning integration
- AI-powered business intelligence systems

It is built for learning, experimentation, and portfolio demonstration of modern full-stack development.
