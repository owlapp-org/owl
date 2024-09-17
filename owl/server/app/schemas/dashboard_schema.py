from dataclasses import field
from typing import Optional

from apiflask.validators import Length
from app.constants import ALLOWED_DASHBOARDFILE_EXTENSIONS, ALLOWED_MACROFILE_EXTENSIONS
from marshmallow import ValidationError, post_load
from marshmallow_dataclass import dataclass


@dataclass
class DashboardFileOut:
    id: int = field()
    path: str = field()
    name: str = field()
    extension: str = field()


@dataclass
class DashboardFileIn:
    name: str = field(metadata={"validate": Length(min=4)})
    content: Optional[str] = field(default=None)

    @post_load
    def name_must_end_with(self, data, **kwargs):
        if not data.get("name"):
            return data
        extension = data.get("name").split(".")[-1]
        if extension not in ALLOWED_DASHBOARDFILE_EXTENSIONS:
            raise ValidationError(
                f"File name must end with {ALLOWED_DASHBOARDFILE_EXTENSIONS}"
            )
        return data


@dataclass
class CreateDashboardFileIn(DashboardFileIn):
    pass


@dataclass
class UpdateDashboardFileIn(DashboardFileIn):
    name: Optional[str] = field(metadata={"validate": Length(min=4)})
