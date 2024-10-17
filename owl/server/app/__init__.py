from app.app import create_app  # noqa
from app.buildinfo import VERSION
from app.constants import APP_NAME  # noqa
from app.logging import setup_logging
from flask_migrate import Migrate

__version__ = VERSION

setup_logging()

migrate = Migrate(compare_type=True)
