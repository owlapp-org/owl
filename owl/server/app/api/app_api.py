from app.schemas import AppConfigSchema
from flask import Blueprint

bp = Blueprint("app", __name__)


@bp.route("/config")
def get_config():
    config = AppConfigSchema.from_settings()
    return config.model_dump()
