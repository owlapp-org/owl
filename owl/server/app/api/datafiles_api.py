from logging import getLogger

from app.constants import ALLOWED_DATAFILE_EXTENSIONS
from app.lib.fs import is_extension_valid
from app.models.datafile import DataFile
from app.schemas.datafile_schema import DataFileOutputSchema, UpdateDataFileInputSchema
from flask import Blueprint, jsonify, make_response, request
from flask_jwt_extended import get_jwt_identity
from pydantic import ValidationError

logger = getLogger(__name__)

bp = Blueprint("files", __name__)


@bp.route("/")
def get_datafiles():
    files = DataFile.find_by_owner(id=get_jwt_identity())
    return [DataFileOutputSchema.validate_and_dump(file) for file in files]


@bp.route("/<int:id>")
def get_datafile(id: int):
    if file := DataFile.find_by_id_and_owner(id=id, owner_id=get_jwt_identity()):
        return DataFileOutputSchema.validate_and_dump(file)
    else:
        return make_response("File not found"), 404


@bp.route("/<int:id>/exists", methods=["GET"])
def check_exists(id: int):
    try:
        if file := DataFile.find_by_id_and_owner(id=id, owner_id=get_jwt_identity()):
            return jsonify({"exists": file.file_exists()}), 200
        else:
            return jsonify({"exists": False}), 200
    except Exception as e:
        return make_response(f"Unable to check. {str(e)}"), 500


@bp.route("/<int:id>", methods=["PUT"])
@bp.route("/<int:id>/rename", methods=["PUT"])
def update_datafile(id: int):
    try:
        input_schema = UpdateDataFileInputSchema.model_validate(request.json)
    except ValidationError as e:
        logger.exception(str(e))
        return make_response("Validation failed %s" % str(e))

    try:
        datafile = DataFile.find_by_id_and_owner(id=id, owner_id=get_jwt_identity())
    except Exception as e:
        logger.exception(str(e))
        return make_response("File not found"), 404

    datafile.update_datafile(name=input_schema.name)

    return DataFileOutputSchema.validate_and_dump(datafile), 200


@bp.route("/upload", methods=["POST"])
def upload_datafile():
    if "file" not in request.files:
        logger.error("No file to upload")
        return make_response("No file to upload"), 404

    file = request.files["file"]
    if not file.filename:
        logger.error("No file to upload")
        return make_response("No file to upload"), 404

    if not is_extension_valid(file.filename, ALLOWED_DATAFILE_EXTENSIONS):
        logger.error("File extension not allowed")
        return (
            make_response(
                "File extension not allowed. Allowed extensions: %s"
                % str(ALLOWED_DATAFILE_EXTENSIONS)
            ),
            500,
        )

    try:
        datafile = DataFile.upload_datafile(get_jwt_identity(), file)
        return DataFileOutputSchema.validate_and_dump(datafile), 200
    except Exception as e:
        logger.exception(str(e))
        return make_response(f"Failed to upload file. {str(e)}"), 500


@bp.route("/<int:id>", methods=["DELETE"])
def delete_datafile(id: int):
    try:
        DataFile.delete_by_id(id, owner_id=get_jwt_identity())
    except Exception as e:
        return make_response(str(e)), 500

    return jsonify({"message": "File deleted successfully"}), 200
