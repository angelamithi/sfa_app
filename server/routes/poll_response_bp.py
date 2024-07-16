from flask import Blueprint, make_response, jsonify
from flask_restful import Api, Resource, reqparse
from flask_jwt_extended import jwt_required
from models import PollResponse, db
from serializer import poll_response_schema
from auth import admin_required

poll_response_bp = Blueprint('poll_response_bp', __name__)
api = Api(poll_response_bp)

post_args = reqparse.RequestParser()
post_args.add_argument('poll_id', type=int, required=True, help='Poll ID is required')
post_args.add_argument('user_id', type=int, required=True, help='User ID is required')
post_args.add_argument('response', type=str, required=True, help='Response is required')

patch_args = reqparse.RequestParser()
patch_args.add_argument('poll_id', type=int)
patch_args.add_argument('user_id', type=int)
patch_args.add_argument('response', type=str)

class PollResponseDetails(Resource):
    @jwt_required()
    def get(self):
        poll_responses = PollResponse.query.all()
        result = [poll_response_schema.dump(response) for response in poll_responses]
        return make_response(jsonify(result), 200)

    @admin_required()
    def post(self):
        data = post_args.parse_args()

        new_poll_response = PollResponse(
            poll_id=data['poll_id'],
            user_id=data['user_id'],
            response=data['response']
        )
        db.session.add(new_poll_response)
        db.session.commit()

        result = poll_response_schema.dump(new_poll_response)
        return make_response(jsonify(result), 201)

api.add_resource(PollResponseDetails, '/poll_responses')

class PollResponseById(Resource):
    @jwt_required()
    def get(self, id):
        poll_response = PollResponse.query.get(id)
        if not poll_response:
            return make_response(jsonify({"error": "Poll response not found"}), 404)

        result = poll_response_schema.dump(poll_response)
        return make_response(jsonify(result), 200)

    @admin_required()
    def delete(self, id):
        poll_response = PollResponse.query.get(id)
        if not poll_response:
            return make_response(jsonify({"error": "Poll response not found"}), 404)

        db.session.delete(poll_response)
        db.session.commit()
        return make_response(jsonify({"message": "Poll response deleted successfully"}), 200)

    @admin_required()
    def patch(self, id):
        poll_response = PollResponse.query.get(id)
        if not poll_response:
            return make_response(jsonify({"error": "Poll response not found"}), 404)

        data = patch_args.parse_args()
        for key, value in data.items():
            if value is not None:
                setattr(poll_response, key, value)

        db.session.commit()

        result = poll_response_schema.dump(poll_response)
        return make_response(jsonify(result), 200)

api.add_resource(PollResponseById, '/poll_responses/<int:id>')
