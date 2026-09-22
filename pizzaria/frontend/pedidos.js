const API_URL = "http://127.0.0.1:8000/order";

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
    const sabor = prompt("Sabor da pizza (ex: Calabresa, Margherita):");
    if (!sabor) return;

    const tamanho = prompt("Tamanho (P, M, G):");
    if (!tamanho) return;

    const quantidade = prompt("Quantidade:");
    if (!quantidade) return;

    const precoUnitario = prompt("Preço unitário (ex: 35.90):");
    if (!precoUnitario) return;

    try {
        const response = await fetch(`${API_URL}/pedido/adicionar-item/${idPedido}`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                sabor: sabor,
                tamanho: tamanho,
                quantidade: parseInt(quantidade),
                preco_unitario: parseFloat(precoUnitario)
            })
        });

        const dados = await response.json();

        if (!response.ok) {
            throw new Error(dados.detail || "Erro ao adicionar item");
        }

        mostrarMensagem("meus-pedidos-message", dados.mensagem, "success");
        listarMeusPedidos();
    } catch (erro) {
        mostrarMensagem("meus-pedidos-message", erro.message, "error");
    }
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