from flask import Blueprint, make_response, jsonify
from flask_restful import Api, Resource, reqparse
from flask_jwt_extended import jwt_required
from models import UserTask, db
from serializer import user_task_schema
from auth import admin_required

user_task_bp = Blueprint('user_tasks_bp', __name__)
api = Api(user_task_bp)

# Define request parsers for POST and PATCH methods
post_args = reqparse.RequestParser()
post_args.add_argument('user_id', type=int, required=True, help='User ID is required')
post_args.add_argument('task_id', type=int, required=True, help='Task ID is required')
post_args.add_argument('status', type=str, default='pending')

patch_args = reqparse.RequestParser()
patch_args.add_argument('user_id', type=int)
patch_args.add_argument('task_id', type=int)
patch_args.add_argument('status', type=str)

# Define Resource for all UserTasks
class UserTasksDetails(Resource):
    @jwt_required()
    def get(self):
        user_tasks = UserTask.query.all()
        result = user_task_schema.dump(user_tasks)
        return make_response(jsonify(result), 200)

    @admin_required()
    def post(self):
        data = post_args.parse_args()
        new_user_task = UserTask(
            user_id=data['user_id'],
            task_id=data['task_id'],
            status=data.get('status', 'pending')
        )
        db.session.add(new_user_task)
        db.session.commit()
        result = user_task_schema.dump(new_user_task)
        return make_response(jsonify(result), 201)

api.add_resource(UserTasksDetails, '/user_tasks')

# Define Resource for a single UserTask by ID
class UserTaskById(Resource):
    @jwt_required()
    def get(self, id):
        user_task = UserTask.query.get(id)
        if not user_task:
            return make_response(jsonify({"error": "UserTask not found"}), 404)
        result = user_task_schema.dump(user_task)
        return make_response(jsonify(result), 200)

    @admin_required()
    def delete(self, id):
        user_task = UserTask.query.get(id)
        if not user_task:
            return make_response(jsonify({"error": "UserTask not found"}), 404)
        db.session.delete(user_task)
        db.session.commit()
        return make_response(jsonify({"message": "UserTask deleted successfully"}), 200)

    @admin_required()
    def patch(self, id):
        user_task = UserTask.query.get(id)
        if not user_task:
            return make_response(jsonify({"error": "UserTask not found"}), 404)
        data = patch_args.parse_args()
        for key, value in data.items():
            if value is not None:
                setattr(user_task, key, value)
        db.session.commit()
        result = user_task_schema.dump(user_task)
        return make_response(jsonify(result), 200)

api.add_resource(UserTaskById, '/user_tasks/<int:id>')
