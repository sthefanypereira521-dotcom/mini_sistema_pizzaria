from fastapi.testclient import TestClient


def test_criar_conta(client):
    response = client.post(
        "/auth/criar_conta",
        json={
            "nome": "raul",
            "email": "raulteste@gmail.com",
            "senha": "senha_teste",
            "ativo": False,
            "admin": False
        }
    )

    assert response.status_code == 200
    assert response.json()["mensagem"] == (
        "usuario(a) cadastrado com sucesso raulteste@gmail.com"
    )


def test_email_existente(client):
    client.post(
        "/auth/criar_conta",
        json={
            "nome": "raul",
            "email": "raulteste@gmail.com",
            "senha": "senha_teste",
            "ativo": False,
            "admin": False
        }
    )

    response = client.post(
        "/auth/criar_conta",
        json={
            "nome": "pessoa",
            "email": "raulteste@gmail.com",
            "senha": "senha_teste1",
            "ativo": False,
            "admin": False
        }
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "email ja cadastrado"
    )


def test_Login(client):
    client.post(
        "/auth/criar_conta",
        json={
            "nome": "gau",
            "email": "teste@gmail.com",
            "senha": "teste123",
            "ativo": False,
            "admin": False
        }
    )

    response = client.post(
        "/auth/Login",
        json={
            "email": "teste@gmail.com",
            "senha": "teste123"
        }

    )

    assert response.status_code == 200
    assert "access_token" in response.json()
    assert "refresh_token" in response.json()
    assert response.json()["token_type"] == "Bearer"
