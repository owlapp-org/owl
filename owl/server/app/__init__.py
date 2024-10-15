from app.app import create_app  # noqa
from app.constants import APP_NAME
from app.lib.build import get_version
from app.logging import setup_logging
from flask_migrate import Migrate

__version__ = get_version()

setup_logging()

migrate = Migrate(compare_type=True)
