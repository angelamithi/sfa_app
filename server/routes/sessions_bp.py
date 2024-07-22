from flask import Blueprint, make_response, jsonify
from flask_restful import Api, Resource, reqparse
from flask_jwt_extended import jwt_required
from models import Session, db
from serializer import session_schema
from auth import admin_required

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
class SessionsDetails(Resource):
    @jwt_required()
    def get(self):
        sessions = Session.query.all()
        result = session_schema.dump(sessions)
        return make_response(jsonify(result), 200)

    @admin_required()
    def post(self):
        data = post_args.parse_args()
        new_session = Session(
            name=data['name'],
            start_date=data['start_date'],
            end_date=data['end_date'],
            year_id=data.get('year_id')
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
                setattr(session, key, value)
        db.session.commit()
        result = session_schema.dump(session)
        return make_response(jsonify(result), 200)

api.add_resource(SessionById, '/sessions/<int:id>')
