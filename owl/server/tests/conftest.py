import pydash as _
import pytest
import requests
from app import create_app
from app.models import User
from app.settings import settings
from sqlalchemy.orm import Session

API_URL = f"http://{settings.FLASK_HOST}:5000/api"


def api_url(endpoint: str) -> str:
    return API_URL + "/" + _.trim_start(endpoint, "/")


@pytest.fixture
def db():
    from app.settings import settings

    url = settings.SQLALCHEMY_DATABASE_URI
    # complete
    from app.settings import settings
    from sqlalchemy import create_engine
    from sqlalchemy.orm import scoped_session, sessionmaker

    # Create a new SQLAlchemy engine
    engine = create_engine(url)
    session = scoped_session(sessionmaker(bind=engine))
    yield session


@pytest.fixture
def use_user(db: Session):
    user = User(email="test@app.com", name="Jane Doe").hash_password("test")
    db.add(user)
    db.commit()
    yield user
    db.delete(user)
    db.commit()


@pytest.fixture
def use_access_token(use_user):
    response = requests.post(
        api_url("/auth/login"),
        json={"email": use_user.email, "password": "test"},
    )
    response_json = response.json()
    yield response_json["access_token"]


def find_me(access_token: str) -> dict:
    response = requests.get(
        api_url("users/me"),
        headers={"Authorization": f"Bearer {access_token}"},
    )
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(
            f"Unable to get authenticated user. {response.status_code}:{response.text}"
        )


@pytest.fixture(scope="session")
def use_app_context():
    app = create_app()
    with app.app_context():
        yield app
