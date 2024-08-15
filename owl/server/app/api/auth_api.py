import os

from app.auth.oauth import oauth
from app.models import db
from app.models.user import User
from app.schemas import LoginInputSchema, LoginOutputSchema
from flask import Blueprint, jsonify, make_response, redirect, request, url_for
from flask_jwt_extended import create_access_token

bp = Blueprint("auth", __name__)


@bp.route("/login", methods=["POST"])
def login():
    input_schema = LoginInputSchema(**request.json)
    try:
        user = User.find_by_email(input_schema.email)
        if user is None or not user.verify_password(input_schema.password):
            return make_response("Failed to login"), 403

        access_token = create_access_token(identity=user)

        return LoginOutputSchema(
            email=user.email, name=user.name, access_token=access_token
        ).model_dump()
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/google/callback", methods=["GET"])
def google_callback():

    token = oauth.google.authorize_access_token()
    userinfo = token["userinfo"]

    email = userinfo["email"]
    user = User.find_by_email(email)
    if user is None:
        user = User(name=userinfo["name"], email=email)
        db.session.add(user)
        db.session.commit()

    access_token = create_access_token(identity=user)
    redirect_url = os.path.join(request.host_url, "/ui/auth/handle-google-callback")
    response = make_response(redirect(redirect_url))

    for name, value in [
        ("email", user.email),
        ("name", user.name),
        ("access_token", access_token),
    ]:
        response.set_cookie(
            f"google-user-{name}",
            value,
            secure=True,
            samesite="Lax",
        )

    return response


@bp.route("/google/login")
def google_login():
    redirect_uri = url_for("/.auth.google_callback", _external=True)
    return oauth.google.authorize_redirect(redirect_uri)
