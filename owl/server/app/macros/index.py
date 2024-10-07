from app.macros.macros import LOGS_MACRO, REF_MACRO


def default_macros() -> str:
    items = [REF_MACRO, LOGS_MACRO]
    return "\n".join(items)
