from flask import Blueprint, make_response, jsonify,request
from flask_restful import Api, Resource, reqparse
from flask_jwt_extended import jwt_required
from models import Session, db,Year
from serializer import session_schema
from auth import admin_required
from datetime import datetime

sessions_bp = Blueprint('sessions_bp', __name__)
api = Api(sessions_bp)

# Define request parsers for POST and PATCH methods
post_args = reqparse.RequestParser()
post_args.add_argument('name', type=str, required=True, help='Name is required')
post_args.add_argument('start_date', type=str, required=True, help='Start Date is required')
post_args.add_argument('end_date', type=str, required=True, help='End Date is required')
post_args.add_argument('year_id', type=int, required=False)

patch_args = reqparse.RequestParser()
patch_args.add_argument('name', type=str)
patch_args.add_argument('start_date', type=str)
patch_args.add_argument('end_date', type=str)
patch_args.add_argument('year_id', type=int)

# Define Resource for all Sessions
# Define Resource for all Sessions
class SessionsDetails(Resource):
    @jwt_required()
    def get(self):
        try:
            # Debugging: Print the JWT token
            token = request.headers.get('Authorization')
            print(f"Received token: {token}")
            
            current_year = datetime.now().year
            
            # Query sessions for the current year with joined Year
            sessions = db.session.query(Session, Year).join(Year).filter(Year.year_name == current_year).all()
            
            # Format the result to include year_name and session_name
            result = [{
                "session_id": session[0].id,  # Access the Session data using index 0
                "year_name": session[1].year_name,  # Access the Year data using index 1
                "session_name": session[0].name,  # Access the Session data using index 0
                "start_date": session[0].start_date.strftime('%d %b %Y'),
                "end_date": session[0].end_date.strftime('%d %b %Y'),
            } for session in sessions]
            
            print(result)
            
            return make_response(jsonify(result), 200)
        except Exception as e:
            print(f"Error: {e}")
            return make_response(jsonify({"error": "An error occurred"}), 500)



    @admin_required()
    def post(self):
        data = post_args.parse_args()

        # Determine the current year
        current_year_name = datetime.now().year

        # Fetch the year_id based on the current year
        year = Year.query.filter_by(year_name=current_year_name).first()
        if not year:
            return make_response(jsonify({"error": "Current year not found in the database"}), 404)

        try:
            # Convert string dates to datetime objects
            start_date = datetime.strptime(data['start_date'], '%Y-%m-%d')
            end_date = datetime.strptime(data['end_date'], '%Y-%m-%d')
        except ValueError as e:
            return make_response(jsonify({"error": f"Date format error: {e}"}), 400)

        new_session = Session(
            name=data['name'],
            start_date=start_date,
            end_date=end_date,
            year_id=year.id  # Use the current year's ID
        )
        db.session.add(new_session)
        db.session.commit()
        result = session_schema.dump(new_session)
        return make_response(jsonify(result), 201)

api.add_resource(SessionsDetails, '/sessions')
# Define Resource for a single Session by ID
class SessionById(Resource):
    @jwt_required()
    def get(self, id):
        session = Session.query.get(id)
        if not session:
            return make_response(jsonify({"error": "Session not found"}), 404)
        result = session_schema.dump(session)
        return make_response(jsonify(result), 200)

    @admin_required()
    def delete(self, id):
        session = Session.query.get(id)
        if not session:
            return make_response(jsonify({"error": "Session not found"}), 404)
        db.session.delete(session)
        db.session.commit()
        return make_response(jsonify({"message": "Session deleted successfully"}), 200)

    @admin_required()
    def patch(self, id):
        session = Session.query.get(id)
        if not session:
            return make_response(jsonify({"error": "Session not found"}), 404)

        data = patch_args.parse_args()

        for key, value in data.items():
            if value is not None:
                if key in ['start_date', 'end_date'] and isinstance(value, str):
                    try:
                        # Convert string date to datetime.date object
                        value = datetime.strptime(value, '%Y-%m-%d').date()
                    except ValueError:
                        return make_response(jsonify({"error": f"Invalid date format for {key}"}), 400)
                setattr(session, key, value)
        
        db.session.commit()
        result = session_schema.dump(session)
        return make_response(jsonify(result), 200)
api.add_resource(SessionById, '/sessions/<int:id>')


class RetrieveSessionsNames(Resource):
    @jwt_required()
    def get(self):
        current_year = datetime.now().year
        
        # Query sessions for the current year with joined Year
        sessions = db.session.query(Session).join(Year).filter(Year.year_name == current_year).all()
        
        # Collect all session names and ids
        result = [{'id': session.id, 'name': session.name} for session in sessions]
        
        return make_response(jsonify(result), 200)



api.add_resource(RetrieveSessionsNames, '/sessions_names')
