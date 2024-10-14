import os
from functools import cache, cached_property
from typing import Generic, Optional, TypeVar

from app.settings import settings
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename

T = TypeVar("T", bound="UserSpaceMixin")


class UserSpaceMixin(Generic[T]):
    owner_id: int
    name: str
    __folder__: str = None

    @cached_property
    def folder_storage_path(self) -> str:
        return os.path.join(settings.STORAGE_BASE_PATH, self.folder_relative_path)

    @property
    def folder_relative_path(self) -> str:
        return os.path.join("users", str(self.owner_id), self.__folder__)

    @property
    def extension(self) -> str:
        return self.name.rsplit(".", 1)[1].lower()

    @cached_property
    def path(self):
        return self.relative_path(self.name)

    @cache
    def relative_path(self, filename: Optional[str] = None):
        if filename is None:
            return self.path
        return os.path.join(self.folder_relative_path, secure_filename(filename))

    @cache
    def file_storage_path(self, filename: Optional[str] = None) -> str:
        if not filename:
            return os.path.join(self.folder_storage_path, self.name)

        return os.path.join(
            self.folder_storage_path,
            secure_filename(filename),
        )

    def create_folder_if_not_exists(self) -> T:
        os.makedirs(self.folder_storage_path, exist_ok=True)
        return self

    def file_exists(self) -> bool:
        return os.path.exists(self.file_storage_path())

    def rename_file(self, name: str) -> T:
        if not name:
            raise Exception("Name can't be empty")
        # extra check to prevent undesired behavior
        if os.path.exists(self.file_storage_path(name)):
            raise Exception("File already exists")
        if not os.path.isdir(self.file_storage_path()):
            os.rename(self.file_storage_path(), self.file_storage_path(name))

        return self

    def read_file(self, filename: str = None) -> str:
        with open(self.file_storage_path(filename), "r") as f:
            return f.read()

    def write_file(self, content: str) -> T:
        self.create_folder_if_not_exists()
        with open(self.file_storage_path(), "w") as f:
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

    def create_file(self, content: Optional[str] = None) -> T:
        self.create_folder_if_not_exists()
        if os.path.exists(self.file_storage_path(self.name)):
            raise Exception("File already exists")

        with open(self.file_storage_path(self.name), "w") as f:
            if content is not None:
                f.write(content)

        return self

    def delete_file(self) -> T:
        if not os.path.isdir(self.file_storage_path()):
            os.remove(self.file_storage_path())
        else:
            raise ValueError("Can't delete directory")

    def upload_file(self, file: FileStorage) -> T:
        self.create_folder_if_not_exists()
        filepath = self.file_storage_path(file.filename)
        if os.path.exists(filepath):
            raise Exception("Upload file already exists")
        file.save(filepath)

        return self
