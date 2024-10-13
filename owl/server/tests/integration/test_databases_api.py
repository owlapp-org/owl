import requests
from tests.conftest import api_url


def test_create_database(use_access_token) -> None:
    response = requests.post(
        api_url("databases"),
        json={
            "name": "test",
            "pool_size": 1,
            "description": "test description",
        },
        headers={"Authorization": f"Bearer {use_access_token}"},
    )
    assert response.status_code == 200, response.text
    response_json = response.json()
    assert response_json["name"] == "test"
    assert response_json["pool_size"] == 1
    assert response_json["owner"] is not None


def test_update_database(use_access_token) -> None:
    response = requests.post(
        api_url("databases"),
        json={
            "name": "test",
            "pool_size": 1,
            "description": "test description",
        },
        headers={"Authorization": f"Bearer {use_access_token}"},
    )
    assert response.status_code == 200
    id = response.json()["id"]
    response = requests.put(
        api_url(f"databases/{id}"),
        json={
            "name": "test 2",
        },
        headers={"Authorization": f"Bearer {use_access_token}"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "test 2"


def test_delete_database(use_access_token) -> None:
    response = requests.post(
        api_url("databases"),
        json={
            "name": "test",
            "pool_size": 1,
            "description": "test description",
        },
        headers={"Authorization": f"Bearer {use_access_token}"},
    )
    assert response.status_code == 200, response.text
    id = response.json()["id"]
    response = requests.delete(
        api_url(f"databases/{id}"),
        headers={"Authorization": f"Bearer {use_access_token}"},
    )
    assert response.status_code == 200, response.text


def test_get_databases(use_access_token) -> None:
    response = requests.post(
        api_url("databases"),
        json={
            "name": "test 1",
            "pool_size": 1,
            "description": "test 1 description",
        },
        headers={"Authorization": f"Bearer {use_access_token}"},
    )
    assert response.status_code == 200
    response = requests.post(
        api_url("databases"),
        json={
            "name": "test 2",
            "pool_size": 1,
            "description": "test 2 description",
        },
        headers={"Authorization": f"Bearer {use_access_token}"},
    )
    assert response.status_code == 200
    response = requests.get(
        api_url("databases"),
        headers={"Authorization": f"Bearer {use_access_token}"},
    )
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_get_database(use_access_token) -> None:
    response = requests.post(
        api_url("databases"),
        json={
            "name": "test 1",
            "pool_size": 1,
            "description": "test 1 description",
        },
        headers={"Authorization": f"Bearer {use_access_token}"},
    )
    assert response.status_code == 200
    id = response.json()["id"]
    response = requests.get(
        api_url(f"databases/{id}"),
        headers={"Authorization": f"Bearer {use_access_token}"},
    )
    assert response.status_code == 200
    assert response.json()["id"] == id


def test_execute(use_access_token):
    response = requests.post(
        api_url("databases"),
        json={
            "name": "test 1",
            "pool_size": 1,
            "description": "test 1 description",
        },
        headers={"Authorization": f"Bearer {use_access_token}"},
    )
    assert response.status_code == 200, response.text

    id = response.json()["id"]
    query = "select 1 as a"
    response = requests.post(
        api_url("databases/run"),
        json={
            "query": query,
        },
        params={"database_id": id},
        headers={"Authorization": f"Bearer {use_access_token}"},
    )

    assert response.status_code == 200, response.text
    assert response.json()["statement_type"] == "SELECT"
    assert response.json()["columns"] == ["a"]
    assert response.json()["data"] == [{"a": 1}]

    query = "create table test_table(a int, b string)"
    response = requests.post(
        api_url("databases/run"),
        json={
            "query": query,
        },
        params={"database_id": id},
        headers={"Authorization": f"Bearer {use_access_token}"},
    )
    assert response.status_code == 200, response.text
    assert response.json()["statement_type"] == "CREATE"

    query = "insert into test_table (a, b) values (1, 'a')"
    response = requests.post(
        api_url("databases/run"),
        json={
            "query": query,
        },
        params={"database_id": id},
        headers={"Authorization": f"Bearer {use_access_token}"},
    )
    assert response.status_code == 200, response.text
    assert response.json()["statement_type"] == "INSERT"
    assert response.json()["affected_rows"] == 1

    query = "select * from test_table"
    response = requests.post(
        api_url("databases/run"),
        json={
            "query": query,
        },
        params={"database_id": id},
        headers={"Authorization": f"Bearer {use_access_token}"},
    )
    assert response.status_code == 200, response.text
    assert response.json()["statement_type"] == "SELECT"
    assert response.json()["data"] == [{"a": 1, "b": "a"}]


def test_run_with_macros(use_access_token):
    macro_file_name = "macro-test.j2"
    macro_file_content = """
        {% macro greet(name) %}
            'Hello, {{ name }}!'
        {% endmacro %}
    """
    response = requests.post(
        api_url("macros"),
        json={"name": macro_file_name, "content": macro_file_content},
        headers={"Authorization": f"Bearer {use_access_token}"},
    )
    assert response.status_code == 200, response.text
    id = response.json()["id"]
    response = requests.get(
        api_url(f"macros/{id}/exists"),
        headers={"Authorization": f"Bearer {use_access_token}"},
    )
    assert response.status_code == 200, response.text
    assert response.json()["exists"]

    query = "select {{ greet('Alice') }} as demo_col"
    response = requests.post(
        api_url("databases/run"),
        json={
            "query": query,
        },
        headers={"Authorization": f"Bearer {use_access_token}"},
    )
    assert response.status_code == 200, response.text
    assert response.json()["statement_type"] == "SELECT"
    assert "Hello, Alice!" in response.json()["data"][0]["demo_col"]
