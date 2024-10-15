import logging
import os

import polars as pl
from app.examples.example_content import (
    ADDRESSES_CSV,
    BASIC_MACROS,
    BASIC_SCRIPT,
    REFERENCE_SCRIPT,
    STATES,
)
from app.models.database import Database
from app.models.datafile import DataFile
from app.models.macrofile import MacroFile
from app.models.script import Script
from app.settings import settings

logger = logging.getLogger(__name__)


class Examples:
    def __init__(self, user_id: int):
        self.user_id = user_id
        self.files_path = os.path.join(
            settings.STORAGE_BASE_PATH, f"users/{user_id}/files"
        )
        self.databases_path = os.path.join(
            settings.STORAGE_BASE_PATH, f"users/{user_id}/databases"
        )
        self.scripts_path = os.path.join(
            settings.STORAGE_BASE_PATH, f"users/{user_id}/scripts"
        )
        self.macros_path = os.path.join(
            settings.STORAGE_BASE_PATH, f"users/{user_id}/macros"
        )

    def generate(self) -> "Examples":
        self.generate_databases().generate_datafiles().generate_scripts().generate_macros()
        return self

    def generate_databases(self) -> "Examples":
        logger.info("Generating databases ...")
        database = Database(name="example-db", owner_id=self.user_id)
        database.create().run(
            id=database.id,
            owner_id=self.user_id,
            query="""
                create table my_addresses (
                    name varchar,
                    email varchar,
                    street varchar,
                    city varchar,
                    phone varchar
                )
            """,
        )
        return self

    def generate_datafiles(self) -> "Examples":
        logger.info("Generating data files ...")
        # CSV
        filename = "example-addresses.csv"
        DataFile.create_datafile(
            owner_id=self.user_id, name=filename, content=ADDRESSES_CSV
        )

        # EXCEL
        filename = "example-states.xls"
        DataFile.create_datafile(owner_id=self.user_id, name=filename)

        filepath = os.path.join(self.files_path, filename)
        pl.DataFrame(STATES).write_excel(filepath, "states")

        return self

    def generate_scripts(self) -> "Examples":
        logger.info("Generating scripts ...")
        for filename, content in [
            ("example.sql", BASIC_SCRIPT),
            ("example-model.sql", REFERENCE_SCRIPT),
        ]:
            Script.create_script(owner_id=self.user_id, name=filename, content=content)

        return self

    def generate_macros(self) -> "Examples":
        logger.info("Generating macros ...")
        for filename, content in [
            ("example.j2", BASIC_MACROS),
        ]:
            MacroFile.create_macro_file(
                owner_id=self.user_id, name=filename, content=content
            )

        return self
