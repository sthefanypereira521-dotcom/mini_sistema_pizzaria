from fastapi import APIRouter, Depends, HTTPException
from models.models import Usuario
from dependencias import pegar_sessao, verificar_token
from security import bcrypt_context, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, SECRET_KEY
from schemas.schemas import UsuarioSchema, LoginSchema
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from fastapi.security import OAuth2PasswordRequestForm


def criar_token(id_usuario, duracao_token=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)):
    data_expiracao = datetime.now(timezone.utc) + duracao_token
    dict_info = {"sub": str(id_usuario), "exp": data_expiracao}
    jwt_codificado = jwt.encode(dict_info, SECRET_KEY, ALGORITHM)
    return jwt_codificado


def autenticar_usuario(email, senha, session):
    usuario = session.query(Usuario).filter(Usuario.email == email).first()
    if not usuario:
        return False
    elif not bcrypt_context.verify(senha, usuario.senha):
        return False
    return usuario


auth_router = APIRouter(prefix="/auth", tags=["auth"])


@auth_router.get("/")
async def home():
    """
    Rota padrão de autenticação do nosso sistema
    """
    return {"mensagem": "você acessou a rota padrão de autenticação", "autenticado": False}


@auth_router.post("/criar_conta")
async def criar_conta(usuario_schema: UsuarioSchema, session=Depends(pegar_sessao)):
    usuario = session.query(Usuario).filter(
        Usuario.email == usuario_schema.email).first()
    if usuario:
        # ja existe com esse email
        raise HTTPException(status_code=400, detail="email ja cadastrado")
    else:
        senha_cripto = bcrypt_context.hash(usuario_schema.senha)
        novo_usuario = Usuario(usuario_schema.nome, usuario_schema.email,
                               senha_cripto, usuario_schema.ativo, usuario_schema.admin)
        session.add(novo_usuario)
        session.commit()
        session.refresh(novo_usuario)
        return {"mensagem": f"usuario(a) cadastrado com sucesso {usuario_schema.email}"}


@auth_router.post("/Login")
async def login(login_schema: LoginSchema, session=Depends(pegar_sessao)):
    usuario = autenticar_usuario(
        login_schema.email, login_schema.senha, session)
    if not usuario:
        raise HTTPException(
            status_code=400, detail="usuario nao encontrado ou credenciais inválidas")
    else:
        access_token = criar_token(usuario.id)
        refresh_token = criar_token(
            usuario.id, duracao_token=timedelta(days=7))
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "Bearer"
        }


@auth_router.get("/refresh")
async def use_refresh_token(usuario: Usuario = Depends(verificar_token)):
    access_token = criar_token(usuario.id)
    return {
        "access_token": access_token,
        "token_type": "Bearer"
    }


@auth_router.post("/login_form")
async def login_form(dados_formulario: OAuth2PasswordRequestForm = Depends(), session=Depends(pegar_sessao)):
    usuario = autenticar_usuario(
        dados_formulario.username, dados_formulario.password, session)
    if not usuario:
        raise HTTPException(
            status_code=400, detail="usuario nao encontrado ou credenciais inválidas")
    else:
        access_token = criar_token(usuario.id)       
        return {
            "access_token": access_token,           
            "token_type": "Bearer"
        }
