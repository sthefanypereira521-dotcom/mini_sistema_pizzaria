from fastapi.testclient import TestClient


def test_criar_pedidos(client):
    client.post(
        "/auth/criar_conta",
        json={
            "nome": "sal",
            "email": "salteste@gmail.com",
            "senha": "senha_teste",
            "ativo": False,
            "admin": False
        }
    )

    login_response = client.post(
        "/auth/Login",
        json={
            "email": "salteste@gmail.com",
            "senha": "senha_teste"
        }

    )

    token = login_response.json()["access_token"]

    headers = {
        "Authorization": f"Bearer {token}"
    }

    response = client.post(
        "/order/pedidos",
        json={
            "id_usuario": 1
        },
        headers=headers
    )

    assert response.status_code == 200
    assert "pedido criado com sucesso." in response.json()["mensagem"]


def test_cancelar_pedido_id(client):

    # cria conta

    client.post(
        "/auth/criar_conta",
        json={
            "nome": "sal",
            "email": "salteste@gmail.com",
            "senha": "senha_teste",
            "ativo": False,
            "admin": False
        }
    )

    # faz login

    login_response = client.post(
        "/auth/Login",
        json={
            "email": "salteste@gmail.com",
            "senha": "senha_teste"
        }

    )

    # pega o token

    token = login_response.json()["access_token"]

    headers = {
        "Authorization": f"Bearer {token}"
    }

    # cria pedido

    pedido_response = client.post(
        "/order/pedidos",
        json={
            "id_usuario": 1
        },
        headers=headers
    )

    
    # pegando mensagem

    mensagem = pedido_response.json()["mensagem"]

    # pegando o id

    id_pedido = int(mensagem.split(":")[-1].strip())

    # cancelar pedido

    response = client.post(
        "/order/pedido/cancelar/id_pedido",
        params={"id_pedido": id_pedido},
        headers=headers
    )

    assert response.status_code == 200
    assert "cancelado com sucesso" in response.json()["mensagem"]
