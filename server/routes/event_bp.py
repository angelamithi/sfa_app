from flask import Blueprint, make_response, jsonify
from flask_restful import Api, Resource, reqparse
from flask_jwt_extended import jwt_required
from models import Event, db, User, Report
from serializer import event_schema
from auth import admin_required
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import os
import datetime

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

# Google Calendar API setup
SCOPES = ['https://www.googleapis.com/auth/calendar']
creds = None

if os.path.exists('token.json'):
    creds = Credentials.from_authorized_user_file('token.json', SCOPES)
if not creds or not creds.valid:
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    else:
        flow = InstalledAppFlow.from_client_secrets_file(
            'credentials.json', SCOPES)
        creds = flow.run_local_server(port=0)
    with open('token.json', 'w') as token:
        token.write(creds.to_json())

service = build('calendar', 'v3', credentials=creds)

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

        print("Events fetched:", event_list)
        return make_response(jsonify(event_list), 200)


    @admin_required()
    def post(self):
        data = post_args.parse_args()

        # Convert string date and time to datetime objects
        event_date = datetime.datetime.strptime(data['event_date'], '%Y-%m-%d').date()
        start_time = datetime.datetime.strptime(data['start_time'], '%H:%M:%S').time()
        end_time = datetime.datetime.strptime(data['end_time'], '%H:%M:%S').time()

        # Create event in the database
        new_event = Event(
            title=data['title'],
            description=data.get('description'),
            event_date=datetime.datetime.combine(event_date, datetime.time.min),
            start_time=datetime.datetime.combine(datetime.date.today(), start_time),
            end_time=datetime.datetime.combine(datetime.date.today(), end_time),
            zoom_link=data.get('zoom_link'),
            community_id=data['community_id'],
            coordinator_id=data['coordinator_id']
        )
        db.session.add(new_event)
        db.session.commit()

        # Fetch all users from the database
        users = User.query.all()
        user_emails = [user.email for user in users]

        # Create event in Google Calendar
        start_datetime = datetime.datetime.combine(event_date, start_time).isoformat()
        end_datetime = datetime.datetime.combine(event_date, end_time).isoformat()

        event = {
            'summary': data['title'],
            'description': data.get('description'),
            'start': {
                'dateTime': start_datetime,
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': end_datetime,
                'timeZone': 'UTC',
            },
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'email', 'minutes': 24 * 60},
                    {'method': 'popup', 'minutes': 10},
                ],
            },
            'conferenceData': {
                'createRequest': {
                    'requestId': 'some-random-string',
                    'conferenceSolutionKey': {'type': 'hangoutsMeet'}
                }
            },
            'attendees': [{'email': email} for email in user_emails],  # Add attendees
            'colorId': '6' 
        }

        created_event = service.events().insert(calendarId='primary', body=event, conferenceDataVersion=1).execute()
        
        # Store the Google Calendar event ID
        new_event.calendar_event_id = created_event['id']
        db.session.commit()

        print('Event created:', created_event.get('htmlLink'))
        print('Event created:', created_event)
        if 'error' in created_event:
            print('API Error:', created_event['error'])

        result = event_schema.dump(new_event)
        return make_response(jsonify(result), 201)



api.add_resource(EventDetails, '/events')


class EventById(Resource):
    @jwt_required()
    def get(self, id):
        event = Event.query.get(id)
        if not event:
            print("Event not found")
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
                "title": report.title if report else None,
                "description": report.description if report else None,
                "user_name": f"{report_user.first_name} {report_user.last_name}" if report_user else None,
            } if report else None,
        }

        print("Event fetched:", event_data)
        return make_response(jsonify(event_data), 200)

    @admin_required()
    def patch(self, id):
        data = patch_args.parse_args()
        event = Event.query.get(id)
        if not event:
            print("Event not found")
            return make_response(jsonify({"error": "Event not found"}), 404)

        # Update event fields
        if data['title']:
            event.title = data['title']
        if data['description']:
            event.description = data['description']
        if data['event_date']:
            event.event_date = datetime.datetime.strptime(data['event_date'], '%Y-%m-%d').date()
        if data['start_time']:
            event.start_time = datetime.datetime.strptime(data['start_time'], '%H:%M:%S').time()
        if data['end_time']:
            event.end_time = datetime.datetime.strptime(data['end_time'], '%H:%M:%S').time()
        if data['zoom_link']:
            event.zoom_link = data['zoom_link']
        if data['community_id']:
            event.community_id = data['community_id']
        if data['coordinator_id']:
            event.coordinator_id = data['coordinator_id']

        db.session.commit()

        # Update Google Calendar event if the calendar_event_id exists
        if event.calendar_event_id:
            start_datetime = datetime.datetime.combine(event.event_date, event.start_time).isoformat()
            end_datetime = datetime.datetime.combine(event.event_date, event.end_time).isoformat()

            calendar_event = {
                'summary': event.title,
                'description': event.description,
                'start': {
                    'dateTime': start_datetime,
                    'timeZone': 'UTC',
                },
                'end': {
                    'dateTime': end_datetime,
                    'timeZone': 'UTC',
                },
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {'method': 'email', 'minutes': 24 * 60},
                        {'method': 'popup', 'minutes': 10},
                    ],
                },
                'conferenceData': {
                    'createRequest': {
                        'requestId': 'some-random-string',
                        'conferenceSolutionKey': {'type': 'hangoutsMeet'}
                    }
                },
                'attendees': [{'email': email} for email in User.query.with_entities(User.email).all()],  # Add attendees
                'colorId': '6'
            }

            try:
                updated_event = service.events().update(
                    calendarId='primary',
                    eventId=event.calendar_event_id,
                    body=calendar_event,
                    conferenceDataVersion=1
                ).execute()
                print('Event updated in Google Calendar:', updated_event.get('htmlLink'))
            except Exception as e:
                print('Failed to update event in Google Calendar:', e)

        print("Event updated:", event_schema.dump(event))
        return make_response(jsonify(event_schema.dump(event)), 200)

    @admin_required()
    def delete(self, id):
        event = Event.query.get(id)
        if not event:
            print("Event not found")
            return make_response(jsonify({"error": "Event not found"}), 404)

        # Delete the event from Google Calendar
        if event.calendar_event_id:
            try:
                service.events().delete(calendarId='primary', eventId=event.calendar_event_id).execute()
                print("Google Calendar event deleted")
            except Exception as e:
                print("Failed to delete event from Google Calendar:", e)

        # Delete the event from the database
        db.session.delete(event)
        db.session.commit()

        print("Event deleted")
        return make_response(jsonify({"message": "Event deleted"}), 200)


api.add_resource(EventById, '/events/<int:id>')
