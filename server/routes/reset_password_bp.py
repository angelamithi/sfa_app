import os
from flask import Blueprint, request, url_for
from flask_restful import Api, Resource, reqparse, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
from flask_mail import Message
from itsdangerous import URLSafeTimedSerializer
from dotenv import load_dotenv
from models import db, User
from app import mail, bcrypt  # Import bcrypt and mail from the main app file

# Load environment variables
load_dotenv()

# Define Blueprint
change_password_bp = Blueprint('change_password_bp', __name__)
api = Api(change_password_bp)

# Initialize URLSafeTimedSerializer
serializer = URLSafeTimedSerializer(os.getenv('MAIL_SECRET_KEY'))  # Use the appropriate environment variable for the secret key

# Argument parsers
change_password_args = reqparse.RequestParser()
change_password_args.add_argument('currentPassword', type=str, required=True)
change_password_args.add_argument('newPassword', type=str, required=True)
change_password_args.add_argument('confirmPassword', type=str, required=True)

forgot_password_args = reqparse.RequestParser()
forgot_password_args.add_argument('email', type=str, required=True)
forgot_password_args.add_argument('newPassword', type=str, required=True)
forgot_password_args.add_argument('confirmPassword', type=str, required=True)

# Argument parsers
change_password_args = reqparse.RequestParser()
change_password_args.add_argument('email', type=str, required=True)

class RequestChangePassword(Resource):
    def post(self):
        data = change_password_args.parse_args()
        email = data.get('email')
        user = User.query.filter_by(email=email).first()
        if not user:
            return {"message": "User not found"}, 404

        token = serializer.dumps(email, salt='password-change-salt')
        change_url = url_for('change_password', token=token, _external=True)
        message = Message('Password Change Request', sender=os.getenv('MAIL_USERNAME'), recipients=[email])
        message.body = f'To change your password, click the following link: {change_url}'
        mail.send(message)

        return {"message": "A password change link has been sent to your email"}, 200
    
api.add_resource(RequestChangePassword, '/request_change_password')

class ChangePassword(Resource):
    def post(self):
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('newPassword')
        confirm_password = data.get('confirmPassword')

        try:
            email = serializer.loads(token, salt='password-change-salt', max_age=3600)
        except:
            return {"message": "The link is invalid or has expired"}, 400

        if new_password != confirm_password:
            return {"message": "New password and confirm password do not match"}, 422

        user = User.query.filter_by(email=email).first()
        if not user:
            return {"message": "User not found"}, 404

        hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
        user.password = hashed_password

        db.session.commit()

        return {"message": "Password changed successfully"}, 200


api.add_resource(ChangePassword, '/change_password')

class RequestResetPassword(Resource):
    def post(self):
        data = request.get_json()
        email = data.get('email')
        user = User.query.filter_by(email=email).first()
        if not user:
            return {"message": "User not found"}, 404

        token = serializer.dumps(email, salt='password-reset-salt')
        reset_url = url_for('reset_password', token=token, _external=True)
        message = Message('Password Reset Request', sender=os.getenv('MAIL_USERNAME'), recipients=[email])
        message.body = f'To reset your password, click the following link: {reset_url}'
        mail.send(message)

        return {"message": "A password reset link has been sent to your email"}, 200
api.add_resource(RequestResetPassword, '/request_reset_password')

class ResetPassword(Resource):
    def post(self):
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('newPassword')

        try:
            email = serializer.loads(token, salt='password-reset-salt', max_age=3600)
        except:
            return {"message": "The reset link is invalid or has expired"}, 400

        user = User.query.filter_by(email=email).first()
        if not user:
            return {"message": "User not found"}, 404

        hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
        user.password = hashed_password
        db.session.commit()

        return {"message": "Password reset successfully"}, 200



api.add_resource(ResetPassword, '/reset_password')
