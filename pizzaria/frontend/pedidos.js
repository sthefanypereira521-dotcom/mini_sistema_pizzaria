const API_URL = "https://mini-sistema-pizzaria.onrender.com/order";

// ============ UTILITÁRIOS ============

function getToken() {
    return localStorage.getItem("access_token");
}

function getAuthHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
    };
}

function mostrarMensagem(elementId, texto, tipo) {
    const el = document.getElementById(elementId);
    el.textContent = texto;
    el.className = "message " + tipo;
    setTimeout(() => {
        el.className = "message";
        el.textContent = "";
    }, 5000);
}

function setLoading(btnId, loading) {
    const btn = document.getElementById(btnId);
    if (loading) {
        btn.classList.add("loading");
        btn.disabled = true;
    } else {
        btn.classList.remove("loading");
        btn.disabled = false;
    }
}

function formatarPreco(valor) {
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

function getStatusClass(status) {
    if (!status) return "status-PENDENTE";
    if (status.includes("CANCELAD")) return "status-CANCELADA";
    if (status.includes("FINALIZAD")) return "status-FINALIZADO";
    return "status-PENDENTE";
}

function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "login.html";
}

// ============ NAVEGAÇÃO ============

function showPanel(panelId, btnElement) {
    // Esconder todos os panels
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
    // Desativar todas as tabs
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    // Mostrar panel selecionado
    document.getElementById(panelId).classList.add("active");
    // Ativar tab selecionada
    if (btnElement) {
        btnElement.classList.add("active");
    }

    // Carregar dados se necessário
    if (panelId === "meus-pedidos") {
        listarMeusPedidos();
    }
}

// ============ ROTA: CRIAR PEDIDO ============

document.getElementById("form-novo-pedido")?.addEventListener("submit", async function(e) {
    e.preventDefault();
    const idUsuario = document.getElementById("id_usuario").value;

    if (!idUsuario) {
        mostrarMensagem("novo-pedido-message", "Informe o ID do usuário!", "error");
        return;
    }

    setLoading("btn-criar-pedido", true);

    try {
        const response = await fetch(`${API_URL}/pedidos`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ id_usuario: parseInt(idUsuario) })
        });

        const dados = await response.json();

        if (!response.ok) {
            throw new Error(dados.detail || "Erro ao criar pedido");
        }

        mostrarMensagem("novo-pedido-message", dados.mensagem, "success");
        document.getElementById("form-novo-pedido").reset();
    } catch (erro) {
        mostrarMensagem("novo-pedido-message", erro.message, "error");
    } finally {
        setLoading("btn-criar-pedido", false);
    }
});

// ============ ROTA: LISTAR MEUS PEDIDOS ============

async function listarMeusPedidos() {
    const listEl = document.getElementById("meus-pedidos-list");

    try {
        const response = await fetch(`${API_URL}/listar/pedidos-usuario`, {
            method: "GET",
            headers: getAuthHeaders()
        });

        const dados = await response.json();

        if (!response.ok) {
            throw new Error(dados.detail || "Erro ao listar pedidos");
        }

        if (!dados || dados.length === 0) {
            listEl.innerHTML = `
                <div class="empty-state">
                    <span class="icon">📦</span>
                    <p>Você ainda não tem pedidos</p>
                </div>
            `;
            return;
        }

        listEl.innerHTML = dados.map(pedido => criarCardPedido(pedido)).join("");
    } catch (erro) {
        mostrarMensagem("meus-pedidos-message", erro.message, "error");
    }
}

// ============ ROTA: LISTAR TODOS (ADMIN) ============

async function listarTodosPedidos() {
    const listEl = document.getElementById("todos-pedidos-list");
    setLoading("btn-listar-todos", true);

    try {
        const response = await fetch(`${API_URL}/listar`, {
            method: "GET",
            headers: getAuthHeaders()
        });

        const dados = await response.json();

        if (!response.ok) {
            throw new Error(dados.detail || "Erro ao listar pedidos");
        }

        if (!dados.pedidos || dados.pedidos.length === 0) {
            listEl.innerHTML = `
                <div class="empty-state">
                    <span class="icon">📦</span>
                    <p>Nenhum pedido encontrado</p>
                </div>
            `;
            return;
        }

        listEl.innerHTML = dados.pedidos.map(pedido => criarCardPedido(pedido)).join("");
    } catch (erro) {
        mostrarMensagem("listar-todos-message", erro.message, "error");
    } finally {
        setLoading("btn-listar-todos", false);
    }
}

// ============ ROTA: VISUALIZAR PEDIDO ============

document.getElementById("form-ver-pedido")?.addEventListener("submit", async function(e) {
    e.preventDefault();
    const idPedido = document.getElementById("ver_id_pedido").value;

    if (!idPedido) {
        mostrarMensagem("ver-pedido-message", "Informe o ID do pedido!", "error");
        return;
    }

    setLoading("btn-ver-pedido", true);

    try {
        const response = await fetch(`${API_URL}/pedido/${idPedido}`, {
            method: "GET",
            headers: getAuthHeaders()
        });

        const dados = await response.json();

        if (!response.ok) {
            throw new Error(dados.detail || "Erro ao buscar pedido");
        }

        const detalhesEl = document.getElementById("pedado-detalhes");
        detalhesEl.innerHTML = criarCardPedido(dados.pedido, true);
        mostrarMensagem("ver-pedido-message", "Pedido encontrado!", "success");
    } catch (erro) {
        mostrarMensagem("ver-pedido-message", erro.message, "error");
    } finally {
        setLoading("btn-ver-pedido", false);
    }
});

// ============ ROTA: CANCELAR PEDIDO ============

async function cancelarPedido(idPedido) {
    if (!confirm(`Deseja realmente cancelar o pedido #${idPedido}?`)) return;

    try {
        const response = await fetch(`${API_URL}/pedido/cancelar/${idPedido}`, {
            method: "POST",
            headers: getAuthHeaders()
        });

        const dados = await response.json();

        if (!response.ok) {
            throw new Error(dados.detail || "Erro ao cancelar pedido");
        }

        mostrarMensagem("meus-pedidos-message", dados.mensagem, "success");
        listarMeusPedidos();
    } catch (erro) {
        mostrarMensagem("meus-pedidos-message", erro.message, "error");
    }
}

// ============ ROTA: FINALIZAR PEDIDO ============

async function finalizarPedido(idPedido) {
    if (!confirm(`Deseja realmente finalizar o pedido #${idPedido}?`)) return;

    try {
        const response = await fetch(`${API_URL}/pedido/finalizar/${idPedido}`, {
            method: "POST",
            headers: getAuthHeaders()
        });

        const dados = await response.json();

        if (!response.ok) {
            throw new Error(dados.detail || "Erro ao finalizar pedido");
        }

        mostrarMensagem("meus-pedidos-message", dados.mensagem, "success");
        listarMeusPedidos();
    } catch (erro) {
        mostrarMensagem("meus-pedidos-message", erro.message, "error");
    }
}

// ============ ROTA: ADICIONAR ITEM ============

async function adicionarItem(idPedido) {
    let dialog = document.getElementById("adicionar-item-dialog");
    if (!dialog) {
        dialog = document.createElement("dialog");
        dialog.id = "adicionar-item-dialog";
        dialog.className = "item-dialog";
        dialog.innerHTML = '<form id="adicionar-item-form" class="item-dialog__form"><div class="item-dialog__heading"><div><p class="item-dialog__eyebrow">Pedido <span id="adicionar-item-pedido"></span></p><h2>Adicionar pizza</h2></div><button type="button" class="item-dialog__close" aria-label="Fechar janela">&times;</button></div><div class="item-dialog__fields"><label class="item-dialog__field item-dialog__field--wide" for="item-sabor">Sabor<input id="item-sabor" name="sabor" type="text" placeholder="Ex.: Calabresa" maxlength="80" required autocomplete="off"></label><label class="item-dialog__field" for="item-tamanho">Tamanho<select id="item-tamanho" name="tamanho" required><option value="" disabled selected>Selecione</option><option value="P">Pequena (P)</option><option value="M">Média (M)</option><option value="G">Grande (G)</option></select></label><label class="item-dialog__field" for="item-quantidade">Quantidade<input id="item-quantidade" name="quantidade" type="number" min="1" max="99" value="1" required></label><label class="item-dialog__field item-dialog__field--wide" for="item-preco">Preço unitário<span class="item-dialog__price-input"><span>R$</span><input id="item-preco" name="preco" type="number" min="0.01" step="0.01" placeholder="0,00" required inputmode="decimal"></span></label></div><p id="adicionar-item-erro" class="item-dialog__error" role="alert"></p><div class="item-dialog__actions"><button type="button" class="item-dialog__cancel">Voltar</button><button type="submit" class="btn btn-primary" id="adicionar-item-submit">Adicionar ao pedido</button></div></form>';
        document.body.appendChild(dialog);
        const fechar = () => dialog.close();
        dialog.querySelector(".item-dialog__close").addEventListener("click", fechar);
        dialog.querySelector(".item-dialog__cancel").addEventListener("click", fechar);
        dialog.addEventListener("click", event => { if (event.target === dialog) fechar(); });
        dialog.querySelector("form").addEventListener("submit", async event => {
            event.preventDefault();
            const form = event.currentTarget;
            if (!form.reportValidity()) return;
            const submit = document.getElementById("adicionar-item-submit");
            const error = document.getElementById("adicionar-item-erro");
            const formData = new FormData(form);
            submit.disabled = true;
            submit.textContent = "Adicionando…";
            error.textContent = "";
            try {
                const response = await fetch(API_URL + "/pedido/adicionar-item/" + dialog.dataset.orderId, {
                    method: "POST", headers: getAuthHeaders(),
                    body: JSON.stringify({ sabor: formData.get("sabor").trim(), tamanho: formData.get("tamanho"), quantidade: Number(formData.get("quantidade")), preco_unitario: Number(formData.get("preco")) })
                });
                const dados = await response.json();
                if (!response.ok) throw new Error(dados.detail || "Não foi possível adicionar a pizza.");
                dialog.close();
                mostrarMensagem("ver-pedido-message", dados.mensagem || "Pizza adicionada ao pedido!", "success");
                const detalhe = document.getElementById("pedado-detalhes");
                if (detalhe && detalhe.innerHTML) {
                    const atualizado = await fetch(API_URL + "/pedido/" + dialog.dataset.orderId, { headers: getAuthHeaders() });
                    const resposta = await atualizado.json();
                    if (atualizado.ok) detalhe.innerHTML = criarCardPedido(resposta.pedido, true);
                }
                listarMeusPedidos();
            } catch (erro) {
                error.textContent = erro.message || "Erro ao adicionar a pizza. Tente novamente.";
            } finally {
                submit.disabled = false;
                submit.textContent = "Adicionar ao pedido";
            }
        });
    }
    dialog.dataset.orderId = idPedido;
    document.getElementById("adicionar-item-pedido").textContent = "#" + idPedido;
    document.getElementById("adicionar-item-form").reset();
    document.getElementById("item-quantidade").value = "1";
    document.getElementById("adicionar-item-erro").textContent = "";
    dialog.showModal();
    document.getElementById("item-sabor").focus();
}
// ============ ROTA: REMOVER ITEM ============

async function removerItem(idItemPedido) {
    if (!confirm(`Deseja realmente remover o item #${idItemPedido}?`)) return;

    try {
        const response = await fetch(`${API_URL}/pedido/remover-item/${idItemPedido}`, {
            method: "POST",
            headers: getAuthHeaders()
        });

        const dados = await response.json();

        if (!response.ok) {
            throw new Error(dados.detail || "Erro ao remover item");
        }

        mostrarMensagem("meus-pedidos-message", dados.mensagem, "success");
        listarMeusPedidos();
    } catch (erro) {
        mostrarMensagem("meus-pedidos-message", erro.message, "error");
    }
}

// ============ RENDERIZAÇÃO ============

function criarCardPedido(pedido, showActions = false) {
    const itensHtml = pedido.itens && pedido.itens.length > 0
        ? pedido.itens.map(item => `
            <div class="order-item">
                <span class="item-info">
                    ${item.quantidade}x ${item.sabor} (${item.tamanho})
                </span>
                <span class="item-price">
                    ${formatarPreco(item.preco_unitario * item.quantidade)}
                    ${showActions ? `<button class="btn btn-danger btn-sm" onclick="removerItem(${item.id})" style="margin-left: 10px;">🗑️</button>` : ''}
                </span>
            </div>
        `).join("")
        : '<p style="color: #999; font-size: 13px;">Nenhum item adicionado</p>';

    const actionsHtml = showActions && pedido.status === "PENDENTE" ? `
        <div class="order-actions">
            <button class="btn btn-primary btn-sm" onclick="adicionarItem(${pedido.id})">➕ Item</button>
            <button class="btn btn-success btn-sm" onclick="finalizarPedido(${pedido.id})">✅ Finalizar</button>
            <button class="btn btn-danger btn-sm" onclick="cancelarPedido(${pedido.id})">❌ Cancelar</button>
        </div>
    ` : '';

    return `
        <div class="order-card">
            <div class="order-header">
                <span class="order-id">Pedido #${pedido.id}</span>
                <span class="order-status ${getStatusClass(pedido.status)}">${pedido.status || "PENDENTE"}</span>
            </div>
            <div class="order-items">
                ${itensHtml}
            </div>
            <div class="order-footer">
                <span class="order-total">Total: ${formatarPreco(pedido.preco || 0)}</span>
                ${actionsHtml}
            </div>
        </div>
    `;
}

// ============ INICIALIZAÇÃO ============

document.addEventListener("DOMContentLoaded", function() {
    // Verificar se está logado
    if (!getToken()) {
        window.location.href = "login.html";
        return;
    }

    // Carregar meus pedidos ao iniciar
    listarMeusPedidos();
});