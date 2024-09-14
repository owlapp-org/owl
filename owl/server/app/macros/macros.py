from typing import Callable

from app.models.script import Script

REF_MACRO = """
{% macro ref(filename) %}
    {% set result = read_script_file(filename + '.sql') %}
    ({{ result }})
{% endmacro %}
"""


def gen__read_script_file(owner_id: int) -> Callable[[str], str]:
    def fn(filename: str) -> str:
        if script := Script.find_by_filename(owner_id, filename):
            if content := script.read_file():
                return content
            else:
                raise ValueError("No script content found")
        else:
            raise ValueError("No script file found with name %s" % filename)

    return fn
