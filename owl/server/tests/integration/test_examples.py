import os
import tempfile
from unittest.mock import patch

from app.examples.examples import Examples
from app.models.database import Database
from app.models.datafile import DataFile
from app.models.macrofile import MacroFile
from app.models.script import Script
from app.models.user import User


def test_generate_databases(use_app_context):
    with tempfile.TemporaryDirectory() as temp_dir:
        with patch("app.examples.examples.settings.STORAGE_BASE_PATH", temp_dir), patch(
            "app.models.database.settings.STORAGE_BASE_PATH", temp_dir
        ):
            os.makedirs(os.path.join(temp_dir, "users"), exist_ok=True)
            user = User.create(name="test", email="test@example")
            Examples(user_id=user.id).generate_databases()
            database = Database.find_by_owner_and_name(
                owner_id=user.id, name="example.db"
            )
            assert database is not None
            result = database.run(
                id=database.id,
                owner_id=user.id,
                query="select count(1) cnt from my_addresses",
            )
            assert result.data[0]["cnt"] == 0
            User.delete_by_id(id=user.id)


def test_generate_datafiles(use_app_context):
    with tempfile.TemporaryDirectory() as temp_dir:
        with patch("app.examples.examples.settings.STORAGE_BASE_PATH", temp_dir), patch(
            "app.models.mixins.user_space_mixin.settings.STORAGE_BASE_PATH",
            temp_dir,
        ):
            os.makedirs(os.path.join(temp_dir, "users"), exist_ok=True)
            user = User.create(name="test", email="test@example")
            os.makedirs(
                os.path.join(temp_dir, "users", str(user.id), "files"), exist_ok=True
            )

            Examples(user_id=user.id).generate_datafiles()
            datafile = DataFile.find_by_owner_and_name(
                owner_id=user.id, name="example-addresses.csv"
            )
            assert datafile is not None
            with open(datafile.file_storage_path(), "r") as f:
                content = f.read()
                line_count = len(content.split("\n"))
                assert line_count > 10

            User.delete_by_id(id=user.id)


def test_generate_scripts(use_app_context):
    with tempfile.TemporaryDirectory() as temp_dir:
        with patch("app.examples.examples.settings.STORAGE_BASE_PATH", temp_dir), patch(
            "app.models.mixins.user_space_mixin.settings.STORAGE_BASE_PATH",
            temp_dir,
        ):
            os.makedirs(os.path.join(temp_dir, "users"), exist_ok=True)
            user = User.create(name="test", email="test@example")
            os.makedirs(
                os.path.join(temp_dir, "users", str(user.id), "scripts"), exist_ok=True
            )

            Examples(user_id=user.id).generate_scripts()

            for name in ["example.sql", "example-model.sql"]:
                script = Script.find_by_name(owner_id=user.id, name=name)
                assert script is not None
                with open(script.file_storage_path(), "r") as f:
                    content = f.read()
                    assert len(content) >= 1

            User.delete_by_id(id=user.id)


def test_generate_macrofiles(use_app_context):
    with tempfile.TemporaryDirectory() as temp_dir:
        with patch("app.examples.examples.settings.STORAGE_BASE_PATH", temp_dir), patch(
            "app.models.mixins.user_space_mixin.settings.STORAGE_BASE_PATH",
            temp_dir,
        ):
            os.makedirs(os.path.join(temp_dir, "users"), exist_ok=True)
            user = User.create(name="test", email="test@example")
            os.makedirs(
                os.path.join(temp_dir, "users", str(user.id), "macros"), exist_ok=True
            )

            Examples(user_id=user.id).generate_macros()

            for name in ["example.j2"]:
                script = MacroFile.find_by_name(owner_id=user.id, name=name)
                assert script is not None
                with open(script.file_storage_path(), "r") as f:
                    content = f.read()
                    assert len(content) >= 1

            User.delete_by_id(id=user.id)
