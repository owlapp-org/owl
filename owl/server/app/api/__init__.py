from app.api import app_api, auth_api, databases_api, ui, users_api
from flask import Blueprint, Flask, redirect, url_for

api = Blueprint("/", __name__)


def init_app(app: Flask) -> None:
    api.register_blueprint(auth_api.bp, url_prefix="/auth")
    api.register_blueprint(users_api.bp, url_prefix="/users")
    api.register_blueprint(databases_api.bp, url_prefix="/databases")
    api.register_blueprint(app_api.bp, url_prefix="/app")
    app.register_blueprint(api, url_prefix="/api")

    app.register_blueprint(ui.bp, url_prefix="/ui")

    @app.route("/", methods=["GET"])
    def redirect_to_ui():
        return redirect(url_for("ui.serve_ui"))
