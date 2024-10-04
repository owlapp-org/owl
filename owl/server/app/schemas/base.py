from dataclasses import field
from typing import Optional

from apiflask.validators import Email
from marshmallow_dataclass import dataclass


@dataclass
class ExistsOut:
    exists: bool = field()


@dataclass
class MessageOut:
    message: str = field()


@dataclass
class EmailIn:
    email: str = field(metadata={"validate": Email()})


@dataclass
class ContentOut:
    content: str = field()


@dataclass
class RenderContentIn:
    content: str = field()
    command: Optional[str] = field()


@dataclass
class RenderContentOut:
    content: str = field()
