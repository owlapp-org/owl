import importlib.metadata

from app.app import create_app  # noqa
from app.constants import APP_NAME
from app.logging import setup_logging
from flask_migrate import Migrate

try:
    __version__ = importlib.metadata.version(APP_NAME)
except:  # noqa
    __version__ = "0.3.20"

setup_logging()

migrate = Migrate(compare_type=True)
