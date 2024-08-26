from app.schemas.base import BaseSchema
from pydantic import BaseModel, ConfigDict


class DataFileOutputSchema(BaseSchema, extra="ignore"):
    model_config = ConfigDict(from_attributes=True)
    id: int
    path: str
    name: str
    extension: str


class UpdateDataFileInputSchema(BaseModel, extra="ignore"):
    name: str
