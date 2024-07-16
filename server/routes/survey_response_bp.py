from flask import Blueprint, make_response, jsonify
from flask_restful import Api, Resource, reqparse
from flask_jwt_extended import jwt_required
from models import SurveyResponse, db
from serializer import survey_response_schema
from auth import admin_required

survey_response_bp = Blueprint('survey_response_bp', __name__)
api = Api(survey_response_bp)

post_args = reqparse.RequestParser()
post_args.add_argument('survey_id', type=int, required=True, help='Survey ID is required')
post_args.add_argument('user_id', type=int, required=True, help='User ID is required')
post_args.add_argument('responses', type=dict, required=True, help='Responses JSON object is required')

patch_args = reqparse.RequestParser()
patch_args.add_argument('survey_id', type=int)
patch_args.add_argument('user_id', type=int)
patch_args.add_argument('responses', type=dict)

class SurveyResponseDetails(Resource):
    @jwt_required()
    def get(self):
        survey_responses = SurveyResponse.query.all()
        result = [survey_response_schema.dump(survey_response) for survey_response in survey_responses]
        return make_response(jsonify(result), 200)

    @admin_required()
    def post(self):
        data = post_args.parse_args()

        new_survey_response = SurveyResponse(
            survey_id=data['survey_id'],
            user_id=data['user_id'],
            responses=data['responses']
        )
        db.session.add(new_survey_response)
        db.session.commit()

        result = survey_response_schema.dump(new_survey_response)
        return make_response(jsonify(result), 201)

api.add_resource(SurveyResponseDetails, '/survey_responses')

class SurveyResponseById(Resource):
    @jwt_required()
    def get(self, id):
        survey_response = SurveyResponse.query.get(id)
        if not survey_response:
            return make_response(jsonify({"error": "Survey Response not found"}), 404)

        result = survey_response_schema.dump(survey_response)
        return make_response(jsonify(result), 200)

    @admin_required()
    def delete(self, id):
        survey_response = SurveyResponse.query.get(id)
        if not survey_response:
            return make_response(jsonify({"error": "Survey Response not found"}), 404)

        db.session.delete(survey_response)
        db.session.commit()
        return make_response(jsonify({"message": "Survey Response deleted successfully"}), 200)

    @admin_required()
    def patch(self, id):
        survey_response = SurveyResponse.query.get(id)
        if not survey_response:
            return make_response(jsonify({"error": "Survey Response not found"}), 404)

        data = patch_args.parse_args()
        for key, value in data.items():
            if value is not None:
                setattr(survey_response, key, value)

        db.session.commit()

        result = survey_response_schema.dump(survey_response)
        return make_response(jsonify(result), 200)

api.add_resource(SurveyResponseById, '/survey_responses/<int:id>')
