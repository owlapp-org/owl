import os

from app.settings import settings


def with_storage_path(path: str) -> str:
    if path.startswith(settings.STORAGE_BASE_PATH):
        return path
    return os.path.join(settings.STORAGE_BASE_PATH, path)


def is_extension_valid(path_or_name: str, allowed_extensions: list[str]) -> bool:
    extension = path_or_name.rsplit(".", 1)[1].lower()
    return extension in allowed_extensions
