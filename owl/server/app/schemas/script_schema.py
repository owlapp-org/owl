from dataclasses import field
from typing import Optional

from apiflask.validators import Length
from marshmallow import ValidationError, post_load
from marshmallow_dataclass import dataclass


@dataclass
class ScriptOut:
    id: int = field()
    path: str = field()
    name: str = field()
    extension: str = field()


@dataclass
class ScriptContentOut:
    content: str = field()


@dataclass
class CreateScriptIn:
    name: str = field(metadata={"validate": Length(min=5)})
    content: Optional[str] = field(default=None)

    @post_load
    def name_must_end_with_sql(self, data, **kwargs):
        if not data.get("name").endswith(".sql"):
            raise ValidationError("File name must end with .sql")
        return data


@dataclass
class UpdateScriptIn:
    name: Optional[str] = field(metadata={"required": False})
    content: Optional[str] = field(metadata={"required": False})

    @post_load
    def name_must_end_with_sql(self, data, **kwargs):
        if data.get("name") and not data.get("name").endswith(".sql"):
            raise ValidationError("File name must end with .sql")
        return data
