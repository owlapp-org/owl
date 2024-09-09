from typing import List, Optional

from apiflask import APIBlueprint, abort
from apiflask.fields import Integer
from app.errors.errors import ModelNotFoundException, NotAuthorizedError
from app.models import db
from app.models.database import Database
from app.schemas import (
    DatabaseSchema,
    QueryDatabaseInputSchema,
    UpdateDatabaseInputSchema,
)
from app.schemas.database_schema import CreateDatabaseIn, DatabaseOut, UpdateDatabaseIn
from app.settings import settings
from flask import jsonify, make_response, request, send_file
from flask_jwt_extended import get_jwt_identity

bp = APIBlueprint("databases", __name__, tag="Databases")


@bp.route("/")
@bp.output(
    DatabaseOut.Schema(many=True), status_code=200, description="List of databases"
)
@bp.doc(security="TokenAuth")
@bp.doc("Returns list of databases owned by the authenticated user.")
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
@bp.output(dict, status_code=200)
@bp.doc(
    security="TokenAuth",
    summary="Delete database",
    description="Delete database by id which is owned by authenticated user",
)
def delete_database(id: int):
    try:
        Database.delete_by_id(id, owner_id=get_jwt_identity())
    except ModelNotFoundException:
        return make_response(f"Database with id {id} not found"), 403
    except NotAuthorizedError as e:
        return make_response(str(e)), 403

    return jsonify({"message": "Database deleted successfully"}), 200


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
@bp.route("/<int:id>/run", methods=["POST"])
def run(id: Optional[int] = None):
    schema = QueryDatabaseInputSchema.model_validate(request.json)

    start_row = request.args.get("start_row", default=0, type=int)
    end_row = request.args.get(
        "end_row",
        default=settings.DEFAULT_SELECT_PAGE_SIZE or settings.result_set_hard_limit,
        type=int,
    )
    with_total_count = request.args.get(
        "with_total_count",
        default=True,
        type=bool,
    )

    owner_id = get_jwt_identity()
    try:
        result = Database.run(
            id=id,
            owner_id=owner_id,
            query=schema.query,
            start_row=start_row,
            end_row=end_row,
            with_total_count=with_total_count,
        )
        return result.model_dump(), 200
    except ModelNotFoundException:
        make_response("Database not found"), 404
    except NotAuthorizedError:
        return (
            make_response("Not authorized to execute the query on this database"),
            403,
        )
    except Exception as e:
        return make_response(str(e)), 500


@bp.route("/<int:id>/download", methods=["GET"])
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
            return make_response("File not found"), 404
    except FileNotFoundError:
        return make_response("File not found"), 404
    except Exception as e:
        print(str(e))
        return make_response(str(e)), 500
