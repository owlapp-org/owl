import logging
from datetime import datetime
from enum import Enum

from app.models.base import TimestampMixin, db
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

logger = logging.getLogger(__name__)


class ExecutionStatus(str, Enum):
    RUNNING = "RUNNING"
    SUCCESS = "SUCCESS"
    ERROR = "ERROR"


class Execution(TimestampMixin, db.Model):
    __tablename__ = "executions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    query_id = Column(String, nullable=False)
    database_id = Column(Integer, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    raw_query = Column(String, nullable=False)
    executed_query = Column(String, nullable=False)
    status = Column(String, nullable=False)
    message = Column(String, nullable=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="executions")

    @classmethod
    def find_all(cls) -> list["Execution"]:
        return cls.query.all()

    @classmethod
    def start(
        cls,
        query_id: str,
        user_id: int,
        raw_query: str,
        executed_query: str,
        message: str = None,
        start_time: datetime = datetime.now(),
    ) -> "Execution":
        execution = cls(
            query_id=query_id,
            user_id=user_id,
            raw_query=raw_query,
            executed_query=executed_query,
            start_time=start_time,
            message=message,
            status=ExecutionStatus.RUNNING,
        )
        return execution.save()

    def error(
        self,
        message: str | Exception,
        end_time: datetime = datetime.now(),
    ) -> "Execution":
        self.set_status(
            ExecutionStatus.ERROR,
            message=f"{self.message}\n{message}" if self.message else message,
            end_time=end_time,
        )
        return self

    def success(
        self,
        message: str = None,
        end_time: datetime = datetime.now(),
    ) -> "Execution":
        self.set_status(
            ExecutionStatus.SUCCESS,
            message=f"{self.message}\n{message}" if self.message else message,
            end_time=end_time,
        )
        return self

    def set_status(
        self,
        status: ExecutionStatus,
        message: str = None,
        end_time: datetime = datetime.now(),
    ) -> "Execution":
        self.status = status
        self.end_time = end_time
        if message:
            self.message = message

        return self.save()

    def save(self) -> "Execution":
        try:
            db.session.add(self)
            db.session.commit()
            return self
        except Exception as e:
            logger.exception("Error saving execution log '%s'", str(e))
            db.session.rollback()
            raise e

    def add_message(self, message: str) -> "Execution":
        self.message = f"{self.message}\n{message}" if self.message else message
        self.save()
        return self
