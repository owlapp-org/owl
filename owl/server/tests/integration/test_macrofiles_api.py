import requests
from tests.conftest import api_url


def test_render_content(use_access_token: str) -> None:
    content = """
        {% macro greet(name) %}
        Hello, {{ name }}!
        {% endmacro %}
    """
    command = "greet('Alice')"
    response = requests.post(
        api_url("macros/render"),
        json={"content": content, "command": command},
        headers={"Authorization": f"Bearer {use_access_token}"},
    )
    assert response.status_code == 200, response.text
    assert str(response.json()["content"]).strip() == "Hello, Alice!"


def test_render_content_without_command(use_access_token: str) -> None:
    content = """
        {% macro greet(name) %}
        Hello, {{ name }}!
        {% endmacro %}

        {{ greet('Alice') }}
    """
    response = requests.post(
        api_url("macros/render"),
        json={"content": content},
        headers={"Authorization": f"Bearer {use_access_token}"},
    )
    assert response.status_code == 200, response.text
    assert str(response.json()["content"]).strip() == "Hello, Alice!"
