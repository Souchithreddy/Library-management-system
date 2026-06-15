# LibraryOS - Library Management System

A full-stack Library Management System built with Flask, React, and SQLite.

## Features

### Student Portal
- Browse and search books by title, author, or genre
- Borrow books (maximum 3 active loans)
- Return borrowed books
- View borrowing history
- Track overdue books
- Pay overdue fines

### Librarian Portal
- Dashboard with library statistics
- Add, edit, and delete books
- Manage book loans and returns
- Monitor overdue books
- Manage fines
- View student borrowing history

---

## Tech Stack

### Backend
- Python
- Flask
- SQLAlchemy
- SQLite

### Frontend
- React
- React Router
- Axios

### Authentication
- Flask Session Authentication

---

## Project Structure

```text
library-management-system/
├── backend/
│   ├── app.py
│   ├── database.py
│   ├── models.py
│   ├── requirements.txt
│   └── routes/
│       ├── auth.py
│       ├── books.py
│       └── loans.py
│
└── frontend/
    ├── package.json
    ├── public/
    └── src/
        ├── App.js
        ├── api/
        ├── components/
        ├── context/
        └── pages/
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/Souchithreddy/Library-management-system.git
cd Library-management-system
```

### Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux / Mac
source venv/bin/activate

pip install -r requirements.txt

python app.py
```

Backend will start at:

```text
http://localhost:5000
```

---

### Frontend Setup

```bash
cd frontend

npm install

npm start
```

Frontend will start at:

```text
http://localhost:3000
```

---

## Demo Accounts

| Role | Email | Password |
|--------|--------|--------|
| Librarian | librarian@library.com | librarian123 |
| Student | arjun@student.com | student123 |
| Student | priya@student.com | student123 |

---

## API Modules

### Authentication
- Login
- Register
- Logout
- Current User

### Books
- Create Book
- Read Books
- Update Book
- Delete Book

### Loans
- Borrow Book
- Return Book
- Loan History
- Fine Management

---

## Future Improvements

- JWT Authentication
- Email Notifications
- Barcode/QR Integration
- Cloud Database Support
- Book Recommendation System
- Analytics Dashboard

---

## Author

**Souchith Reddy**

GitHub: https://github.com/Souchithreddy
