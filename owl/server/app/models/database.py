import logging
import os
import tempfile
import uuid
from contextlib import contextmanager
from typing import Any, Generator, Optional

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
from app.macros.index import default_macros
from app.macros.macros import gen__read_script_file
from app.models.base import TimestampMixin, db
from app.models.mixins.user_space_mixin import UserSpaceMixin
from app.schemas.database_schema import RunOut
from app.settings import settings
from duckdb import DuckDBPyConnection
from flask import json
from sqlalchemy import JSON, Column, ForeignKey, Integer, String, UniqueConstraint, and_
from sqlalchemy.orm import relationship
from sqlparse.sql import Statement as SqlParseStatement

logger = logging.getLogger(__name__)


class Database(TimestampMixin, UserSpaceMixin["Database"], db.Model):
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
        return cls.query.filter(cls.owner_id == id).order_by(cls.path).all()

    @classmethod
    def find_by_id_and_owner(cls, id: int, owner_id: int) -> "Database":
        return cls.query.filter(
            and_(cls.id == id, cls.owner_id == owner_id)
        ).one_or_none()

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

    def update(
        self,
        name: Optional[str] = None,
        pool_size: Optional[int] = None,
        description: Optional[str] = None,
    ) -> "Database":
        if name:
            self.name = name
        if description:
            self.description = description

        if not pool_size or pool_size == self.pool_size:
            return self

        self.pool_size = pool_size
        if pool := registry.get(self.id):
            pool.reset_pool_size(pool_size)

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
        from app.models import MacroFile

        macro_files = MacroFile.find_by_owner(id=owner_id) or []
        combined_macro_files_content = "\n".join([c.read_file() for c in macro_files])

        files_path = os.path.join(
            settings.STORAGE_BASE_PATH, "users", str(owner_id), "files"
        )

        template_base = "\n".join(
            [
                default_macros(),
                combined_macro_files_content,
            ]
        )

        text = "\n".join([template_base, query])
        # todo 2- dag implementation / better solution
        for __ in range(settings.MAX_MACRO_RESOLVE_DEPTH):
            text = "\n".join([template_base, text])
            text = jinja2.Template(text).render(
                files=files_path,
                read_script_file=gen__read_script_file(owner_id=owner_id),
            )
            if "{{" not in text:
                break
        return text

    @classmethod
    def run(
        cls,
        id: int | None,
        query: str,
        owner_id: int,
        **kwargs,
    ) -> RunOut:
        logger.debug("Received query", extra={"query": query})
        query = _.chain(query).trim().trim_end(";").value()
        query = cls.resolve_query_template(validate_query(query), owner_id)

        statements = sqlparse.parse(query)
        if len(statements) == 0:
            raise QueryParseError(f"Failed to parse query {query}")
        if len(statements) > 1:
            raise MultipleStatementsNotAllowedError("Multiple statements not allowed")

        statement = statements[0]
        # todo check dialect specific options
        # if statement_type == "UNKNOWN":
        #     raise QueryParseError(f"Failed to parse query {query}")

        if id is not None:
            database = cls.find_by_id_and_owner(id, owner_id=owner_id)
            if not database:
                raise ModelNotFoundException("Database not found")
        else:
            # run select only in-memory queries
            database = cls(id=None)

        if id is None and statement.get_type() != "SELECT":
            raise Exception(
                "Only select statement is supported for in memory database."
            )

        # execute using im-memory database
        if id is None:
            return database.run_query(conn=duckdb, statement=statement, **kwargs)

        # execute using a database
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
        self, conn: DuckDBPyConnection, statement: SqlParseStatement, **kwargs
    ) -> RunOut:
        statement_type = statement.get_type()
        result = conn.execute(str(statement))
        conn.commit()
        if statement_type in [
            StatementType.INSERT,
            StatementType.UPDATE,
            StatementType.DELETE,
        ]:
            return RunOut(
                database_id=self.id,
                query=str(statement),
                statement_type=statement_type,
                affected_rows=result.fetchone()[0],
            )
        else:
            return RunOut(
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
        **kwargs,
    ) -> RunOut:

        offset = start_row
        limit = end_row - start_row
        query_wrapper = f"select * from ({statement}) order by * LIMIT {limit} OFFSET {offset}"  # nosec B608
        df = conn.execute(query_wrapper).pl()

        if with_total_count:
            total_count_query = f"select count(*) from ({statement})"  # nosec B608
            total_count = conn.execute(total_count_query).fetchone()[0]
        else:
            total_count = None

        return RunOut(
            database_id=self.id,
            query=str(statement),
            statement_type=StatementType.SELECT,
            data=df.to_dicts(),
            columns=df.columns,
            total_count=total_count,
            start_row=start_row,
            end_row=end_row,
        )

    @classmethod
    @contextmanager
    def export(
        cls,
        id: int | None,
        owner_id: int,
        query: str,
        filename: str,
        _file_type: str = "CSV",
        options: dict[str, Any] = None,
    ) -> Generator[str, None, None]:

        logger.debug("Received query", extra={"query": query})

        opts = []
        options = options or {}
        if options.get("compress", False):
            opts.append("compression gzip")

        delimiter = options.get("delimiter", ",")
        header = options.get("header", True)
        quote = options.get("quote", '"')
        escape_quote = options.get("escape_quote", '"')
        date_format = options.get("date_format", "%Y.%m.%d %H:%M:%s")

        delimiter and opts.append(f"delimiter '{delimiter}'")
        opts.append(f"header {header}")
        quote and opts.append(f"quote '{quote}'")
        escape_quote and opts.append(f"escape '{escape_quote}'")
        date_format and opts.append(f"dateformat '{date_format}'")

        with tempfile.TemporaryDirectory() as temp_dir:
            print(temp_dir, filename)
            filepath = os.path.join(temp_dir, filename)
            sql = f"""
                copy ({query}) to '{filepath}' ({",".join(opts)})
            """
            logger.debug(f"=== Raw SQL ===\n{sql}")
            sql = _.chain(sql).trim().trim_end(";").value()
            sql = cls.resolve_query_template(validate_query(sql), owner_id)
            logger.debug(f"=== Resolved SQL ===\n{sql}")
            print(sql)
            # todo funtionalize this pattern
            if id is not None:
                database = cls.find_by_id_and_owner(id, owner_id=owner_id)
                if not database:
                    raise ModelNotFoundException("Database not found")

                pool = registry.get(database.id, database)
                if not pool:
                    raise ConnectionError(
                        f"Failed to establish connection to database, {database}"
                    )
                with pool.acquire_connection() as conn:
                    conn.execute(sql)
            else:
                duckdb.execute(sql)

            yield filepath
