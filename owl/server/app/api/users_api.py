from apiflask import APIBlueprint, abort
from app.models import User
from app.schemas.base import EmailIn
from app.schemas.user_schema import UpdateUserIn, UserOut
from flask_jwt_extended import get_jwt_identity
from sqlalchemy.exc import NoResultFound

bp = APIBlueprint("users", __name__, tag="Users")


@bp.route("/")
@bp.output(UserOut.Schema(many=True), status_code=200, description="List of users")
@bp.doc(
    security="TokenAuth",
    description="Returns the users in the system",
)
def get_users():
    return User.find_all()


@bp.route("/me")
@bp.output(UserOut.Schema, status_code=200, description="Authenticated user")
@bp.doc(
    security="TokenAuth",
    description="Returns the authenticated user",
)
def get_me():
    if user := User.find_by_id(id=get_jwt_identity()):
        return user
    else:
        return abort(404, "Not Found")


@bp.route("/<int:id>")
@bp.output(UserOut.Schema, status_code=200, description="User with given id")
@bp.doc(
    security="TokenAuth",
    description="Returns the user with given id",
)
def get_user(id: int):
    try:
        return User.find_by_id(id)
    except NoResultFound:
        return abort(404, "User not found.")
    except Exception as e:
        return abort(500, str(e))


@bp.route("/email/<string:email>")
@bp.input(EmailIn.Schema, arg_name="email", location="path")
@bp.output(
    UserOut.Schema,
    status_code=200,
    description="User with given email address",
)
@bp.doc(
    security="TokenAuth",
    description="Returns the user with given email",
)
def get_user_by_email(email: EmailIn):
    if user := User.find_by_email(email.email):
        return user
    return abort(404, "User not found.")


@bp.route("/", methods=["PUT"])
@bp.input(UpdateUserIn.Schema, arg_name="payload")
@bp.output(
    UserOut.Schema,
    status_code=200,
    description="User model",
)
@bp.doc(
    security="TokenAuth",
    description="Returns the updated user",
)
def update_user(payload: UpdateUserIn):
    if user := User.find_by_id(id=get_jwt_identity()):
        return user.update_user(payload.name, payload.password)
    return abort(404, "User not found")
