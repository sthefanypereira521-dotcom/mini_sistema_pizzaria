import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine

from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from database.database import Base


from dependencias import pegar_sessao, verificar_token
from security import bcrypt_context
from routes.auth_routes import criar_token
from main import app
from models.models import Usuario, Pedido, ItemPedido
import uuid


DATABASE_URL = "sqlite:///:memory:"

# criando sqlite:

engine_test = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)

# criando a sessao:

SessionTest = sessionmaker(
    bind=engine_test,
    autocommit=False,
    autoflush=False

)

# criando uma fixture do pytest


@pytest.fixture
def db_session():

    Base.metadata.create_all(bind=engine_test)

    session = SessionTest()

    try:
        yield session
    finally:
        session.close()

    Base.metadata.drop_all(bind=engine_test)


@pytest.fixture
def client(db_session):

    def override_pegar_sessao():
        yield db_session

    overrides_originais = app.dependency_overrides.copy()

    app.dependency_overrides[pegar_sessao] = override_pegar_sessao

    try:
        with TestClient(app) as cliente:
            yield cliente

    finally:
        app.dependency_overrides.clear()
        app.dependency_overrides.update(overrides_originais)



@pytest.fixture
def token_admin(db_session):
    usuario = Usuario (
        nome = "admin",
        email= f"admin{uuid.uuid4()}@gmail.com",
        senha=bcrypt_context.hash("123456"),
        ativo=True,
        admin=True
    )        

    db_session.add(usuario)
    db_session.commit()
    db_session.refresh(usuario)

    token = criar_token(id_usuario=usuario.id)
    return token
