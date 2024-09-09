import os

from apiflask import APIBlueprint
from flask import send_from_directory

bp = APIBlueprint("ui", __name__, static_folder="../static")


@bp.route("/", defaults={"path": ""})
@bp.route("/<path:path>")
def serve_ui(path):
    if path != "" and os.path.exists(os.path.join(bp.static_folder, path)):
        return send_from_directory(bp.static_folder, path)
    else:
        return send_from_directory(bp.static_folder, "index.html")
