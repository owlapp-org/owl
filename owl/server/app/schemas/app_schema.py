from dataclasses import field
from datetime import datetime
from typing import Optional

from app import buildinfo
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


@dataclass
class AppAboutOut:
    version: Optional[str] = field(default="unknown")
    last_commit_date: Optional[datetime] = field(default=None)
    last_commit_hash: Optional[str] = field(default="unknown")

    @classmethod
    def from_buildinfo(cls) -> "AppConfigOut":
        last_commit_date = datetime.strptime(
            buildinfo.LAST_COMMIT_DATE, "%a %b %d %H:%M:%S %Y %z"
        )
        return cls(
            version=buildinfo.VERSION,
            last_commit_date=last_commit_date,
            last_commit_hash=buildinfo.LAST_COMMIT_HASH,
        )
