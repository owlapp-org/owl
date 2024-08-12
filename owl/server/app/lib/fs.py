import os

from app.settings import settings


def with_storage_path(path: str) -> str:
    if path.startswith(settings.STORAGE_BASE_PATH):
        return path
    return os.path.join(settings.STORAGE_BASE_PATH, path)
