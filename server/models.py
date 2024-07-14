from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData, Enum
from sqlalchemy.orm import validates
from sqlalchemy.ext.hybrid import hybrid_property
import uuid

metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
})
db = SQLAlchemy(metadata=metadata)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    phone_number = db.Column(db.String)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(50), nullable=False)
    volunteer_hours = db.relationship('VolunteerHour', backref='user', lazy=True)
    events = db.relationship('Event', backref='user', lazy=True)
    poll_responses = db.relationship('PollResponse', backref='user', lazy=True)
    owned_polls = db.relationship('Poll', backref='owner', lazy=True)
    owned_surveys = db.relationship('Survey', backref='owner', lazy=True)
    survey_responses = db.relationship('SurveyResponse', backref='user', lazy=True)
    owned_reports = db.relationship('Report', backref='owner', lazy=True)
    communities = db.relationship('UserCommunity', back_populates='user')

class Community(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.String(255))
    events = db.relationship('Event', backref='community', lazy=True)
    coordinator_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    coordinator = db.relationship('User', backref='coordinated_communities', lazy=True)
    members = db.relationship('UserCommunity', back_populates='community')

class UserCommunity(db.Model):
    __tablename__ = 'user_community'
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    community_id = db.Column(db.Integer, db.ForeignKey('community.id'), primary_key=True)
    user = db.relationship('User', back_populates='communities')
    community = db.relationship('Community', back_populates='members')


class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    event_date=db.Column(db.DateTime,nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    zoom_link = db.Column(db.String(255))
    community_id = db.Column(db.Integer, db.ForeignKey('community.id'), nullable=False)
    coordinator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    polls = db.relationship('Poll', backref='event', lazy=True)
    transcription = db.relationship('Transcription', uselist=False, backref='event')
    report = db.relationship('Report', uselist=False, backref='event')
    volunteer_hours = db.relationship('VolunteerHour', backref='event', lazy=True)

class Poll(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.String(255), nullable=False)
    options = db.Column(db.JSON, nullable=False)
    responses = db.relationship('PollResponse', backref='poll', lazy=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    poll_owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class PollResponse(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    poll_id = db.Column(db.Integer, db.ForeignKey('poll.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    response = db.Column(db.String(255), nullable=False)

class Transcription(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    transcribed_content = db.Column(db.Text, nullable=False)
    summary=db.Column(db.Text, nullable=False)

class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    num_attendees = db.Column(db.Integer, nullable=False)
    overview = db.Column(db.Text, nullable=False)
    user_id=db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class VolunteerHour(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    hours = db.Column(db.Float, nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=True)

class Survey(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    questions = db.Column(db.JSON, nullable=False)
    responses = db.relationship('SurveyResponse', backref='survey', lazy=True)
    survey_owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class SurveyResponse(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    survey_id = db.Column(db.Integer, db.ForeignKey('survey.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    responses = db.Column(db.JSON, nullable=False)


class TokenBlocklist(db.Model):
    __tablename__ = 'tokenblocklist'
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, index=True)
    created_at = db.Column(db.DateTime, nullable=False)