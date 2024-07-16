from flask import Blueprint, make_response, jsonify
from flask_restful import Api, Resource, reqparse
from flask_jwt_extended import jwt_required
from models import UserCommunity, db
from serializer import user_community_schema
from auth import admin_required

user_community_bp = Blueprint('user_community_bp', __name__)
api = Api(user_community_bp)

post_args = reqparse.RequestParser()
post_args.add_argument('user_id', type=int, required=True, help='User ID is required')
post_args.add_argument('community_id', type=int, required=True, help='Community ID is required')

patch_args = reqparse.RequestParser()
patch_args.add_argument('user_id', type=int)
patch_args.add_argument('community_id', type=int)

class UserCommunityDetails(Resource):
    @jwt_required()
    def get(self):
        user_communities = UserCommunity.query.all()
        result = user_community_schema.dump(user_communities, many=True)
        return make_response(jsonify(result), 200)

    @admin_required()
    def post(self):
        data = post_args.parse_args()

        # Check if the user-community relationship already exists
        existing_relationship = UserCommunity.query.filter_by(user_id=data['user_id'], community_id=data['community_id']).first()
        if existing_relationship:
            return make_response(jsonify({"error": "User-Community relationship already exists"}), 409)

        new_relationship = UserCommunity(
            user_id=data['user_id'],
            community_id=data['community_id']
        )
        db.session.add(new_relationship)
        db.session.commit()

        result = user_community_schema.dump(new_relationship)
        return make_response(jsonify(result), 201)
api.add_resource(UserCommunityDetails, '/user_communities')

class UserCommunityByUserAndCommunity(Resource):
    @jwt_required()
    def get(self, user_id, community_id):
        user_community = UserCommunity.query.filter_by(user_id=user_id, community_id=community_id).first()
        if not user_community:
            return make_response(jsonify({"error": "User-Community relationship not found"}), 404)

        result = user_community_schema.dump(user_community)
        return make_response(jsonify(result), 200)

    @admin_required()
    def delete(self, user_id, community_id):
        user_community = UserCommunity.query.filter_by(user_id=user_id, community_id=community_id).first()
        if not user_community:
            return make_response(jsonify({"error": "User-Community relationship not found"}), 404)

        db.session.delete(user_community)
        db.session.commit()
        return make_response(jsonify({"message": "User-Community relationship deleted successfully"}), 200)

    @admin_required()
    def patch(self, user_id, community_id):
        user_community = UserCommunity.query.filter_by(user_id=user_id, community_id=community_id).first()
        if not user_community:
            return make_response(jsonify({"error": "User-Community relationship not found"}), 404)

        data = patch_args.parse_args()
        for key, value in data.items():
            if value is not None:
                setattr(user_community, key, value)

        db.session.commit()

        result = user_community_schema.dump(user_community)
        return make_response(jsonify(result), 200)


api.add_resource(UserCommunityByUserAndCommunity, '/user_communities/<int:user_id>/<int:community_id>')
