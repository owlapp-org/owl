from typing import Optional

from app.schemas.base import BaseSchema
from pydantic import (
    BaseModel,
    ConfigDict,
    ValidationInfo,
    field_validator,
    model_validator,
)


class ScriptOutputSchema(BaseSchema, extra="ignore"):
    model_config = ConfigDict(from_attributes=True)
    id: int
    path: str
    name: str
    extension: str


class CreateScriptInputSchema(BaseModel, extra="ignore"):
    name: str
    content: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_must_end_with_sql(cls, value: str, info: ValidationInfo):
        assert value.endswith(".sql"), f"{info.field_name} must end with .sql"
        return value


class UpdateScriptInputSchema(BaseModel, extra="ignore"):
    name: Optional[str] = None
    content: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_must_end_with_sql(cls, value: str, info: ValidationInfo):
        assert value.endswith(".sql"), f"{info.field_name} must end with .sql"
        return value

    @model_validator(mode="after")
    def check_at_least_one_field(self):
        if not self.name and self.content is None:
            raise ValueError("No attributes specified to update")
        return self
