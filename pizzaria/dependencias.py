from fastapi import Depends, HTTPException
from pizzaria.database.database import SessionLocal
from pizzaria.models.models import Usuario
from jose import jwt, JWTError
from pizzaria.security import SECRET_KEY, ALGORITHM, oauth2_schema


def pegar_sessao():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def verificar_token(token: str = Depends(oauth2_schema), session=Depends(pegar_sessao)):
    try:
        dict_info = jwt.decode(token, SECRET_KEY, ALGORITHM)
        id_usuario = int(dict_info.get("sub"))
    except JWTError:
        raise HTTPException(status_code=401, detail="acesso Negado")
    usuario = session.query(Usuario).filter(Usuario.id == id_usuario).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="acesso inválido")
    return usuario


