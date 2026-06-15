from database import db
from datetime import datetime, date

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='student')  # 'librarian' or 'student'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    loans = db.relationship('Loan', backref='student', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat()
        }


class Book(db.Model):
    __tablename__ = 'books'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    author = db.Column(db.String(100), nullable=False)
    isbn = db.Column(db.String(20), unique=True, nullable=False)
    genre = db.Column(db.String(50))
    total_copies = db.Column(db.Integer, default=1)
    available_copies = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    loans = db.relationship('Loan', backref='book', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'author': self.author,
            'isbn': self.isbn,
            'genre': self.genre,
            'total_copies': self.total_copies,
            'available_copies': self.available_copies,
            'created_at': self.created_at.isoformat()
        }


class Loan(db.Model):
    __tablename__ = 'loans'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
    issued_at = db.Column(db.Date, default=date.today)
    due_date = db.Column(db.Date, nullable=False)
    returned_at = db.Column(db.Date, nullable=True)
    fine_amount = db.Column(db.Float, default=0.0)
    fine_paid = db.Column(db.Boolean, default=False)

    FINE_PER_DAY = 5.0   # ₹5 per day
    LOAN_DAYS = 14

    def calculate_fine(self):
        check_date = self.returned_at or date.today()
        if check_date > self.due_date:
            overdue_days = (check_date - self.due_date).days
            return round(overdue_days * self.FINE_PER_DAY, 2)
        return 0.0

    @property
    def overdue_days(self):
        check_date = self.returned_at or date.today()
        if check_date > self.due_date:
            return (check_date - self.due_date).days
        return 0

    @property
    def status(self):
        if self.returned_at:
            return 'returned'
        if date.today() > self.due_date:
            return 'overdue'
        return 'active'

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': self.student.name if self.student else '',
            'student_email': self.student.email if self.student else '',
            'book_id': self.book_id,
            'book_title': self.book.title if self.book else '',
            'book_author': self.book.author if self.book else '',
            'book_isbn': self.book.isbn if self.book else '',
            'issued_at': self.issued_at.isoformat(),
            'due_date': self.due_date.isoformat(),
            'returned_at': self.returned_at.isoformat() if self.returned_at else None,
            'fine_amount': self.calculate_fine(),
            'fine_paid': self.fine_paid,
            'overdue_days': self.overdue_days,
            'status': self.status,
        }
