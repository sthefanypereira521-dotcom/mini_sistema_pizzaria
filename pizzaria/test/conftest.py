import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine

from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from database.database import Base


from dependencias import pegar_sessao
from main import app
from models.models import Usuario, Pedido, ItemPedido


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
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[pegar_sessao] = override_pegar_sessao

    with TestClient(app) as cliente:
        yield cliente

    app.dependency_overrides.clear()
