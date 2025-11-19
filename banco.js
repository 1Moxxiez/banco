// banco registra movimentações maiores que 1000
// sistema de banco para controlar as transações
// tem-se agência(s) - mais de uma - um banco tem varias agencias 
//clientes que fazem operações -> saque, transferencia entre clientes (pix) e deposito
// exibir o extrato por cliente


// =====================================================================
// SISTEMA SIMPLES DE BANCO
// =====================================================================
// Aqui temos a simulação de um banco real:
// - Pessoas têm saldo e extrato
// - Elas podem sacar, depositar e transferir
// - O banco registra todas as movimentações
// - O Banco Central registra só movimentações acima de R$ 1000
// =====================================================================



// ======================================================================
// CLASSE BANCO CENTRAL
// ======================================================================

// Essa classe serve para registrar movimentações acima de 1000 reais.
class bancoCentral{
    movimentacoesGrandes = [] // lista onde ficam registradas

    movimentacoesAltas(pessoa, valor, tipo){
        // Se o valor for maior que 1000, registra
        if (valor > 1000){
            this.movimentacoesGrandes.push({pessoa: pessoa.nome, valor: valor, tipo: tipo})
            console.log("Uma movimentação de alto valor foi realizada.")
        }
    }
}



// ======================================================================
// CLASSE BANCO
// ======================================================================

// Classe que representa um banco normal.
// Ele guarda todas as movimentações, mesmo as pequenas.
class banco{
    movimentacoes = []  // lista de todas as operações do banco
    agencias = []       // lista de agências (não está sendo usada ainda)

    registroMovimentacao(pessoa, valor, tipo){
        // sempre registra a movimentação
        this.movimentacoes.push({pessoa: pessoa.nome, valor: valor, tipo: tipo})
        console.log("Movimentação registrada")
    }
}



// ======================================================================
// CLASSE AGÊNCIA
// ======================================================================

// Uma agência É UM BANCO, então ela herda tudo de banco.
class agencia extends banco{
    clientes = []   // lista de clientes da agência
}



// ======================================================================
// CLASSE PESSOA
// ======================================================================

// Representa um cliente do banco: nome, cpf, saldo e extrato
class pessoa {
    nome
    cpf
    #saldo   // saldo privado → só a classe pode mexer
    extrato = []

    constructor(nome, cpf, saldo) {
        this.nome = nome;
        this.cpf = cpf;
        this.#saldo = saldo;
    }

    // Getter pra consultar o saldo (não pode mudar por fora)
    get getSaldo() {
        return this.#saldo;
    }



    // ==================================================================
    // DEPÓSITO
    // ==================================================================
    depositar(banco, bancoCentral, valor){

        if (valor<= 0){
            console.log("Valor indisponível para depósito.")
        } else {

            // adiciona o valor ao saldo
            this.#saldo += valor

            // registra no extrato da pessoa
            this.extrato.push({
                tipo: "Depósito",
                valor: valor,
                saldoAtual: this.#saldo
            });
        }

        // registra no banco (sempre faz isso)
        banco.registroMovimentacao(this, valor, "Depósito")

        // verifica se precisa avisar o banco central
        bancoCentral.movimentacoesAltas(this, valor, "Depósito")
    }



    // ==================================================================
    // SAQUE
    // ==================================================================
    sacar(banco, bancoCentral, valor){

        if (this.#saldo >= valor){

            // desconta o saldo
            this.#saldo -= valor

            // registra no extrato
            this.extrato.push({
                tipo: "Saque",
                valor: valor,
                saldoAtual: this.#saldo
            });

        } else {
            console.log(`${this.nome} não tem saldo suficiente para realizar saque.`)
        }

        // registra no banco
        banco.registroMovimentacao(this, valor, "Saque")

        // registra no banco central, se necessário
        bancoCentral.movimentacoesAltas(this, valor, "Saque")
    }



    // ==================================================================
    // MOSTRAR EXTRATO
    // ==================================================================
    mostrarExtrato(){
        console.log(`---------Extrato de ${this.nome}---------`)

        // percorre cada movimentação e mostra
        for(let movimentacao of this.extrato){
            console.log(`${movimentacao.tipo} R$: ${movimentacao.valor} | Saldo atual: R$ ${movimentacao.saldoAtual}`)
        }
    }



    // ==================================================================
    // TRANSFERIR (AQUI TEM PROBLEMAS — e você vai corrigir 🙂)
    // ==================================================================
    transferir(destinatario, valor){
        // esse código não funciona como deveria
        // ele não desconta saldo do remetente corretamente
        // ele chama depositar errado
        // e passa destinatario errado na mensagem

        if (valor <= 0){
            console.log("❌ Valor inválido para transferência.");
            return;
        }

        // Verifica saldo do remetente
        if (this.#saldo < valor) {
            console.log(`❌ ${this.nome} não tem saldo suficiente para transferir.`);
            return;
        }

        // Desconta do remetente
        this.#saldo -= valor

         // Adiciona ao destinatário usando depósito
        destinatario.#saldo += valor

        // Registra no extrato do remetente
        this.extrato.push({
            tipo: 'Transferencia para ${destinatario.nome}',
            valor: valor,
            saldoAtual: this.#saldo
        });

        // Registra no extrato do destinatário
        destinatario.extrato.push({
            tipo: 'Transferencia de ${this.nome}',
            valor: valor,
            saldoAtual: destinatario.#saldo
        });

    }

    // -----------------------------------------------------------------
    // EXIBIR EXTRATO
    // -----------------------------------------------------------------

    mostrarExtrato(){
        console.log(`\n📄 --------- Extrato de ${this.nome} ---------`);
        
        for (let mov of this.extrato) {
            console.log(`${mov.tipo} | Valor: R$ ${mov.valor} | Saldo após operação: R$ ${mov.saldoAtual}`);
        }
    }
}



// ======================================================================
// CRIAÇÃO DOS OBJETOS E TESTES
// ======================================================================

let bc = new bancoCentral()
let caixa = new agencia()
let br = new agencia()
let maria = new pessoa("Maria", "062.459.651-60", 50)
let matheus = new pessoa("Matheus", "062.876.540-67", 0)

// Chamadas de teste
matheus.depositar(br, bc, 30)
matheus.depositar(br, bc, 30000)
matheus.depositar(br, bc, 50)
matheus.transferir(maria, 827)

matheus.mostrarExtrato()
