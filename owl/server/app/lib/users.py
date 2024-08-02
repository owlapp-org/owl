import logging
import os

from app.settings import settings

logger = logging.getLogger(__name__)


def create_user_paths(user_id: int):
    user_path = os.path.join(settings.STORAGE_BASE_PATH, "users", user_id)
    paths = [
        user_path,
        os.path.join(user_path, "databases"),
        os.path.join(user_path, "files"),
    ]
    for path in paths:
        logger.debug(f"Creating path {path}")
        os.mkdir(path)
