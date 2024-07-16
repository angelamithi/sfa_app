from flask import Blueprint, make_response, jsonify
from flask_restful import Api, Resource, reqparse
from flask_jwt_extended import jwt_required
from models import Poll, db
from serializer import poll_schema
from auth import admin_required

poll_bp = Blueprint('poll_bp', __name__)
api = Api(poll_bp)

post_args = reqparse.RequestParser()
post_args.add_argument('question', type=str, required=True, help='Question is required')
post_args.add_argument('options', type=dict, required=True, help='Options are required')
post_args.add_argument('event_id', type=int, required=True, help='Event ID is required')
post_args.add_argument('poll_owner_id', type=int, required=True, help='Poll Owner ID is required')

patch_args = reqparse.RequestParser()
patch_args.add_argument('question', type=str)
patch_args.add_argument('options', type=dict)
patch_args.add_argument('event_id', type=int)
patch_args.add_argument('poll_owner_id', type=int)

class PollDetails(Resource):
    @jwt_required()
    def get(self):
        polls = Poll.query.all()
        result = [poll_schema.dump(poll) for poll in polls]
        return make_response(jsonify(result), 200)

    @admin_required()
    def post(self):
        data = post_args.parse_args()

        new_poll = Poll(
            question=data['question'],
            options=data['options'],
            event_id=data['event_id'],
            poll_owner_id=data['poll_owner_id']
        )
        db.session.add(new_poll)
        db.session.commit()

        result = poll_schema.dump(new_poll)
        return make_response(jsonify(result), 201)

api.add_resource(PollDetails, '/polls')

class PollById(Resource):
    @jwt_required()
    def get(self, id):
        poll = Poll.query.get(id)
        if not poll:
            return make_response(jsonify({"error": "Poll not found"}), 404)

        result = poll_schema.dump(poll)
        return make_response(jsonify(result), 200)

    @admin_required()
    def delete(self, id):
        poll = Poll.query.get(id)
        if not poll:
            return make_response(jsonify({"error": "Poll not found"}), 404)

        db.session.delete(poll)
        db.session.commit()
        return make_response(jsonify({"message": "Poll deleted successfully"}), 200)

    @admin_required()
    def patch(self, id):
        poll = Poll.query.get(id)
        if not poll:
            return make_response(jsonify({"error": "Poll not found"}), 404)

        data = patch_args.parse_args()
        for key, value in data.items():
            if value is not None:
                setattr(poll, key, value)

        db.session.commit()

        result = poll_schema.dump(poll)
        return make_response(jsonify(result), 200)

api.add_resource(PollById, '/polls/<int:id>')
