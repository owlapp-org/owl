from app.constants import ALLOWED_FILE_EXTENSIONS
from app.models.file import File
from app.schemas.file_schema import FileSchema
from app.settings import settings
from flask import Blueprint, make_response, request
from flask_jwt_extended import get_jwt_identity

bp = Blueprint("files", __name__)


@bp.route("/")
def get_files():
    files = File.find_by_owner(id=get_jwt_identity())
    return [FileSchema.model_validate(file).model_dump() for file in files]


@bp.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return make_response("No file part"), 500

    file = request.files["file"]
    if file.filename == "":
        return make_response("No selected file"), 500
    file_extension = file.filename.rsplit(".", 1)[1].lower()
    if file_extension not in ALLOWED_FILE_EXTENSIONS:
        return make_response(f"File extension ('{file_extension}') not allowed"), 500

    f = File.save_file(get_jwt_identity(), file)
    return FileSchema.model_validate(f).model_dump()
