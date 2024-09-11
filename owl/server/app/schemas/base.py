from dataclasses import field
from typing import Any

from apiflask.validators import Email
from marshmallow_dataclass import dataclass
from pydantic import BaseModel


@dataclass
class ExistsOut:
    exists: bool = field()


@dataclass
class MessageOut:
    message: str = field()


@dataclass
class EmailIn:
    email: str = field(metadata={"validate": Email()})


class BaseSchema(BaseModel):
    @classmethod
    def validate_and_dump(cls, value: any) -> dict[str, Any]:
        return cls.model_validate(value).model_dump()
