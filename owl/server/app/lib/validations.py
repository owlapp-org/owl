import logging
import os
from textwrap import dedent

from app.settings import settings

logger = logging.getLogger(__name__)

LOG_PATH_NOTFOUND_ERROR = dedent(
    f"""
    ! Log path "{settings.LOG_PATH}" does not exist.
    Did you initialize the application?

    Run the following command to init app.
    > owl init all
"""
)

STORAGE_PATH_NOTFOUND_ERROR = dedent(
    f"""
    ! Storage path "{settings.STORAGE_BASE_PATH}" does not exist.
    Did you initialize the application?

    Run the following command to init app.
    > owl init all
"""
)

STORAGE_PATH_NOTSET_ERROR = dedent(
    """
Storage path env variable is not set! see `STORAGE_BASE_PATH`
You can set it in .env file or export it as environment variable.
"""
)
LOG_PATH_NOTSET_ERROR = dedent(
    """
Log path env variable is not set! see `LOG_PATH`
You can set it in .env file or export it as environment variable.
"""
)


def is_log_path_exists() -> bool:
    logger.debug(f"Checking if log path exists. {settings.LOG_PATH}")
    return os.path.exists(settings.LOG_PATH)


def is_storage_path_exists() -> bool:
    logger.debug(f"Checking if storage path exists. {settings.STORAGE_BASE_PATH}")
    return os.path.exists(settings.STORAGE_BASE_PATH)


def validate_setup() -> str | None:
    if not settings.STORAGE_BASE_PATH:
        return STORAGE_PATH_NOTSET_ERROR
    if not settings.LOG_PATH:
        return LOG_PATH_NOTSET_ERROR
    if not is_log_path_exists():
        return LOG_PATH_NOTFOUND_ERROR
    if not is_storage_path_exists():
        return STORAGE_PATH_NOTFOUND_ERROR
