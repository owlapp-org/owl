APP_NAME = "owl"


class StatementType:
    SELECT: str = "SELECT"
    INSERT: str = "INSERT"
    UPDATE: str = "UPDATE"
    DELETE: str = "DELETE"
    UNKNOWN: str = "UNKNOWN"


ALLOWED_FILE_EXTENSIONS = {"csv", "xls", "xlsx", "json", "parquet"}
