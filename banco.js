// =====================================================================
// SISTEMA SIMPLES DE BANCO (LÓGICA DE CLASSES)
// =====================================================================

// CLASSE BANCO CENTRAL
class bancoCentral {
    movimentacoesGrandes = []

    movimentacoesAltas(pessoa, valor, tipo){
        if (valor > 1000){
            this.movimentacoesGrandes.push({
                pessoa: pessoa.nome,
                valor: valor,
                tipo: tipo
            })
            console.log("📢 Banco Central: movimentação de alto valor registrada.")
        }
    }
}

// CLASSE BANCO
class banco {
    movimentacoes = []
    agencias = []

    registroMovimentacao(pessoa, valor, tipo){
        this.movimentacoes.push({
            pessoa: pessoa.nome,
            valor: valor,
            tipo: tipo
        })
        console.log("💼 Banco: movimentação registrada.")
    }
}

// CLASSE AGÊNCIA
class agencia extends banco {
    clientes = []
    nome
    banco

    constructor(nome, banco){
        super()
        this.nome = nome
        this.banco = banco
        banco.agencias.push(this)
    }

    registrarOperacao(pessoa, valor, tipo){
        this.movimentacoes.push({
            pessoa: pessoa.nome,
            valor: valor,
            tipo: tipo
        })
        this.banco.registroMovimentacao(pessoa, valor, tipo)
    }

    registrarBancoCentral(bc, pessoa, valor, tipo){
        bc.movimentacoesAltas(pessoa, valor, tipo)
    }
}

// CLASSE PESSOA
class pessoa {
    nome
    cpf
    #saldo
    extrato = []
    agencia

    constructor(nome, cpf, saldo, agencia){
        this.nome = nome
        this.cpf = cpf
        this.#saldo = Number(saldo) // Garante que é número
        this.agencia = agencia
        agencia.clientes.push(this)
    }

    get getSaldo(){
        return this.#saldo
    }

    depositar(valor, bancoCentral){
        if(valor <= 0){
            alert("❌ Valor inválido para depósito.")
            return
        }

        this.#saldo += valor
        this.extrato.push({ tipo: "Depósito", valor: valor, saldoAtual: this.#saldo })
        this.agencia.registrarOperacao(this, valor, "Depósito")
        this.agencia.registrarBancoCentral(bancoCentral, this, valor, "Depósito")
        alert("Depósito realizado com sucesso!")
    }

    sacar(valor, bancoCentral){
        if(this.#saldo < valor){
            alert(`❌ Saldo insuficiente. Saldo atual: R$ ${this.#saldo}`)
            return
        }

        this.#saldo -= valor
        this.extrato.push({ tipo: "Saque", valor: valor, saldoAtual: this.#saldo })
        this.agencia.registrarOperacao(this, valor, "Saque")
        this.agencia.registrarBancoCentral(bancoCentral, this, valor, "Saque")
        alert("Saque realizado com sucesso!")
    }

    transferir(destinatario, valor, bancoCentral){
        if(valor <= 0){
            alert("❌ Valor inválido.")
            return
        }
        if(this.#saldo < valor){
            alert("❌ Saldo insuficiente para transferência.")
            return
        }

        this.#saldo -= valor
        destinatario.#saldo += valor // Como estamos dentro da classe, o JS permite acesso ao campo privado, mas idealmente usaria métodos

        this.extrato.push({ tipo: `Enviado para ${destinatario.nome}`, valor: valor, saldoAtual: this.#saldo })
        destinatario.extrato.push({ tipo: `Recebido de ${this.nome}`, valor: valor, saldoAtual: destinatario.getSaldo }) // Usando getter aqui para garantir

        this.agencia.registrarOperacao(this, valor, "Transferência Enviada")
        destinatario.agencia.registrarOperacao(destinatario, valor, "Transferência Recebida")
        this.agencia.registrarBancoCentral(bancoCentral, this, valor, "Transferência")
        
        alert("Transferência realizada!")
    }
}

// ======================================================================
// CONFIGURAÇÃO INICIAL (Backend Simulado)
// ======================================================================

let bc = new bancoCentral()
let bancoBrasil = new banco()
let agenciaCentro = new agencia("Centro", bancoBrasil) // Agência padrão para o exemplo

// Lista global para controlar quem aparece na tela
let listaClientes = []

// Clientes iniciais de teste
let maria = new pessoa("Maria", "000.000.000-01", 100, agenciaCentro)
let matheus = new pessoa("Matheus", "000.000.000-02", 50, agenciaCentro)
listaClientes.push(maria, matheus)


// ======================================================================
// INTERAÇÃO COM O HTML (DOM)
// ======================================================================

// Função auxiliar para atualizar os <select> do HTML
function atualizarSelects() {
    const selectCliente = document.getElementById("clienteSelecionado")
    const selectDestino = document.getElementById("clienteDestino")
    
    // Limpa as opções atuais
    selectCliente.innerHTML = ""
    selectDestino.innerHTML = ""

    // Recria as opções baseadas na listaClientes
    listaClientes.forEach((cliente, index) => {
        let option1 = document.createElement("option")
        option1.value = index // O valor será o índice no array
        option1.text = `${cliente.nome} (Saldo: R$ ${cliente.getSaldo})`
        selectCliente.add(option1)

        let option2 = document.createElement("option")
        option2.value = index
        option2.text = cliente.nome
        selectDestino.add(option2)
    })
}

// 1. CRIAR CLIENTE
function criarCliente() {
    let nome = document.getElementById("nome").value
    let cpf = document.getElementById("cpf").value
    let saldo = document.getElementById("saldo").value

    if(nome === "" || saldo === "") {
        alert("Preencha todos os campos!")
        return
    }

    // Cria o objeto e adiciona na lista
    let novoCliente = new pessoa(nome, cpf, saldo, agenciaCentro)
    listaClientes.push(novoCliente)

    // Atualiza a interface
    atualizarSelects()
    alert("Cliente cadastrado com sucesso!")
    
    // Limpa campos
    document.getElementById("nome").value = ""
    document.getElementById("cpf").value = ""
    document.getElementById("saldo").value = ""
}

// 2. DEPOSITAR
function depositar() {
    let index = document.getElementById("clienteSelecionado").value
    let valor = Number(document.getElementById("valorDeposito").value)
    
    if(listaClientes[index]) {
        listaClientes[index].depositar(valor, bc)
        atualizarSelects() // Atualiza para mostrar saldo novo no select
    }
}

// 3. SACAR
function sacar() {
    let index = document.getElementById("clienteSelecionado").value
    let valor = Number(document.getElementById("valorSaque").value)

    if(listaClientes[index]) {
        listaClientes[index].sacar(valor, bc)
        atualizarSelects()
    }
}

// 4. TRANSFERIR
function transferir() {
    let indexOrigem = document.getElementById("clienteSelecionado").value
    let indexDestino = document.getElementById("clienteDestino").value
    let valor = Number(document.getElementById("valorTransferencia").value)

    if (indexOrigem === indexDestino) {
        alert("Não pode transferir para si mesmo!")
        return
    }

    let remetente = listaClientes[indexOrigem]
    let destinatario = listaClientes[indexDestino]

    remetente.transferir(destinatario, valor, bc)
    atualizarSelects()
}

// 5. MOSTRAR EXTRATO
function mostrarExtrato() {
    let index = document.getElementById("clienteSelecionado").value
    let cliente = listaClientes[index]
    let box = document.getElementById("extratoBox")

    let texto = `Extrato de ${cliente.nome} (CPF: ${cliente.cpf}):\n-----------------------------------\n`
    
    cliente.extrato.forEach(mov => {
        texto += `${mov.tipo} | R$ ${mov.valor} | Saldo Final: R$ ${mov.saldoAtual}\n`
    })

    box.innerText = texto
}

// Roda uma vez ao iniciar para carregar Maria e Matheus nos selects
atualizarSelects()