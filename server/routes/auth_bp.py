from datetime import datetime
from flask import Blueprint, jsonify
from flask_restful import Api, Resource, abort, reqparse
from flask_bcrypt import Bcrypt
from flask_jwt_extended import jwt_required, get_jwt, JWTManager,get_jwt_identity
from flask_jwt_extended import create_access_token,create_refresh_token
from models import User, db, TokenBlocklist
from serializer import user_schema

bcrypt = Bcrypt()

auth_bp = Blueprint('auth_bp', __name__)
api = Api(auth_bp)


login_args = reqparse.RequestParser()
login_args.add_argument('email', type=str, required=True,
                        help="email is required")
login_args.add_argument('password', type=str, required=True,
                        help="password is required")
login_args.add_argument('role', type=str, required=True,
                        help="role is required")



class Login(Resource):
    def post(self):
        data = login_args.parse_args()
        email = data['email']
        role = data['role']
        password = data['password']
        
        user = User.query.filter_by(email=email).first()
        if not user:
            abort(404, detail="The email provided was not found. Please provide a valid email or sign up")

        if bcrypt.check_password_hash(user.password, password.encode('utf-8')):
            if user.role != role:
                abort(404, detail="Role does not match")

            access_token = create_access_token(identity=user.id, additional_claims={
                "user_id": user.id,
                "role": user.role,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "username": user.username
            })
            refresh_token = create_refresh_token(identity=user.id, additional_claims={
                "user_id": user.id,
                "role": user.role,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "username": user.username
            })
           
            return jsonify(access_token=access_token, refresh_token=refresh_token)
        else:
            abort(400, detail="Your password is incorrect")

api.add_resource(Login, '/login')

class Refresh(Resource):
    @jwt_required(refresh=True)
    def post(self):
        identity = get_jwt_identity()
        claims = get_jwt()
        
        # Fetch user details from the database
        user = User.query.get(identity)
        if not user:
            abort(404, detail="User not found")
        
        # Validate role from JWT claims
        token_role = claims.get('role')
        if user.role != token_role:
            abort(404, detail="Role does not match")
        
        # Create new access token with additional claims
        access_token = create_access_token(identity=user.id, additional_claims={
            "user_id": user.id,
            "role": user.role,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "username": user.username
        })

        return jsonify(access_token=access_token)

api.add_resource(Refresh, '/refresh')


# Logout function
class Logout(Resource):
    @jwt_required()
    def get(self):
        token = get_jwt()
        blocked_token = TokenBlocklist(
            jti=token['jti'], created_at=datetime.utcnow())
        db.session.add(blocked_token)
        db.session.commit()
        return {'detail': "Token logged out"}

api.add_resource(Logout, '/logout')