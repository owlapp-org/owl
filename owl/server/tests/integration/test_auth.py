import requests
from app.models.user import User
from tests.conftest import api_url


def test_login(use_user: User) -> None:
    response = requests.post(
        api_url("auth/login"),
        json={"email": use_user.email, "password": "test"},
    )
    assert response.status_code == 200
    response_json = response.json()
    assert "access_token" in response_json
    assert response_json["access_token"]
