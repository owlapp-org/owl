import csv
import tempfile

import requests
from app.models.datafile import DataFile
from pytest import Session
from tests.conftest import api_url


def test_upload_datafile(use_access_token: str, db: Session) -> None:
    data = [
        ["Name", "Age", "City"],
        ["Alice", 30, "New York"],
        ["Bob", 25, "Los Angeles"],
        ["Charlie", 35, "Chicago"],
    ]

    with tempfile.NamedTemporaryFile(
        mode="w", newline="", suffix=".csv", delete=False
    ) as f:
        writer = csv.writer(f)
        writer.writerows(data)
        temp_file_name = f.name

    with open(temp_file_name, "rb") as f:
        response = requests.post(
            api_url("files/upload"),
            files={"file": f},
            headers={"Authorization": f"Bearer {use_access_token}"},
        )
        assert response.status_code == 200, response.text
        id = response.json()["id"]
        with db() as session:
            uploaded_file = session.query(DataFile).filter(DataFile.id == id).first()
            assert uploaded_file is not None, "File not found in database"

        response = requests.get(
            api_url(f"files/{id}/exists"),
            headers={"Authorization": f"Bearer {use_access_token}"},
        )
        assert response.status_code == 200, response.text
        assert response.json()["exists"]


def test_delete_datafile(use_access_token: str, db: Session):
    data = [
        ["Name", "Age", "City"],
        ["Alice", 30, "New York"],
        ["Bob", 25, "Los Angeles"],
        ["Charlie", 35, "Chicago"],
    ]

    with tempfile.NamedTemporaryFile(
        mode="w", newline="", suffix=".csv", delete=False
    ) as f:
        writer = csv.writer(f)
        writer.writerows(data)
        temp_file_name = f.name

    with open(temp_file_name, "rb") as f:
        response = requests.post(
            api_url("files/upload"),
            files={"file": f},
            headers={"Authorization": f"Bearer {use_access_token}"},
        )
        assert response.status_code == 200, response.text
        id = response.json()["id"]
        response = requests.delete(
            api_url(f"files/{id}"),
            headers={"Authorization": f"Bearer {use_access_token}"},
        )
        assert response.status_code == 200, response.text

        response = requests.get(
            api_url(f"files/{id}/exists"),
            headers={"Authorization": f"Bearer {use_access_token}"},
        )
        assert response.status_code == 200, response.text
        assert not response.json()["exists"]

        with db() as session:
            uploaded_file = session.query(DataFile).filter(DataFile.id == id).first()
            assert uploaded_file is None, "File is not removed from database"


def test_rename_datafile(use_access_token: str, db: Session) -> None:
    data = [
        ["Name", "Age", "City"],
        ["Alice", 30, "New York"],
        ["Bob", 25, "Los Angeles"],
        ["Charlie", 35, "Chicago"],
    ]

    with tempfile.NamedTemporaryFile(
        mode="w", newline="", suffix=".csv", delete=False
    ) as f:
        writer = csv.writer(f)
        writer.writerows(data)
        temp_file_name = f.name

    with open(temp_file_name, "rb") as f:
        response = requests.post(
            api_url("files/upload"),
            files={"file": f},
            headers={"Authorization": f"Bearer {use_access_token}"},
        )
        assert response.status_code == 200, response.text
        id = response.json()["id"]
        with db() as session:
            uploaded_file = session.query(DataFile).filter(DataFile.id == id).first()
            assert uploaded_file is not None, "File not found in database"

        response = requests.put(
            api_url(f"files/{id}/rename"),
            json={
                "name": "test.csv",
            },
            headers={"Authorization": f"Bearer {use_access_token}"},
        )
        assert response.status_code == 200, response.text

        response = requests.get(
            api_url(f"files/{id}"),
            headers={"Authorization": f"Bearer {use_access_token}"},
        )
        assert response.status_code == 200, response.text
        assert response.json()["name"] == "test.csv"
