import logging
import os
import uuid

import pydash as _
import sqlparse
from app.errors.errors import (
    ModelNotFoundException,
    MultipleStatementsNotAllowedError,
    NotAuthorizedError,
    QueryParseError,
    StoragePathExists,
)
from app.lib.database.registry import registry
from app.models.base import TimestampMixin, db
from app.schemas import ExecutionResult, UpdateDatabaseInputSchema
from app.settings import settings
from flask import json
from sqlalchemy import JSON, Column, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

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
        database = cls.find_by_id(id)
        if not database:
            raise ModelNotFoundException()

        if owner_id is not None and database.owner_id != owner_id:
            raise NotAuthorizedError(
                "You are not authorized to delete database that is not owned by you!"
            )

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
    def execute(cls, id: int, query: str, owner_id: int) -> ExecutionResult:
        logger.debug("Received query", extra=query)

        query = _.chain(query).trim().trim_end(";").value()

        statements = sqlparse.parse(query)
        if len(statements) == 0:
            raise QueryParseError(f"Failed to parse query {query}")
        if len(statements) > 1:
            print(statements)
            raise MultipleStatementsNotAllowedError("Multiple statements not allowed")

        statement = statements[0]
        statement_type = statement.get_type()

        # todo check dialect specific options
        # if statement_type == "UNKNOWN":
        #     raise QueryParseError(f"Failed to parse query {query}")

        database = cls.find_by_id(id)
        if not database:
            raise ModelNotFoundException()
        if owner_id is not None and database.owner_id != owner_id:
            raise NotAuthorizedError(
                "You are not authorized to delete database that is not owned by you!"
            )

        pool = registry.get(database.id, database)
        if not pool:
            raise ConnectionError(
                f"Failed to establish connection to database, {database}"
            )

        with pool.acquire_connection() as conn:
            if statement_type == "SELECT":
                query_with_hard_limit = f"""
                    select * from ({query}) limit {settings.result_set_hard_limit}
                """
                df = conn.query(query_with_hard_limit).pl()
                return ExecutionResult(
                    statement_type=statement_type,
                    data=df.to_dicts(),
                    columns=df.columns,
                )

            result = conn.execute(query)
            conn.commit()
            if statement_type in ["INSERT", "UPDATE", "DELETE"]:
                return ExecutionResult(
                    statement_type=statement_type,
                    affected_rows=result.fetchone()[0],
                )
            else:
                return ExecutionResult(statement_type=statement_type)
