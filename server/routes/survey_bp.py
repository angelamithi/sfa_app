from flask import Blueprint, make_response, jsonify
from flask_restful import Api, Resource, reqparse
from flask_jwt_extended import jwt_required
from models import Survey, db
from serializer import survey_schema
from auth import admin_required

survey_bp = Blueprint('survey_bp', __name__)
api = Api(survey_bp)

post_args = reqparse.RequestParser()
post_args.add_argument('title', type=str, required=True, help='Title is required')
post_args.add_argument('questions', type=dict, required=True, help='Questions are required')
post_args.add_argument('survey_owner_id', type=int, required=True, help='Survey Owner ID is required')

patch_args = reqparse.RequestParser()
patch_args.add_argument('title', type=str)
patch_args.add_argument('questions', type=dict)
patch_args.add_argument('survey_owner_id', type=int)

class SurveyDetails(Resource):
    @jwt_required()
    def get(self):
        surveys = Survey.query.all()
        result = survey_schema.dump(surveys, many=True)
        return make_response(jsonify(result), 200)

    @admin_required()
    def post(self):
        data = post_args.parse_args()

        new_survey = Survey(
            title=data['title'],
            questions=data['questions'],
            survey_owner_id=data['survey_owner_id']
        )
        db.session.add(new_survey)
        db.session.commit()

        result = survey_schema.dump(new_survey)
        return make_response(jsonify(result), 201)

api.add_resource(SurveyDetails, '/surveys')

class SurveyById(Resource):
    @jwt_required()
    def get(self, id):
        survey = Survey.query.get(id)
        if not survey:
            return make_response(jsonify({"error": "Survey not found"}), 404)

        result = survey_schema.dump(survey)
        return make_response(jsonify(result), 200)

    @admin_required()
    def delete(self, id):
        survey = Survey.query.get(id)
        if not survey:
            return make_response(jsonify({"error": "Survey not found"}), 404)

        db.session.delete(survey)
        db.session.commit()
        return make_response(jsonify({"message": "Survey deleted successfully"}), 200)

    @admin_required()
    def patch(self, id):
        survey = Survey.query.get(id)
        if not survey:
            return make_response(jsonify({"error": "Survey not found"}), 404)

        data = patch_args.parse_args()
        for key, value in data.items():
            if value is not None:
                setattr(survey, key, value)

        db.session.commit()

        result = survey_schema.dump(survey)
        return make_response(jsonify(result), 200)

api.add_resource(SurveyById, '/surveys/<int:id>')
