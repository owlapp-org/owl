from dataclasses import field

from apiflask.validators import Email, Length
from marshmallow_dataclass import dataclass


@dataclass
class LoginIn:
    email: str = field(metadata={"required": True, "validate": Email()})
    password: str = field(metadata={"required": True, "validate": Length(min=1)})


@dataclass
class LoginOut:
    email: str = field(metadata={"required": True, "validate": Email()})
    name: str = field(metadata={"required": True})
    access_token: str = field(metadata={"required": True})
