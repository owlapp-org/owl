import os
from logging import getLogger

from apiflask import APIBlueprint, abort
from app.auth.oauth import oauth
from app.models import db
from app.models.user import User
from app.schemas.auth_schema import LoginIn, LoginOut
from flask import make_response, redirect, request, url_for
from flask_jwt_extended import create_access_token

bp = APIBlueprint("auth", __name__, tag="Authentication")

logger = getLogger(__name__)


@bp.route("/login", methods=["POST"])
@bp.input(
    LoginIn.Schema,
    example={"email": "jane.doe@owl.dev", "password": "myPassword123"},
    location="json",
    arg_name="payload",
)
@bp.output(LoginOut.Schema, status_code=200, description="login success")
def login(payload: LoginIn):
    try:
        user = User.find_by_email(payload.email)
        if user is None or not user.verify_password(payload.password):
            return abort(403, "Failed to login")

        access_token = create_access_token(identity=user)
        return LoginOut(email=user.email, name=user.name, access_token=access_token)
    except Exception as e:
        logger.exception(e)
        return abort(500, "Internal application error", extra_data={"error": str(e)})


@bp.route("/google/callback", methods=["GET"])
@bp.doc(
    summary="Google oauth callback.",
    description="""To use it you must enable it on the settings GOOGLE_OAUTH_ENABLED.
    Also you need to setup the authentication settings on the Google console.
    """,
)
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
@bp.doc(
    summary="Google login url.",
    description="""To use it you must enable it on the settings GOOGLE_OAUTH_ENABLED.
    Also you need to setup the authentication settings on the Google console.
    """,
)
def google_login():
    redirect_uri = url_for("/.auth.google_callback", _external=True)
    return oauth.google.authorize_redirect(redirect_uri)
