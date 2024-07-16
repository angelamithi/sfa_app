from flask import Blueprint, make_response, jsonify
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from flask_restful import Api, Resource, reqparse
from flask_jwt_extended import jwt_required
from models import User, db  
from serializer import user_schema 
from auth import admin_required

user_bp = Blueprint('user_bp', __name__)
api = Api(user_bp)

post_args = reqparse.RequestParser()
post_args.add_argument('username', type=str, required=True, help='Username is required')
post_args.add_argument('email', type=str, required=True, help='Email is required')
post_args.add_argument('first_name', type=str, required=True, help='First Name is required')
post_args.add_argument('last_name', type=str, required=True, help='Last Name is required')
post_args.add_argument('phone_number', type=str)
post_args.add_argument('password_hash', type=str, required=True, help='Password Hash is required')
post_args.add_argument('role', type=str, required=True, help='Role is required')

patch_args = reqparse.RequestParser()
patch_args.add_argument('username', type=str)
patch_args.add_argument('email', type=str)
patch_args.add_argument('first_name', type=str)
patch_args.add_argument('last_name', type=str)
patch_args.add_argument('phone_number', type=str)
patch_args.add_argument('password_hash', type=str)
patch_args.add_argument('role', type=str)


class UserDetails(Resource):
    @jwt_required()
    def get(self):
        users = User.query.all()
        result = user_schema.dump(users,many=True)
        return make_response(jsonify(result), 200)

    @admin_required()  
    def post(self):
        data = post_args.parse_args()

        # Check if the user already exists
        existing_user = User.query.filter_by(username=data['username']).first()
        if existing_user:
            return make_response(jsonify({"error": "User with this username already exists"}), 409)
          # Check if the user already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return make_response(jsonify({"error": "User with this email address already exists"}), 409)

        new_user = User(
            username=data['username'],
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            phone_number=data['phone_number'],
            password_hash=data['password_hash'],
            role=data['role']
        )
        db.session.add(new_user)
        db.session.commit()

       
        result = user_schema.dump(new_user)
        return make_response(jsonify(result), 201)

api.add_resource(UserDetails, '/users')

class UserById(Resource):
    @jwt_required()
    def get(self, id):
        user = User.query.get(id)
        if not user:
            return make_response(jsonify({"error": "User not found"}), 404)

        
        result = user_schema.dump(user)
        return make_response(jsonify(result), 200)

    @admin_required() 
    def delete(self, id):
        user = User.query.get(id)
        if not user:
            return make_response(jsonify({"error": "User not found"}), 404)

        db.session.delete(user)
        db.session.commit()
        return make_response(jsonify({"message": "User deleted successfully"}), 200)

    @admin_required()  
    def patch(self, id):
        user = User.query.get(id)
        if not user:
            return make_response(jsonify({"error": "User not found"}), 404)

        data = patch_args.parse_args()
        for key, value in data.items():
            if value is not None:
                setattr(user, key, value)

        db.session.commit()
     
        result = user_schema.dump(user)
        return make_response(jsonify(result), 200)

api.add_resource(UserById, '/users/<int:id>')

