from flask import Blueprint, make_response, jsonify
from flask_restful import Api, Resource, reqparse
from flask_jwt_extended import jwt_required
from models import Year, db
from serializer import year_schema
from auth import admin_required

years_bp = Blueprint('years_bp', __name__)
api = Api(years_bp)

# Define request parsers for POST and PATCH methods
post_args = reqparse.RequestParser()
post_args.add_argument('year_name', type=int, required=True, help='Year Name is required')

patch_args = reqparse.RequestParser()
patch_args.add_argument('year_name', type=int)


    
class YearsDetails(Resource):
    @jwt_required()
    def get(self):
        years = Year.query.all()
        result = year_schema.dump(years,many=True)
        print(result)
        return make_response(jsonify(result), 200)

    @admin_required()
    def post(self):
        data = post_args.parse_args()
        new_year = Year(
            year_name=data['year_name']
        )
        db.session.add(new_year)
        db.session.commit()
        result = year_schema.dump(new_year)
        return make_response(jsonify(result), 201)

api.add_resource(YearsDetails, '/years')

# Define Resource for a single Year by ID
class YearById(Resource):
    @jwt_required()
    def get(self, id):
        year = Year.query.get(id)
        if not year:
            return make_response(jsonify({"error": "Year not found"}), 404)
        result = year_schema.dump(year)
        return make_response(jsonify(result), 200)

    @admin_required()
    def delete(self, id):
        year = Year.query.get(id)
        if not year:
            return make_response(jsonify({"error": "Year not found"}), 404)
        db.session.delete(year)
        db.session.commit()
        return make_response(jsonify({"message": "Year deleted successfully"}), 200)

    @admin_required()
    def patch(self, id):
        year = Year.query.get(id)
        if not year:
            return make_response(jsonify({"error": "Year not found"}), 404)
        data = patch_args.parse_args()
        for key, value in data.items():
            if value is not None:
                setattr(year, key, value)
        db.session.commit()
        result = year_schema.dump(year)
        return make_response(jsonify(result), 200)

api.add_resource(YearById, '/years/<int:id>')
