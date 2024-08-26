from typing import Any

from pydantic import BaseModel


class BaseSchema(BaseModel):
    @classmethod
    def validate_and_dump(cls, value: any) -> dict[str, Any]:
        return cls.model_validate(value).model_dump()
