import json
import logging
import os
import sys
from datetime import datetime
from logging.handlers import RotatingFileHandler

from app.settings import settings


class JSONFormatter(logging.Formatter):
    """Custom formatter to output logs in JSON format."""

    def format(self, record: logging.LogRecord) -> str:
        log = {
            "level": record.levelname,
            "time": self.format_time(record),
            "message": record.getMessage(),
            "filename": record.pathname,
            "line_no": record.lineno,
            "logger": record.name,
            "extra": {},
        }

        for key, value in record.__dict__.items():
            if key not in (
                "levelname",
                "msg",
                "args",
                "exc_info",
                "pathname",
                "lineno",
                "funcName",
                "module",
                "name",
                "levelno",
                "created",
                "exc_text",
                "stack_info",
                "relativeCreated",
                "thread",
                "threadName",
                "processName",
                "process",
                "taskName",
                "asctime",
                "filename",
                "msecs",
                "message",
            ):
                log["extra"][key] = value

        return json.dumps(log)

    @staticmethod
    def format_time(record: logging.LogRecord) -> str:
        """Format the timestamp for the log record."""
        return datetime.fromtimestamp(record.created).strftime("%Y-%m-%d %H:%M:%S")


def add_stream_handler():
    """Add a stream handler for logging to the console."""
    root_logger = logging.getLogger()

    if not any(
        isinstance(handler, logging.StreamHandler) for handler in root_logger.handlers
    ):
        handler = logging.StreamHandler(
            sys.stdout if settings.LOG_STDOUT else sys.stderr
        )
        formatter = logging.Formatter(settings.LOG_FORMAT)
        handler.setFormatter(formatter)
        handler.setLevel(settings.LOG_LEVEL)
        root_logger.addHandler(handler)


def add_rotating_json_file_handler(
    max_bytes: int = 10 * 1024 * 1024, backup_count: int = 5
):
    """Add a rotating file handler for logging to a JSON file."""
    root_logger = logging.getLogger()

    os.makedirs(os.path.dirname(settings.LOG_PATH), exist_ok=True)

    if not any(
        isinstance(handler, RotatingFileHandler) for handler in root_logger.handlers
    ):
        handler = RotatingFileHandler(
            filename=os.path.join(settings.LOG_PATH, "app.log"),
            maxBytes=max_bytes,
            backupCount=backup_count,
        )
        handler.setFormatter(JSONFormatter())
        handler.setLevel(settings.LOG_LEVEL)
        root_logger.addHandler(handler)


def setup_logging():
    """Set up logging with both stream and file handlers."""
    if settings.LOG_LEVEL != "DEBUG":
        for name in ["passlib"]:
            logging.getLogger(name).setLevel("ERROR")

    logger = logging.getLogger()
    logger.setLevel(settings.LOG_LEVEL)

    add_stream_handler()
    add_rotating_json_file_handler()
