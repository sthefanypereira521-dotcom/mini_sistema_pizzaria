from fastapi import APIRouter, Depends, HTTPException
from dependencias import pegar_sessao, verificar_token
from pizzaria.schemas.schemas import PedidoSchema, ItemPedidoSchema, ResponsePedidoDoSchema, List
from models.models import Pedido, Usuario, ItemPedido


order_router = APIRouter(
    prefix="/order", tags=["pedidos"], dependencies=[Depends(verificar_token)])


@order_router.get("/")
async def pedidos():
    """
    essa é a rota padrao de pedidos do nosso sistema

    """
    return {"mensagem": "voce acessou a rota de pedidos"}


@order_router.post("/pedidos")
async def criar_pedido(pedido_schema: PedidoSchema, session=Depends(pegar_sessao)):
    """
     criação de pedidos

    """
    novo_pedido = Pedido(usuario=pedido_schema.id_usuario)
    session.add(novo_pedido)
    session.commit()
    return {"mensagem": f"pedido criado com sucesso. id do pedido: {novo_pedido.id}"}


@order_router.post("/pedido/cancelar/id_pedido")
async def cancelar_pedido(id_pedido: int, session=Depends(pegar_sessao), usuario: Usuario = Depends(verificar_token)):
    pedido = session.query(Pedido).filter(Pedido.id == id_pedido).first()
    if not pedido:
        raise HTTPException(status_code=400, detail="pedido não encontrado")
    if not usuario.admin and usuario.id != pedido.usuario:
        raise HTTPException(
            status_code=401, detail="você não tem autorização para modificar")
    pedido.status = "CANCELADO"
    session.commit()
    return {
        "mensagem": f"pedido numero: {pedido.id} cancelado com sucesso",
        "pedido": pedido
    }


@order_router.get("/listar")
async def listar_pedidos(session=Depends(pegar_sessao), usuario: Usuario = Depends(verificar_token)):
    if not usuario.admin:
        raise HTTPException(
            status_code=401, detail="você não tem autorizacão para fazer essa operação")
    else:
        pedidos = session.query(Pedido).all()
        return {
            "pedidos": pedidos
        }


@order_router.post("/pedido/adicionar-item/{id_pedido}")
async def adicionar_item_pedido(id_pedido: int,
                                item_pedido_schema: ItemPedidoSchema, session=Depends(pegar_sessao), usuario: Usuario = Depends(verificar_token)):
    pedido = session.query(Pedido).filter(Pedido.id == id_pedido).first()
    if not pedido:
        raise HTTPException(status_code=400, detail="pedido não existente")
    if not usuario.admin and usuario.id != pedido.usuario:
        raise HTTPException(
            status_code=401, detail="não tem autorização para a operação")
    item_pedido = ItemPedido(item_pedido_schema.quantidade,
                             item_pedido_schema.sabor,
                             item_pedido_schema.tamanho,
                             item_pedido_schema.preco_unitario,
                             id_pedido)

    session.add(item_pedido)
    session.flush()
    pedido.calcular_preco()
    session.commit()
    return {
        "mensagem": "item criado com sucesso",
        "item_id": item_pedido.id,
        "pedido": pedido
    }


@order_router.post("/pedido/remover-item/{id_item_pedido}")
async def remover_item_pedido(id_item_pedido: int,
                              session=Depends(pegar_sessao),
                              usuario: Usuario = Depends(verificar_token)):
    item_pedido = session.query(ItemPedido).filter(
        ItemPedido.id == id_item_pedido).first()

    pedido = session.query(Pedido).filter(
        Pedido.id == item_pedido.pedido).first()

    if not item_pedido:
        raise HTTPException(
            status_code=400, detail="item no pedido não existe")

    if not usuario.admin and usuario.id != pedido.usuario:

        raise HTTPException(
            status_code=401, detail="não tem autorização para a operação")

    session.delete(item_pedido)
    pedido.calcular_preco()
    session.commit()
    return {
        "mensagem": "item removido com sucesso",
        "quantidade_itens_pedido": len(pedido.itens),
        "pedido": pedido
    }


@order_router.post("/pedido/finalizar/id_pedido")
async def finalizar_pedido(id_pedido: int, session=Depends(pegar_sessao), usuario: Usuario = Depends(verificar_token)):
    pedido = session.query(Pedido).filter(Pedido.id == id_pedido).first()

    if not pedido:
        raise HTTPException(status_code=400, detail="pedido não encontrado")

    if not usuario.admin and usuario.id != pedido.usuario:
        raise HTTPException(
            status_code=401, detail="você não tem autorização para modificar")

    pedido.status = "FINALIZADO"
    session.commit()
    return {
        "mensagem": f"pedido numero: {pedido.id} finalizado com sucesso",
        "pedido": pedido
    }


@order_router.get("/pedido/{id_pedido}")
async def visualizar_pedido(id_pedido: int,
                            session=Depends(pegar_sessao),
                            usuario: Usuario = Depends(verificar_token)):
    pedido = session.query(Pedido).filter(Pedido.id == id_pedido).first()

    if not pedido:
        raise HTTPException(status_code=400, detail="pedido não encontrado")

    if not usuario.admin and usuario.id != pedido.usuario:
        raise HTTPException(
            status_code=401, detail="você não tem autorização para modificar")
    return {
        "quantidade_itens_pedido": len(pedido.itens),
        "pedido": pedido
    }


@order_router.get("/listar/pedidos-usuario", response_model=List[ResponsePedidoDoSchema])
async def listar_pedidos(session=Depends(pegar_sessao), usuario: Usuario = Depends(verificar_token)):
    pedidos = session.query(Pedido).filter(Pedido.usuario == usuario.id).all()
    return pedidos


