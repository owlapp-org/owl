from datetime import timedelta

from apiflask import APIFlask
from app.settings import settings
from flask import jsonify, request


def create_app() -> APIFlask:
    from app import api, migrate
    from app.auth import jwt_auth, oauth
    from app.models import db
    from flask_cors import CORS

    app = APIFlask(__name__, spec_path="/api/spec", docs_path="/api/docs")
    app.config.from_object(settings)
    app.security_schemes = {  # equals to use config SECURITY_SCHEMES
        "TokenAuth": {
            "type": "apiKey",
            "in": "header",
            "name": "Authorization",
            "description": "Type in the *'Value'* input box below: **'Bearer &lt;JWT&gt;'**, where JWT is the token",
        }
    }

    # todo manage this
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)

    CORS(app)

    @app.before_request
    def before_request():
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        }
        if request.method.lower() == "options":
            return jsonify(headers), 200

    db.init_app(app)
    migrate.init_app(app, db)
    api.init_app(app)
    jwt_auth.init_app(app)
    oauth.init_app(app)

    return app
