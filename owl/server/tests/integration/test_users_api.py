import requests
from app.models.user import User
from tests.conftest import api_url


def test_get_users(use_access_token, db):
    with db() as session:
        u1 = User(email="foo@test.com", name="foo").hash_password("foo")
        u2 = User(email="bar@test.com", name="bar").hash_password("bar")
        session.add(u1)
        session.add(u2)
        session.commit()

        response = requests.get(
            api_url("users"),
            headers={"Authorization": f"Bearer {use_access_token}"},
        )
        try:
            assert response.status_code == 200, response.text
            response_json = response.json()
            assert len(response_json) == 3
            assert ("foo@test.com", "foo") in [
                (u["email"], u["name"]) for u in response_json
            ]
        except AssertionError as e:
            raise e
        finally:
            session.delete(u1)
            session.delete(u2)
            session.commit()


def test_get_user(use_access_token, db):
    with db() as session:
        u1 = User(email="foo@test.com", name="foo").hash_password("foo")
        session.add(u1)
        session.commit()

        response = requests.get(
            api_url(f"users/{u1.id}"),
            headers={"Authorization": f"Bearer {use_access_token}"},
        )
        try:
            assert response.status_code == 200, response.text
            response_json = response.json()
            assert response_json["email"] == u1.email
        except AssertionError as e:
            raise e
        finally:
            session.delete(u1)
            session.commit()


def test_get_user_by_email(use_access_token, db):
    with db() as session:
        u1 = User(email="foo@test.com", name="foo").hash_password("foo")
        session.add(u1)
        session.commit()

        response = requests.get(
            api_url(f"users/email/{u1.email}"),
            headers={"Authorization": f"Bearer {use_access_token}"},
        )
        try:
            assert response.status_code == 200, response.text
            response_json = response.json()
            assert response_json["email"] == u1.email
        except AssertionError as e:
            raise e
        finally:
            session.delete(u1)
            session.commit()


def test_update_password(use_user):
    email = use_user.email
    response = requests.post(
        api_url("/auth/login"),
        json={"email": email, "password": "test"},
    )
    assert response.status_code == 200, response.text
    access_token = response.json()["access_token"]
    response = requests.put(
        api_url("users/password"),
        json={"password": "test1"},
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == 200, response.text
    response = requests.post(
        api_url("/auth/login"),
        json={"email": email, "password": "test1"},
    )
    assert response.status_code == 200, response.text
