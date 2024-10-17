import logging
import os
from textwrap import dedent

from app.settings import settings

logger = logging.getLogger(__name__)


def is_log_path_exists() -> bool:
    logger.debug(f"Checking if log path exists. {settings.LOG_PATH}")
    return os.path.exists(settings.LOG_PATH)


def is_storage_path_exists() -> bool:
    logger.debug(f"Checking if storage path exists. {settings.STORAGE_BASE_PATH}")
    return os.path.exists(settings.STORAGE_BASE_PATH)


def validate_setup() -> str | None:
    if not is_log_path_exists():
        return dedent(
            f"""
            ! Log path "{settings.LOG_PATH}" does not exist.
            Did you initialize the application?

            Run the following command to init app.
            > owl init all
        """
        )
    if not is_storage_path_exists():
        return dedent(
            f"""
            ! Storage path "{settings.STORAGE_BASE_PATH}" does not exist.
            Did you initialize the application?

            Run the following command to init app.
            > owl init all
        """
        )
