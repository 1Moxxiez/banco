// =====================================================================
// SISTEMA SIMPLES DE BANCO (LÓGICA DE CLASSES) - COMENTÁRIOS LINHA A LINHA
// Abaixo cada linha importante do código está comentada para explicar o que
// exatamente acontece, por que está ali e quais cuidados tomar.
// =====================================================================

// ---------------------------------------------------------------------
// CLASSE BANCO CENTRAL - monitora movimentações acima de R$1000
// ---------------------------------------------------------------------
class bancoCentral {
    // Declaração de propriedade pública: array que vai guardar objetos
    // representando movimentações de alto valor. Inicialmente vazio.
    movimentacoesGrandes = []

    // Método público esse qui'movimentacoesAltas' recebe: pessoa (objeto), valor (número), tipo (string)
    movimentacoesAltas(pessoa, valor, tipo){
        // Se o 'valor' for maior que 1000, então consideramos a movimentação "grande"
        if (valor > 1000){
            // Empurra um objeto com os dados básicos para o array 'movimentacoesGrandes'
            this.movimentacoesGrandes.push({
                // Guardamos somente o nome (pode guardar CPF se quiser identificar unicamente)
                pessoa: pessoa.nome,
                // Valor numérico da movimentação
                valor: valor,
                // Tipo: "Depósito", "Saque", "Transferência", etc.
                tipo: tipo
            })
            // Log no console para desenvolvimento (não conflita com a UI)
            console.log("📢 Banco Central: movimentação de alto valor registrada.")
        }
        // Se o valor for <= 1000, o método não faz nada (retorna undefined implicitamente)
    }
}

// ---------------------------------------------------------------------
// CLASSE BANCO - armazena movimentações de todo o banco e suas agências
// ---------------------------------------------------------------------
class banco {
    // Array que conterá objetos com registros simples de movimentação
    movimentacoes = []
    // Array que conterá referências às agências pertencentes a este banco
    agencias = []

    // Método para registrar movimentações no nível do banco
    registroMovimentacao(pessoa, valor, tipo){
        // Adiciona um objeto de registro ao array 'movimentacoes'
        this.movimentacoes.push({
            pessoa: pessoa.nome, // o nome do cliente (para leitura humana)
            valor: valor,        // o valor movimentado
            tipo: tipo           // o tipo de operação
        })
        // Log informativo
        console.log("💼 Banco: movimentação registrada.")
    }
}

// ---------------------------------------------------------------------
// CLASSE AGÊNCIA - representa uma agência específica do banco
// OBS: ela estende (herda) 'banco', portanto tem 'movimentacoes' e 'agencias'
// ---------------------------------------------------------------------
class agencia extends banco {
    // Lista de clientes dessa agência (cada cliente é uma instância de 'pessoa')
    clientes = []
    // Propriedades para armazenar nome da agência e referência ao banco dono
    nome
    banco

    // Construtor chamado quando fazemos "new agencia(nome, banco)"
    constructor(nome, banco){
        super() // Chama o construtor da classe pai (banco). Aqui garante que movimentacoes/agencias existam.
        this.nome = nome // Define o nome da agência
        this.banco = banco // Guarda referência para o banco "pai"
        // Registra esta agência dentro do array 'agencias' do banco dono.
        // Isso permite que o banco tenha noção de suas agências.
        banco.agencias.push(this)
    }

    // Método para registrar uma operação local e também repassar para o banco
    registrarOperacao(pessoa, valor, tipo){
        // Registra a movimentação na própria agência (array herdado de "banco")
        this.movimentacoes.push({
            pessoa: pessoa.nome,
            valor: valor,
            tipo: tipo
        })

        // Em seguida, registra também no banco geral usando o método do banco
        // Note: this.banco é a instância de 'banco' passada ao construtor
        this.banco.registroMovimentacao(pessoa, valor, tipo)
    }

    // Método que simplesmente chama o serviço do Banco Central para triagem
    registrarBancoCentral(bc, pessoa, valor, tipo){
        // Encaminha os parâmetros: o banco central decide se registra ou não
        bc.movimentacoesAltas(pessoa, valor, tipo)
    }
}

// ---------------------------------------------------------------------
// CLASSE PESSOA - representa um cliente com saldo PRIVADO e histórico (extrato)
// ---------------------------------------------------------------------
class pessoa {
    nome
    cpf
    #saldo // campo privado: só métodos da classe podem acessá-lo diretamente
    extrato = [] // array de objetos com o histórico (tipo, valor, saldo atual)
    agencia   // referência para a agência dessa pessoa

    // Construtor da classe pessoa
    constructor(nome, cpf, saldo, agencia){
        this.nome = nome // nome textual do cliente
        this.cpf = cpf   // CPF (string) — poderia validar formato aqui
        // Armazena o saldo desde já convertido em número (evita problemas com string)
        this.#saldo = Number(saldo)
        this.agencia = agencia // referência à agência onde o cliente foi criado

        // Ao criar a pessoa, adicionamos automaticamente ela à lista de clientes da agência
        // Isso evita ter que inserir manualmente na agência após criar a pessoa
        agencia.clientes.push(this)
    }

    // Getter para permitir recuperação do saldo de fora da classe sem expor o campo privado
    get getSaldo(){
        // Retorna o valor do campo #saldo. Não permite alteração direta.
        return this.#saldo
    }

    // ---------------------------------------------------------------
    // Método: depositar
    // Parâmetros: valor (número), bancoCentral (instância de bancoCentral)
    // ---------------------------------------------------------------
    depositar(valor, bancoCentral){
        // Validação: depósitos devem ser positivos
        if(valor <= 0){
            alert("❌ Valor inválido para depósito.") // Feedback ao usuário
            return // interrompe a execução do método
        }

        // Atualiza o saldo privado adicionando o valor informado
        this.#saldo += valor

        // Registra a operação no extrato local (para histórico do cliente)
        // Salvamos tipo, valor e o saldo após a operação
        this.extrato.push({ tipo: "Depósito", valor: valor, saldoAtual: this.#saldo })

        // Registra a operação na agência (registro local) — o método também registra no banco
        this.agencia.registrarOperacao(this, valor, "Depósito")

        // Verifica/avisa Banco Central caso a movimentação seja de alto valor
        // (a agência delega essa responsabilidade ao objeto 'bc')
        this.agencia.registrarBancoCentral(bancoCentral, this, valor, "Depósito")

        // Confirmação visual para o usuário (pode ser substituído por UI mais elegante)
        alert("Depósito realizado com sucesso!")
    }

    // ---------------------------------------------------------------
    // Método: sacar
    // ---------------------------------------------------------------
    sacar(valor, bancoCentral){
        // Verifica se o cliente tem saldo suficiente antes de sacar
        if(this.#saldo < valor){
            // Alerta com saldo atual (lembre-se: #saldo é número)
            alert(`❌ Saldo insuficiente. Saldo atual: R$ ${this.#saldo}`)
            return
        }

        // Diminui o saldo privado
        this.#saldo -= valor

        // Registra no extrato
        this.extrato.push({ tipo: "Saque", valor: valor, saldoAtual: this.#saldo })

        // Registra na agência e no banco
        this.agencia.registrarOperacao(this, valor, "Saque")

        // Verifica/avisa Banco Central para possíveis movimentações altas
        this.agencia.registrarBancoCentral(bancoCentral, this, valor, "Saque")

        // Feedback ao usuário
        alert("Saque realizado com sucesso!")
    }

    // ---------------------------------------------------------------
    // Método: transferir
    // Parâmetros: destinatario (instância de pessoa), valor (número), bancoCentral
    // Observação: aqui acessamos diretamente destinatario.#saldo porque estamos
    // dentro da mesma classe — o JavaScript permite acesso ao campo privado
    // quando o acesso ocorre em métodos da mesma definição de classe.
    // ---------------------------------------------------------------
    transferir(destinatario, valor, bancoCentral){
        // Validação: valor precisa ser positivo
        if(valor <= 0){
            alert("❌ Valor inválido.")
            return
        }

        // Validação: saldo suficiente
        if(this.#saldo < valor){
            alert("❌ Saldo insuficiente para transferência.")
            return
        }

        // Debita do remetente
        this.#saldo -= valor

        // Credita no destinatário — acesso direto ao campo privado do outro objeto
        // Observação: isso funciona porque estamos no contexto da classe 'pessoa'.
        destinatario.#saldo += valor

        // Registra no extrato do remetente informando pra quem enviou
        this.extrato.push({ tipo: `Enviado para ${destinatario.nome}`, valor: valor, saldoAtual: this.#saldo })

        // Registra no extrato do destinatário informando de quem recebeu
        // Usamos destinatario.getSaldo (getter) para ler o saldo atual do destinatário
        destinatario.extrato.push({ tipo: `Recebido de ${this.nome}`, valor: valor, saldoAtual: destinatario.getSaldo })

        // Registra nas respectivas agências e no banco
        this.agencia.registrarOperacao(this, valor, "Transferência Enviada")
        destinatario.agencia.registrarOperacao(destinatario, valor, "Transferência Recebida")

        // Envia aviso ao Banco Central (se necessário)
        this.agencia.registrarBancoCentral(bancoCentral, this, valor, "Transferência")

        // Confirmação para o usuário
        alert("Transferência realizada!")
    }
}

// ======================================================================
// CONFIGURAÇÃO INICIAL (instâncias que simulam o backend)
// ======================================================================

// Cria uma instância do Banco Central (objeto que vai monitorar altas movimentações)
let bc = new bancoCentral()

// Cria uma instância do Banco "geral" (onde as agências serão registradas)
let bancoBrasil = new banco()

// Cria uma agência chamada "Centro" e registra ela dentro do bancoBrasil
let agenciaCentro = new agencia("Centro", bancoBrasil) // Agência padrão para o exemplo

// Lista global usada pela interface para popular selects e manipular clientes
let listaClientes = []

// Clientes iniciais de teste (serão automaticamente adicionados `agenciaCentro.clientes` no construtor)
let maria = new pessoa("Maria", "000.000.000-01", 100, agenciaCentro)
let matheus = new pessoa("Matheus", "000.000.000-02", 50, agenciaCentro)

// Coloca os clientes na lista usada pelo front-end
listaClientes.push(maria, matheus)


// ======================================================================
// INTERAÇÃO COM O HTML (DOM) - FUNÇÕES CHAMADAS PELOS BOTÕES NA PÁGINA
// ======================================================================

// Função que atualiza os elementos <select> conforme o estado de 'listaClientes'
function atualizarSelects() {
    // pega o select onde escolhemos o cliente que fará a operação
    const selectCliente = document.getElementById("clienteSelecionado")
    // pega o select onde escolhemos o cliente destino da transferência
    const selectDestino = document.getElementById("clienteDestino")

    // limpa todo conteúdo anterior (remove <option>s já existentes)
    selectCliente.innerHTML = ""
    selectDestino.innerHTML = ""

    // percorre cada cliente e cria uma <option> para cada select
    listaClientes.forEach((cliente, index) => {
        // === opção para o select de cliente (exibe nome e saldo) ===
        let option1 = document.createElement("option") // cria elemento option
        option1.value = index // definimos o value como o índice do array — fácil de recuperar
        option1.text = `${cliente.nome} (Saldo: R$ ${cliente.getSaldo})` // label com saldo
        selectCliente.add(option1) // adiciona ao select

        // === opção para select de destino (apenas nome) ===
        let option2 = document.createElement("option")
        option2.value = index
        option2.text = cliente.nome
        selectDestino.add(option2)
    })
}

// ---------------------------------------------------------------
// 1. CRIAR CLIENTE — lida com inputs do formulário de cadastro
// ---------------------------------------------------------------
function criarCliente() {
    // Lê valores direto dos inputs no DOM
    let nome = document.getElementById("nome").value
    let cpf = document.getElementById("cpf").value
    let saldo = document.getElementById("saldo").value

    // Validação básica: nome e saldo não podem estar vazios
    if(nome === "" || saldo === "") {
        alert("Preencha todos os campos!")
        return
    }

    // Cria uma nova instância de 'pessoa'. O construtor já adiciona na agência.
    let novoCliente = new pessoa(nome, cpf, saldo, agenciaCentro)

    // Adiciona o novo cliente na lista que o front-end usa
    listaClientes.push(novoCliente)

    // Atualiza os selects para mostrar o novo cliente imediatamente
    atualizarSelects()
    alert("Cliente cadastrado com sucesso!")

    // Limpa os campos do formulário para nova inserção
    document.getElementById("nome").value = ""
    document.getElementById("cpf").value = ""
    document.getElementById("saldo").value = ""
}

// ---------------------------------------------------------------
// 2. DEPOSITAR — pega índice do select e chama o método do cliente
// ---------------------------------------------------------------
function depositar() {
    // Recupera o índice selecionado (string) e o valor do input
    let index = document.getElementById("clienteSelecionado").value
    let valor = Number(document.getElementById("valorDeposito").value)

    // Checa se existe um cliente naquele índice e chama o método depositar
    if(listaClientes[index]) {
        listaClientes[index].depositar(valor, bc)
        // Atualiza interface para refletir novo saldo
        atualizarSelects()
    }
}

// ---------------------------------------------------------------
// 3. SACAR — muito parecido com depositar
// ---------------------------------------------------------------
function sacar() {
    let index = document.getElementById("clienteSelecionado").value
    let valor = Number(document.getElementById("valorSaque").value)

    if(listaClientes[index]) {
        listaClientes[index].sacar(valor, bc)
        atualizarSelects()
    }
}

// ---------------------------------------------------------------
// 4. TRANSFERIR
// ---------------------------------------------------------------
function transferir() {
    // índices do remetente e destinatário
    let indexOrigem = document.getElementById("clienteSelecionado").value
    let indexDestino = document.getElementById("clienteDestino").value
    let valor = Number(document.getElementById("valorTransferencia").value)

    // Previne transferência para si mesmo (mesmo índice)
    if (indexOrigem === indexDestino) {
        alert("Não pode transferir para si mesmo!")
        return
    }

    // Recupera referências aos objetos pessoa
    let remetente = listaClientes[indexOrigem]
    let destinatario = listaClientes[indexDestino]

    // Executa o método transferir do remetente (vai atualizar ambos os extratos)
    remetente.transferir(destinatario, valor, bc)

    // Atualiza a interface para refletir novos saldos
    atualizarSelects()
}

// ---------------------------------------------------------------
// 5. MOSTRAR EXTRATO
// ---------------------------------------------------------------
function mostrarExtrato() {
    // Pega o cliente selecionado e o elemento <pre> onde mostraremos o texto
    let index = document.getElementById("clienteSelecionado").value
    let cliente = listaClientes[index]
    let box = document.getElementById("extratoBox")

    // Inicia uma string formatada com cabeçalho
    let texto = `Extrato de ${cliente.nome} (CPF: ${cliente.cpf}):
-----------------------------------
`

    // Para cada item do extrato, concatena uma linha com detalhes
    cliente.extrato.forEach(mov => {
        texto += `${mov.tipo} | R$ ${mov.valor} | Saldo Final: R$ ${mov.saldoAtual}
`
    })

    // Define o texto no elemento <pre> (mantém quebras de linha)
    box.innerText = texto
}

// Ao carregar o script, inicia os selects com os clientes existentes
atualizarSelects()
