from flask import Blueprint, request, jsonify, session
from models import Loan, Book, User
from database import db
from datetime import date, timedelta

loans_bp = Blueprint('loans', __name__)
LOAN_DAYS = 14


def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return None
    return User.query.get(user_id)


@loans_bp.route('/borrow', methods=['POST'])
def borrow():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    if user.role != 'student':
        return jsonify({'error': 'Only students can borrow books'}), 403

    data = request.get_json()
    book_id = data.get('book_id')
    if not book_id:
        return jsonify({'error': 'book_id is required'}), 400

    book = Book.query.get(book_id)
    if not book:
        return jsonify({'error': 'Book not found'}), 404
    if book.available_copies < 1:
        return jsonify({'error': 'No copies available'}), 400

    # Check if student already has this book
    existing = Loan.query.filter_by(
        student_id=user.id, book_id=book_id, returned_at=None
    ).first()
    if existing:
        return jsonify({'error': 'You already have this book borrowed'}), 400

    # Check borrow limit (max 3 books at once)
    active_count = Loan.query.filter_by(student_id=user.id, returned_at=None).count()
    if active_count >= 3:
        return jsonify({'error': 'Borrow limit reached (max 3 books at a time)'}), 400

    today = date.today()
    loan = Loan(
        student_id=user.id,
        book_id=book_id,
        issued_at=today,
        due_date=today + timedelta(days=LOAN_DAYS),
    )
    book.available_copies -= 1
    db.session.add(loan)
    db.session.commit()
    return jsonify({'loan': loan.to_dict(), 'message': 'Book borrowed successfully'}), 201


@loans_bp.route('/return/<int:loan_id>', methods=['POST'])
def return_book(loan_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    loan = Loan.query.get(loan_id)
    if not loan:
        return jsonify({'error': 'Loan not found'}), 404

    # Student can return own book; librarian can return any
    if user.role == 'student' and loan.student_id != user.id:
        return jsonify({'error': 'Not authorized'}), 403
    if loan.returned_at:
        return jsonify({'error': 'Book already returned'}), 400

    loan.returned_at = date.today()
    loan.fine_amount = loan.calculate_fine()
    loan.book.available_copies += 1
    db.session.commit()
    return jsonify({'loan': loan.to_dict(), 'message': 'Book returned successfully'})


@loans_bp.route('/pay-fine/<int:loan_id>', methods=['POST'])
def pay_fine(loan_id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401

    loan = Loan.query.get(loan_id)
    if not loan:
        return jsonify({'error': 'Loan not found'}), 404
    if user.role == 'student' and loan.student_id != user.id:
        return jsonify({'error': 'Not authorized'}), 403
    if not loan.returned_at:
        return jsonify({'error': 'Book must be returned first'}), 400
    if loan.fine_paid:
        return jsonify({'error': 'Fine already paid'}), 400

    loan.fine_paid = True
    db.session.commit()
    return jsonify({'loan': loan.to_dict(), 'message': 'Fine paid successfully'})


@loans_bp.route('/my-history', methods=['GET'])
def my_history():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    if user.role != 'student':
        return jsonify({'error': 'Students only'}), 403

    loans = Loan.query.filter_by(student_id=user.id)\
        .order_by(Loan.issued_at.desc()).all()
    return jsonify({'loans': [l.to_dict() for l in loans]})


@loans_bp.route('/active', methods=['GET'])
def active_loans():
    """Librarian: see all active loans"""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    if user.role != 'librarian':
        return jsonify({'error': 'Librarian access required'}), 403

    loans = Loan.query.filter_by(returned_at=None)\
        .order_by(Loan.due_date).all()
    return jsonify({'loans': [l.to_dict() for l in loans]})


@loans_bp.route('/all', methods=['GET'])
def all_loans():
    """Librarian: full loan history"""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    if user.role != 'librarian':
        return jsonify({'error': 'Librarian access required'}), 403

    loans = Loan.query.order_by(Loan.issued_at.desc()).all()
    return jsonify({'loans': [l.to_dict() for l in loans]})


@loans_bp.route('/stats', methods=['GET'])
def stats():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    if user.role != 'librarian':
        return jsonify({'error': 'Librarian access required'}), 403

    total_books = db.session.query(db.func.sum(Book.total_copies)).scalar() or 0
    available = db.session.query(db.func.sum(Book.available_copies)).scalar() or 0
    active_loans = Loan.query.filter_by(returned_at=None).count()
    overdue = sum(1 for l in Loan.query.filter_by(returned_at=None).all()
                  if date.today() > l.due_date)
    total_members = User.query.filter_by(role='student').count()
    fines_collected = db.session.query(
        db.func.sum(Loan.fine_amount)
    ).filter(Loan.fine_paid == True).scalar() or 0
    fines_pending = sum(
        l.calculate_fine() for l in Loan.query.filter(
            Loan.fine_paid == False
        ).all() if l.calculate_fine() > 0
    )

    return jsonify({
        'total_books': total_books,
        'available_books': available,
        'active_loans': active_loans,
        'overdue_loans': overdue,
        'total_members': total_members,
        'fines_collected': round(fines_collected, 2),
        'fines_pending': round(fines_pending, 2),
    })


@loans_bp.route('/members', methods=['GET'])
def members_list():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    if user.role != 'librarian':
        return jsonify({'error': 'Librarian access required'}), 403

    members = User.query.filter_by(role='student').all()
    result = []
    for m in members:
        active = sum(1 for l in m.loans if not l.returned_at)
        overdue = sum(1 for l in m.loans if not l.returned_at and date.today() > l.due_date)
        pending_fine = sum(l.calculate_fine() for l in m.loans if not l.fine_paid and l.calculate_fine() > 0)
        result.append({**m.to_dict(), 'active_loans': active, 'overdue_loans': overdue,
                       'pending_fine': round(pending_fine, 2)})
    return jsonify({'members': result})
