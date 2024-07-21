from flask import Blueprint, make_response, jsonify
from flask_restful import Api, Resource, reqparse
from flask_jwt_extended import jwt_required
from models import Poll, db,Event,User,PollResponse
from serializer import poll_schema,poll_response_schema
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
        poll_details = []

        for poll in polls:
            event = Event.query.get(poll.event_id)
            poll_owner = User.query.get(poll.poll_owner_id)

            detail = {
                'id': poll.id,
                'question': poll.question,
                'event_name': event.title if event else None,
                'poll_owner_name': f"{poll_owner.first_name} {poll_owner.last_name}" if poll_owner else None
            }

            poll_details.append(detail)

        return make_response(jsonify(poll_details), 200)


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
        # Fetch the poll
        poll = Poll.query.get(id)
        if not poll:
            return make_response(jsonify({"error": "Poll not found"}), 404)

        # Fetch poll responses
        responses = PollResponse.query.filter_by(poll_id=id).all()

        # Fetch event and poll owner details
        event = Event.query.get(poll.event_id)
        poll_owner = User.query.get(poll.poll_owner_id)

        # Serialize poll data
        poll_data = poll_schema.dump(poll)
        response_data = poll_response_schema.dump(responses, many=True)

        # Add event name and poll owner name to poll data
        poll_data['event_name'] = event.title if event else None
        poll_data['poll_owner_name'] = f"{poll_owner.first_name} {poll_owner.last_name}" if poll_owner else None

        # Fetch user names for each response
        for response in response_data:
            user = User.query.get(response['user_id'])
            response['user_name'] = f"{user.first_name} {user.last_name}" if user else "Unknown"

        # Log the fetched data for debugging
        print("Poll Data:", poll_data)
        print("Response Data:", response_data)

        # Combine poll details and responses
        result = {
            "poll": poll_data,
            "responses": response_data
        }
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
