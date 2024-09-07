import logging
from typing import Optional

from app.models.base import TimestampMixin, db
from app.models.mixins.user_space_mixin import UserSpaceMixin
from sqlalchemy import Column, ForeignKey, Integer, String, and_
from sqlalchemy.orm import relationship
from werkzeug.datastructures import FileStorage

logger = logging.getLogger(__name__)


class DataFile(TimestampMixin, UserSpaceMixin["DataFile"], db.Model):
    __tablename__ = "data_files"
    __folder__ = "files"

    id = Column(Integer, primary_key=True, autoincrement=True)
    path = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    owner = relationship("User", back_populates="data_files")

    @classmethod
    def find_by_id(cls, id: int) -> Optional["DataFile"]:
        return cls.query.filter_by(id=id).one_or_none()

    @classmethod
    def find_by_owner(cls, id: int) -> list["DataFile"]:
        return cls.query.filter(cls.owner_id == id).order_by(cls.path).all()

    @classmethod
    def find_by_id_and_owner(cls, id: int, owner_id: int) -> Optional["DataFile"]:
        return cls.query.filter(
            and_(cls.id == id, cls.owner_id == owner_id)
        ).one_or_none()

    @classmethod
    def delete_by_id(cls, id: int, owner_id: int = None) -> "DataFile":
        file: DataFile = cls.query.filter(
            and_(cls.id == id, cls.owner_id == owner_id)
        ).one()
        try:
            file.delete_file()
            db.session.delete(file)
            db.session.commit()
        except FileNotFoundError:
            logger.warning("File not found")
        except Exception as e:
            db.session.rollback()
            raise e

    @classmethod
    def upload_datafile(cls, owner_id: int, file: FileStorage) -> "DataFile":
        datafile = DataFile(owner_id=owner_id).upload_file(file)
        datafile.path = datafile.relative_path(file.filename)
        try:
            db.session.add(datafile)
            db.session.commit()
            return datafile
        except Exception as e:
            db.session.rollback()
            raise e

    def update_datafile(self, name: str) -> "DataFile":
        self.rename_file(name)
        self.path = self.relative_path(name)
        try:
            db.session.add(self)
            db.session.commit()
            return self
        except Exception as e:
            logger.exception("Error creating data file '%s'", str(e))
            db.session.rollback()
            raise e
