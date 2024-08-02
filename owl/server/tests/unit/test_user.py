from app.models.user import User


def test_verify_password():
    assert User().hash_password("123").verify_password("123")
