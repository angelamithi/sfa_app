from flask import Blueprint, make_response, jsonify
from flask_restful import Api, Resource, reqparse
from flask_jwt_extended import jwt_required,get_jwt
from models import Poll, db,Event,User,PollResponse
from serializer import poll_schema,poll_response_schema
from auth import admin_required

poll_bp = Blueprint('poll_bp', __name__)
api = Api(poll_bp)

post_args = reqparse.RequestParser()
post_args.add_argument('question', type=str, required=True, help='Question is required')
post_args.add_argument('options', type=dict, required=True, help='Options are required')
post_args.add_argument('event_id', type=int, required=True, help='Event ID is required')
post_args.add_argument('poll_start_date', type=str, required=True, help='Poll Start Date is required')
post_args.add_argument('poll_stop_date', type=str, required=True, help='Poll Stop Date is required')


patch_args = reqparse.RequestParser()
patch_args.add_argument('question', type=str)
patch_args.add_argument('options', type=dict)
patch_args.add_argument('event_id', type=int)
patch_args.add_argument('poll_start_date', type=str)
patch_args.add_argument('poll_stop_date', type=str)

from flask_jwt_extended import get_jwt_identity

class PollDetails(Resource):
    @jwt_required()
    def get(self):
        current_user_id = get_jwt_identity()  # Extract the current user's ID from the JWT token

        polls = Poll.query.all()
        poll_details = []

        for poll in polls:
            event = Event.query.get(poll.event_id)
            poll_owner = User.query.get(poll.poll_owner_id)

            # Extract only the date part from datetime
            poll_start_date = poll.poll_start_date.strftime('%Y-%m-%d') if poll.poll_start_date else None
            poll_stop_date = poll.poll_stop_date.strftime('%Y-%m-%d') if poll.poll_stop_date else None

            detail = {
                'id': poll.id,
                'question': poll.question,
                'event_name': event.title if event else None,
                'poll_owner_name': f"{poll_owner.first_name} {poll_owner.last_name}" if poll_owner else None,
                'poll_owner_id': poll.poll_owner_id,  # Include the poll owner ID
                'poll_start_date': poll_start_date,
                'poll_stop_date': poll_stop_date,
            }

            poll_details.append(detail)

        response = {
            'polls': poll_details,
            'current_user_id': current_user_id,  # Include the current user ID in the response
        }

        return make_response(jsonify(response), 200)




    @jwt_required()
    def post(self):
        data = post_args.parse_args()
        jwt_payload=get_jwt()
        poll_owner_id = jwt_payload.get('user_id')  
        print(poll_owner_id)
        # Convert date strings to datetime.date objects
        if 'poll_start_date' in data and data['poll_start_date']:
            poll_start_date = datetime.strptime(data['poll_start_date'], '%Y-%m-%d').date()
        else:
            poll_start_date = None

        if 'poll_stop_date' in data and data['poll_stop_date']:
            poll_stop_date = datetime.strptime(data['poll_stop_date'], '%Y-%m-%d').date()
        else:
            poll_stop_date = None

        new_poll = Poll(
            question=data['question'],
            options=data['options'],
            event_id=data['event_id'],
            poll_owner_id=poll_owner_id,
            poll_start_date= poll_start_date,
            poll_stop_date= poll_stop_date
                    
        )
        db.session.add(new_poll)
        db.session.commit()

        result = poll_schema.dump(new_poll)
        return make_response(jsonify(result), 201)

api.add_resource(PollDetails, '/polls')



from datetime import datetime

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

        # Format poll dates to only include date part
        poll_data['poll_start_date'] = poll.poll_start_date.strftime('%Y-%m-%d') if poll.poll_start_date else None
        poll_data['poll_stop_date'] = poll.poll_stop_date.strftime('%Y-%m-%d') if poll.poll_stop_date else None

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




    @jwt_required()
    def delete(self, id):
        # Fetch the poll
        poll = Poll.query.get(id)
        if not poll:
            return make_response(jsonify({"error": "Poll not found"}), 404)

        # Delete all associated PollResponse entries
        PollResponse.query.filter_by(poll_id=id).delete()

        # Now delete the Poll
        db.session.delete(poll)
        db.session.commit()

        return make_response(jsonify({"message": "Poll deleted successfully"}), 200)


    @jwt_required()
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
