import logging
from typing import Optional

from app.models.base import TimestampMixin, db
from app.models.mixins.user_space_mixin import UserSpaceMixin
from sqlalchemy import Column, ForeignKey, Integer, String, and_
from sqlalchemy.orm import relationship
from werkzeug.datastructures import FileStorage

logger = logging.getLogger(__name__)


class Script(TimestampMixin, UserSpaceMixin["Script"], db.Model):
    __tablename__ = "scripts"
    __folder__ = "scripts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    path = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    owner = relationship("User", back_populates="scripts")

    @classmethod
    def find_by_id(cls, id: int) -> Optional["Script"]:
        return cls.query.filter_by(id=id).one_or_none()

    @classmethod
    def find_by_owner(cls, id: int) -> list["Script"]:
        return cls.query.filter(cls.owner_id == id).order_by(cls.path).all()

    @classmethod
    def find_by_filename(cls, owner_id: int, filename: str) -> Optional["Script"]:
        return cls.query.filter(
            and_(
                cls.owner_id == owner_id,
                cls.path.like(f"%/{filename}"),
            )
        ).one_or_none()

    @classmethod
    def find_by_id_and_owner(cls, id: int, owner_id: int) -> Optional["Script"]:
        return cls.query.filter(
            and_(cls.id == id, cls.owner_id == owner_id)
        ).one_or_none()

    @classmethod
    def create_script(
        cls, owner_id: int, filename: str, content: Optional[str] = None
    ) -> "Script":
        script = cls(owner_id=owner_id).create_file(filename, content)
        script.path = script.relative_path(filename)
        try:
            db.session.add(script)
            db.session.commit()
            return script
        except Exception as e:
            db.session.rollback()
            raise e

    @classmethod
    def delete_by_id(cls, id: int, owner_id: int = None) -> "Script":
        script: Script = cls.query.filter(
            and_(cls.id == id, cls.owner_id == owner_id)
        ).one()
        try:
            script.delete_file()
            db.session.delete(script)
            db.session.commit()
        except FileNotFoundError:
            logger.warning("Script not found: %s" % script.relative_path())

    @classmethod
    def upload_script(cls, owner_id: int, file: FileStorage) -> "Script":
        script = Script(owner_id=owner_id).upload_file(file)
        script.path = script.relative_path(file.filename)
        try:
            db.session.add(script)
            db.session.commit()
            return script
        except Exception as e:
            db.session.rollback()
            raise e

    def update_script(
        self, name: Optional[str] = None, content: Optional[str] = None
    ) -> "Script":
        if not name and content is None:
            raise ValueError("Name or content must be specified")

        self.update_file(name, content)
        if name:
            self.path = self.relative_path(name)

        db.session.add(self)
        db.session.commit()
        return self
