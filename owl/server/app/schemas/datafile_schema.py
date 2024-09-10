from dataclasses import field

from marshmallow_dataclass import dataclass


@dataclass
class DataFileOut:
    id: int = field()
    path: str = field()
    name: str = field()
    extension: str = field()


@dataclass
class UpdateDataFileIn:
    name: str = field()
