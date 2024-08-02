from typing import Optional

from app.settings import settings
from pydantic import BaseModel


class AppConfigSchema(BaseModel):
    google_login: Optional[bool] = False
    production: Optional[bool] = False

    @classmethod
    def from_settings(cls) -> "AppConfigSchema":
        return cls(
            production=settings.PRODUCTION,
            google_login=settings.GOOGLE_OAUTH_ENABLED,
        )
