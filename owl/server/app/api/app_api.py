from apiflask import APIBlueprint
from app.schemas import AppConfigSchema

bp = APIBlueprint("app", __name__)


@bp.route("/config")
def get_config():
    config = AppConfigSchema.from_settings()
    return config.model_dump()
