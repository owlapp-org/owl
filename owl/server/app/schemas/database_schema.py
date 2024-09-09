from dataclasses import field
from typing import Any, Optional

from apiflask import Schema, fields
from apiflask.validators import Length
from app.schemas.user_schema import UserOut, UserSchema
from marshmallow import ValidationError, post_load
from marshmallow_dataclass import dataclass
from pydantic import BaseModel, ConfigDict


@dataclass
class DatabaseOut:
    id: int = field()
    name: str = field()
    pool_size: int = field()
    owner: UserOut = field()
    description: Optional[str] = field(default=None)


@dataclass
class CreateDatabaseIn:
    name: str = field(metadata={"required": True, "validate": Length(min=1)})
    pool_size: Optional[int] = field(
        metadata={
            "required": False,
        },
        default=1,
    )
    description: Optional[str] = field(
        metadata={
            "required": False,
        },
        default=None,
    )


@dataclass
class UpdateDatabaseIn:
    name: Optional[str] = field(metadata={"required": False})
    pool_size: Optional[int] = field(
        metadata={
            "required": False,
        },
        default=1,
    )
    description: Optional[str] = field(
        metadata={
            "required": False,
        },
        default=None,
    )

    @post_load
    def check_at_least_one_argument(self, data, **kwargs):
        if not any([data.get("name"), data.get("pool_size"), data.get("description")]):
            raise ValidationError("At least one argument must be provided.")
        return data


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
