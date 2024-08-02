from app.settings import settings
from authlib.integrations.flask_client import OAuth
from flask import Flask

oauth = OAuth()


def init_app(app: Flask):
    oauth.init_app(app)
    oauth.register(
        name="google",
        server_metadata_url=settings.google_discovery_url,
        client_kwargs={"scope": "openid email profile"},
    )
