import logging
import sys

from app.settings import settings


def setup_logging():
    handler = logging.StreamHandler(sys.stdout if settings.LOG_STDOUT else sys.stderr)
    formatter = logging.Formatter(settings.LOG_FORMAT)
    handler.setFormatter(formatter)
    logging.getLogger().addHandler(handler)
    logging.getLogger().setLevel(settings.LOG_LEVEL)

    if settings.LOG_LEVEL != "DEBUG":
        for name in [
            "passlib",
        ]:
            logging.getLogger(name).setLevel("ERROR")
