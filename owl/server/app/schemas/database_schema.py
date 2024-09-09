from typing import Any, Optional

from apiflask import Schema, fields
from app.schemas.user_schema import UserOut, UserSchema
from pydantic import BaseModel, ConfigDict


class DatabaseOut(Schema):
    id = fields.Integer()
    name = fields.String()
    pool_size = fields.Integer()
    owner = fields.Nested(UserOut)
    description = fields.String()

    class Meta:
        unknown = "exclude"


class CreateDatabaseIn(Schema):
    name = fields.String()
    pool_size = fields.Integer()
    description = fields.String()


class DatabaseSchema(BaseModel, extra="ignore"):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    pool_size: int
    owner: UserSchema
    description: str


class CreateDatabaseInputSchema(BaseModel):
    name: str
    pool_size: int
    description: str


class UpdateDatabaseInputSchema(BaseModel, extra="ignore"):
    name: Optional[str] = None
    pool_size: Optional[int] = None
    description: Optional[str] = None


class QueryDatabaseInputSchema(BaseModel):
    query: str


class ExecutionResult(BaseModel):
    database_id: Optional[int] = None
    query: str
    statement_type: Optional[str] = "UNKNOWN"
    data: Optional[list[dict[str, Any]]] = None
    columns: Optional[list[str]] = None
    affected_rows: Optional[int] = None
    total_count: Optional[int] = None
    start_row: Optional[int] = None
    end_row: Optional[int] = None
