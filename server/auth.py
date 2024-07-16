from functools import wraps
from flask_jwt_extended import get_jwt
from flask_jwt_extended import verify_jwt_in_request
from flask import jsonify, make_response



def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            try:
                if claims["role"] == "Administrator":
                    return fn(*args, **kwargs)
            except KeyError:
                return make_response(jsonify(msg="admin only!"), 403)
        return decorator
    return wrapper



def coordinator_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            try:
                if claims["role"] =="Coordinator":
                    return fn(*args, **kwargs)
            except KeyError:
                return make_response(jsonify(msg="Coordinator only!"), 403)

        return decorator

    return wrapper


def volunteer_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            try:
                if claims["role"] == "Volunteer":
                    return fn(*args, **kwargs)
            except KeyError:
                return make_response(jsonify(msg="Volunteer only!"), 403)

        return decorator

    return wrapper

def member_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            try:
                if claims["role"] == "Member":
                    return fn(*args, **kwargs)
            except KeyError:
                return make_response(jsonify(msg="Member only!"), 403)

        return decorator

    return wrapper