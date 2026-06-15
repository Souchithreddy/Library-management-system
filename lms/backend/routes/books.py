from flask import Blueprint, request, jsonify, session
from models import Book
from database import db

books_bp = Blueprint('books', __name__)


def require_librarian():
    from models import User
    user_id = session.get('user_id')
    if not user_id:
        return None, jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user or user.role != 'librarian':
        return None, jsonify({'error': 'Librarian access required'}), 403
    return user, None, None


def require_auth():
    from models import User
    user_id = session.get('user_id')
    if not user_id:
        return None, jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user:
        return None, jsonify({'error': 'User not found'}), 404
    return user, None, None


@books_bp.route('/', methods=['GET'])
def list_books():
    user, err, code = require_auth()
    if err:
        return err, code

    q = request.args.get('q', '')
    genre = request.args.get('genre', '')

    query = Book.query
    if q:
        like = f'%{q}%'
        query = query.filter(
            (Book.title.ilike(like)) | (Book.author.ilike(like)) | (Book.isbn.ilike(like))
        )
    if genre:
        query = query.filter(Book.genre.ilike(f'%{genre}%'))

    books = query.order_by(Book.title).all()
    return jsonify({'books': [b.to_dict() for b in books]})


@books_bp.route('/<int:book_id>', methods=['GET'])
def get_book(book_id):
    user, err, code = require_auth()
    if err:
        return err, code
    book = Book.query.get_or_404(book_id)
    return jsonify({'book': book.to_dict()})


@books_bp.route('/', methods=['POST'])
def add_book():
    user, err, code = require_librarian()
    if err:
        return err, code

    data = request.get_json()
    title = data.get('title', '').strip()
    author = data.get('author', '').strip()
    isbn = data.get('isbn', '').strip()
    genre = data.get('genre', '').strip()
    copies = int(data.get('total_copies', 1))

    if not title or not author or not isbn:
        return jsonify({'error': 'Title, author, and ISBN are required'}), 400
    if Book.query.filter_by(isbn=isbn).first():
        return jsonify({'error': 'ISBN already exists'}), 409

    book = Book(title=title, author=author, isbn=isbn, genre=genre or None,
                total_copies=copies, available_copies=copies)
    db.session.add(book)
    db.session.commit()
    return jsonify({'book': book.to_dict(), 'message': 'Book added'}), 201


@books_bp.route('/<int:book_id>', methods=['PUT'])
def update_book(book_id):
    user, err, code = require_librarian()
    if err:
        return err, code

    book = Book.query.get_or_404(book_id)
    data = request.get_json()

    if 'title' in data:
        book.title = data['title'].strip()
    if 'author' in data:
        book.author = data['author'].strip()
    if 'genre' in data:
        book.genre = data['genre'].strip() or None
    if 'total_copies' in data:
        diff = int(data['total_copies']) - book.total_copies
        book.total_copies = int(data['total_copies'])
        book.available_copies = max(0, book.available_copies + diff)

    db.session.commit()
    return jsonify({'book': book.to_dict(), 'message': 'Book updated'})


@books_bp.route('/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    user, err, code = require_librarian()
    if err:
        return err, code

    book = Book.query.get_or_404(book_id)
    active = sum(1 for l in book.loans if not l.returned_at)
    if active:
        return jsonify({'error': f'Cannot delete: {active} active loan(s)'}), 400

    db.session.delete(book)
    db.session.commit()
    return jsonify({'message': 'Book deleted'})


@books_bp.route('/genres', methods=['GET'])
def genres():
    user, err, code = require_auth()
    if err:
        return err, code
    rows = db.session.query(Book.genre).filter(Book.genre != None).distinct().all()
    return jsonify({'genres': [r[0] for r in rows if r[0]]})
