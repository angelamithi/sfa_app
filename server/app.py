
import os
from flask import Flask,jsonify,make_response,request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_restful import Api, Resource,reqparse
from sqlalchemy.exc import SQLAlchemyError
from flask_cors import CORS,cross_origin
from flask_marshmallow import Marshmallow
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from datetime import datetime,timedelta
from models import db
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from flask_bcrypt import Bcrypt
from models import TokenBlocklist
from routes.user_bp import user_bp
from routes.community_bp import community_bp
from routes.user_community_bp import user_community_bp
from routes.event_bp import event_bp
from routes.poll_bp import poll_bp
from routes.poll_response_bp import poll_response_bp
from routes.survey_bp import survey_bp
from routes.survey_response_bp import survey_response_bp
from routes.volunteer_hour_bp import volunteer_hour_bp
from routes.reports_bp import report_bp
from routes.transcription_bp import transcription_bp

bcrypt = Bcrypt()


def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    migrate = Migrate(app, db)

    db.init_app(app)


    bcrypt.init_app(app)
    load_dotenv()
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    app.config['JWT_BLACKLIST_ENABLED'] = True
    app.config['JWT_BLACKLIST_TOKEN_CHECKS'] = ['access', 'refresh']
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)

    jwt = JWTManager(app)
    CORS(app)

    @jwt.token_in_blocklist_loader
    def check_if_token_is_revoked(jwt_header, jwt_payload: dict):
        jti = jwt_payload["jti"]
        token = db.session.query(TokenBlocklist).filter_by(jti=jti).first()
        return token is not None
    
    app.register_blueprint(user_bp)
    app.register_blueprint(community_bp)
    app.register_blueprint(user_community_bp)
    app.register_blueprint(event_bp)
    app.register_blueprint(survey_bp)
    app.register_blueprint(survey_response_bp)
    app.register_blueprint(poll_bp)
    app.register_blueprint(poll_response_bp)
    app.register_blueprint(report_bp)
    app.register_blueprint(transcription_bp)
    app.register_blueprint(volunteer_hour_bp)
    return app



app = create_app()


