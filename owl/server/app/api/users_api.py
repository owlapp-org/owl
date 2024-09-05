from app.models import User, db
from app.schemas.user_schema import UpdateUserInputSchema, UserSchema
from flask import Blueprint, jsonify, make_response, request
from flask_jwt_extended import get_jwt_identity
from sqlalchemy.exc import NoResultFound

bp = Blueprint("users", __name__)


@bp.route("/test-access-token")
def test_access_token():
    return jsonify({}), 200


@bp.route("/")
def get_users():
    users = User.find_all()
    return [UserSchema.model_validate(u).model_dump() for u in users]


@bp.route("/me")
def get_me():
    if user := User.find_by_id(id=get_jwt_identity()):
        return UserSchema.validate_and_dump(user), 200
    else:
        return make_response("Not Found"), 404


@bp.route("/<int:id>")
def get_user(id: int):
    try:
        user = User.find_by_id(id)
    except NoResultFound:
        return jsonify({"error": "User not found."}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    return UserSchema.model_validate(user).model_dump()


@bp.route("/email/<string:email>")
def get_user_by_email(email: str):
    if not email:
        return jsonify({"error": "Email is required."}), 400
    user = User.find_by_email(email)
    if not user:
        return jsonify({"error": "User not found."}), 404
    return UserSchema.model_validate(user).model_dump()


@bp.route("/password", methods=["PUT"])
@bp.route("/", methods=["PUT"])
def update_user():
    input_schema = UpdateUserInputSchema.model_validate(request.json)
    if user := User.find_by_id(id=get_jwt_identity()):
        user.update_user(input_schema.name, input_schema.password)
    else:
        return make_response("User not found"), 404

    return UserSchema.validate_and_dump(user), 200
