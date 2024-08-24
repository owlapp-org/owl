from pydantic import BaseModel, ConfigDict


class ScriptSchema(BaseModel, extra="ignore"):
    model_config = ConfigDict(from_attributes=True)
    id: int
    path: str
    name: str
    extension: str


class ScriptInputSchema(BaseModel, extra="ignore"):
    name: str
