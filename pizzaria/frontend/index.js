const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const senha = document.getElementById("senha");
const btnLogin = document.getElementById("btnLogin");
const message = document.getElementById("message");

function mostrarMensagem(texto, tipo) {
    message.textContent = texto;
    message.className = "message " + tipo;
}

function limparMensagem() {
    message.textContent = "";
    message.className = "message";
}

function setLoading(loading) {
    if (loading) {
        btnLogin.classList.add("loading");
        btnLogin.disabled = true;
    } else {
        btnLogin.classList.remove("loading");
        btnLogin.disabled = false;
    }
}

async function fazerLogin(event) {
    event.preventDefault();
    limparMensagem();

    const dadosLogin = {
        email: email.value.trim(),
        senha: senha.value
    };

    if (!dadosLogin.email || !dadosLogin.senha) {
        mostrarMensagem("Preencha todos os campos!", "error");
        return;
    }

    setLoading(true);

    try {
        const response = await fetch("http://127.0.0.1:8000/auth/Login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dadosLogin)
        });

        const dados = await response.json();

        if (!response.ok) {
            throw new Error(dados.detail || "Erro ao fazer login");
        }

        // Salvar tokens no localStorage
        localStorage.setItem("access_token", dados.access_token);
        localStorage.setItem("refresh_token", dados.refresh_token);

        mostrarMensagem("Login realizado com sucesso! Redirecionando...", "success");

        // Redirecionar após 1.5s
        setTimeout(() => {
            window.location.href = "pedidos.html";
        }, 1500);

    } catch (erro) {
        console.error("Erro no login:", erro);
        mostrarMensagem(erro.message || "Erro ao fazer login. Tente novamente.", "error");
    } finally {
        setLoading(false);
    }
}

form.addEventListener("submit", fazerLogin);

// Limpar mensagem ao começar a digitar
email.addEventListener("input", limparMensagem);
senha.addEventListener("input", limparMensagem);