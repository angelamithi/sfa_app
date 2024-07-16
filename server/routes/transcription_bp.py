from flask import Blueprint, make_response, jsonify
from flask_restful import Api, Resource, reqparse
from flask_jwt_extended import jwt_required
from models import Transcription, db
from serializer import transcription_schema
from auth import admin_required

transcription_bp = Blueprint('transcription_bp', __name__)
api = Api(transcription_bp)

post_args = reqparse.RequestParser()
post_args.add_argument('event_id', type=int, required=True, help='Event ID is required')
post_args.add_argument('transcribed_content', type=str, required=True, help='Transcribed Content is required')
post_args.add_argument('summary', type=str, required=True, help='Summary is required')

patch_args = reqparse.RequestParser()
patch_args.add_argument('event_id', type=int)
patch_args.add_argument('transcribed_content', type=str)
patch_args.add_argument('summary', type=str)

class TranscriptionDetails(Resource):
    @jwt_required()
    def get(self):
        transcriptions = Transcription.query.all()
        result = [transcription_schema.dump(transcription) for transcription in transcriptions]
        return make_response(jsonify(result), 200)

    @admin_required()
    def post(self):
        data = post_args.parse_args()

        new_transcription = Transcription(
            event_id=data['event_id'],
            transcribed_content=data['transcribed_content'],
            summary=data['summary']
        )
        db.session.add(new_transcription)
        db.session.commit()

        result = transcription_schema.dump(new_transcription)
        return make_response(jsonify(result), 201)

api.add_resource(TranscriptionDetails, '/transcriptions')

class TranscriptionById(Resource):
    @jwt_required()
    def get(self, id):
        transcription = Transcription.query.get(id)
        if not transcription:
            return make_response(jsonify({"error": "Transcription not found"}), 404)

        result = transcription_schema.dump(transcription)
        return make_response(jsonify(result), 200)

    @admin_required()
    def delete(self, id):
        transcription = Transcription.query.get(id)
        if not transcription:
            return make_response(jsonify({"error": "Transcription not found"}), 404)

        db.session.delete(transcription)
        db.session.commit()
        return make_response(jsonify({"message": "Transcription deleted successfully"}), 200)

    @admin_required()
    def patch(self, id):
        transcription = Transcription.query.get(id)
        if not transcription:
            return make_response(jsonify({"error": "Transcription not found"}), 404)

        data = patch_args.parse_args()
        for key, value in data.items():
            if value is not None:
                setattr(transcription, key, value)

        db.session.commit()

        result = transcription_schema.dump(transcription)
        return make_response(jsonify(result), 200)

api.add_resource(TranscriptionById, '/transcriptions/<int:id>')
