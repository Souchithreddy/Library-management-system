# LibraryOS — Library Management System

Full-stack app: **Flask (Python)** backend + **React** frontend + **SQLite** database.

---

## Project Structure

```
library-management-system/
├── backend/
│   ├── app.py              # Flask app entry point + seeding
│   ├── database.py         # SQLAlchemy instance
│   ├── models.py           # User, Book, Loan models
│   ├── requirements.txt
│   └── routes/
│       ├── auth.py         # /api/auth — login, register, me, logout
│       ├── books.py        # /api/books — CRUD
│       └── loans.py        # /api/loans — borrow, return, history, fines
└── frontend/
    ├── package.json
    ├── public/index.html
    └── src/
        ├── App.js
        ├── index.js / index.css
        ├── api/index.js
        ├── context/AuthContext.js
        ├── components/
        │   ├── Sidebar.js
        │   └── Toast.js
        └── pages/
            ├── LoginPage.js
            ├── student/
            │   ├── BrowsePage.js    # Search & borrow books
            │   ├── MyBooksPage.js   # Active borrows + return
            │   └── HistoryPage.js   # Full history + pay fines
            └── librarian/
                ├── DashboardPage.js # Stats + active loans
                ├── BooksPage.js     # Add/edit/delete books
                ├── LoansPage.js     # All loans + return + fines
                └── MembersPage.js   # Student overview + history
```

---

## Quick Start

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Backend runs at **http://localhost:5000**

Database (`library.db`) is created automatically with seed data on first run.

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs at **http://localhost:3000** (proxies API calls to Flask).

---

## Demo Accounts

| Role       | Email                    | Password      |
|------------|--------------------------|---------------|
| Librarian  | librarian@library.com    | librarian123  |
| Student    | arjun@student.com        | student123    |
| Student    | priya@student.com        | student123    |

---

## Features

### Student
- Browse & search books by title, author, genre
- Borrow books (max 3 at a time, 14-day loan period)
- Return books from "My Books"
- View complete borrow history with filters (All / Active / Overdue / Returned)
- Pay fines online (₹5/day for overdue books)

### Librarian
- Dashboard with live stats (books, loans, overdue, fines)
- Add / edit / delete books
- View and process all loans and returns
- Mark fines as paid
- View all members with their loan summaries and history drill-down

---

## Tech Stack

| Layer    | Tech                          |
|----------|-------------------------------|
| Backend  | Python 3.10+, Flask, SQLAlchemy |
| Database | SQLite (zero config)          |
| Frontend | React 18, React Router v6, Axios |
| Auth     | Flask sessions (cookie-based) |
