from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "service": "azure-security-automation-platform",
    }


def test_homepage():
    response = client.get("/")

    assert response.status_code == 200
    assert "Utility Hub" in response.text


def test_calculator_addition():
    response = client.post(
        "/api/v1/calculator",
        json={
            "operation": "add",
            "a": 10,
            "b": 5,
        },
    )

    assert response.status_code == 200
    assert response.json()["result"] == 15


def test_calculator_division_by_zero():
    response = client.post(
        "/api/v1/calculator",
        json={
            "operation": "divide",
            "a": 10,
            "b": 0,
        },
    )

    assert response.status_code == 400


def test_cidr_calculation():
    response = client.post(
        "/api/v1/cidr",
        params={"cidr": "192.168.1.0/24"},
    )

    assert response.status_code == 200

    data = response.json()

    assert data["network"] == "192.168.1.0"
    assert data["broadcast"] == "192.168.1.255"
    assert data["subnet_mask"] == "255.255.255.0"
    assert data["wildcard_mask"] == "0.0.0.255"
    assert data["first_host"] == "192.168.1.1"
    assert data["last_host"] == "192.168.1.254"
    assert data["total_addresses"] == 256
    assert data["usable_hosts"] == 254
    assert data["prefix_length"] == 24


def test_unit_conversion():
    response = client.post(
        "/api/v1/convert",
        params={
            "category": "length",
            "from_unit": "km",
            "to_unit": "m",
            "value": 5,
        },
    )

    assert response.status_code == 200
    assert response.json()["result"] == 5000