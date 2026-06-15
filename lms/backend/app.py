from flask import Flask
from flask_cors import CORS
from database import db
from routes.auth import auth_bp
from routes.books import books_bp
from routes.loans import loans_bp
import os

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'lms-secret-key-change-in-production'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///library.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    CORS(app, supports_credentials=True)
    db.init_app(app)

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(books_bp, url_prefix='/api/books')
    app.register_blueprint(loans_bp, url_prefix='/api/loans')

    with app.app_context():
        db.create_all()
        seed_data()

    return app

def seed_data():
    from models import User, Book
    from werkzeug.security import generate_password_hash

    if User.query.first():
        return

    # Create librarian
    librarian = User(
        name='Admin Librarian',
        email='librarian@library.com',
        password=generate_password_hash('librarian123'),
        role='librarian'
    )
    # Create students
    students = [
        User(name='Arjun Sharma', email='arjun@student.com',
             password=generate_password_hash('student123'), role='student'),
        User(name='Priya Nair', email='priya@student.com',
             password=generate_password_hash('student123'), role='student'),
    ]
    # Create books
    books = [
        Book(title='The Pragmatic Programmer', author='Andrew Hunt', isbn='978-0135957059',
             genre='Technology', total_copies=3, available_copies=3),
        Book(title='Clean Code', author='Robert C. Martin', isbn='978-0132350884',
             genre='Technology', total_copies=2, available_copies=2),
        Book(title='Design Patterns', author='Gang of Four', isbn='978-0201633610',
             genre='Technology', total_copies=2, available_copies=2),
        Book(title='Sapiens', author='Yuval Noah Harari', isbn='978-0062316097',
             genre='History', total_copies=4, available_copies=4),
        Book(title='Thinking, Fast and Slow', author='Daniel Kahneman', isbn='978-0374533557',
             genre='Psychology', total_copies=2, available_copies=2),
        Book(title='The Great Gatsby', author='F. Scott Fitzgerald', isbn='978-0743273565',
             genre='Fiction', total_copies=3, available_copies=3),
        Book(title='Atomic Habits', author='James Clear', isbn='978-0735211292',
             genre='Self-Help', total_copies=3, available_copies=3),
        Book(title='Deep Work', author='Cal Newport', isbn='978-1455586691',
             genre='Self-Help', total_copies=2, available_copies=2),
    ]

    db.session.add(librarian)
    for s in students:
        db.session.add(s)
    for b in books:
        db.session.add(b)
    db.session.commit()

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
