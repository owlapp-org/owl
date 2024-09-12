import logging
from typing import Optional

from app.models.base import TimestampMixin, db
from app.models.mixins.user_space_mixin import UserSpaceMixin
from sqlalchemy import Column, ForeignKey, Integer, String, and_
from sqlalchemy.orm import relationship
from werkzeug.datastructures import FileStorage

logger = logging.getLogger(__name__)


class MacroFile(TimestampMixin, UserSpaceMixin["MacroFile"], db.Model):
    __tablename__ = "macro_files"
    __folder__ = "macros"

    id = Column(Integer, primary_key=True, autoincrement=True)
    path = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    owner = relationship("User", back_populates="macro_files")

    @classmethod
    def find_by_id(cls, id: int) -> Optional["MacroFile"]:
        return cls.query.filter_by(id=id).one_or_none()

    @classmethod
    def find_by_owner(cls, id: int) -> list["MacroFile"]:
        return cls.query.filter(cls.owner_id == id).order_by(cls.path).all()

    @classmethod
    def find_by_id_and_owner(cls, id: int, owner_id: int) -> Optional["MacroFile"]:
        return cls.query.filter(
            and_(cls.id == id, cls.owner_id == owner_id)
        ).one_or_none()

    @classmethod
    def create_macro_file(
        cls, owner_id: int, filename: str, content: Optional[str] = None
    ) -> "MacroFile":
        macro_file = cls(owner_id=owner_id).create_file(filename, content)
        macro_file.path = macro_file.relative_path(filename)
        try:
            db.session.add(macro_file)
            db.session.commit()
            return macro_file
        except Exception as e:
            db.session.rollback()
            raise e

    @classmethod
    def delete_by_id(cls, id: int, owner_id: int = None) -> "MacroFile":
        macro_file: MacroFile = cls.query.filter(
            and_(cls.id == id, cls.owner_id == owner_id)
        ).one()
        try:
            macro_file.delete_file()
            db.session.delete(macro_file)
            db.session.commit()
        except FileNotFoundError:
            logger.warning("Macro file not found: %s" % macro_file.relative_path())

    @classmethod
    def upload_macro_file(cls, owner_id: int, file: FileStorage) -> "MacroFile":
        macro_file = MacroFile(owner_id=owner_id).upload_file(file)
        macro_file.path = macro_file.relative_path(file.filename)
        try:
            db.session.add(macro_file)
            db.session.commit()
            return macro_file
        except Exception as e:
            db.session.rollback()
            raise e

    def update_macro_file(
        self, name: Optional[str] = None, content: Optional[str] = None
    ) -> "MacroFile":
        if not name and content is None:
            raise ValueError("Name or content must be specified")

        self.update_file(name, content)
        if name:
            self.path = self.relative_path(name)

        db.session.add(self)
        db.session.commit()
        return self
