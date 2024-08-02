from app.models.user import User
from flask import Flask
from flask_jwt_extended import JWTManager, jwt_required


def init_app(app: Flask) -> None:
    jwt = JWTManager(app=app)

    @jwt.user_identity_loader
    def user_identity_lookup(user):
        return user.id

    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        identity = jwt_data["sub"]
        return User.find_by_id(identity)

    apply_jwt_required(app)


def apply_jwt_required(app: Flask) -> None:
    exclude_routes = [
        "static",
        "/.auth.login",
        "/.auth.google_login",
        "/.auth.google_callback",
        "/.app.get_config",
        "ui.static",
        "ui.serve_ui",
        "ui.serve_assets",
        "redirect_to_ui",
    ]
    for rule in app.url_map.iter_rules():
        if rule.endpoint not in exclude_routes:
            view_func = app.view_functions[rule.endpoint]
            app.view_functions[rule.endpoint] = jwt_required()(view_func)
