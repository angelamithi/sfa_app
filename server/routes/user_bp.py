from flask import Blueprint, make_response, jsonify
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from flask_restful import Api, Resource, reqparse
from flask_jwt_extended import jwt_required
from models import User, db,UserCommunity,VolunteerHour,Event
from serializer import user_schema ,community_schema,event_schema,volunteer_hour_schema
from auth import admin_required
from flask_bcrypt import Bcrypt

user_bp = Blueprint('user_bp', __name__)
api = Api(user_bp)
bcrypt = Bcrypt()
post_args = reqparse.RequestParser()
post_args.add_argument('username', type=str, required=True, help='Username is required')
post_args.add_argument('email', type=str, required=True, help='Email is required')
post_args.add_argument('first_name', type=str, required=True, help='First Name is required')
post_args.add_argument('last_name', type=str, required=True, help='Last Name is required')
post_args.add_argument('phone_number', type=str)
post_args.add_argument('role', type=str, required=True, help='Role is required')

patch_args = reqparse.RequestParser()
patch_args.add_argument('username', type=str)
patch_args.add_argument('email', type=str)
patch_args.add_argument('first_name', type=str)
patch_args.add_argument('last_name', type=str)
patch_args.add_argument('phone_number', type=str)
patch_args.add_argument('password', type=str)
patch_args.add_argument('role', type=str)


class UserDetails(Resource):
    # @jwt_required()
    def get(self):
        users = User.query.all()
        result = user_schema.dump(users,many=True)
        return make_response(jsonify(result), 200)

  
    def post(self):
        data = post_args.parse_args()

        # Check if the user already exists
        existing_user = User.query.filter_by(username=data['username']).first()
        if existing_user:
            return jsonify({"error": "User with this username already exists"})
        
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({"error": "User with this email address already exists"})
        
        # Set default password if not provided
        default_password = 'default123'
        password = data.get('password', default_password)
        
        hashed_password =bcrypt.generate_password_hash(password)

        new_user = User(
            username=data['username'],
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            phone_number=data['phone_number'],
            password=hashed_password,
            role=data['role']
        )
        
        db.session.add(new_user)
        db.session.commit()

        result = user_schema.dump(new_user)
        return jsonify(result)

api.add_resource(UserDetails, '/users')


class UserById(Resource):
    @jwt_required()
    def get(self, id):
        user = User.query.get(id)
        if not user:
            return make_response(jsonify({"error": "User not found"}), 404)

        user_data = user_schema.dump(user)
        user_communities = UserCommunity.query.filter_by(user_id=id).all()
        communities = [community_schema.dump(uc.community) for uc in user_communities]
        user_data['communities'] = communities if communities else "No community"

        if user.role == 'Coordinator':
            # Fetch events coordinated by this user
            events = Event.query.filter_by(coordinator_id=id).all()
            events_data = [event_schema.dump(event) for event in events]
            user_data['events'] = events_data if events_data else "No events coordinated"
        elif user.role == 'Volunteer':
            # Fetch volunteer hours and events this user has volunteered in
            volunteer_hours = VolunteerHour.query.filter_by(user_id=id).all()
            volunteer_hours_data = [volunteer_hour_schema.dump(hour) for hour in volunteer_hours]
            events = Event.query.join(VolunteerHour).filter(VolunteerHour.user_id == id).all()
            events_data = [event_schema.dump(event) for event in events]
            user_data['volunteer_hours'] = volunteer_hours_data if volunteer_hours_data else "No volunteer hours recorded"
            user_data['events'] = events_data if events_data else "No events volunteered in"

        return make_response(jsonify(user_data), 200)



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

