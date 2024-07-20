import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_restful import Api
from flask_cors import CORS
from flask_marshmallow import Marshmallow
from datetime import timedelta
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from flask_bcrypt import Bcrypt
from models import db, TokenBlocklist
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
from routes.auth_bp import auth_bp
from routes.reset_password_bp import change_password_bp
from flask_mail import Mail

# Initialize Flask components
bcrypt = Bcrypt()
mail = Mail()

def create_app():
    app = Flask(__name__)
    load_dotenv()

    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    app.config['JWT_BLACKLIST_ENABLED'] = True
    app.config['JWT_BLACKLIST_TOKEN_CHECKS'] = ['access', 'refresh']
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT'))
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS') == 'True'
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')

    db.init_app(app)
    migrate = Migrate(app, db)

    bcrypt.init_app(app)
    mail.init_app(app)

    jwt = JWTManager(app)
    CORS(app)

    @jwt.token_in_blocklist_loader
    def check_if_token_is_revoked(jwt_header, jwt_payload: dict):
        jti = jwt_payload["jti"]
        token = db.session.query(TokenBlocklist).filter_by(jti=jti).first()
        return token is not None

    # Register Blueprints
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
    app.register_blueprint(auth_bp)
    app.register_blueprint(change_password_bp)

    return app

app = create_app()
