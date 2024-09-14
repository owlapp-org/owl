import os
from functools import cache, cached_property
from typing import Generic, Optional, TypeVar

from app.settings import settings
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename

T = TypeVar("T", bound="UserSpaceMixin")


class UserSpaceMixin(Generic[T]):
    owner_id: int
    path: str
    __folder__: str = None

    @cached_property
    def folder_absolute_path(self) -> str:
        return os.path.join(
            settings.STORAGE_BASE_PATH,
            "users",
            str(self.owner_id),
            self.__folder__,
        )

    @property
    def folder_relative_path(self) -> str:
        return os.path.join("users", str(self.owner_id), self.__folder__)

    @property
    def name(self) -> str:
        return self.path.rsplit("/", 1)[1]

    @property
    def extension(self) -> str:
        return self.name.rsplit(".", 1)[1].lower()

    def create_folder_if_not_exists(self) -> T:
        if not os.path.exists(self.folder_absolute_path):
            os.makedirs(self.folder_absolute_path)
        return self

    @cache
    def relative_path(self, filename: Optional[str] = None):
        if filename is None:
            return self.path
        return os.path.join(self.folder_relative_path, secure_filename(filename))

    @cache
    def absolute_path(self, filename: Optional[str] = None) -> str:
        if not filename:
            return os.path.join(settings.STORAGE_BASE_PATH, self.path)

        return os.path.join(
            self.folder_absolute_path,
            secure_filename(filename),
        )

    def file_exists(self) -> bool:
        return os.path.exists(os.path.join(settings.STORAGE_BASE_PATH, self.path))

    def rename_file(self, name: str) -> T:
        if not name:
            raise Exception("Name can't be empty")
        # extra check to prevent undesired behavior
        if os.path.exists(self.absolute_path(name)):
            raise Exception("File already exists")
        if not os.path.isdir(self.absolute_path()):
            os.rename(self.absolute_path(), self.absolute_path(name))

        return self

    def read_file(self, filename: str = None) -> str:
        abs_path = self.absolute_path(filename) if filename else self.absolute_path()
        with open(abs_path, "r") as f:
            return f.read()

    def write_file(self, content: str) -> T:
        self.create_folder_if_not_exists()
        with open(self.absolute_path(), "w") as f:
            f.write(content)
        return self

    def update_file(
        self, name: Optional[str] = None, content: Optional[str] = None
    ) -> T:
        if name:
            self.rename_file(name)
        if content is not None:
            self.write_file(content)

        return self

    def create_file(self, name: str, content: Optional[str] = None) -> T:
        self.create_folder_if_not_exists()
        if os.path.exists(self.absolute_path(name)):
            raise Exception("File already exists")

        with open(self.absolute_path(name), "w") as f:
            if content is not None:
                f.write(content)

        return self

    def delete_file(self) -> T:
        if not os.path.isdir(self.absolute_path()):
            os.remove(self.absolute_path())
        else:
            raise ValueError("Can't delete directory")

    def upload_file(self, file: FileStorage) -> T:
        self.create_folder_if_not_exists()
        abs_path = self.absolute_path(file.filename)
        if os.path.exists(abs_path):
            raise Exception("Upload file already exists")
        file.save(abs_path)

        return self
