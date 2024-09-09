from dataclasses import field
from typing import Any

from marshmallow_dataclass import dataclass
from pydantic import BaseModel


@dataclass
class IdSchema:
    id: int = field()


class BaseSchema(BaseModel):
    @classmethod
    def validate_and_dump(cls, value: any) -> dict[str, Any]:
        return cls.model_validate(value).model_dump()
