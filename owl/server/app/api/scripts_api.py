from logging import getLogger

from app.constants import ALLOWED_SCRIPT_EXTENSIONS
from app.models.script import Script
from app.schemas.script_schema import ScriptSchema
from flask import Blueprint, jsonify, make_response, request
from flask_jwt_extended import get_jwt_identity

logger = getLogger(__name__)

bp = Blueprint("scripts", __name__)


@bp.route("/")
def get_scripts():
    scripts = Script.find_by_owner(id=get_jwt_identity())
    return [ScriptSchema.model_validate(script).model_dump() for script in scripts]


@bp.route("/<int:id>")
def get_script(id: int):
    if script := Script.find_by_id_and_owner(id=id, owner_id=get_jwt_identity()):
        return ScriptSchema.model_validate(script).model_dump()
    else:
        return make_response("Script file not found"), 404


@bp.route("/<int:id>/content", methods=["GET"])
def get_script_content(id: int):
    if script := Script.find_by_id_and_owner(id=id, owner_id=get_jwt_identity()):
        return jsonify({"content": script.content()})
    else:
        return make_response("Script file not found"), 404


@bp.route("/<int:id>/content", methods=["PUT"])
def update_script_content(id: int):
    if script := Script.find_by_id_and_owner(id, get_jwt_identity()):
        # todo validate
        content = request.json["content"]
        script.update_content(content)
        return jsonify({}), 200
    else:
        return make_response("Script file not found"), 404


@bp.route("/upload", methods=["POST"])
def upload_script():
    try:
        if "file" not in request.files:
            message = "No script to upload"
            logger.error(message)
            return make_response(message), 500

        script = request.files["file"]
        if script.filename == "":
            message = "No selected script"
            logger.error(message)
            return make_response(message), 500
        script_extension = script.filename.rsplit(".", 1)[1].lower()
        if script_extension not in ALLOWED_SCRIPT_EXTENSIONS:
            message = f"Script extension ('{script_extension}') not allowed"
            logger.error(message)
            return make_response(message), 500
        f = Script.save_script(get_jwt_identity(), script)

        return ScriptSchema.model_validate(f).model_dump()
    except Exception as e:
        logger.error(str(e))
        return make_response(f"Failed to upload script {e}"), 500


@bp.route("/<int:id>/rename", methods=["PUT"])
def rename_script(id: int):
    if "name" not in request.json:
        logger.error("Name property not found")
        return make_response("Name property not found"), 500

    name = request.json["name"]
    if not name:
        return make_response("File name can't be empty"), 500

    if script := Script.find_by_id(id):
        try:
            script = script.rename(name)
            return ScriptSchema.model_validate(script).model_dump()
        except Exception as e:
            logger.error("Failed to rename script", e)
            return make_response("Failed to rename script"), 500
    else:
        return make_response("Script not found"), 404


@bp.route("/<int:id>/exists", methods=["GET"])
def exists(id: int):
    try:
        if script := Script.find_by_id_and_owner(id=id, owner_id=get_jwt_identity()):
            return jsonify({"exists": script.script_exists()}), 200
        else:
            return jsonify({"exists": False}), 200
    except Exception as e:
        return make_response(f"Unable to check. {str(e)}"), 500


@bp.route("/<int:id>", methods=["DELETE"])
def delete_script(id: int):
    try:
        Script.delete_by_id(id, owner_id=get_jwt_identity())
    except Exception as e:
        return make_response(str(e)), 500

    return jsonify({"message": "Script deleted successfully"}), 200
