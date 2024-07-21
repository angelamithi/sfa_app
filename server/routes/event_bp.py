from flask import Blueprint, make_response, jsonify
from flask_restful import Api, Resource, reqparse
from flask_jwt_extended import jwt_required
from models import Event, db,User,Report
from serializer import event_schema
from auth import admin_required
from sqlalchemy.orm import joinedload

event_bp = Blueprint('event_bp', __name__)
api = Api(event_bp)

post_args = reqparse.RequestParser()
post_args.add_argument('title', type=str, required=True, help='Title is required')
post_args.add_argument('description', type=str)
post_args.add_argument('event_date', type=str, required=True, help='Event date is required')
post_args.add_argument('start_time', type=str, required=True, help='Start time is required')
post_args.add_argument('end_time', type=str, required=True, help='End time is required')
post_args.add_argument('zoom_link', type=str)
post_args.add_argument('community_id', type=int, required=True, help='Community ID is required')
post_args.add_argument('coordinator_id', type=int, required=True, help='Coordinator ID is required')

patch_args = reqparse.RequestParser()
patch_args.add_argument('title', type=str)
patch_args.add_argument('description', type=str)
patch_args.add_argument('event_date', type=str)
patch_args.add_argument('start_time', type=str)
patch_args.add_argument('end_time', type=str)
patch_args.add_argument('zoom_link', type=str)
patch_args.add_argument('community_id', type=int)
patch_args.add_argument('coordinator_id', type=int)

class EventDetails(Resource):

    @jwt_required()
    def get(self):
        # Query all events
        events = Event.query.all()

        # Construct the response manually
        event_list = []
        for event in events:
            # Fetch coordinator details
            coordinator = User.query.get(event.coordinator_id)

            event_data = {
                "id": event.id,
                "title": event.title,
                "description": event.description,
                "event_date": event.event_date.isoformat() if event.event_date else None,
                "start_time": event.start_time.isoformat() if event.start_time else None,
                "end_time": event.end_time.isoformat() if event.end_time else None,
                "zoom_link": event.zoom_link,
                "coordinator_name": f"{coordinator.first_name} {coordinator.last_name}" if coordinator else None,
                "community_name": event.community.name if event.community else None,
            }
            event_list.append(event_data)

        return make_response(jsonify(event_list), 200)


    @admin_required()
    def post(self):
        data = post_args.parse_args()

        new_event = Event(
            title=data['title'],
            description=data.get('description'),
            event_date=data['event_date'],
            start_time=data['start_time'],
            end_time=data['end_time'],
            zoom_link=data.get('zoom_link'),
            community_id=data['community_id'],
            coordinator_id=data['coordinator_id']
        )
        db.session.add(new_event)
        db.session.commit()

        result = event_schema.dump(new_event)
        return make_response(jsonify(result), 201)

api.add_resource(EventDetails, '/events')


class EventById(Resource):
    @jwt_required()
    def get(self, id):
        event = Event.query.get(id)
        if not event:
            return make_response(jsonify({"error": "Event not found"}), 404)

        # Fetch coordinator details
        coordinator = User.query.get(event.coordinator_id)

        # Fetch report details
        report = Report.query.filter_by(event_id=event.id).first()

        # Fetch user details for the report
        report_user = User.query.get(report.user_id) if report else None

        # Construct the response manually
        event_data = {
            "id": event.id,
            "title": event.title,
            "description": event.description,
            "event_date": event.event_date.isoformat() if event.event_date else None,
            "start_time": event.start_time.isoformat() if event.start_time else None,
            "end_time": event.end_time.isoformat() if event.end_time else None,
            "zoom_link": event.zoom_link,
            "coordinator_name": f"{coordinator.first_name} {coordinator.last_name}" if coordinator else None,
            "community_name": event.community.name if event.community else None,
            "report": {
                "id": report.id if report else None,
                "num_attendees": report.num_attendees if report else None,
                "overview": report.overview if report else None,
                "user_name": f"{report_user.first_name} {report_user.last_name}" if report_user else None
            } if report else None
        }

        return make_response(jsonify(event_data), 200)



    @admin_required()
    def delete(self, id):
        event = Event.query.get(id)
        if not event:
            return make_response(jsonify({"error": "Event not found"}), 404)

        db.session.delete(event)
        db.session.commit()
        return make_response(jsonify({"message": "Event deleted successfully"}), 200)

    @admin_required()
    def patch(self, id):
        event = Event.query.get(id)
        if not event:
            return make_response(jsonify({"error": "Event not found"}), 404)

        data = patch_args.parse_args()
        for key, value in data.items():
            if value is not None:
                setattr(event, key, value)

        db.session.commit()

        result = event_schema.dump(event)
        return make_response(jsonify(result), 200)

api.add_resource(EventById, '/events/<int:id>')
