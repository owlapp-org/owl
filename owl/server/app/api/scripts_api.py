from logging import getLogger

from apiflask import APIBlueprint, FileSchema, abort
from app.constants import ALLOWED_SCRIPT_EXTENSIONS
from app.lib.fs import is_extension_valid
from app.models.script import Script
from app.schemas.base import ExistsOut, MessageOut
from app.schemas.script_schema import (
    CreateScriptIn,
    ScriptContentOut,
    ScriptOut,
    UpdateScriptIn,
)
from flask import request, send_file
from flask_jwt_extended import get_jwt_identity

logger = getLogger(__name__)

bp = APIBlueprint("scripts", __name__, tag="Scripts")


@bp.route("/")
@bp.output(
    ScriptOut.Schema(many=True),
    status_code=200,
    description="List of scripts owned by the authenticated user",
)
@bp.doc(
    security="TokenAuth",
    description="Returns list of scripts owned by the authenticated user.",
)
def get_scripts():
    return Script.find_by_owner(id=get_jwt_identity())


@bp.route("/<int:id>")
@bp.output(
    ScriptOut.Schema,
    status_code=200,
    description="Script for the given id which belongs to the authenticated user",
)
@bp.doc(
    security="TokenAuth",
    summary="Get script",
    description="Returns the script for the given id which belongs to the authenticated user",
)
def get_script(id: int):
    if script := Script.find_by_id_and_owner(id=id, owner_id=get_jwt_identity()):
        return script
    else:
        return abort(404, "Script file not found")


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
        script = Script.find_by_id_and_owner(id=id, owner_id=get_jwt_identity())
        return ExistsOut(exists=script is not None)
    except Exception as e:
        return abort(500, f"Unable to check. {str(e)}")


@bp.route("/<int:id>/content", methods=["GET"])
@bp.output(
    ScriptContentOut.Schema,
    status_code=200,
    description="Script content",
)
@bp.doc(
    security="TokenAuth",
    description="Returns the script's content.",
)
def get_script_content(id: int):
    if script := Script.find_by_id_and_owner(id=id, owner_id=get_jwt_identity()):
        return ScriptContentOut(content=script.read_file())
    return abort(404, "Script not found")


@bp.route("/", methods=["POST"])
@bp.input(
    CreateScriptIn.Schema,
    arg_name="payload",
)
@bp.output(
    ScriptOut.Schema,
    status_code=200,
    description="Script model",
)
@bp.doc(
    security="TokenAuth",
    description="Returns the created script model",
)
def create_script(payload: CreateScriptIn):
    try:
        script = Script.create_script(
            owner_id=get_jwt_identity(),
            filename=payload.name,
            content=payload.content,
        )
        return script
    except Exception as e:
        return abort(500, str(e))


@bp.route("/<int:id>", methods=["PUT"])
@bp.input(
    UpdateScriptIn.Schema,
    arg_name="payload",
)
@bp.output(
    ScriptOut.Schema,
    status_code=200,
    description="Script model",
)
@bp.doc(
    security="TokenAuth",
    description="Returns the updated script model",
)
def update_script(id: int, payload: UpdateScriptIn):
    if script := Script.find_by_id_and_owner(id, get_jwt_identity()):
        script.update_script(name=payload.name, content=payload.content)
        return script

    return abort(404, "Script file not found")


@bp.route("/upload", methods=["POST"])
@bp.output(
    ScriptOut.Schema,
    status_code=200,
    description="Script model",
)
@bp.doc(
    security="TokenAuth",
    description="Returns the uploaded script model",
)
def upload_script():
    try:
        if "file" not in request.files:
            logger.error("No script to upload")
            return abort(404, "No script to upload")

        script = request.files["file"]
        if not script.filename:
            logger.error("No selected script")
            return abort(500, "No selected script")

        if not is_extension_valid(script.filename, ALLOWED_SCRIPT_EXTENSIONS):
            logger.error("Script extension not allowed")
            return abort(
                500,
                "Script extension not allowed. Allowed extensions: %s"
                % str(ALLOWED_SCRIPT_EXTENSIONS),
            )

        return Script.upload_script(get_jwt_identity(), script)
    except Exception as e:
        logger.error(str(e))
        return abort(500, f"Failed to upload script {str(e)}")


@bp.route("/<int:id>", methods=["DELETE"])
@bp.output(
    MessageOut.Schema,
    status_code=200,
    description="Success message",
)
@bp.doc(
    security="TokenAuth",
    description="Deletes a script with given id",
)
def delete_script(id: int):
    try:
        Script.delete_by_id(id, owner_id=get_jwt_identity())
    except Exception as e:
        return abort(500, str(e))

    return MessageOut(message="Script deleted successfully")


@bp.route("/<int:id>/download", methods=["GET"])
@bp.output(FileSchema, content_type="application/octet-stream")
@bp.doc(
    security="TokenAuth",
    summary="Download script file",
)
def download_script(id: int):
    try:
        if script := Script.find_by_id_and_owner(id, owner_id=get_jwt_identity()):
            filepath = script.absolute_path()
            file = open(filepath, "rb")
            return (
                send_file(
                    file,
                    as_attachment=True,
                    download_name=script.name,
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
