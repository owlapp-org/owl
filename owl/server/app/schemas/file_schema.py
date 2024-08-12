from pydantic import BaseModel, ConfigDict


class FileSchema(BaseModel, extra="ignore"):
    model_config = ConfigDict(from_attributes=True)
    id: int
    path: str
    name: str
    extension: str
