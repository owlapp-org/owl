from dataclasses import field
from typing import Optional

from apiflask.validators import Email
from marshmallow import EXCLUDE, ValidationError, post_load
from marshmallow_dataclass import dataclass


@dataclass
class UserOut:
    id: int = field(metadata={"required": True})
    name: str = field(metadata={"required": True})
    email: str = field(metadata={"required": True, "validate": Email()})

    class Meta:
        unknown = EXCLUDE


@dataclass
class UpdateUserIn:
    name: Optional[str] = field()
    password: Optional[str] = field()

    @post_load
    def check_at_least_one_argument(self, data, **kwargs):
        if not any([data.get("name"), data.get("password")]):
            raise ValidationError("At least one argument must be provided.")
        return data
