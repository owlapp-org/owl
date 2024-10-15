from apiflask import APIBlueprint
from app.schemas.app_schema import AppAboutOut, AppConfigOut

bp = APIBlueprint("app", __name__, tag="App")


@bp.route("/config")
@bp.output(
    AppConfigOut.Schema,
    status_code=200,
    description="Application configuration params",
)
def get_config():
    return AppConfigOut.from_settings()


@bp.route("/about")
@bp.output(
    AppAboutOut.Schema,
    status_code=200,
    description="Application build params",
)
def get_about():
    return AppAboutOut.from_buildinfo()
