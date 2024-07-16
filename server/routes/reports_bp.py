from flask import Blueprint, make_response, jsonify
from flask_restful import Api, Resource, reqparse
from flask_jwt_extended import jwt_required
from models import Report, db
from serializer import report_schema
from auth import admin_required

report_bp = Blueprint('report_bp', __name__)
api = Api(report_bp)

post_args = reqparse.RequestParser()
post_args.add_argument('event_id', type=int, required=True, help='Event ID is required')
post_args.add_argument('num_attendees', type=int, required=True, help='Number of Attendees is required')
post_args.add_argument('overview', type=str, required=True, help='Overview is required')
post_args.add_argument('user_id', type=int, required=True, help='User ID is required')

patch_args = reqparse.RequestParser()
patch_args.add_argument('event_id', type=int)
patch_args.add_argument('num_attendees', type=int)
patch_args.add_argument('overview', type=str)
patch_args.add_argument('user_id', type=int)

class ReportDetails(Resource):
    @jwt_required()
    def get(self):
        reports = Report.query.all()
        result = [report_schema.dump(report) for report in reports]
        return make_response(jsonify(result), 200)

    @admin_required()
    def post(self):
        data = post_args.parse_args()

        new_report = Report(
            event_id=data['event_id'],
            num_attendees=data['num_attendees'],
            overview=data['overview'],
            user_id=data['user_id']
        )
        db.session.add(new_report)
        db.session.commit()

        result = report_schema.dump(new_report)
        return make_response(jsonify(result), 201)

api.add_resource(ReportDetails, '/reports')

class ReportById(Resource):
    @jwt_required()
    def get(self, id):
        report = Report.query.get(id)
        if not report:
            return make_response(jsonify({"error": "Report not found"}), 404)

        result = report_schema.dump(report)
        return make_response(jsonify(result), 200)

    @admin_required()
    def delete(self, id):
        report = Report.query.get(id)
        if not report:
            return make_response(jsonify({"error": "Report not found"}), 404)

        db.session.delete(report)
        db.session.commit()
        return make_response(jsonify({"message": "Report deleted successfully"}), 200)

    @admin_required()
    def patch(self, id):
        report = Report.query.get(id)
        if not report:
            return make_response(jsonify({"error": "Report not found"}), 404)

        data = patch_args.parse_args()
        for key, value in data.items():
            if value is not None:
                setattr(report, key, value)

        db.session.commit()

        result = report_schema.dump(report)
        return make_response(jsonify(result), 200)

api.add_resource(ReportById, '/reports/<int:id>')
