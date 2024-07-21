from flask import Blueprint, make_response, jsonify
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from flask_restful import Api, Resource, reqparse
from flask_jwt_extended import jwt_required
from models import Community, db,User,UserCommunity,Event
from serializer import community_schema,user_schema,volunteer_hour_schema,event_schema
from auth import admin_required
from sqlalchemy.orm import joinedload

community_bp = Blueprint('community_bp', __name__)
api = Api(community_bp)

post_args = reqparse.RequestParser()
post_args.add_argument('name', type=str, required=True, help='Name is required')
post_args.add_argument('description', type=str)
post_args.add_argument('coordinator_id', type=int, required=True, help='Coordinator ID is required')

patch_args = reqparse.RequestParser()
patch_args.add_argument('name', type=str)
patch_args.add_argument('description', type=str)
patch_args.add_argument('coordinator_id', type=int)


class CommunityDetails(Resource):
    @jwt_required()
    def get(self):
        # Query communities with joined user to get coordinator details
        communities = Community.query.options(joinedload(Community.coordinator)).all()

        # Format the result
        result = []
        for community in communities:
            community_data = {
                'id': community.id,
                'name': community.name,
                'description': community.description,
                'coordinator_id': community.coordinator_id,
                'coordinator_name': f"{community.coordinator.first_name} {community.coordinator.last_name}" if community.coordinator else None
            }
            result.append(community_data)

        return make_response(jsonify(result), 200)

    @admin_required()
    def post(self):
        data = post_args.parse_args()

        # Check if the community name already exists
        existing_community = Community.query.filter_by(name=data['name']).first()
        if existing_community:
            return make_response(jsonify({"error": "Community with this name already exists"}), 409)

        new_community = Community(
            name=data['name'],
            description=data['description'],
            coordinator_id=data['coordinator_id']
        )
        db.session.add(new_community)
        db.session.commit()

        result = community_schema.dump(new_community)
        return make_response(jsonify(result), 201)

api.add_resource(CommunityDetails, '/communities')

class CommunityById(Resource):
    from flask import jsonify, make_response
from flask_jwt_extended import jwt_required
from sqlalchemy.orm import joinedload

class CommunityById(Resource):
    @jwt_required()
    def get(self, id):
        community = Community.query.options(joinedload(Community.coordinator)).get(id)
        if not community:
            return make_response(jsonify({"error": "Community not found"}), 404)
        
        # Fetch related data
        members = User.query.join(UserCommunity).filter(UserCommunity.community_id == id).all()
        events = Event.query.filter_by(community_id=id).all()

        # Format the result
        result = community_schema.dump(community)
        result['members'] = [user_schema.dump(member) for member in members]
        result['events'] = [event_schema.dump(event) for event in events]  # Add events to the result

        # Calculate total volunteer hours
        total_volunteer_hours = sum(
            hour.hours for member in members for hour in member.volunteer_hours
        )

        # Add total volunteer hours to the community result
        result['total_volunteer_hours'] = total_volunteer_hours

        # Add coordinator details to the result
        if community.coordinator:
            result['coordinator_id'] = community.coordinator.id
            result['coordinator_name'] = f"{community.coordinator.first_name} {community.coordinator.last_name}"
        else:
            result['coordinator_id'] = None
            result['coordinator_name'] = None

        return make_response(jsonify(result), 200)





    @admin_required()
    def delete(self, id):
        community = Community.query.get(id)
        if not community:
            return make_response(jsonify({"error": "Community not found"}), 404)

        db.session.delete(community)
        db.session.commit()
        return make_response(jsonify({"message": "Community deleted successfully"}), 200)

    @admin_required()
    def patch(self, id):
        community = Community.query.get(id)
        if not community:
            return make_response(jsonify({"error": "Community not found"}), 404)

        data = patch_args.parse_args()
        for key, value in data.items():
            if value is not None:
                setattr(community, key, value)

        db.session.commit()

        result = community_schema.dump(community)
        return make_response(jsonify(result), 200)

api.add_resource(CommunityById, '/communities/<int:id>')
