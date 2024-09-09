from dataclasses import field
from typing import Optional

from apiflask.validators import Email
from app.schemas.base import BaseSchema
from marshmallow import EXCLUDE
from marshmallow_dataclass import dataclass
from pydantic import ConfigDict, model_validator


@dataclass
class UserOut:
    id: int = field(metadata={"required": True})
    name: str = field(metadata={"required": True})
    email: str = field(metadata={"required": True, "validate": Email()})

    class Meta:
        unknown = EXCLUDE


class UserSchema(BaseSchema):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str


class UpdateUserInputSchema(BaseSchema, extra="ignore"):
    model_config = ConfigDict(from_attributes=True)
    name: Optional[str] = None
    password: Optional[str] = None

    @model_validator(mode="after")
    def check_at_least_one_field(self):
        if not self.name and self.password is None:
            raise ValueError("No attributes specified to update")
        return self
