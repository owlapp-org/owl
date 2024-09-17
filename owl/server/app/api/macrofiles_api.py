from logging import getLogger

from apiflask import APIBlueprint, FileSchema, abort
from app.constants import ALLOWED_MACROFILE_EXTENSIONS
from app.lib.fs import is_extension_valid
from app.models.macrofile import MacroFile
from app.schemas.base import ExistsOut, MessageOut, RenderContentIn, RenderContentOut
from app.schemas.macrofile_schema import (
    CreateMacroFileIn,
    MacroFileContentOut,
    MacroFileOut,
    UpdateMacroFileIn,
)
from flask import request, send_file
from flask_jwt_extended import get_jwt_identity

logger = getLogger(__name__)

bp = APIBlueprint("macros", __name__, tag="Macros")


@bp.route("/")
@bp.output(
    MacroFileOut.Schema(many=True),
    status_code=200,
    description="List of macro files owned by the authenticated user",
)
@bp.doc(
    security="TokenAuth",
    description="Returns list of macro files owned by the authenticated user.",
)
def get_macro_files():
    return MacroFile.find_by_owner(id=get_jwt_identity())


@bp.route("/<int:id>")
@bp.output(
    MacroFileOut.Schema,
    status_code=200,
    description="Macro for the given id which belongs to the authenticated user",
)
@bp.doc(
    security="TokenAuth",
    summary="Get macro file model",
    description="Returns the macro file model for the given id which belongs to the authenticated user",
)
def get_macro_file(id: int):
    if macro_file := MacroFile.find_by_id_and_owner(id=id, owner_id=get_jwt_identity()):
        return macro_file
    else:
        return abort(404, "Macro file not found")


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
        macro_file = MacroFile.find_by_id_and_owner(id=id, owner_id=get_jwt_identity())
        return ExistsOut(exists=macro_file is not None)
    except Exception as e:
        return abort(500, f"Unable to check. {str(e)}")


@bp.route("/<int:id>/content", methods=["GET"])
@bp.output(
    MacroFileContentOut.Schema,
    status_code=200,
    description="Macro file content",
)
@bp.doc(
    security="TokenAuth",
    description="Returns the macro file's content.",
)
def get_macro_content(id: int):
    if macro := MacroFile.find_by_id_and_owner(id=id, owner_id=get_jwt_identity()):
        return MacroFileContentOut(content=macro.read_file())
    return abort(404, "Macro file not found")


@bp.route("/", methods=["POST"])
@bp.input(
    CreateMacroFileIn.Schema,
    arg_name="payload",
)
@bp.output(
    MacroFileOut.Schema,
    status_code=200,
    description="Macro model",
)
@bp.doc(
    security="TokenAuth",
    description="Returns the created macro model",
)
def create_macro_file(payload: CreateMacroFileIn):
    try:
        macro = MacroFile.create_macro_file(
            owner_id=get_jwt_identity(),
            filename=payload.name,
            content=payload.content,
        )
        return macro
    except Exception as e:
        return abort(500, str(e))


@bp.route("/<int:id>", methods=["PUT"])
@bp.input(
    UpdateMacroFileIn.Schema,
    arg_name="payload",
)
@bp.output(
    MacroFileOut.Schema,
    status_code=200,
    description="Macro file model",
)
@bp.doc(
    security="TokenAuth",
    description="Returns the updated macro model",
)
def update_macro_file(id: int, payload: UpdateMacroFileIn):
    if macro_file := MacroFile.find_by_id_and_owner(id, get_jwt_identity()):
        macro_file.update_macro_file(name=payload.name, content=payload.content)
        return macro_file

    return abort(404, "Macro file not found")


@bp.route("/upload", methods=["POST"])
@bp.output(
    MacroFileOut.Schema,
    status_code=200,
    description="Macro model",
)
@bp.doc(
    security="TokenAuth",
    description="Returns the uploaded macro file model",
)
def upload_macro_file():
    try:
        if "file" not in request.files:
            logger.error("No macro to upload")
            return abort(404, "No macro to upload")

        macro_file = request.files["file"]
        if not macro_file.filename:
            logger.error("No selected macro")
            return abort(500, "No selected macro")

        if not is_extension_valid(macro_file.filename, ALLOWED_MACROFILE_EXTENSIONS):
            logger.error("Macro file extension not allowed")
            return abort(
                500,
                "Macro file extension not allowed. Allowed extensions: %s"
                % str(ALLOWED_MACROFILE_EXTENSIONS),
            )

        return MacroFile.upload_macro_file(get_jwt_identity(), macro_file)
    except Exception as e:
        logger.exception(e)
        return abort(500, f"Failed to upload macro file. {str(e)}")


@bp.route("/<int:id>", methods=["DELETE"])
@bp.output(
    MessageOut.Schema,
    status_code=200,
    description="Success message",
)
@bp.doc(
    security="TokenAuth",
    description="Deletes a macro file with given id",
)
def delete_macro_file(id: int):
    try:
        MacroFile.delete_by_id(id, owner_id=get_jwt_identity())
    except Exception as e:
        return abort(500, str(e))

    return MessageOut(message="Macro file deleted successfully")


@bp.route("/<int:id>/download", methods=["GET"])
@bp.output(FileSchema, content_type="application/octet-stream")
@bp.doc(
    security="TokenAuth",
    summary="Download macro file",
)
def download_macro_file(id: int):
    try:
        if macro_file := MacroFile.find_by_id_and_owner(
            id, owner_id=get_jwt_identity()
        ):
            filepath = macro_file.absolute_path()
            file = open(filepath, "rb")
            return (
                send_file(
                    file,
                    as_attachment=True,
                    download_name=macro_file.name,
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
    rendered_content = MacroFile.render_content(
        owner_id=get_jwt_identity(),
        content=payload.content,
        command=payload.command,
    )
    return RenderContentOut(content=rendered_content)
