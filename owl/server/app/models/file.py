import logging
import os
from typing import Optional

from app.lib.fs import with_storage_path
from app.models.base import TimestampMixin, db
from app.settings import settings
from sqlalchemy import Column, ForeignKey, Integer, String, and_
from sqlalchemy.orm import relationship
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename

logger = logging.getLogger(__name__)


class File(TimestampMixin, db.Model):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, autoincrement=True)
    path = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    owner = relationship("User", back_populates="files")

    @property
    def name(self) -> str:
        return self.path.rsplit("/", 1)[1]

    @property
    def extension(self) -> str:
        return self.name.rsplit(".", 1)[1].lower()

    @classmethod
    def find_by_id(cls, id: int) -> Optional["File"]:
        return cls.query.filter_by(id=id).one_or_none()

    @classmethod
    def find_by_owner(cls, id: int) -> list["File"]:
        return cls.query.filter(cls.owner_id == id).all()

    @classmethod
    def find_by_id_and_owner(cls, id: int, owner_id: int) -> Optional["File"]:
        return cls.query.filter(
            and_(cls.id == id, cls.owner_id == owner_id)
        ).one_or_none()

    @classmethod
    def delete_by_id(cls, id: int, owner_id: int = None) -> "File":
        file: File = cls.query.filter(
            and_(cls.id == id, cls.owner_id == owner_id)
        ).one()

        path = os.path.join(settings.STORAGE_BASE_PATH, file.path)
        try:
            db.session.delete(file)
            db.session.commit()
            os.remove(path)
        except FileNotFoundError:
            logger.warning(
                "File not found: %s. Database might be never accessed." % path
            )

    @classmethod
    def save_file(cls, owner_id: int, file: FileStorage) -> "File":
        filename = secure_filename(file.filename)
        files_folder = os.path.join(
            settings.STORAGE_BASE_PATH,
            "users",
            str(owner_id),
            "files",
        )
        if not os.path.exists(files_folder):
            os.makedirs(files_folder)

        path = os.path.join(files_folder, filename)
        if os.path.exists(path):
            raise FileExistsError("File already exists: %s" % filename)
        try:
            file.save(path)
            relative_path = os.path.join("users", str(owner_id), "files", filename)
            model = File(path=relative_path, owner_id=owner_id)
            db.session.add(model)
            db.session.commit()
            return model
        except Exception as e:
            db.session.rollback()
            if os.path.exists(path) and not os.path.isdir(path):
                os.remove(path)
            raise e

    def file_exists(self) -> bool:
        return os.path.exists(os.path.join(settings.STORAGE_BASE_PATH, self.path))

    def rename(self, name: str) -> "File":
        if not name:
            raise Exception("Name can't be empty")
        path: str = self.path
        name = secure_filename(name)
        self.path = os.path.join(path.rsplit("/", 1)[0], name)
        if not os.path.isdir(path):
            os.rename(with_storage_path(path), with_storage_path(self.path))
        db.session.add(self)
        db.session.commit()

        return self
