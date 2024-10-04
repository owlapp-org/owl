from dataclasses import field
from typing import Any, Optional

from apiflask.validators import Length, OneOf, Range
from app.constants import StatementType
from app.schemas.user_schema import UserOut
from app.settings import settings
from marshmallow import ValidationError, post_load
from marshmallow_dataclass import dataclass


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


@dataclass
class RunQuery:
    database_id: Optional[int] = field(
        default=None,
        metadata={
            "required": False,
            "validate": Range(min=1),
        },
    )
    start_row: Optional[int] = field(
        default=0,
        metadata={
            "validate": Range(min=0),
            "required": False,
        },
    )
    end_row: Optional[int] = field(
        default=settings.DEFAULT_SELECT_PAGE_SIZE or settings.result_set_hard_limit,
        metadata={
            "validate": Range(min=1),
            "required": False,
        },
    )
    with_total_count: Optional[bool] = field(
        default=True,
        metadata={"required": False},
    )


@dataclass
class RunIn:
    query: str = field(metadata={"required": True, "validate": Length(min=1)})


@dataclass
class ExportQuery:
    database_id: Optional[int] = field(metadata={"required": False})


@dataclass
class ExportIn:
    query: str = field(metadata={"required": True, "validate": Length(min=7)})
    file_type: str = field(
        default="CSV",
        metadata={"required": True, "validate": OneOf("CSV")},
    )
    filename: str = (field(metadata={"required": True}, default="owl-export.dat"),)
    options: Optional[dict[str, Any]] = field(
        default_factory=dict, metadata={"required": False}
    )


@dataclass
class RunOut:
    query: str = field(
        metadata={
            "required": True,
            "validate": Length(min=1),
            "description": "Query to run",
        }
    )
    database_id: Optional[int] = field(default=None, metadata={"required": False})
    statement_type: Optional[str] = field(
        default=StatementType.UNKNOWN,
        metadata={
            "required": False,
            "description": "Query to run",
        },
    )
    data: Optional[list[dict[str, Any]]] = field(default=None)
    columns: Optional[list[str]] = field(default=None)
    affected_rows: Optional[int] = field(default=None)
    total_count: Optional[int] = field(default=None)
    start_row: Optional[int] = field(default=None)
    end_row: Optional[int] = field(default=None)
