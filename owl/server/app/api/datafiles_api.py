from logging import getLogger

from apiflask import APIBlueprint, FileSchema, abort
from app.constants import ALLOWED_DATAFILE_EXTENSIONS
from app.lib.fs import is_extension_valid
from app.models.datafile import DataFile
from app.schemas.base import ExistsOut, MessageOut
from app.schemas.datafile_schema import DataFileOut, UpdateDataFileIn
from flask import request, send_file
from flask_jwt_extended import get_jwt_identity

logger = getLogger(__name__)

bp = APIBlueprint("files", __name__, tag="Data Files")


@bp.route("/")
@bp.output(
    DataFileOut.Schema(many=True),
    status_code=200,
    description="List of data files",
)
@bp.doc(
    security="TokenAuth",
    description="Returns list of data files owned by the authenticated user.",
)
def get_datafiles():
    return DataFile.find_by_owner(id=get_jwt_identity())


@bp.route("/<int:id>")
@bp.output(
    DataFileOut.Schema,
    status_code=200,
    description="Data file with the given id",
)
@bp.doc(
    security="TokenAuth",
    description="Returns data file with the given id that is owned by the authenticated user",
)
def get_datafile(id: int):
    if file := DataFile.find_by_id_and_owner(id=id, owner_id=get_jwt_identity()):
        return file

    return abort(404, "File not found")


@bp.route("/<int:id>/exists", methods=["GET"])
@bp.doc(
    security="TokenAuth",
    description="Returns if the file exists or not.",
)
@bp.output(
    ExistsOut.Schema,
    status_code=200,
    description="Check if the file with given id exists or not.",
)
def check_exists(id: int):
    try:
        file = DataFile.find_by_id_and_owner(id=id, owner_id=get_jwt_identity())
        return ExistsOut(exists=file is not None)
    except Exception as e:
        return abort(500, f"Unable to check. {str(e)}")


@bp.route("/<int:id>", methods=["PUT"])
@bp.input(
    UpdateDataFileIn.Schema,
    arg_name="payload",
)
@bp.output(
    DataFileOut.Schema,
    status_code=200,
    description="Returns the updated datafile model",
)
@bp.doc(
    security="TokenAuth",
    description="Update the datafile and return the updated datafile model.",
)
def update_datafile(id: int, payload: UpdateDataFileIn):
    try:
        datafile = DataFile.find_by_id_and_owner(id=id, owner_id=get_jwt_identity())
    except Exception as e:
        logger.exception(e)
        return abort(404, "File not found")

    return datafile.update_datafile(name=payload.name)


@bp.route("/upload", methods=["POST"])
@bp.output(
    DataFileOut.Schema,
    status_code=200,
    description=f"""
    Returns the updated datafile model.
    Allowed file extensions are {ALLOWED_DATAFILE_EXTENSIONS}""",
)
@bp.doc(
    security="TokenAuth",
    description="Upload a data file.",
)
def upload_datafile():
    if "file" not in request.files:
        logger.error("No file to upload")
        return abort(404, "No file to upload")

    file = request.files["file"]
    if not file.filename:
        logger.error("No file to upload")
        return abort(404, "No file to upload")

    if not is_extension_valid(file.filename, ALLOWED_DATAFILE_EXTENSIONS):
        logger.error("File extension not allowed")
        return abort(
            500,
            "File extension not allowed. Allowed extensions: %s"
            % str(ALLOWED_DATAFILE_EXTENSIONS),
        )
    try:
        return DataFile.upload_datafile(get_jwt_identity(), file)
    except Exception as e:
        logger.exception(e)
        return abort(500, f"Failed to upload file. {str(e)}")


@bp.route("/<int:id>", methods=["DELETE"])
@bp.output(
    MessageOut.Schema,
    status_code=200,
    description="Message to indicate successful deletion.",
)
@bp.doc(
    security="TokenAuth",
    summary="Delete a datafile",
    description="Delete a datafile owned by the authenticated user",
)
def delete_datafile(id: int):
    try:
        DataFile.delete_by_id(id, owner_id=get_jwt_identity())
    except Exception as e:
        return abort(500, str(e))

    return MessageOut(message="File deleted successfully")


@bp.route("/<int:id>/download", methods=["GET"])
@bp.doc(
    security="TokenAuth",
    summary="Download datafile",
    description="Download a datafile owned by the authenticated user",
)
@bp.output(FileSchema)
def download_datafile(id: int):
    try:
        if datafile := DataFile.find_by_id_and_owner(id, owner_id=get_jwt_identity()):
            filepath = datafile.absolute_path()
            file = open(filepath, "rb")
            return (
                send_file(
                    file,
                    as_attachment=True,
                    download_name=datafile.name,
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
