# Pizzaria

Backend de um sistema de pedidos de pizzaria, desenvolvido em Python com FastAPI, SQLAlchemy e PostgreSQL.

## Sobre o projeto

API para gerenciar pedidos de uma pizzaria: cadastro de usuários, autenticação, criação de pedidos e itens de pedido, com controle de acesso via token (usuários comuns e admin).

## Tecnologias

- **Python 3.14**
- **FastAPI** — rotas assíncronas
- **SQLAlchemy** — ORM
- **Alembic** — migrações de banco de dados
- **PostgreSQL** — banco de dados
- **Poetry** — gerenciamento de dependências
- **Docker** — containerização




## Serviços (Docker Compose)

* Serviço	    Imagem/Build	Container      	Porta

* db	        postgres:16	    pizzaria_db	    5433:5432

* aplicativo	build local     pizzaria_app    8000:8000
            (Dockerfile)		          

* frontend	nginx:alpine	pizzaria_frontend	5500:80


- O container da aplicação, ao subir, já roda `alembic upgrade head` e em seguida inicia o `uvicorn`. O frontend serve os arquivos estáticos da pasta `frontend/` via Nginx.


## Funcionalidades

- Cadastro e autenticação de usuários (com permissão de admin)
- Criação e gerenciamento de pedidos
- Adição de itens ao pedido
- Proteção de rotas por token de autenticação

## Como rodar o projeto

### Pré-requisitos

- Docker
- Docker Compose

### Passo a passo

1. Clone o repositório

git clone https://github.com/sthefanypereira521-dotcom/pizzaria.git
cd pizzaria


2. Crie um arquivo `.env` na raiz do projeto com as variáveis do banco:

.env
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=pizzaria


3. Suba a aplicação (API, banco, migrações e frontend rodam dentro dos containers)

* docker-compose up --build


* Todo o ambiente (dependências, banco de dados e migrações do Alembic) já está configurado dentro do Docker  não é necessário instalar Python, Poetry ou PostgreSQL localmente.


### Acessando os serviços

- **API:** `http://localhost:8000`
- **Frontend:** `http://localhost:5500`
- **Banco de dados (Postgres):** `localhost:5433`


## Documentação da API

Com o projeto rodando, acesse:

http://localhost:8000/docs

(Swagger gerado automaticamente pelo FastAPI)



## Testes

- O projeto conta com testes automatizados (pytest), organizados em teste/:

- conftest.py configura o banco de testes e as fixtures (sessão de banco e client de teste)

- auth_router_test.py  testa criação de conta, e-mail já cadastrado e login

- order_router_test.py  testa criação e cancelamento de pedidos


**os testes usam um banco **SQLite em memória**, criado do zero a cada execução e descartado logo em seguida  ou seja, nenhum dado de teste fica salvo ou interfere no banco real (PostgreSQL).

* Para rodar os testes dentro do container da aplicação:
- docker exec -it pizzaria_app pytest


## Autor

Desenvolvido por [Sthefany Pereira](https://github.com/sthefanypereira521-dotcom).