const form = document.getElementById("registerForm");
const nome = document.getElementById("nome");
const email = document.getElementById("email");
const senha = document.getElementById("senha");
const confirmarSenha = document.getElementById("confirmar_senha");
const btnRegister = document.getElementById("btnRegister");
const message = document.getElementById("message");
const strengthBar = document.getElementById("strengthBar");

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
        btnRegister.classList.add("loading");
        btnRegister.disabled = true;
    } else {
        btnRegister.classList.remove("loading");
        btnRegister.disabled = false;
    }
}

function verificarForcaSenha(senha) {
    if (senha.length < 6) {
        strengthBar.className = "bar";
    } else if (senha.length < 8) {
        strengthBar.className = "bar weak";
    } else if (senha.length < 12) {
        strengthBar.className = "bar medium";
    } else {
        strengthBar.className = "bar strong";
    }
}

// Verificar força da senha ao digitar
senha.addEventListener("input", function() {
    verificarForcaSenha(senha.value);
    limparMensagem();
});

// Limpar mensagem ao começar a digitar
nome.addEventListener("input", limparMensagem);
email.addEventListener("input", limparMensagem);
confirmarSenha.addEventListener("input", limparMensagem);

async function criarConta(event) {
    event.preventDefault();
    limparMensagem();

    const dadosConta = {
        nome: nome.value.trim(),
        email: email.value.trim(),
        senha: senha.value,
        ativo: true,
        admin: true
    };

    // Validações
    if (!dadosConta.nome) {
        mostrarMensagem("Informe seu nome!", "error");
        return;
    }

    if (!dadosConta.email) {
        mostrarMensagem("Informe seu e-mail!", "error");
        return;
    }

    if (!dadosConta.senha) {
        mostrarMensagem("Informe sua senha!", "error");
        return;
    }

    if (dadosConta.senha.length < 6) {
        mostrarMensagem("A senha deve ter pelo menos 6 caracteres!", "error");
        return;
    }

    if (dadosConta.senha !== confirmarSenha.value) {
        mostrarMensagem("As senhas não coincidem!", "error");
        return;
    }

    setLoading(true);

    try {
        const response = await fetch("http://127.0.0.1:8000/auth/criar_conta", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dadosConta)
        });

        const dados = await response.json();

        if (!response.ok) {
            throw new Error(dados.detail || "Erro ao criar conta");
        }

        mostrarMensagem("Conta criada com sucesso! Redirecionando para login...", "success");

        // Redirecionar para login após 2s
        setTimeout(() => {
            window.location.href = "login.html";
        }, 2000);

    } catch (erro) {
        console.error("Erro ao criar conta:", erro);
        mostrarMensagem(erro.message || "Erro ao criar conta. Tente novamente.", "error");
    } finally {
        setLoading(false);
    }
}

form.addEventListener("submit", criarConta);