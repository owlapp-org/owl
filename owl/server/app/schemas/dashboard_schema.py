from dataclasses import field
from typing import Optional

from apiflask.validators import Length
from app.constants import ALLOWED_MACROFILE_EXTENSIONS
from marshmallow import ValidationError, post_load
from marshmallow_dataclass import dataclass


@dataclass
class DashboardOut:
    id: int = field()
    path: str = field()
    name: str = field()
    extension: str = field()
