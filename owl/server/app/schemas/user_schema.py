from typing import Optional

from app.schemas.base import BaseSchema
from pydantic import ConfigDict, model_validator


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
