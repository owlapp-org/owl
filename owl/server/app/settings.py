import os
import secrets
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings, extra="ignore"):
    """Application settings.
    Only uppercase variables can be configured on the .env file
    """

    model_config = SettingsConfigDict(
        env_file=os.environ.get("OWL_ENV_FILE", ".env"),
        env_file_encoding="utf-8",
    )

    google_discovery_url: str = (
        "https://accounts.google.com/.well-known/openid-configuration"
    )

    # todo: pagination
    # Until we start supporting pagination, we limit the number of
    # records per SELECT query result for performance reasons.
    result_set_hard_limit: int = 1_000

    def generate_env_content(self) -> str:
        """Generates string content for your .env file."""
        from inspect import cleandoc
        from textwrap import indent

        content: list[str] = []
        for key, field in self.model_fields.items():
            if not key.isupper():
                continue
            if (
                str(field.annotation) == "typing.Optional[str]"
                and field.default is not None
            ):
                value = f'"{field.default}"'
            elif field.default is None:
                value = ""
            else:
                value = field.default

            if field.description:
                content.append(indent(cleandoc(field.description), "# "))
            if not value:
                content.append(f"# {key}={value}")
            else:
                content.append(f"{key}={value}")

            content.append("\n")

        return "\r\n".join(content)

    SECRET_KEY: Optional[str] = Field(
        description="The secret key for Flask sessions and JWT",
        default=secrets.token_urlsafe(32),
    )
    FLASK_DEBUG: Optional[bool] = Field(
        description="Whether Flask is in debug mode", default=False
    )

    # Google login
    GOOGLE_CLIENT_ID: Optional[str] = Field(
        description="The Google client ID", default=None
    )
    GOOGLE_CLIENT_SECRET: Optional[str] = Field(
        description="The Google client secret", default=None
    )
    GOOGLE_OAUTH_ENABLED: Optional[bool] = Field(
        description="Is Google Login enabled.", default=False
    )

    # Database
    SQLALCHEMY_DATABASE_URI: Optional[str] = Field(
        description="The URI for the database. Only Postgres and SQLite supported.",
        default=f"sqlite:///{os.getcwd()}/sqlite.db",
    )

    PRODUCTION: Optional[bool] = Field(
        description="Whether the app is in production mode", default=False
    )
    PUBLIC_URL: Optional[str] = Field(
        description="The public URL of the app", default=None
    )

    # Logging
    LOG_STDOUT: Optional[bool] = Field(
        description="Whether to log to stdout", default=False
    )
    LOG_FORMAT: Optional[str] = Field(
        description="The format of the logs",
        default="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
    LOG_LEVEL: Optional[str] = Field(
        description="The level of the logs", default="INFO"
    )

    STORAGE_BASE_PATH: Optional[str] = Field(
        description="Base path to store user files", default="storage"
    )

    FLASK_HOST: Optional[str] = Field(
        description="Host that flask is running on. Used in test containers.",
        default="flask",
    )

    DEFAULT_SELECT_PAGE_SIZE: Optional[int] = Field(
        description="Default page size for select queries.",
        default=None,
    )

    MAX_MACRO_RESOLVE_DEPTH: Optional[int] = Field(
        default=10,
        description="Maximum iterations to resolve macros. This is a temporary solution and will be replaced in the future.",
    )


settings = Settings()
