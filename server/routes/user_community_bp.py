from flask import Blueprint, make_response, jsonify, request
from flask_restful import Api, Resource, reqparse
from flask_jwt_extended import jwt_required
from models import UserCommunity, Community, User, db
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
        user_communities = UserCommunity.query.join(User, UserCommunity.user_id == User.id) \
                                             .join(Community, UserCommunity.community_id == Community.id) \
                                             .add_columns(User.first_name, User.last_name, Community.name, UserCommunity.user_id, UserCommunity.community_id) \
                                             .all()
        if not user_communities:
            return make_response(jsonify({"error": "No User-Community relationships found"}), 404)
        
        result = [
            {
                "user_name": f"{uc.first_name} {uc.last_name}",
                "community_name": uc.name,
                "user_id": uc.user_id,
                "community_id": uc.community_id
            }
            for uc in user_communities
        ]
        return make_response(jsonify(result), 200)

    @admin_required()
    def post(self):
        data = request.get_json()
        user_ids = data.get('user_ids')
        community_id = data.get('community_id')

        if not user_ids or not community_id:
            return {'error': 'User IDs and Community ID are required.'}, 400

        community = Community.query.get(community_id)
        if not community:
            return {'error': 'Community not found.'}, 404

        for user_id in user_ids:
            user = User.query.get(user_id)
            if not user:
                return {'error': f'User with ID {user_id} not found.'}, 404

            user_community = UserCommunity(user_id=user_id, community_id=community_id)
            db.session.add(user_community)

        db.session.commit()
        return {'message': 'Users successfully assigned to community.'}, 201

api.add_resource(UserCommunityDetails, '/user_communities')


class UserCommunityByUserAndCommunity(Resource):
    @jwt_required()
    def get(self, user_id, community_id):
        user_community = UserCommunity.query.filter_by(user_id=user_id, community_id=community_id) \
                                             .join(User, UserCommunity.user_id == User.id) \
                                             .join(Community, UserCommunity.community_id == Community.id) \
                                             .add_columns(User.first_name, User.last_name, Community.name) \
                                             .first()
        if not user_community:
            return make_response(jsonify({"error": "User-Community relationship not found"}), 404)

        result = {
            "user_name": f"{user_community.first_name} {user_community.last_name}",
            "community_name": user_community.name
        }
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
