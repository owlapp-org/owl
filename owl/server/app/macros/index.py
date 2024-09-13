from app.macros.macros import REF_MACRO


def default_macros() -> str:
    items = [REF_MACRO]
    return "\n".join(items)
