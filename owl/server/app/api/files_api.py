from logging import getLogger

from app.constants import ALLOWED_FILE_EXTENSIONS
from app.models.file import File
from app.schemas.file_schema import FileSchema
from flask import Blueprint, jsonify, make_response, request
from flask_jwt_extended import get_jwt_identity

logger = getLogger(__name__)

bp = Blueprint("files", __name__)


@bp.route("/")
def get_files():
    files = File.find_by_owner(id=get_jwt_identity())
    return [FileSchema.model_validate(file).model_dump() for file in files]


@bp.route("/<int:id>")
def get_file(id: int):
    if file := File.find_by_id_and_owner(id=id, owner_id=get_jwt_identity()):
        return FileSchema.model_validate(file).model_dump()
    else:
        return make_response("File not found"), 404


@bp.route("/upload", methods=["POST"])
def upload_file():
    try:
        if "file" not in request.files:
            message = "No file to upload"
            logger.error(message)
            return make_response(message), 500

        file = request.files["file"]
        if file.filename == "":
            message = "No selected file"
            logger.error(message)
            return make_response(message), 500
        file_extension = file.filename.rsplit(".", 1)[1].lower()
        if file_extension not in ALLOWED_FILE_EXTENSIONS:
            message = f"File extension ('{file_extension}') not allowed"
            logger.error(message)
            return (make_response(message), 500)
        f = File.save_file(get_jwt_identity(), file)

        return FileSchema.model_validate(f).model_dump()
    except Exception as e:
        logger.error(str(e))
        return make_response(f"Failed to upload file {e}"), 500


@bp.route("/<int:id>/rename", methods=["PUT"])
def rename_file(id: int):
    if "name" not in request.json:
        logger.error("Name property not found")
        return make_response("Name property not found"), 500

    name = request.json["name"]
    if not name:
        return make_response("File name can't be empty"), 500

    if file := File.find_by_id(id):
        try:
            file = file.rename(name)
            return FileSchema.model_validate(file).model_dump()
        except Exception as e:
            logger.error("Failed to rename file", e)
            return make_response("Failed to rename file"), 500
    else:
        return make_response("File not found"), 404


@bp.route("/<int:id>/exists", methods=["GET"])
def exists(id: int):
    try:
        if file := File.find_by_id_and_owner(id=id, owner_id=get_jwt_identity()):
            return jsonify({"exists": file.file_exists()}), 200
        else:
            return jsonify({"exists": False}), 200
    except Exception as e:
        return make_response(f"Unable to check. {str(e)}"), 500


@bp.route("/<int:id>", methods=["DELETE"])
def delete_file(id: int):
    try:
        File.delete_by_id(id, owner_id=get_jwt_identity())
    except Exception as e:
        return make_response(str(e)), 500

    return jsonify({"message": "File deleted successfully"}), 200
