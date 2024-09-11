from apiflask import APIBlueprint
from app.schemas.app_schema import AppConfigOut

bp = APIBlueprint("app", __name__, tag="App")


@bp.route("/config")
@bp.output(
    AppConfigOut.Schema,
    status_code=200,
    description="Application configuration params",
)
def get_config():
    return AppConfigOut.from_settings()
