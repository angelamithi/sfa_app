from flask import Blueprint, make_response, jsonify,request
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from flask_restful import Api, Resource, reqparse
from flask_jwt_extended import jwt_required
from models import User, db,UserCommunity,VolunteerHour,Event,Goals,Year,Session,Community,UserGoals
from serializer import user_schema ,community_schema,event_schema,volunteer_hour_schema,user_goals_schema
from auth import admin_required
from flask_bcrypt import Bcrypt
from datetime import datetime

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
            return make_response(jsonify({"error": "User with this username already exists"}), 400)
        
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return make_response(jsonify({"error": "User with this email address already exists"}), 400)
        
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
        return make_response(jsonify(result), 201)  # Return 201 for successful creation

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
        data = patch_args.parse_args()

        user = User.query.get(id)
        if not user:
            return make_response(jsonify({"error": "User not found"}), 404)

        # Check for uniqueness of updated username and email
        if data.get('username') and data['username'] != user.username:
            existing_user = User.query.filter_by(username=data['username']).first()
            if existing_user:
                return make_response(jsonify({"error": "User with this username already exists"}), 400)
        
        if data.get('email') and data['email'] != user.email:
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user:
                return make_response(jsonify({"error": "User with this email address already exists"}), 400)

        if data['username']:
            user.username = data['username']
        if data['email']:
            user.email = data['email']
        if data['first_name']:
            user.first_name = data['first_name']
        if data['last_name']:
            user.last_name = data['last_name']
        if data['phone_number']:
            user.phone_number = data['phone_number']
        if data['role']:
            user.role = data['role']
      
        db.session.commit()

        result = user_schema.dump(user)
        return make_response(jsonify(result), 200)
api.add_resource(UserById, '/users/<int:id>')

class DeactivateUser(Resource):
    @admin_required()
    def patch(self, id):
        user = User.query.get(id)
        if not user:
            return make_response(jsonify({"error": "User not found"}), 404)

        user.active_status = False
        db.session.commit()

        result = user_schema.dump(user)
        return make_response(jsonify(result), 200)

api.add_resource(DeactivateUser, '/users_deactivate/<int:id>')

class ReactivateUser(Resource):
    @admin_required()
    def patch(self, id):
        user = User.query.get(id)
        if not user:
            return make_response(jsonify({"error": "User not found"}), 404)

        user.active_status = True
        db.session.commit()

        result = user_schema.dump(user)
        return make_response(jsonify(result), 200)

api.add_resource(ReactivateUser, '/users_reactivate/<int:id>')



class AssignGoal(Resource):
    @jwt_required()  # Ensure this route is protected by JWT authentication
    def post(self):
        data = request.get_json()
        user_ids = data.get('user_ids')
        goal_id = data.get('goal_id')

        if not user_ids or not goal_id:
            return {'error': 'User IDs and Goal ID are required.'}, 400

        # Find the goal by ID
        goal = Goals.query.get(goal_id)
        if not goal:
            return {'error': f'Goal with ID {goal_id} not found.'}, 404

        already_assigned = []
        not_found_users = []

        for user_id in user_ids:
            user = User.query.get(user_id)
            if not user:
                not_found_users.append(user_id)
                continue

            existing_assignment = UserGoals.query.filter_by(user_id=user_id, goal_id=goal_id).first()
            if existing_assignment:
                already_assigned.append({'user_id': user_id, 'user_name': user.username})
            else:
                # Assign the goal to the user
                new_assignment = UserGoals(user_id=user_id, goal_id=goal_id)
                db.session.add(new_assignment)
                db.session.commit()

        return {
            'message': 'Goals successfully assigned!',
            'already_assigned': already_assigned,
            'not_found_users': not_found_users
        }, 200
api.add_resource(AssignGoal, '/assign_goal')


class GoalsAssignmentDetails(Resource):
    @jwt_required()
    def get(self):
        current_year = datetime.utcnow().year
        year = Year.query.filter_by(year_name=current_year).first()

        if not year:
            return make_response(jsonify({"message": "No goals found for the current year"}), 404)

        # Retrieve goals associated with the current year
        goals = Goals.query.filter(Goals.year_id == year.id).all()

        if not goals:
            return make_response(jsonify({"message": "No goals found for the current year"}), 404)

        # Format the result to include goal IDs and names
        result = {"goals": [{"id": goal.id, "name": goal.name} for goal in goals]}

        return make_response(jsonify(result), 200)


api.add_resource(GoalsAssignmentDetails, '/fetching_goals')


class UserGoalsDetails(Resource):
    @jwt_required()
    def get(self):
        # Query to join UserGoals, User, and Goals
        user_goals = db.session.query(UserGoals, User, Goals).\
            join(User, UserGoals.user_id == User.id).\
            join(Goals, UserGoals.goal_id == Goals.id).\
            all()
        
        result = []
        for user_goal, user, goal in user_goals:
            user_goal_data = {
                'user_id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'goal_id': goal.id,
                'goal_name': goal.name,
                'assigned_at': user_goal.assigned_at
            }
            result.append(user_goal_data)
        
        return make_response(jsonify(result), 200)

# Add the resource to the API
api.add_resource(UserGoalsDetails, '/user_goals')



class CoordinatorDetails(Resource):
    # @jwt_required()
    def get(self):
        # Filter users by role "coordinator"
        users = User.query.filter_by(role='Coordinator').all()
        result = user_schema.dump(users, many=True)
        return make_response(jsonify(result), 200)

# Assuming this is part of your Flask app setup
api.add_resource(CoordinatorDetails, '/coordinators')


class FetchCoordinators(Resource):
    def get(self):
        coordinators = User.query.filter_by(role='Coordinator').all()
        result = [{"id": user.id, "name": f"{user.first_name} {user.last_name}"} for user in coordinators]
        return make_response(jsonify(result), 200)

api.add_resource(FetchCoordinators, '/fetch_coordinators')
