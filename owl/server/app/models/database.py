import logging
import os
import uuid

import duckdb
import jinja2
import pydash as _
import sqlparse
from app.constants import StatementType
from app.errors.errors import (
    ModelNotFoundException,
    MultipleStatementsNotAllowedError,
    NotAuthorizedError,
    QueryParseError,
    StoragePathExists,
)
from app.lib.database.registry import registry
from app.lib.database.validation import validate_query
from app.models.base import TimestampMixin, db
from app.schemas import ExecutionResult, UpdateDatabaseInputSchema
from app.settings import settings
from duckdb import DuckDBPyConnection
from flask import json
from sqlalchemy import JSON, Column, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlparse.sql import Statement as SqlParseStatement

logger = logging.getLogger(__name__)


class Database(TimestampMixin, db.Model):
    __tablename__ = "databases"
    __table_args__ = (UniqueConstraint("name", "owner_id", name="_name_owner_uc"),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    config = Column(JSON, nullable=True)
    description = Column(String, nullable=True)
    path = Column(String, nullable=True)

    pool_size = Column(Integer, nullable=True, default=1)

    owner = relationship("User", back_populates="databases")

    def __str__(self) -> str:
        return json.dumps(
            {
                "id": self.id,
                "name": self.name,
                "owner_id": self.owner_id,
            }
        )

    def abs_path(self) -> str:
        return os.path.join(settings.STORAGE_BASE_PATH, self.path)

    @classmethod
    def find_by_id(cls, id: int) -> "Database":
        return cls.query.filter(cls.id == id).one_or_none()

    @classmethod
    def find_all(cls) -> list["Database"]:
        return cls.query.all()

    @classmethod
    def find_by_owner(cls, id: int) -> list["Database"]:
        return cls.query.filter(cls.owner_id == id).all()

    @classmethod
    def delete_by_id(cls, id: int, owner_id: int = None) -> "Database":
        database = cls.query.filter(
            cls.id == id and cls.owner_id == owner_id
        ).one_or_none()
        if not database:
            raise ModelNotFoundException()

        db.session.delete(database)
        db.session.commit()
        registry.remove(database.id)
        path = os.path.join(settings.STORAGE_BASE_PATH, database.path)
        try:
            os.remove(path)
        except FileNotFoundError:
            logger.warning(
                "File not found: %s. Database might be never accessed." % path
            )

    def set_path(self):
        self.path = os.path.join(
            "users",
            str(self.owner_id),
            "databases",
            str(self.id),
            self.name + "." + str(uuid.uuid4()) + ".db",
        )
        return self

    def update(self, database: UpdateDatabaseInputSchema) -> "Database":
        if database.name:
            self.name = database.name
        if database.description:
            self.description = database.description
        if not database.pool_size or database.pool_size == self.pool_size:
            return self

        if pool := registry.get(self.id):
            pool.reset_pool_size(database.pool_size)

        return self

    def create(self):
        try:
            db.session.add(self)
            db.session.flush()
            self.set_path()
            database_path = os.path.join(
                settings.STORAGE_BASE_PATH,
                self.path,
            )
            directories = database_path.rsplit(os.sep, 1)[0]
            if os.path.exists(directories):
                raise StoragePathExists()
            os.makedirs(directories)
            db.session.commit()
            return self
        except Exception as e:
            logger.error("Error creating database: %s", str(e))
            db.session.rollback()
            raise e

    @classmethod
    def resolve_query_template(cls, query: str, owner_id: int) -> str:
        files_path = os.path.join(
            settings.STORAGE_BASE_PATH, "users", str(owner_id), "files"
        )
        query = jinja2.Template(query).render(files=files_path)
        return query

    @classmethod
    def run(
        cls, id: int | None, query: str, owner_id: int, **kwargs
    ) -> ExecutionResult:
        logger.debug("Received query", extra=query)

        query = _.chain(query).trim().trim_end(";").value()
        query = cls.resolve_query_template(validate_query(query), owner_id)

        statements = sqlparse.parse(query)
        if len(statements) == 0:
            raise QueryParseError(f"Failed to parse query {query}")
        if len(statements) > 1:
            print(statements)
            raise MultipleStatementsNotAllowedError("Multiple statements not allowed")

        statement = statements[0]
        # todo check dialect specific options
        # if statement_type == "UNKNOWN":
        #     raise QueryParseError(f"Failed to parse query {query}")

        if id is not None:
            database = cls.find_by_id(id)
        else:
            # run select only in-memory queries
            database = cls(id=None)

        if id is not None and not database:
            raise ModelNotFoundException()
        if id is not None and owner_id is not None and database.owner_id != owner_id:
            raise NotAuthorizedError(
                "You are not authorized to delete database that is not owned by you!"
            )
        if id is None and statement.get_type() != "SELECT":
            raise Exception(
                "Only select statement is supported for in memory database."
            )
        if id is None:
            return database.run_query(conn=duckdb, statement=statement, **kwargs)

        pool = registry.get(database.id, database)
        if not pool:
            raise ConnectionError(
                f"Failed to establish connection to database, {database}"
            )
        with pool.acquire_connection() as conn:
            if statement.get_type() == "SELECT":
                return database.run_query(conn=conn, statement=statement, **kwargs)
            else:
                return database.run_execute(conn=conn, statement=statement)

    def run_execute(
        self, conn: DuckDBPyConnection, statement: SqlParseStatement
    ) -> ExecutionResult:
        statement_type = statement.get_type()
        result = conn.execute(str(statement))
        conn.commit()
        if statement_type in [
            StatementType.INSERT,
            StatementType.UPDATE,
            StatementType.DELETE,
        ]:
            return ExecutionResult(
                database_id=self.id,
                query=str(statement),
                statement_type=statement_type,
                affected_rows=result.fetchone()[0],
            )
        else:
            return ExecutionResult(
                database_id=self.id,
                query=str(statement),
                statement_type=statement_type,
            )

    def run_query(
        self,
        conn: DuckDBPyConnection,
        statement: SqlParseStatement,
        start_row: int = 0,
        end_row: int = settings.result_set_hard_limit,
        with_total_count: bool = True,
    ) -> ExecutionResult:

        offset = start_row
        limit = end_row - start_row
        query_wrapper = (
            f"select * from ({statement}) order by * LIMIT {limit} OFFSET {offset}"
        )
        df = conn.execute(query_wrapper).pl()

        if with_total_count:
            total_count_query = f"select count(*) from ({statement})"
            total_count = conn.execute(total_count_query).fetchone()[0]
        else:
            total_count = None

        return ExecutionResult(
            database_id=self.id,
            query=str(statement),
            statement_type=StatementType.SELECT,
            data=df.to_dicts(),
            columns=df.columns,
            total_count=total_count,
            start_row=start_row,
            end_row=end_row,
        )
