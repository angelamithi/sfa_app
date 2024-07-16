from flask import Blueprint, make_response, jsonify
from flask_restful import Api, Resource, reqparse
from flask_jwt_extended import jwt_required
from models import VolunteerHour, db
from serializer import volunteer_hour_schema
from auth import admin_required

volunteer_hour_bp = Blueprint('volunteer_hour_bp', __name__)
api = Api(volunteer_hour_bp)

post_args = reqparse.RequestParser()
post_args.add_argument('user_id', type=int, required=True, help='User ID is required')
post_args.add_argument('date', type=str, required=True, help='Date is required (YYYY-MM-DD)')
post_args.add_argument('hours', type=float, required=True, help='Hours volunteered is required')
post_args.add_argument('event_id', type=int)
post_args.add_argument('approved_by', type=int)
post_args.add_argument('approved_at', type=str)

patch_args = reqparse.RequestParser()
patch_args.add_argument('user_id', type=int)
patch_args.add_argument('date', type=str)
patch_args.add_argument('hours', type=float)
patch_args.add_argument('event_id', type=int)
patch_args.add_argument('approved_by', type=int)
patch_args.add_argument('approved_at', type=str)

class VolunteerHourDetails(Resource):
    @jwt_required()
    def get(self):
        volunteer_hours = VolunteerHour.query.all()
        result = [volunteer_hour_schema.dump(volunteer_hour) for volunteer_hour in volunteer_hours]
        return make_response(jsonify(result), 200)

    @admin_required()
    def post(self):
        data = post_args.parse_args()

        new_volunteer_hour = VolunteerHour(
            user_id=data['user_id'],
            date=data['date'],
            hours=data['hours'],
            event_id=data['event_id'],
            approved_by=data['approved_by'],
            approved_at=data['approved_at']
        )
        db.session.add(new_volunteer_hour)
        db.session.commit()

        result = volunteer_hour_schema.dump(new_volunteer_hour)
        return make_response(jsonify(result), 201)

api.add_resource(VolunteerHourDetails, '/volunteer_hours')

class VolunteerHourById(Resource):
    @jwt_required()
    def get(self, id):
        volunteer_hour = VolunteerHour.query.get(id)
        if not volunteer_hour:
            return make_response(jsonify({"error": "Volunteer Hour not found"}), 404)

        result = volunteer_hour_schema.dump(volunteer_hour)
        return make_response(jsonify(result), 200)

    @admin_required()
    def delete(self, id):
        volunteer_hour = VolunteerHour.query.get(id)
        if not volunteer_hour:
            return make_response(jsonify({"error": "Volunteer Hour not found"}), 404)

        db.session.delete(volunteer_hour)
        db.session.commit()
        return make_response(jsonify({"message": "Volunteer Hour deleted successfully"}), 200)

    @admin_required()
    def patch(self, id):
        volunteer_hour = VolunteerHour.query.get(id)
        if not volunteer_hour:
            return make_response(jsonify({"error": "Volunteer Hour not found"}), 404)

        data = patch_args.parse_args()
        for key, value in data.items():
            if value is not None:
                setattr(volunteer_hour, key, value)

        db.session.commit()

        result = volunteer_hour_schema.dump(volunteer_hour)
        return make_response(jsonify(result), 200)

api.add_resource(VolunteerHourById, '/volunteer_hours/<int:id>')
