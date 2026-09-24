from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_security_metadata():
    assert app.title == "Azure Security Automation Platform"
    assert app.version == "1.0.0"
    assert "security" in app.description.lower()


def test_key_vault_endpoint(monkeypatch):
    def fake_get_secret(secret_name):
        assert secret_name == "utility-message"
        return "test-secret"

    monkeypatch.setattr("app.main.get_secret", fake_get_secret)

    response = client.get("/api/v1/security/key-vault")

    assert response.status_code == 200
    assert response.json() == {
        "status": "success",
        "message": "test-secret",
    }


def test_key_vault_error_is_not_exposed(monkeypatch):
    def fake_get_secret(secret_name):
        raise Exception("internal credential or vault error")

    monkeypatch.setattr("app.main.get_secret", fake_get_secret)

    response = client.get("/api/v1/security/key-vault")

    assert response.status_code == 503
    assert response.json() == {
        "detail": "Key Vault access is unavailable."
    }