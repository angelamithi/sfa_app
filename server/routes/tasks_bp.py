from flask import Blueprint, make_response, jsonify
from flask_restful import Api, Resource, reqparse
from flask_jwt_extended import jwt_required
from models import Tasks, db
from serializer import tasks_schema
from auth import admin_required

tasks_bp = Blueprint('tasks_bp', __name__)
api = Api(tasks_bp)

# Define request parsers for POST and PATCH methods
post_args = reqparse.RequestParser()
post_args.add_argument('name', type=str, required=True, help='Name is required')
post_args.add_argument('description', type=str, required=True, help='Description is required')
post_args.add_argument('goals_id', type=str, required=True, help='Goals ID is required')
post_args.add_argument('event_id', type=int, required=False)
post_args.add_argument('year_id', type=int, required=False)
post_args.add_argument('start_date', type=str, required=True, help='Start Date is required')
post_args.add_argument('end_date', type=str, required=True, help='End Date is required')

patch_args = reqparse.RequestParser()
patch_args.add_argument('name', type=str)
patch_args.add_argument('description', type=str)
patch_args.add_argument('goals_id', type=str)
patch_args.add_argument('event_id', type=int)
patch_args.add_argument('year_id', type=int)
patch_args.add_argument('start_date', type=str)
patch_args.add_argument('end_date', type=str)

# Define Resource for all Tasks
class TasksDetails(Resource):
    @jwt_required()
    def get(self):
        tasks = Tasks.query.all()
        result = tasks_schema.dump(tasks)
        return make_response(jsonify(result), 200)

    @admin_required()
    def post(self):
        data = post_args.parse_args()
        new_task = Tasks(
            name=data['name'],
            description=data['description'],
            goals_id=data['goals_id'],
            event_id=data.get('event_id'),
            year_id=data.get('year_id'),
            start_date=data['start_date'],
            end_date=data['end_date']
        )
        db.session.add(new_task)
        db.session.commit()
        result = tasks_schema.dump(new_task)
        return make_response(jsonify(result), 201)

api.add_resource(TasksDetails, '/tasks')

# Define Resource for a single Task by ID
class TaskById(Resource):
    @jwt_required()
    def get(self, id):
        task = Tasks.query.get(id)
        if not task:
            return make_response(jsonify({"error": "Task not found"}), 404)
        result = tasks_schema.dump(task)
        return make_response(jsonify(result), 200)

    @admin_required()
    def delete(self, id):
        task = Tasks.query.get(id)
        if not task:
            return make_response(jsonify({"error": "Task not found"}), 404)
        db.session.delete(task)
        db.session.commit()
        return make_response(jsonify({"message": "Task deleted successfully"}), 200)

    @admin_required()
    def patch(self, id):
        task = Tasks.query.get(id)
        if not task:
            return make_response(jsonify({"error": "Task not found"}), 404)
        data = patch_args.parse_args()
        for key, value in data.items():
            if value is not None:
                setattr(task, key, value)
        db.session.commit()
        result = tasks_schema.dump(task)
        return make_response(jsonify(result), 200)

api.add_resource(TaskById, '/tasks/<int:id>')
