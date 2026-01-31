# 🧠 SmartSales Assistant

**SmartSales Assistant** is a full-stack sales analytics and intelligence application built with **Python (FastAPI)** for the backend and **React.js** for the frontend.  
It helps track products, sales, and expenses, visualize business performance, generate insights, predict future demand, and provide AI-assisted explanations for smarter decision-making.

---

## 🚀 Features

- Product, Sales, and Expense management (CRUD)
- Sales dashboard with totals, profit/loss, and product statistics
- Date-range filtering and CSV export
- Interactive charts and tables
- Rule-based business insights
- Sales prediction using machine learning
- AI-generated explanations using OpenAI
- Natural language queries and alert system
- Responsive and clean UI

---

## 🛠 Tech Stack

### Backend
- Python
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- Uvicorn
- Scikit-learn / TensorFlow
- OpenAI API

### Frontend
- React.js
- TailwindCSS
- Recharts
- Axios

---

## 📂 Project Structure

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
│ ├── requirements.txt
│ └── .env
│
├── frontend/
│ ├── src/
│ │ ├── pages/
│ │ ├── components/
│ │ ├── services/
│ │ └── App.jsx
│ └── package.json
│
├── .gitignore
└── README.md

yaml
Copy code

---

## ⚙️ Setup Instructions

### Backend Setup

cd backend
python -m venv venv
source venv/bin/activate # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

yaml
Copy code

Test backend:
GET http://localhost:8000/ping

yaml
Copy code

---

### Frontend Setup

cd frontend
npm install
npm run dev

yaml
Copy code

---

## 🔐 Environment Variables

Create a `.env` file inside the `backend/` directory:

OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=sqlite:///./smartsales.db

markdown
Copy code

---

## 📊 API Overview

- `/ping` – Health check
- `/products` – Product CRUD
- `/sales` – Sales CRUD
- `/expenses` – Expense CRUD
- `/dashboard` – Sales analytics & summaries
- `/product/{id}/stats` – Product-level metrics
- `/predict` – Sales prediction
- `/explain` – AI-generated insights
- `/query` – Natural language data queries

---

## 🎯 Purpose

This project demonstrates:
- Full-stack development skills
- Clean REST API architecture
- Data analytics and visualization
- Machine learning integration
- AI-assisted business intelligence

Designed for learning, experimentation, and portfolio showcase.
