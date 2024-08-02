import requests
from tests.conftest import api_url


def test_get_app_config():
    response = requests.get(
        api_url("app/config"),
    )
    assert response.status_code == 200
    assert "production" in response.json()
    assert "google_login" in response.json()
