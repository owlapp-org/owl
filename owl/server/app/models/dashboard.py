import logging
from typing import Optional

from app.models.base import TimestampMixin, db
from app.models.mixins.user_space_mixin import UserSpaceMixin
from sqlalchemy import Column, ForeignKey, Integer, String, and_
from sqlalchemy.orm import relationship
from werkzeug.datastructures import FileStorage

logger = logging.getLogger(__name__)


class Dashboard(TimestampMixin, UserSpaceMixin["Dashboard"], db.Model):
    __tablename__ = "dashboards"
    __folder__ = "dashboards"

    id = Column(Integer, primary_key=True, autoincrement=True)
    path = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    owner = relationship("User", back_populates="dashboards")

    @classmethod
    def find_by_id(cls, id: int) -> Optional["Dashboard"]:
        return cls.query.filter_by(id=id).one_or_none()

    @classmethod
    def find_by_owner(cls, id: int) -> list["Dashboard"]:
        return cls.query.filter(cls.owner_id == id).order_by(cls.path).all()

    @classmethod
    def find_by_id_and_owner(cls, id: int, owner_id: int) -> Optional["Dashboard"]:
        return cls.query.filter(
            and_(cls.id == id, cls.owner_id == owner_id)
        ).one_or_none()

    @classmethod
    def create_dashboard_file(
        cls, owner_id: int, filename: str, content: Optional[str] = None
    ) -> "Dashboard":
        model = cls(owner_id=owner_id).create_file(filename, content)
        model.path = model.relative_path(filename)
        try:
            db.session.add(model)
            db.session.commit()
            return model
        except Exception as e:
            db.session.rollback()
            raise e

    @classmethod
    def delete_by_id(cls, id: int, owner_id: int = None) -> "Dashboard":
        model: Dashboard = cls.query.filter(
            and_(cls.id == id, cls.owner_id == owner_id)
        ).one()
        try:
            model.delete_file()
            db.session.delete(model)
            db.session.commit()
        except FileNotFoundError:
            logger.warning("Dashboard file not found: %s" % model.relative_path())

    @classmethod
    def upload_dashboard_file(cls, owner_id: int, file: FileStorage) -> "Dashboard":
        model = cls(owner_id=owner_id).upload_file(file)
        model.path = model.relative_path(file.filename)
        try:
            db.session.add(model)
            db.session.commit()
            return model
        except Exception as e:
            db.session.rollback()
            raise e

    def update_dashboard_file(
        self, name: Optional[str] = None, content: Optional[str] = None
    ) -> "Dashboard":
        if not name and content is None:
            raise ValueError("Name or content must be specified")

        self.update_file(name, content)
        if name:
            self.path = self.relative_path(name)

        db.session.add(self)
        db.session.commit()
        return self

    @classmethod
    def render_content(cls, owner_id: int, content: str) -> str:
        pass
