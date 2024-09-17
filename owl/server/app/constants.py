APP_NAME = "owl"


class StatementType:
    SELECT: str = "SELECT"
    INSERT: str = "INSERT"
    UPDATE: str = "UPDATE"
    DELETE: str = "DELETE"
    UNKNOWN: str = "UNKNOWN"


ALLOWED_DATAFILE_EXTENSIONS = {"csv", "xls", "xlsx", "json", "parquet"}
ALLOWED_SCRIPT_EXTENSIONS = {"sql"}
ALLOWED_MACROFILE_EXTENSIONS = {"j2", "jinja"}
ALLOWED_DASHBOARDFILE_EXTENSIONS = {"yml", "yaml"}
