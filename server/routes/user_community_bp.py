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
        # Join UserCommunity with User and Community tables
        user_communities = db.session.query(
            UserCommunity.user_id,
            UserCommunity.community_id,
            User.first_name,
            User.last_name,
            Community.name.label('community_name')
        ).join(User, UserCommunity.user_id == User.id) \
         .join(Community, UserCommunity.community_id == Community.id) \
         .all()

        # Check if there are any user-community relationships
        if not user_communities:
            return make_response(jsonify({"error": "No User-Community relationships found"}), 404)
        
        # Format the result
        result = [
            {
                "user_name": f"{uc.first_name} {uc.last_name}",
                "community_name": uc.community_name,
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

        # Check if the community exists
        community = Community.query.get(community_id)
        if not community:
            return {'error': f'Community with ID {community_id} not found.'}, 404

        already_exists = []
        not_found_users = []
        added_users = []

        for user_id in user_ids:
            user = User.query.get(user_id)
            if not user:
                not_found_users.append(user_id)
                continue

            # Check if the relationship already exists
            existing_user_community = UserCommunity.query.filter_by(user_id=user_id, community_id=community_id).first()
            if existing_user_community:
                already_exists.append({
                    'user_id': user_id,
                    'user_name': user.username,
                    'community_id': community_id,
                    'community_name': community.name
                })
                continue

            # Create a new UserCommunity entry
            new_user_community = UserCommunity(user_id=user_id, community_id=community_id)
            db.session.add(new_user_community)
            added_users.append(user_id)

        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500

        response = {}
        if already_exists:
            response['already_exists'] = already_exists
        if not_found_users:
            response['not_found_users'] = not_found_users

        if added_users:
            response['message'] = 'Users successfully assigned to community!'
        else:
            response['message'] = 'No new users were added to the community.'

        return response, 200


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
