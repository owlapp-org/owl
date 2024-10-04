from logging import getLogger
from typing import Optional

from apiflask import APIBlueprint, FileSchema, abort
from app.errors.errors import ModelNotFoundException, NotAuthorizedError
from app.models import db
from app.models.database import Database
from app.schemas.base import MessageOut
from app.schemas.database_schema import (
    CreateDatabaseIn,
    DatabaseOut,
    ExportIn,
    ExportQuery,
    RunIn,
    RunOut,
    RunQuery,
    UpdateDatabaseIn,
)
from flask import send_file
from flask_jwt_extended import get_jwt_identity

bp = APIBlueprint("databases", __name__, tag="Databases")

logger = getLogger(__name__)


@bp.route("/")
@bp.output(
    DatabaseOut.Schema(many=True), status_code=200, description="List of databases"
)
@bp.doc(
    security="TokenAuth",
    description="Returns list of databases owned by the authenticated user.",
)
def get_databases():
    return Database.find_by_owner(id=get_jwt_identity())


@bp.route("/", methods=["POST"])
@bp.input(
    CreateDatabaseIn.Schema,
    arg_name="payload",
    example={
        "name": "demo-database",
        "pool_size": 2,
        "description": "My demo database description.",
    },
)
@bp.output(DatabaseOut.Schema, status_code=200, description="created database")
@bp.doc(
    security="TokenAuth",
    summary="Create a new database",
    description="Create a new database owned by the authenticated user",
)
def create_database(payload: CreateDatabaseIn):
    database = Database(
        name=payload.name,
        pool_size=payload.pool_size,
        description=payload.description,
        owner_id=get_jwt_identity(),
    )
    try:
        return database.create()
    except Exception as e:
        return abort(500, f"Error creating database {str(e)}")


@bp.route("/<int:id>", methods=["DELETE"])
@bp.output(MessageOut.Schema, status_code=200)
@bp.doc(
    security="TokenAuth",
    summary="Delete database",
    description="Delete database by id which is owned by authenticated user",
)
def delete_database(id: int):
    try:
        Database.delete_by_id(id, owner_id=get_jwt_identity())
    except ModelNotFoundException:
        return abort(403, f"Database with id {id} not found")
    except NotAuthorizedError as e:
        return abort(403, str(e))

    return MessageOut(message="Database deleted successfully")


@bp.route("/<int:id>")
@bp.output(
    DatabaseOut.Schema,
    status_code=200,
    description="Database for the given id which belongs to the authenticated user",
)
@bp.doc(
    security="TokenAuth",
    summary="Get database",
    description="Returns the database for the given id which belongs to the authenticated user",
)
def get_database(id: int):
    database = Database.find_by_id(id)
    if not database:
        return abort(403, f"Database with id {id} not found")

    return database


@bp.route("/<int:id>", methods=["PUT"])
@bp.input(
    UpdateDatabaseIn.Schema,
    arg_name="payload",
    example={
        "pool_size": 2,
    },
)
@bp.output(
    DatabaseOut.Schema,
    status_code=200,
    description="Database for the given id which belongs to the authenticated user",
)
@bp.doc(
    security="TokenAuth",
    summary="Update database",
    description="Update the and return the updated database",
)
def update_database(id: int, payload: UpdateDatabaseIn):
    if database := Database.find_by_id(id):
        database.update(payload.name, payload.pool_size, payload.description)
        db.session.commit()
        return database

    return abort(404, "Database not found")


@bp.route("/run", methods=["POST"])
@bp.input(RunIn.Schema, example={"query": "select * from my_table"}, arg_name="payload")
@bp.input(RunQuery.Schema, location="query", example="database_id=1", arg_name="q")
@bp.output(
    RunOut.Schema,
    status_code=200,
    description="Execution result with possible metadata",
)
@bp.doc(
    security="TokenAuth",
    summary="Run query",
    description="Runs a query and returns result",
)
def run(payload: RunIn, q: Optional[RunQuery] = None):
    q = q or RunQuery()
    try:
        owner_id = get_jwt_identity()
        return Database.run(
            id=q.database_id,
            owner_id=owner_id,
            query=payload.query,
            start_row=q.start_row,
            end_row=q.end_row,
            with_total_count=q.with_total_count,
        )
    except ModelNotFoundException as e:
        logger.exception(e)
        return abort(404, "Database not found")
    except NotAuthorizedError as e:
        logger.exception(e)
        return abort(403, "Not authorized to execute the query on this database")
    except Exception as e:
        logger.exception(e)
        return abort(500, str(e))


@bp.route("/export", methods=["POST"])
@bp.input(ExportQuery.Schema, location="query", arg_name="q")
@bp.input(
    ExportIn.Schema,
    example={
        "query": "select * from my_table",
        "file_name": "output.csv",
        "file_type": "CSV",
    },
    arg_name="payload",
)
@bp.output(FileSchema, content_type="application/octet-stream")
@bp.doc(
    security="TokenAuth",
    summary="Export a query result",
    description="Accepts a query and exports the result",
)
def export(q: Optional[ExportQuery], payload: ExportIn):
    try:
        with Database.export(
            id=q.database_id,
            query=payload.query,
            filename=payload.filename,
            options=payload.options,
            owner_id=get_jwt_identity(),
        ) as filepath:
            file = open(filepath, "rb")
            return (
                send_file(
                    file,
                    as_attachment=True,
                    download_name=payload.filename,
                    conditional=True,
                ),
                200,
                {"Connection": "close"},
            )
    except Exception as e:
        logger.exception("Failed to export data", extra={"error": str(e)})
        return abort(500, str(e))


@bp.route("/<int:id>/download", methods=["GET"])
@bp.output(FileSchema, content_type="application/octet-stream")
@bp.doc(
    security="TokenAuth",
    summary="Download database file",
    description="Download binary database file",
)
def download_database(id: int):
    try:
        if database := Database.find_by_id_and_owner(id, owner_id=get_jwt_identity()):
            filepath = database.absolute_path()
            file = open(filepath, "rb")
            return (
                send_file(
                    file,
                    as_attachment=True,
                    download_name=database.name + ".db",
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
        return abort(500, str(e))
