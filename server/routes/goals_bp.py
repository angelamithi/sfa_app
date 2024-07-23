from flask import Blueprint, make_response, jsonify
from flask_restful import Api, Resource, reqparse
from flask_jwt_extended import jwt_required
from models import Goals, db,Session,Community,Year
from serializer import goal_schema
from auth import admin_required
from datetime import datetime
from sqlalchemy.orm import joinedload
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

class GoalsDetails(Resource):
    @jwt_required()
    def get(self):
        current_year = datetime.utcnow().year
        year = Year.query.filter_by(year_name=current_year).first()

        if not year:
            return make_response(jsonify({"message": "No goals found for the current year"}), 404)

        # Simplified query to isolate the problem
        goals = db.session.query(Goals, Session, Community).distinct().join(Session, Goals.session_id == Session.id).join(Community, Goals.id == Community.goal_id).filter(Goals.year_id == year.id).all()

        if not goals:
            return make_response(jsonify({"message": "No goals found for the current year"}), 404)

        # Format the result
        result = []
        for goal, session, community in goals:
            result.append({
                "goal_id": goal.id,
                "goal_name": goal.name,
                "goal_description": goal.description,
                "goal_status": goal.goal_status,
                "session_name": session.name,
                "community_name": community.name
            })

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




class GoalById(Resource):
    @jwt_required()
    def get(self, id):
        # Fetch the goal along with associated data
        goal = Goals.query.options(
            joinedload(Goals.tasks),
            joinedload(Goals.community_goals).joinedload(Community.coordinator),
            joinedload(Goals.session)
        ).filter_by(id=id).first()

        if not goal:
            return make_response(jsonify({"error": "Goal not found"}), 404)

        # Serialize the result
        result = {
            'id': goal.id,
            'name': goal.name,
            'description': goal.description,
            'status': goal.goal_status,
            'session': {
                'id': goal.session.id,
                'name': goal.session.name,
                'start_date': goal.session.start_date.date().isoformat(),
                'end_date': goal.session.end_date.date().isoformat()
            } if goal.session else None,
            'tasks': [
                {
                    'id': task.id,
                    'name': task.name,
                    'description': task.description,
                    'start_date': task.start_date.date().isoformat(),
                    'end_date': task.end_date.date().isoformat(),
                    'status': task.task_status
                } for task in goal.tasks
            ],
            'communities': [
                {
                    'id': community.id,
                    'name': community.name,
                    'description': community.description,
                    'coordinator': {
                        'id': community.coordinator.id,
                        'username': community.coordinator.username,
                        'first_name': community.coordinator.first_name,
                        'last_name': community.coordinator.last_name
                    } if community.coordinator else None
                } for community in goal.community_goals
            ]
        }
      
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
