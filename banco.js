// =====================================================================
// 1. LÓGICA DE NEGÓCIOS (O CÉREBRO DO SISTEMA)
// =====================================================================
// Aqui definimos como o banco funciona, sem se preocupar ainda com a tela (HTML).

// --- CLASSE BANCO CENTRAL ---
// Responsável por vigiar transações suspeitas ou de alto valor.
class bancoCentral {
    movimentacoesGrandes = [] // Array (lista) para guardar o histórico

    // Método que recebe os dados de quem fez a transação
    notificarTransacao(pessoa, valor, tipo){
        // IF (Condicional): Só executa o bloco se o valor for maior que 1000
        if (valor > 1000){
            
            // .push(): Adiciona um novo registro dentro da lista 'movimentacoesGrandes'
            this.movimentacoesGrandes.push({
                conta: pessoa.numeroConta,
                valor: valor,
                tipo: tipo
            })
        }
    }
}

// --- CLASSE AGÊNCIA ---
// Define o que é uma agência e o que ela pode fazer.
class agencia {
    numeroAgencia // Ex: "001"
    nome          // Ex: "Agência Centro"
    clientes = [] // Lista vazia que vai enchendo conforme criamos contas

    // CONSTRUCTOR: Executado automaticamente quando fazemos 'new agencia()'
    constructor(numeroAgencia, nome){
        this.numeroAgencia = numeroAgencia
        this.nome = nome
    }

    // Método Fábrica: A agência cria o cliente e gera o número da conta
    abrirConta(nome, cpf, saldoInicial){
        // Math.random(): Gera número aleatório. Math.floor: Arredonda.
        let sequencia = this.clientes.length + 1 
        //O .length (comprimento) é uma propriedade que diz quantos itens tem dentro da lista.

        // 2. Transforma em texto e garante 3 dígitos com ZEROS a esquerda
        // Ex: 1 vira "001", 10 vira "010", 100 vira "100"
        let numeroContaGerado = sequencia.toString().padStart(3,"0")
        

        //Math.floor(100 + Math.random() * 900) 
        //A fórmula mágica:Sempre que quiser um intervalo entre um Mínimo e um Máximo, a 
        // fórmula é: Math.random() * (Maximo - Minimo) + Minimo
        // No seu caso: Máximo: 1000 (exclusivo)Mínimo: 100
        //Se você quer números de 3 dígitos, o menor é 100 e o maior é 999.
        //A distância entre eles é: 999 - 100 = 899 (arredondando, são 900 possibilidades de números).
        // 1000 - 100 = 900.
        

        // 'new pessoa': Cria o objeto do cliente na memória
        // 'this': Passa a própria agência para dentro do cliente, criando o vínculo
        let novoCliente = new pessoa(nome, cpf, saldoInicial, this, numeroContaGerado)
        
        // Adiciona esse novo cliente na lista da agência
        this.clientes.push(novoCliente)

        return novoCliente // Devolve o cliente criado para quem chamou a função
    }

    // Método de Busca: Varre a lista de clientes procurando um número específico
    buscarCliente(numeroConta){
        // .find(): Procura item por item. Se encontrar, retorna o cliente. Se não, retorna undefined.
        return this.clientes.find(cliente => cliente.numeroConta === numeroConta)
        //Tradução: "Dado um cliente, verifique se o número da conta dele é igual ao número que eu estou procurando."
    }

    // Função genérica para gravar no extrato
    //O .push() é o comando que adiciona um novo item no final da lista.
    registrar(tipo, valor, pessoa){
        pessoa.extrato.push({
            data: new Date().toLocaleTimeString(),
            tipo: tipo,
            valor: valor,
            saldo: pessoa.getSaldo() // O método getSaldo() é definido na classe pessoa pq é priv
        })
    }
}

// --- CLASSE PESSOA (CLIENTE) ---
class pessoa {
    nome
    cpf
    #saldo // O '#' torna este dado PRIVADO. Ninguém muda o saldo sem passar pelos métodos.
    agencia 
    numeroConta 
    extrato = [] // Histórico pessoal do cliente

    constructor(nome, cpf, saldo, agenciaObj, numeroConta){
        this.nome = nome
        this.cpf = cpf
        this.#saldo = Number(saldo) // Number(): Garante que o texto vire número matemático
        this.agencia = agenciaObj
        this.numeroConta = numeroConta
    }

    // Ação de Depositar
    depositar(valor, bc){
        if(valor <= 0) return alert("Valor inválido") // Validação de segurança
        
        this.#saldo += valor // Soma ao saldo privado
        this.agencia.registrar("Depósito", valor, this) // Salva no extrato
        bc.notificarTransacao(this, valor, "Depósito") // Avisa o Banco Central
        alert(`Depósito de R$ ${valor} realizado! Saldo atual: R$ ${this.#saldo}`)
    }

    // Ação de Sacar
    sacar(valor, bc){
        if(this.#saldo < valor) return alert("Saldo insuficiente!") // Validação de saldo
        
        this.#saldo -= valor // Subtrai do saldo
        this.agencia.registrar("Saque", valor, this) //this.agencia.registrar pq eu tenho que chama a minha agencia pra fazer agr
        bc.notificarTransacao(this, valor, "Saque")
        alert(`Saque realizado! Saldo restante: R$ ${this.#saldo}`)
    }

    // Ação de Transferir (Interage com outra pessoa)
    transferir(destinatario, valor, bc){
        if(this.#saldo < valor) return alert("Saldo insuficiente para transferir.")

        this.#saldo -= valor // Tira do meu saldo
        
        // Chama o método da OUTRA pessoa para ela receber o dinheiro
        destinatario.receberTransferencia(valor, this.nome)
        
        this.agencia.registrar(`Enviado para ${destinatario.nome}`, valor, this)
        bc.notificarTransacao(this, valor, "Transferência")
        alert("Transferência realizada com sucesso!")
    }

    // Função auxiliar para quando alguém me manda dinheiro
    receberTransferencia(valor, remetenteNome){
        this.#saldo += valor
        this.extrato.push({
            data: new Date().toLocaleTimeString(), // Pega a hora atual do computador
            tipo: `Recebido de ${remetenteNome}`,
            valor: valor,
            saldo: this.#saldo
        })
    }


    // Getter: Permite ler o saldo (que é privado) sem deixar alterar manualmente
    getSaldo(){ return this.#saldo }
}

// ======================================================================
// 2. CONFIGURAÇÃO INICIAL (SIMULANDO UM BANCO DE DADOS)
// ======================================================================

const BC = new bancoCentral() // Inicializa o sistema do BC

// Criamos as agências que existem no mundo real do nosso sistema
const agenciasDisponiveis = [
    new agencia("001", "Agência Centro"), 
    new agencia("002", "Agência Norte"),
    new agencia("003", "Agência Sul") 
]

agenciasDisponiveis[1].abrirConta("Alberta", "231.231.231-31", 122)

// 2. Criar o João na Agência Centro (Índice 0)
agenciasDisponiveis[0].abrirConta("João Silva", "999.888.777-00", 5000)

// 3. Criar a Maria na Agência Sul (Índice 2)
agenciasDisponiveis[2].abrirConta("Maria Souza", "111.222.333-44", 10)


// ======================================================================
// 3. INTERAÇÃO COM O USUÁRIO (LIGANDO JS AO HTML)
// ======================================================================

// --- FUNÇÃO AUTOMÁTICA ---
// Preenche o menu <select> com as agências criadas acima
function carregarAgenciasNoHTML() {
    const select = document.getElementById("escolhaAgencia") // Pega o elemento HTML
    
    select.innerHTML = "" // Limpa opções antigas (se houver)

    // Tradução: "Para cada item dentro da lista agenciasDisponiveis, 
    // execute o código abaixo e chame o item atual de agencia."
    agenciasDisponiveis.forEach(agencia => {
        let opcao = document.createElement("option") // Cria a tag <option>
        
        opcao.value = agencia.numeroAgencia // O valor que o código lê (001)
        opcao.text = `${agencia.nome} (${agencia.numeroAgencia})` // O texto que o usuário vê
        
        select.add(opcao) // Adiciona no menu

        //Exemplo de como fica o menu:
        // <select id="escolhaAgencia">
        // <option value="001">Agência Centro (001)</option>
        // <option value="002">Agência Norte (002)</option>
        // <option value="003">Agência Sul (003)</option>
        // </select>
    })

}

// Roda essa função imediatamente ao abrir a página
carregarAgenciasNoHTML()


// --- 1. BOTÃO ABRIR CONTA ---
function solicitarAberturaConta() {
    // Pega os elementos do HTML (inputs e selects)
    let numAgencia = document.getElementById("escolhaAgencia").value
    let nomeInput = document.getElementById("nome")
    let cpfInput = document.getElementById("cpf")
    let saldoInput = document.getElementById("saldo")

    // Verifica se algum campo está vazio
    if(!nomeInput.value || !cpfInput.value || !saldoInput.value) return alert("Preencha tudo!")

    // Busca qual objeto Agência corresponde ao número escolhido
    // 2. "Falo para caçar dentro dessa lista"
    // O .find() é o caçador. Ele pega cada 'agencia' da lista e testa.
    // 3. "Qual agência que o número dela bate com o número que eu peguei"
    // O código pergunta: "O número desta agência é IGUAL ao do HTML?"
    let agenciaSelecionada = agenciasDisponiveis.find(ag => ag.numeroAgencia === numAgencia)
    
    // Manda a agência criar a conta
    let novoCliente = agenciaSelecionada.abrirConta(nomeInput.value, cpfInput.value, saldoInput.value)

    // Mostra o resultado
    alert(`✅ Conta Criada!\n\nCliente: ${novoCliente.nome}\nAgência: ${novoCliente.agencia.nome}\nConta: ${novoCliente.numeroConta}\n\nGuarde esse número!`)

    // Limpa os campos para o próximo uso
    nomeInput.value = ""
    cpfInput.value = ""
    saldoInput.value = ""
}


// --- FUNÇÃO DE LOGIN (Usada por Depósito, Saque e Extrato) ---
// Ela lê os campos "Sua Agência" e "Sua Conta" e tenta achar o cliente
function buscarClientePorLogin() {
    //Use sem .value quando quiser mudar a cor da caixa, esconder a caixa ou mudar o tamanho dela.
    //Use com .value quando quiser saber o que o usuário escreveu lá dentro.
   
    let numAgencia = document.getElementById("loginAgencia").value
    let numConta = document.getElementById("loginConta").value

    // 1. Acha a agência
    let agenciaEncontrada = agenciasDisponiveis.find(ag => ag.numeroAgencia === numAgencia)
    
    if (!agenciaEncontrada) {
        alert("Agência não encontrada! Verifique o número.")
        return null // Para a execução aqui
    }

    // 2. Acha a conta dentro daquela agência
    let clienteEncontrado = agenciaEncontrada.buscarCliente(numConta)

    if (!clienteEncontrado) {
        alert("Conta não encontrada! Verifique o número.")
        return null
    }

    return clienteEncontrado // Devolve o cliente achado
}


// --- 2. BOTÃO DEPOSITAR ---
function realizarDeposito() {
    let cliente = buscarClientePorLogin() // Tenta logar

    if(cliente) { // Se o login deu certo...
        let valorInput = document.getElementById("valorDeposito")
        let valor = Number(valorInput.value)
        
        cliente.depositar(valor, BC) // Executa a lógica da classe
        
        valorInput.value = "" // Limpa só o valor
    }
}


// --- 3. BOTÃO SACAR ---
function realizarSaque() {
    let cliente = buscarClientePorLogin()
    
    if(cliente) {
        let valorInput = document.getElementById("valorSaque")
        let valor = Number(valorInput.value)
        
        cliente.sacar(valor, BC)

        valorInput.value = ""
    }
}


// --- 4. BOTÃO EXTRATO ---
function verExtrato() {
    let cliente = buscarClientePorLogin()
    
    if(cliente) {
        let box = document.getElementById("extratoBox") // Pega a área de texto <pre>
        
        // Monta o cabeçalho do texto
        let texto = `Extrato de ${cliente.nome} | Conta: ${cliente.numeroConta}\n----------------------------------\n`
        
        // Loop: Para cada movimento no extrato, adiciona uma linha de texto
        cliente.extrato.forEach(mov => {
            texto += `${mov.data} - ${mov.tipo}: R$ ${mov.valor} (Saldo: R$ ${mov.saldo})\n`
        })
        
        // Joga o texto final na tela
        box.innerText = texto
    }
}


// --- 5. BOTÃO TRANSFERIR ---
function realizarTransferencia() {
    // Quem envia (usa o login lá de cima)
    let remetente = buscarClientePorLogin()
    if(!remetente) return

    // Quem recebe (pega os inputs específicos da área de transferência)
    let agDestinoInput = document.getElementById("destAgencia")
    let contaDestinoInput = document.getElementById("destConta")
    let valorInput = document.getElementById("valorTransferencia")

    let valor = Number(valorInput.value)

    // Valida Agência de Destino
    let agenciaDest = agenciasDisponiveis.find(ag => ag.numeroAgencia === agDestinoInput.value)
    if(!agenciaDest) return alert("Agência de destino não existe.")

    // Valida Conta de Destino
    let destinatario = agenciaDest.buscarCliente(contaDestinoInput.value)
    if(!destinatario) return alert("Conta de destino não existe.")

    // Executa a transferência na classe Pessoa
    remetente.transferir(destinatario, valor, BC)

    // Limpa os campos da transferência
    agDestinoInput.value = ""
    contaDestinoInput.value = ""
    valorInput.value = ""
}