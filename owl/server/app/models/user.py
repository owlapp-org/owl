import nacl.pwhash as pwhash
from app.models.base import TimestampMixin, db
from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship


class User(TimestampMixin, db.Model):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, unique=True)
    name = Column(String)
    password_hash = Column(String, nullable=True)

    databases = relationship(
        "Database",
        back_populates="owner",
        lazy="dynamic",
        cascade="all, delete-orphan",
        single_parent=True,
    )

    is_admin = Column(Boolean, default=False)

    def hash_password(self, password: str) -> "User":
        self.password_hash = pwhash.str(password.encode("utf-8")).decode("utf-8")
        return self

    @classmethod
    def find_by_id(cls, id: int) -> "User":
        return cls.query.filter(cls.id == id).one_or_none()

    @classmethod
    def find_all(cls) -> list["User"]:
        return cls.query.all()

    @classmethod
    def find_by_email(cls, email: str) -> "User":
        return cls.query.filter(cls.email == email).one_or_none()

    def verify_password(self, password: str) -> bool:
        return pwhash.verify(
            self.password_hash.encode("utf-8"), password.encode("utf-8")
        )
