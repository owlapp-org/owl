from apiflask import APIBlueprint, APIFlask
from app.api import (
    app_api,
    auth_api,
    databases_api,
    datafiles_api,
    macrofiles_api,
    scripts_api,
    ui,
    users_api,
)
from flask import redirect, url_for

api = APIBlueprint("/", __name__, tag="Owl API")


def init_app(app: APIFlask) -> None:
    api.register_blueprint(auth_api.bp, url_prefix="/auth")
    api.register_blueprint(users_api.bp, url_prefix="/users")
    api.register_blueprint(databases_api.bp, url_prefix="/databases")
    api.register_blueprint(app_api.bp, url_prefix="/app")
    api.register_blueprint(datafiles_api.bp, url_prefix="/files")
    api.register_blueprint(scripts_api.bp, url_prefix="/scripts")
    api.register_blueprint(macrofiles_api.bp, url_prefix="/macros")
    app.register_blueprint(api, url_prefix="/api")

    app.register_blueprint(ui.bp, url_prefix="/ui")

    @app.route("/", methods=["GET"])
    def redirect_to_ui():
        return redirect(url_for("ui.serve_ui"))
