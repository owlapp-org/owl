from typing import Optional

from pydantic import BaseModel, ConfigDict, ValidationInfo, field_validator, validator


class ScriptSchema(BaseModel, extra="ignore"):
    model_config = ConfigDict(from_attributes=True)
    id: int
    path: str
    name: str
    extension: str


class ScriptInputSchema(BaseModel, extra="ignore"):
    name: str
    content: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_must_end_with_sql(cls, value: str, info: ValidationInfo):
        assert value.endswith(".sql"), f"{info.field_name} must end with .sql"
        return value
