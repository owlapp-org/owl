import os

from flask import Blueprint, send_from_directory

bp = Blueprint("ui", __name__, static_folder="../static")


@bp.route("/", defaults={"path": ""})
@bp.route("/<path:path>")
def serve_ui(path):
    if path != "" and os.path.exists(os.path.join(bp.static_folder, path)):
        return send_from_directory(bp.static_folder, path)
    else:
        return send_from_directory(bp.static_folder, "index.html")
