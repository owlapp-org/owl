from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, DateTime, func

db = SQLAlchemy()


class TimestampMixin:
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
