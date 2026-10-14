# 🔬 ResearchNexus — University Research Opportunity Portal

> **NUCES Peshawar | BS CS | Assignment #01 | Fall-2026**

A full-stack web application that allows faculty members to post, manage, and track research opportunities — and students to discover them.

---

## 🚀 Live Preview

Open `frontend/index.html` in your browser after starting the backend server.

---

## 🛠️ Tech Stack

| Layer     | Technology                   |
|-----------|------------------------------|
| Backend   | Node.js + Express.js         |
| Database  | MySQL                        |
| Frontend  | HTML5 + CSS3 + Vanilla JS    |

---

## 📁 Project Structure

```
research-portal/
├── backend/
│   ├── server.js             # Express app entry point
│   ├── db.js                 # MySQL connection pool
│   ├── routes/
│   │   └── opportunities.js  # CRUD route handlers
│   ├── .env                  # Environment variables (configure your DB here)
│   └── package.json
├── frontend/
│   ├── index.html            # Single-page application
│   ├── style.css             # Futuristic dark UI styles
│   └── app.js                # Frontend logic & API calls
├── database/
│   └── schema.sql            # DB schema + seed data
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- **Node.js** (v18+) — [Download](https://nodejs.org)
- **MySQL** (v8+) — [Download](https://dev.mysql.com/downloads/)

### 1. Database Setup

Open MySQL Workbench or your MySQL client and run:

```sql
SOURCE /path/to/research-portal/database/schema.sql;
```

Or via CLI:
```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Edit `.env` and set your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=research_portal
DB_PORT=3306
PORT=5000
```

Start the server:

```bash
npm start
```

The API will be running at **http://localhost:5000**

### 3. Frontend Setup

Simply open `frontend/index.html` in your browser. No build step required!

> Make sure the backend server is running on port 5000 before opening the frontend.

---

## 🌐 API Endpoints

| Method   | Endpoint                     | Description                    | Status Codes         |
|----------|------------------------------|--------------------------------|----------------------|
| `GET`    | `/api/opportunities`         | Get all opportunities          | 200, 500             |
| `GET`    | `/api/opportunities/:id`     | Get one by ID                  | 200, 404, 500        |
| `POST`   | `/api/opportunities`         | Create new opportunity         | 201, 400, 500        |
| `PUT`    | `/api/opportunities/:id`     | Update an opportunity          | 200, 400, 404, 500   |
| `DELETE` | `/api/opportunities/:id`     | Delete an opportunity          | 200, 404, 500        |
| `GET`    | `/api/health`                | Health check                   | 200                  |

### Query Parameters for GET All
- `?status=Open` / `?status=Closed` — filter by status
- `?research_area=AI` — filter by area
- `?search=keyword` — full-text search

---

## 📦 Data Model

```json
{
  "id": 1,
  "title": "AI-Powered Medical Diagnosis",
  "description": "...",
  "research_area": "Artificial Intelligence",
  "faculty_name": "Dr. Ayesha Tariq",
  "department": "Computer Science",
  "required_skills": "Python, TensorFlow, OpenCV",
  "available_positions": 3,
  "application_deadline": "2026-12-15",
  "status": "Open",
  "created_at": "2026-10-14T06:00:00Z",
  "updated_at": "2026-10-14T06:00:00Z"
}
```

---

## ✨ Features

### Frontend
- 🎨 **Futuristic dark UI** with animated particle background, glassmorphism, and neon glow effects
- 📊 **Live stats bar** — total, open, closed, and available positions
- 🔍 **Real-time search** — filter by title, faculty, department, skills
- 🏷️ **Status & area filters** — instant filtering
- 📋 **Sliding detail panel** — full opportunity view with skills list
- 📝 **Create/Edit modal forms** — with client-side validation
- ❌ **Delete with confirmation** dialog
- 🔄 **Status toggle** — Open ↔ Closed with one click
- 🔔 **Toast notifications** — success, error, info
- ⌨️ **Keyboard shortcuts** — `Esc` to close, `Ctrl+K` to focus search
- 📱 **Fully responsive** — works on mobile, tablet, and desktop

### Backend
- ✅ Full CRUD REST API with Express.js
- ✅ MySQL with connection pooling
- ✅ Input validation on all endpoints
- ✅ Proper HTTP status codes (200, 201, 400, 404, 500)
- ✅ CORS enabled
- ✅ Request logging middleware
- ✅ Global error handling

---

## 📬 Postman Collection

Import the collection file from `postman/ResearchNexus.postman_collection.json` to test all API endpoints.

Or test manually using curl:

```bash
# Get all opportunities
curl http://localhost:5000/api/opportunities

# Create an opportunity
curl -X POST http://localhost:5000/api/opportunities \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Research","description":"A test project","research_area":"AI","faculty_name":"Dr. Test","department":"CS","required_skills":"Python","available_positions":2,"application_deadline":"2026-12-31"}'
```

---

## 📜 GitHub Repository

> **Repository:** [https://github.com/Ahmed-Hassan0925/research-portal](https://github.com/Ahmed-Hassan0925/research-portal)

---

## 👤 Student Information

| Field       | Value              |
|-------------|--------------------|
| Name        | Ahmed Hassan       |
| Reg. No.    | 24K-0925           |
| Program     | BS CS 5B           |
| Semester    | Fall-2026          |
| Course      | Computer Networks  |

---

*Built with ❤️ for NUCES Peshawar — Research Opportunity Portal Assignment*
