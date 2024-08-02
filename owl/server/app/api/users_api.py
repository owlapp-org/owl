from app.models import User, db
from app.schemas.user_schema import UserSchema
from flask import Blueprint, jsonify, make_response, request
from flask_jwt_extended import get_jwt_identity
from sqlalchemy.exc import NoResultFound

bp = Blueprint("users", __name__)


@bp.route("/")
def get_users():
    users = User.find_all()
    return [UserSchema.model_validate(u).model_dump() for u in users]


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
def update_password():
    user_id = get_jwt_identity()
    password = request.json.get("password")
    if password is None:
        return make_response("Missing new password"), 400

    user = User.find_by_id(user_id)
    if user is None:
        return make_response("User not found"), 404

    user.hash_password(password)
    db.session.commit()

    return jsonify({"message": "Password updated successfully."}), 200
