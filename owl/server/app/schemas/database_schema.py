from typing import Any, Optional

from app.schemas.user_schema import UserSchema
from pydantic import BaseModel, ConfigDict


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
    statement_type: Optional[str] = "UNKNOWN"
    data: Optional[list[dict[str, Any]]] = None
    columns: Optional[list[str]] = None
    affected_rows: Optional[int] = None
