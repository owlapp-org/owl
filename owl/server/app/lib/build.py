import importlib
import os
import subprocess
from textwrap import dedent

import toml
from app.constants import APP_NAME


def get_last_commit_date() -> str:
    try:
        commit_date = subprocess.check_output(
            ["git", "log", "-1", "--format=%cd"], universal_newlines=True
        ).strip()
        return commit_date
    except subprocess.CalledProcessError:
        return "Unknown"


def get_last_commit_hash():
    try:
        # Get the last commit hash from Git
        commit_hash = subprocess.check_output(
            ["git", "log", "-1", "--format=%H"], universal_newlines=True
        ).strip()
        return commit_hash
    except subprocess.CalledProcessError:
        return "Unknown"


def get_version() -> str:
    pyproject_path = "pyproject.toml"
    with open(pyproject_path, "r") as f:
        pyproject_data = toml.load(f)

    # Extract the version from the [tool.poetry] section
    version = pyproject_data.get("tool", {}).get("poetry", {}).get("version", "0.0.0")
    return version


def save():
    last_commit_date = get_last_commit_date()
    last_commit_hash = get_last_commit_hash()
    version = get_version()
    with open("owl/server/app/buildinfo.py", "w") as f:
        content = dedent(
            f"""
            #! do not modify this file manually

            LAST_COMMIT_DATE = "{last_commit_date}"
            LAST_COMMIT_HASH = "{last_commit_hash}"
            VERSION = "{version}"
        """
        )
        f.write(content.strip())


if __name__ == "__main__":
    save()
