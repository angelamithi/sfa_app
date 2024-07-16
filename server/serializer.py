from flask import Blueprint, make_response, jsonify
from flask_marshmallow import Marshmallow
from flask_restful import Api, Resource, abort, reqparse
from flask_bcrypt import Bcrypt
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, auto_field, fields
from marshmallow.fields import Nested
from models import (TokenBlocklist,db,User,Community,UserCommunity,Event,Survey,SurveyResponse,Poll,PollResponse,VolunteerHour,Transcription,Report)

serializer_bp = Blueprint('serializer_bp', __name__)
ma = Marshmallow(serializer_bp)
bcrypt = Bcrypt()
api = Api(serializer_bp)


class UserSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = User
        include_fk = True


user_schema = UserSchema()

class CommunitySchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Community
        include_fk = True

community_schema = CommunitySchema()

class UserCommunitySchema(SQLAlchemyAutoSchema):
    class Meta:
        model = UserCommunity
        include_fk = True

user_community_schema = UserCommunitySchema()


class EventSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Event
        include_fk = True

event_schema = EventSchema()


class SurveySchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Survey
        include_fk = True

survey_schema = SurveySchema()


class SurveyResponseSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = SurveyResponse
        include_fk = True

survey_response_schema = SurveyResponseSchema()


class PollSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Poll
        include_fk = True

poll_schema = PollSchema()


class PollResponseSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = PollResponse
        include_fk = True

poll_response_schema = PollResponseSchema()


class VolunteerHourSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = VolunteerHour
        include_fk = True

volunteer_hour_schema = VolunteerHourSchema()


class TranscriptionSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Transcription
        include_fk = True

transcription_schema = TranscriptionSchema()


class ReportSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Report
        include_fk = True

report_schema = ReportSchema()




