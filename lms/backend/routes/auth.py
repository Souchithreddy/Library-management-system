from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from models import User
from database import db

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    role = data.get('role', 'student')

    if not name or not email or not password:
        return jsonify({'error': 'All fields are required'}), 400
    if role not in ('student', 'librarian'):
        return jsonify({'error': 'Invalid role'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409

    user = User(
        name=name,
        email=email,
        password=generate_password_hash(password),
        role=role
    )
    db.session.add(user)
    db.session.commit()

    session['user_id'] = user.id
    return jsonify({'user': user.to_dict(), 'message': 'Registered successfully'}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid email or password'}), 401

    session['user_id'] = user.id
    return jsonify({'user': user.to_dict()})


@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out'})


@auth_bp.route('/me', methods=['GET'])
def me():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user.to_dict()})
