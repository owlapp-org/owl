from logging import getLogger

from apiflask import APIBlueprint, FileSchema, abort
from app.constants import ALLOWED_DASHBOARDFILE_EXTENSIONS
from app.lib.fs import is_extension_valid
from app.models.dashboard import Dashboard
from app.schemas.base import (
    ContentOut,
    ExistsOut,
    MessageOut,
    RenderContentIn,
    RenderContentOut,
)
from app.schemas.dashboard_schema import (
    CreateDashboardFileIn,
    DashboardFileOut,
    UpdateDashboardFileIn,
)
from flask import request, send_file
from flask_jwt_extended import get_jwt_identity

logger = getLogger(__name__)

bp = APIBlueprint("dashboards", __name__, tag="Dashboards")


@bp.route("/")
@bp.output(
    DashboardFileOut.Schema(many=True),
    status_code=200,
    description="List of dashboard files owned by the authenticated user",
)
@bp.doc(
    security="TokenAuth",
    description="Returns list of dashboard files owned by the authenticated user.",
)
def get_dashboard_files():
    return Dashboard.find_by_owner(id=get_jwt_identity())


@bp.route("/<int:id>")
@bp.output(
    DashboardFileOut.Schema,
    status_code=200,
    description="Dashboard file for the given id which belongs to the authenticated user",
)
@bp.doc(
    security="TokenAuth",
    summary="Get dashboard file model",
    description="Returns the dashboard file model for the given id which belongs to the authenticated user",
)
def get_dashboard_file(id: int):
    if result := Dashboard.find_by_id_and_owner(id=id, owner_id=get_jwt_identity()):
        return result
    else:
        return abort(404, "Dashboard file not found")


@bp.route("/<int:id>/exists", methods=["GET"])
@bp.output(
    ExistsOut.Schema,
    status_code=200,
    description="Check if the file with given id exists or not.",
)
@bp.doc(
    security="TokenAuth",
    description="Returns if the file exists or not.",
)
def check_exists(id: int):
    try:
        model = Dashboard.find_by_id_and_owner(id=id, owner_id=get_jwt_identity())
        return ExistsOut(exists=model is not None)
    except Exception as e:
        return abort(500, f"Unable to check. {str(e)}")


@bp.route("/<int:id>/content", methods=["GET"])
@bp.output(
    ContentOut.Schema,
    status_code=200,
    description="file content",
)
@bp.doc(
    security="TokenAuth",
    description="Returns the file's content.",
)
def get_dashboard_content(id: int):
    if model := Dashboard.find_by_id_and_owner(id=id, owner_id=get_jwt_identity()):
        return ContentOut(content=model.read_file())
    return abort(404, "File not found")


@bp.route("/", methods=["POST"])
@bp.input(
    CreateDashboardFileIn.Schema,
    arg_name="payload",
)
@bp.output(
    DashboardFileOut.Schema,
    status_code=200,
    description="Result model",
)
@bp.doc(
    security="TokenAuth",
    description="Returns the created macro model",
)
def create_dashboard_file(payload: CreateDashboardFileIn):
    try:
        return Dashboard.create_dashboard_file(
            owner_id=get_jwt_identity(),
            filename=payload.name,
            content=payload.content,
        )
    except Exception as e:
        return abort(500, str(e))


@bp.route("/<int:id>", methods=["PUT"])
@bp.input(
    UpdateDashboardFileIn.Schema,
    arg_name="payload",
)
@bp.output(
    DashboardFileOut.Schema,
    status_code=200,
    description="file model",
)
@bp.doc(
    security="TokenAuth",
    description="Returns the updated model",
)
def update_dashboard_file(id: int, payload: UpdateDashboardFileIn):
    if model := Dashboard.find_by_id_and_owner(id, get_jwt_identity()):
        return model.update_dashboard_file(name=payload.name, content=payload.content)

    return abort(404, "Macro file not found")


@bp.route("/upload", methods=["POST"])
@bp.output(
    DashboardFileOut.Schema,
    status_code=200,
    description="File model",
)
@bp.doc(
    security="TokenAuth",
    description="Returns the uploaded file model",
)
def upload_dashboard_file():
    try:
        if "file" not in request.files:
            logger.error("No file to upload")
            return abort(404, "No file to upload")

        macro_file = request.files["file"]
        if not macro_file.filename:
            logger.error("No selected file")
            return abort(500, "No selected file")

        if not is_extension_valid(
            macro_file.filename, ALLOWED_DASHBOARDFILE_EXTENSIONS
        ):
            logger.error("File extension not allowed")
            return abort(
                500,
                "File extension not allowed. Allowed extensions: %s"
                % str(ALLOWED_DASHBOARDFILE_EXTENSIONS),
            )

        return Dashboard.upload_dashboard_file(get_jwt_identity(), macro_file)
    except Exception as e:
        logger.exception(e)
        return abort(500, f"Failed to upload macro file. {str(e)}")


@bp.route("/<int:id>", methods=["DELETE"])
@bp.output(
    DashboardFileOut.Schema,
    status_code=200,
    description="Success message",
)
@bp.doc(
    security="TokenAuth",
    description="Deletes a file with given id",
)
def delete_dashboard_file(id: int):
    try:
        Dashboard.delete_by_id(id, owner_id=get_jwt_identity())
    except Exception as e:
        return abort(500, str(e))

    return MessageOut(message="Macro file deleted successfully")


@bp.route("/<int:id>/download", methods=["GET"])
@bp.output(FileSchema, content_type="application/octet-stream")
@bp.doc(
    security="TokenAuth",
    summary="Download file",
)
def download_dashboard_file(id: int):
    try:
        if model := Dashboard.find_by_id_and_owner(id, owner_id=get_jwt_identity()):
            filepath = model.absolute_path()
            file = open(filepath, "rb")
            return (
                send_file(
                    file,
                    as_attachment=True,
                    download_name=model.name,
                    conditional=True,
                ),
                200,
                {"Connection": "close"},
            )
        else:
            return abort(404, "File not found")
    except FileNotFoundError:
        return abort(404, "File not found")
    except Exception as e:
        logger.exception(e)
        return abort(500, str(e))


@bp.route("/render", methods=["POST"])
@bp.input(RenderContentIn.Schema, arg_name="payload")
@bp.output(RenderContentOut.Schema)
@bp.doc(security="TokenAuth", summary="Render given content and command result")
def render_content(payload: RenderContentIn):
    rendered_content = Dashboard.render_content(
        owner_id=get_jwt_identity(),
        content=payload.content,
    )
    return RenderContentOut(content=rendered_content)
