from dataclasses import field
from typing import Optional

from app.settings import settings
from marshmallow_dataclass import dataclass


@dataclass
class AppConfigOut:
    google_login: Optional[bool] = field(default=False)
    production: Optional[bool] = field(default=False)

    @classmethod
    def from_settings(cls) -> "AppConfigOut":
        return cls(
            production=settings.PRODUCTION,
            google_login=settings.GOOGLE_OAUTH_ENABLED,
        )
