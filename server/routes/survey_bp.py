from flask import Blueprint, make_response, jsonify
from flask_restful import Api, Resource, reqparse
from flask_jwt_extended import jwt_required,get_jwt,get_jwt_identity
from models import Survey, db,User,SurveyResponse
from serializer import survey_schema,survey_response_schema
from auth import admin_required
from datetime import datetime

survey_bp = Blueprint('survey_bp', __name__)
api = Api(survey_bp)

post_args = reqparse.RequestParser()
post_args.add_argument('title', type=str, required=True, help='Title is required')
post_args.add_argument('questions', type=dict, required=True, help='Questions are required')
post_args.add_argument('survey_start_date', type=str, required=True, help='Survey Start Date is required')
post_args.add_argument('survey_stop_date', type=str, required=True, help='Survey Stop Date is required')


patch_args = reqparse.RequestParser()
patch_args.add_argument('title', type=str)
patch_args.add_argument('questions', type=dict)
patch_args.add_argument('survey_start_date', type=str)
patch_args.add_argument('survey_stop_date', type=str)


class SurveyDetails(Resource):
    @jwt_required()
    def get(self):
        # Get the current user's ID from the JWT
        current_user_id = get_jwt_identity()

        # Query to get all surveys with owner information
        surveys = db.session.query(Survey, User.first_name, User.last_name).outerjoin(User, Survey.survey_owner_id == User.id).all()

        # Serialize survey details
        result = []
        for survey, owner_first_name, owner_last_name in surveys:
            survey_data = survey_schema.dump(survey)
            survey_data['owner_name'] = f"{owner_first_name} {owner_last_name}"
            survey_data['survey_owner_id'] = survey.survey_owner_id
            survey_data['current_user_id'] = current_user_id  # Add current user ID to the response
            # Format dates to only include the date part (YYYY-MM-DD)
            survey_data['survey_start_date'] = survey.survey_start_date.date().strftime('%Y-%m-%d')
            survey_data['survey_stop_date'] = survey.survey_stop_date.date().strftime('%Y-%m-%d')
            result.append(survey_data)

        return make_response(jsonify(result), 200)

# Assuming you have the rest of your Flask app and resources setup




    @jwt_required()
    def post(self):
        data = post_args.parse_args()
        jwt_payload=get_jwt()
        survey_owner_id = jwt_payload.get('user_id')  
        print(survey_owner_id)
        # Convert date strings to datetime.date objects
        if 'survey_start_date' in data and data['survey_start_date']:
            survey_start_date = datetime.strptime(data['survey_start_date'], '%Y-%m-%d').date()
        else:
            survey_start_date = None

        if 'survey_stop_date' in data and data['survey_stop_date']:
            survey_stop_date = datetime.strptime(data['survey_stop_date'], '%Y-%m-%d').date()
        else:
            survey_stop_date = None

        new_survey = Survey(
            title=data['title'],
            questions=data['questions'],
            survey_owner_id=survey_owner_id,
            survey_start_date= survey_start_date,
            survey_stop_date= survey_stop_date
        )
        db.session.add(new_survey)
        db.session.commit()

        result = survey_schema.dump(new_survey)
        return make_response(jsonify(result), 201)

api.add_resource(SurveyDetails, '/surveys')


class SurveyById(Resource):
    @jwt_required()
    def get(self, id):
        # Fetch the survey
        survey = Survey.query.get(id)
        if not survey:
            return make_response(jsonify({"error": "Survey not found"}), 404)

        # Fetch survey responses
        responses = SurveyResponse.query.filter_by(survey_id=id).all()

        # Serialize survey data
        survey_data = survey_schema.dump(survey)
        response_data = survey_response_schema.dump(responses, many=True)

        # Fetch user names for each response
        for response in response_data:
            user = User.query.get(response['user_id'])
            response['user_name'] = f"{user.first_name} {user.last_name}" if user else "Unknown"

        # Add the owner of the survey to survey data
        survey_owner = User.query.get(survey.survey_owner_id)
        survey_data['survey_owner_name'] = f"{survey_owner.first_name} {survey_owner.last_name}" if survey_owner else "Unknown"

        # Format dates to only include date part
        survey_data['survey_start_date'] = survey.survey_start_date.strftime('%Y-%m-%d') if survey.survey_start_date else None
        survey_data['survey_end_date'] = survey.survey_stop_date.strftime('%Y-%m-%d') if survey.survey_stop_date else None

        # Combine survey details and responses
        result = {
            "survey": survey_data,
            "responses": response_data
        }
        print(result)
        return make_response(jsonify(result), 200)


    @jwt_required()
    def delete(self, id):
        survey = Survey.query.get(id)
        if not survey:
            return make_response(jsonify({"error": "Survey not found"}), 404)
        SurveyResponse.query.filter_by(survey_id=id).delete()

        db.session.delete(survey)
        db.session.commit()
        return make_response(jsonify({"message": "Survey deleted successfully"}), 200)

    
    @jwt_required()
    def patch(self, id):
        survey = Survey.query.get(id)
        if not survey:
            return make_response(jsonify({"error": "Survey not found"}), 404)

        data = patch_args.parse_args()

        # Convert date strings to datetime.date objects if present
        for key, value in data.items():
            if value is not None:
                if key in ['survey_start_date', 'survey_stop_date']:
                    # Assume the date format is 'YYYY-MM-DD'
                    try:
                        value = datetime.strptime(value, '%Y-%m-%d').date()
                    except ValueError:
                        return make_response(jsonify({"error": f"Invalid date format for {key}"}), 400)
                
                setattr(survey, key, value)

        db.session.commit()
api.add_resource(SurveyById, '/surveys/<int:id>')
