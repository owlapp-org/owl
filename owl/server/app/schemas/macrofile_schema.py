from dataclasses import field
from typing import Optional

from apiflask.validators import Length
from app.constants import ALLOWED_MACROFILE_EXTENSIONS
from marshmallow import ValidationError, post_load
from marshmallow_dataclass import dataclass


@dataclass
class MacroFileOut:
    id: int = field()
    path: str = field()
    name: str = field()
    extension: str = field()


@dataclass
class MacroFileContentOut:
    content: str = field()


@dataclass
class CreateMacroFileIn:
    name: str = field(metadata={"validate": Length(min=4)})
    content: Optional[str] = field(default=None)

    @post_load
    def name_must_end_with_sql(self, data, **kwargs):
        if not data.get("name"):
            return data
        extension = data.get("name").split(".")[-1]
        if extension not in ALLOWED_MACROFILE_EXTENSIONS:
            raise ValidationError("File name must end with .sql")
        return data


@dataclass
class UpdateMacroFileIn:
    name: Optional[str] = field(metadata={"required": False})
    content: Optional[str] = field(metadata={"required": False})

    @post_load
    def name_must_end_with_sql(self, data, **kwargs):
        if not data.get("name"):
            return data
        extension = data.get("name").split(".")[-1]
        if extension not in ALLOWED_MACROFILE_EXTENSIONS:
            raise ValidationError("File name must end with .sql")
        return data
