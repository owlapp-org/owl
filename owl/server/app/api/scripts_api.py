from logging import getLogger

from app.constants import ALLOWED_SCRIPT_EXTENSIONS
from app.lib.fs import is_extension_valid
from app.models.script import Script
from app.schemas.script_schema import (CreateScriptInputSchema,
                                       ScriptOutputSchema,
                                       UpdateScriptInputSchema)
from flask import Blueprint, jsonify, make_response, request
from flask_jwt_extended import get_jwt_identity

logger = getLogger(__name__)

bp = Blueprint("scripts", __name__)


@bp.route("/")
def get_scripts():
    scripts = Script.find_by_owner(id=get_jwt_identity())
    return [ScriptOutputSchema.validate_and_dump(script) for script in scripts]


@bp.route("/<int:id>")
def get_script(id: int):
    if script := Script.find_by_id_and_owner(id=id, owner_id=get_jwt_identity()):
        return ScriptOutputSchema.validate_and_dump(script)
    else:
        return make_response("Script file not found"), 404


@bp.route("/<int:id>/exists", methods=["GET"])
def check_exists(id: int):
    try:
        if script := Script.find_by_id_and_owner(id=id, owner_id=get_jwt_identity()):
            return jsonify({"exists": script.file_exists()}), 200
        else:
            return jsonify({"exists": False}), 200
    except Exception as e:
        return make_response(f"Unable to check. {str(e)}"), 500


@bp.route("/<int:id>/content", methods=["GET"])
def get_script_content(id: int):
    if script := Script.find_by_id_and_owner(id=id, owner_id=get_jwt_identity()):
        return jsonify({"content": script.read_file()})
    else:
        return make_response("Script not found"), 404


@bp.route("/", methods=["POST"])
def create_script():
    input_schema = CreateScriptInputSchema.model_validate(request.json)
    try:
        script = Script.create_script(
            owner_id=get_jwt_identity(),
            filename=input_schema.name,
            content=input_schema.content,
        )
        return ScriptOutputSchema.validate_and_dump(script)
    except Exception as e:
        return make_response(str(e)), 500


@bp.route("/<int:id>/rename", methods=["PUT"])
@bp.route("/<int:id>/content", methods=["PUT"])
@bp.route("/<int:id>", methods=["PUT"])
def update_script(id: int):
    input_schema = UpdateScriptInputSchema.model_validate(request.json)
    if script := Script.find_by_id_and_owner(id, get_jwt_identity()):
        script.update_script(name=input_schema.name, content=input_schema.content)
        return ScriptOutputSchema.validate_and_dump(script), 200
    else:
        return make_response("Script file not found"), 404


@bp.route("/upload", methods=["POST"])
def upload_script():
    try:
        if "file" not in request.files:
            logger.error("No script to upload")
            return make_response("No script to upload"), 404

        script = request.files["file"]
        if not script.filename:
            logger.error("No selected script")
            return make_response("No selected script"), 500

        if not is_extension_valid(script.filename, ALLOWED_SCRIPT_EXTENSIONS):
            logger.error("Script extension not allowed")
            return (
                make_response(
                    "Script extension not allowed. Allowed extensions: %s"
                    % str(ALLOWED_SCRIPT_EXTENSIONS)
                ),
                500,
            )

        script = Script.upload_script(get_jwt_identity(), script)
        return ScriptOutputSchema.validate_and_dump(script), 200
    except Exception as e:
        logger.error(str(e))
        return make_response(f"Failed to upload script {str(e)}"), 500


@bp.route("/<int:id>", methods=["DELETE"])
def delete_script(id: int):
    try:
        Script.delete_by_id(id, owner_id=get_jwt_identity())
    except Exception as e:
        return make_response(str(e)), 500

    return jsonify({"message": "Script deleted successfully"}), 200
