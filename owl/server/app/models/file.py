import os

from app.models.base import TimestampMixin, db
from app.settings import settings
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename


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
    def find_by_owner(cls, id: int) -> list["File"]:
        return cls.query.filter(cls.owner_id == id).all()

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
            # todo
            # if os.path.exists(path) and not os.path.isdir(path):
            #     os.remove(path)
            raise e
