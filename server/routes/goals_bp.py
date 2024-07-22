from flask import Blueprint, make_response, jsonify
from flask_restful import Api, Resource, reqparse
from flask_jwt_extended import jwt_required
from models import Goals, db
from serializer import goal_schema
from auth import admin_required

goals_bp = Blueprint('goals_bp', __name__)
api = Api(goals_bp)

# Define request parsers for POST and PATCH methods
post_args = reqparse.RequestParser()
post_args.add_argument('user_id', type=str, required=True, help='User ID is required')
post_args.add_argument('name', type=str, required=True, help='Name is required')
post_args.add_argument('description', type=str, required=True, help='Description is required')
post_args.add_argument('session_id', type=str, required=True, help='Session ID is required')
post_args.add_argument('year_id', type=int, required=False)

patch_args = reqparse.RequestParser()
patch_args.add_argument('user_id', type=str)
patch_args.add_argument('name', type=str)
patch_args.add_argument('description', type=str)
patch_args.add_argument('session_id', type=str)
patch_args.add_argument('year_id', type=int)

# Define Resource for all Goals
class GoalsDetails(Resource):
    @jwt_required()
    def get(self):
        goals = Goals.query.all()
        result = goals_schema.dump(goals)
        return make_response(jsonify(result), 200)

    @admin_required()
    def post(self):
        data = post_args.parse_args()
        new_goal = Goals(
            user_id=data['user_id'],
            name=data['name'],
            description=data['description'],
            session_id=data['session_id'],
            year_id=data.get('year_id')
        )
        db.session.add(new_goal)
        db.session.commit()
        result = goal_schema.dump(new_goal)
        return make_response(jsonify(result), 201)

api.add_resource(GoalsDetails, '/goals')

# Define Resource for a single Goal by ID
class GoalById(Resource):
    @jwt_required()
    def get(self, id):
        goal = Goals.query.get(id)
        if not goal:
            return make_response(jsonify({"error": "Goal not found"}), 404)
        result = goal_schema.dump(goal)
        return make_response(jsonify(result), 200)

    @admin_required()
    def delete(self, id):
        goal = Goals.query.get(id)
        if not goal:
            return make_response(jsonify({"error": "Goal not found"}), 404)
        db.session.delete(goal)
        db.session.commit()
        return make_response(jsonify({"message": "Goal deleted successfully"}), 200)

    @admin_required()
    def patch(self, id):
        goal = Goals.query.get(id)
        if not goal:
            return make_response(jsonify({"error": "Goal not found"}), 404)
        data = patch_args.parse_args()
        for key, value in data.items():
            if value is not None:
                setattr(goal, key, value)
        db.session.commit()
        result = goal_schema.dump(goal)
        return make_response(jsonify(result), 200)

api.add_resource(GoalById, '/goals/<int:id>')
