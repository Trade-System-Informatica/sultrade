import React, { Component } from 'react'
import './styles.css'
import { Formik, Field, Form } from 'formik'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import ModalListas from '../../../components/modalListas'
import Skeleton from '../../../components/skeleton'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import ModalLogs from '../../../components/modalLogs'
import Alert from '../../../components/alert'
import { apiEmployee } from '../../../services/apiamrg'
import moment from 'moment'
import loader from '../../../classes/loader'
import util from '../../../classes/util'
import Select from 'react-select';
import { Modal } from '@material-ui/core'

const estadoInicial = {
    conta: '',
    chave: 0,
    lancamento: moment().format('YYYY-MM-DD'),
    pessoa: '',
    tipo: '',
    contaContabil: '',
    codBarras: '',
    centroCusto: '',
    contaBloqueto: '',
    historicoPadrao: '',
    historico: '',
    contaDesconto: '',
    parcelaInicial: 1,
    parcelaFinal: 1,
    numBoleto: '',
    valor: '',
    saldo: '',
    vencimento: '',
    vencimentoOrig: '',
    contaProvisao: '',
    provisaoCheck: false,
    valorInicial: '',
    empresa: 0,
    documento: '',
    tipoDocumento: '',
    meioPagamento: '',
    meioPagamentoNome: '',
    descontosModal: false,

    logs: [],
    modalLog: false,

    codigoReceita: '',
    contribuinte: '',
    codigoIdentificadorTributo: '',
    mesCompetNumRef: '',
    dataApuracao: '',
    darfValor: '',
    darfMulta: '',
    darfJuros: '',
    darfOutros: '',
    darfPagamento: '',
    tipoPix: '',

    desconto: '',
    descontoComplemento: '',
    descontoConta: '',
    retencaoInss: '',
    retencaoInssCheck: false,
    retencaoInssComplemento: '',
    retencaoInssConta: '',
    retencaoIr: '',
    retencaoIrCheck: false,
    retencaoIrComplemento: '',
    retencaoIrConta: '',
    retencaoIss: '',
    retencaoIssCheck: false,
    retencaoIssComplemento: '',
    retencaoIssConta: '',
    retencaoPis: '',
    retencaoPisCheck: false,
    retencaoPisComplemento: '',
    retencaoPisConta: '',
    retencaoCofins: '',
    retencaoCofinsCheck: false,
    retencaoCofinsComplemento: '',
    retencaoCofinsConta: '',
    retencaoCsll: '',
    retencaoCsllCheck: false,
    retencaoCsllComplemento: '',
    retencaoCsllConta: '',

    empresas: [],
    empresasOptions: [],
    empresasOptionsTexto: '',

    pessoas: [],
    pessoasOptions: [],
    pessoasOptionsTexto: '',

    planosContas: [],
    planosContasOptions: [],
    planosContasOptionsTexto: '',

    centrosCustos: [],
    centrosCustosOptions: [],
    centrosCustosOptionsTexto: '',

    historicos: [],
    historicosOptions: [],
    historicosOptionsTexto: '',

    tiposDocumentos: [],
    tiposDocumentosOptions: [],
    tiposDocumentosOptionsTexto: '',

    tiposOptions: [
        { label: '', value: '', },
        { label: 'Receber', value: 0 },
        { label: 'Pagar', value: 1 }
    ],

    dadosIniciais: [],
    dadosFinais: [],
    dadosIniciaisDarf: [
        { titulo: 'codigo_receita', valor: '' },
        { titulo: 'contribuinte', valor: '' },
        { titulo: 'codigo_identificador_tributo', valor: '' },
        { titulo: 'mes_compet_num_ref', valor: '' },
        { titulo: 'data_apuracao', valor: '' },
        { titulo: 'valor', valor: '' },
        { titulo: 'valor_multa', valor: '' },
        { titulo: 'valor_juros', valor: '' },
        { titulo: 'valor_outros', valor: '' },
        { titulo: 'valor_pagamento', valor: '' },
        { titulo: 'tipo_pix', valor: '' }
    ],
    dadosFinaisDarf: [
        { titulo: 'codigo_receita', valor: '' },
        { titulo: 'contribuinte', valor: '' },
        { titulo: 'codigo_identificador_tributo', valor: '' },
        { titulo: 'mes_compet_num_ref', valor: '' },
        { titulo: 'data_apuracao', valor: '' },
        { titulo: 'valor', valor: '' },
        { titulo: 'valor_multa', valor: '' },
        { titulo: 'valor_juros', valor: '' },
        { titulo: 'valor_outros', valor: '' },
        { titulo: 'valor_pagamento', valor: '' },
        { titulo: 'tipo_pix', valor: '' }
    ],

    contabilizada: 0,

    meiosPagamentos: [],
    meiosPagamentosOptions: [],
    meiosPagamentosOptionsTexto: '',

    acessos: [],
    permissoes: [],
    acessosPermissoes: [],

    ultimaTransacao: [],

    modalAberto: false,
    modal: 0,
    modalLista: '',
    modalPesquisa: '',

    os: "",
    navio: "",
    porto: "",
    sailed: '',

    navios: [],
    naviosOptions: [],
    portos: [],
    portosOptions: [],
    optionsTexto: "",

    manual: false,
    bloqueado: false,
    osExiste: false,
    loading: true,

    roe: 5,

    discount: 0,
    received: 0,

    alert: { type: "", msg: "" }
}

class AddConta extends Component {

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        window.scrollTo(0, 0)
        var id = await this.props.match.params.id;
        if (this.state.usuarioLogado.empresa != 0) {
            await this.setState({ empresa: this.state.usuarioLogado.empresa })
        }
        await this.setState({ chave: id })
        if (this.props.location && this.props.location.state && this.props.location.state.tipo) {
            this.setState({ tipo: this.props.location.state.tipo })
        }
        if (parseInt(id) !== 0) {
            await this.setState({ conta: this.props.location.state.conta })
            //console.log('Servicos: ' + JSON.stringify(this.state.tiposervico))
            //await this.loadData(this.state.tiposervico)
            console.log(this.state.conta);
            await this.setState({
                lancamento: moment(this.state.conta.Lancto).format('YYYY-MM-DD'),
                tipo: this.state.conta.Tipo,
                pessoa: this.state.conta.Pessoa,
                contaContabil: this.state.conta.Conta_Contabil,
                codBarras: this.state.conta.RepCodBar,
                centroCusto: this.state.conta.Centro_Custo,
                contaBloqueto: this.state.conta.Conta_Bloqueto,
                historico: this.state.conta.Historico,
                contaDesconto: this.state.conta.Conta_Desconto,
                parcelaInicial: this.state.conta.Parc_Ini,
                parcelaFinal: this.state.conta.Parc_Fim,
                numBoleto: this.state.conta.LinhaDig,
                valor: new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.state.conta.Valor),
                saldo: parseFloat(this.state.conta.Saldo).toFixed(2).replaceAll('.', ','),
                valorInicial: parseFloat(this.state.conta.Valor).toFixed(2).replaceAll('.', ','),
                vencimento: moment(this.state.conta.Vencimento).format('YYYY-MM-DD'),
                vencimentoOrig: moment(this.state.conta.Vencimento_Original).format('YYYY-MM-DD'),
                contaProvisao: this.state.conta.Conta_Provisao,
                empresa: this.state.conta.Empresa,
                documento: this.state.conta.Docto,
                tipoDocumento: this.state.conta.tipodocto,
                meioPagamento: this.state.conta.meio_pagamento,
                os: this.state.conta.os_manual,
                navio: this.state.conta.navio_manual,
                porto: this.state.conta.porto_manual,
                roe: this.state.conta.roe_manual,
                discount: this.state.conta.discount_manual ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.state.conta.discount_manual) : '0,00',
                received: this.state.conta.received_manual ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.state.conta.received_manual) : '0,00',
                sailed: this.state.conta.sailed_manual
            })

            this.setState({
                manual: !!(this.state.os || this.state.navio || this.state.porto || this.state.roe || this.state.discount || this.state.received || this.state.sailed),
            });

            if (this.state.contaProvisao != 0) {
                await this.setState({ provisaoCheck: true })
            }

            await this.setState({ ultimaTransacao: await loader.getBody(`getUltimaTransacaoConta.php`, { chave: this.state.chave }) });
        }
        await this.loadAll();

        if (this.state.chave != 0) {
            await this.setState({
                dadosIniciais: [
                    { titulo: 'Tipo', valor: util.formatForLogs(this.state.tipo, 'options', '', '', this.state.tiposOptions) },
                    { titulo: 'Lançamento', valor: util.formatForLogs(this.state.lancamento, 'date') },
                    { titulo: 'Documento', valor: util.formatForLogs(this.state.documento) },
                    { titulo: 'Parcela Inicial', valor: util.formatForLogs(this.state.parcelaInicial) },
                    { titulo: 'Parcela Final', valor: util.formatForLogs(this.state.parcelaFinal) },
                    { titulo: 'Histórico', valor: util.formatForLogs(this.state.historico) },
                    { titulo: 'Vencimento', valor: util.formatForLogs(this.state.vencimento, 'date') },
                    { titulo: 'Vencimento Original', valor: util.formatForLogs(this.state.vencimentoOrig, 'date') },
                    { titulo: 'Valor', valor: util.formatForLogs(this.state.valor, 'money') },
                    { titulo: 'Saldo', valor: util.formatForLogs(this.state.saldo, 'money') },
                    { titulo: 'Centro Custo', valor: util.formatForLogs(this.state.centroCusto, 'options', '', '', this.state.centrosCustosOptions) },
                    { titulo: 'Conta Provisão', valor: util.formatForLogs(this.state.contaProvisao, 'options', '', '', this.state.planosContasOptions) },
                    { titulo: 'Conta Débito', valor: util.formatForLogs(this.state.contaContabil, 'options', '', '', this.state.planosContasOptions) },
                    { titulo: 'Conta Desconto', valor: util.formatForLogs(this.state.contaDesconto, 'options', '', '', this.state.planosContasOptions) },
                    { titulo: 'Pessoa', valor: util.formatForLogs(this.state.pessoa, 'options', '', '', this.state.pessoasOptions) },
                    { titulo: 'Operador', valor: util.formatForLogs(this.state.usuarioLogado.nome) },
                    { titulo: 'Conta Bloqueto', valor: util.formatForLogs(this.state.contaBloqueto, 'options', '', '', this.state.planosContasOptions) },
                    { titulo: 'Tipo de Documento', valor: util.formatForLogs(this.state.tipoDocumento, 'options', '', '', this.state.tiposDocumentosOptions) },
                    { titulo: 'Meio Pagamento', valor: util.formatForLogs(this.state.meioPagamento, 'options', '', '', this.state.meiosPagamentos) },
                ]
            });
        }

        const meioPagamentoNome = this.state.meiosPagamentos.filter((e) => e.chave == this.state.meioPagamento);
        if (meioPagamentoNome && meioPagamentoNome[0]) {
            await this.setState({ meioPagamentoNome: meioPagamentoNome[0].descricao });

            if (this.state.meioPagamentoNome == 'DARF' || this.state.meioPagamentoNome == 'GPS' || this.state.meioPagamentoNome == 'GRU' || this.state.meioPagamentoNome == "PIX") {
                await this.getContasComplementar();
            }

        }
        this.state.acessosPermissoes.map((e) => {
            if ((e.acessoAcao == "CONTAS_ABERTAS" && e.permissaoInsere == 0 && this.state.chave == 0) || (e.acessoAcao == "CONTAS_ABERTAS" && e.permissaoEdita == 0 && this.state.chave != 0)) {
                this.setState({ bloqueado: true })
            }
        })

    }

    componentDidUpdate = async (prevProps, prevState) => {
        if (this.state.pessoa != prevState.pessoa && this.state.tipo == 1) {
            this.setState({ contaProvisao: await loader.getContaPessoa(this.state.pessoa, "provisao") });
        }
    }

    loadAll = async () => {
        await this.getPessoas();

        await this.setState({
            historicos: await loader.getBase('getHistoricos.php'),
            historicosOptions: await loader.getHistoricosOptions(),

            planosContas: await loader.getBase('getPlanosContasAnaliticas.php'),
            planosContasOptions: await loader.getPlanosContasAnaliticasOptions(),

            centrosCustos: await loader.getBase('getCentrosCustos.php'),

            tiposDocumentos: await loader.getBase('getTiposLancamento.php'),
            tiposDocumentosOptions: await loader.getTiposLancamentoOptions(),

            meiosPagamentos: await loader.getBase('getMeiosPagamentos.php'),
            meiosPagamentosOptions: await loader.getMeiosPagamentosOptions(),

            parametros: await loader.getBody('getParametros.php', { token: true, empresa: this.state.usuarioLogado.empresa }),

            naviosOptions: await loader.getBaseOptions("getNavios.php", "nome", "chave"),
            portosOptions: await loader.getBaseOptions("getPortos.php", "Descricao", "Chave"),

            acessos: await loader.getBase('getTiposAcessos.php'),
            permissoes: await loader.getBase('getPermissoes.php')
        })

        this.setState({
            centrosCustosOptions: this.state.centrosCustos.map((c) => ({ label: `CC: ${c.Codigo} - ${c.Descricao}`, value: c.Chave }))
        })

        if (this.state.chave) {
            const contabilizada = await loader.getBody(`getLancamentoConta.php`, { chavePr: this.state.chave });
            if (contabilizada[0]) {
                this.setState({ contabilizada: contabilizada[0].Chave })
            }

            const contasDescontos = await loader.getBody(`getContasDescontos.php`, {
                token: true,
                chave_conta_aberto: this.state.chave
            });


            contasDescontos.map((conta) => {
                switch (conta.tipo) {
                    case "DESCONTO":
                        this.setState({ desconto: conta.valor, descontoComplemento: conta.complemento });
                        break;
                    case "INSS":
                        this.setState({ retencaoInss: conta.valor, retencaoInssComplemento: conta.complemento, retencaoInssCheck: true });
                        break;
                    case "IR":
                        this.setState({ retencaoIr: conta.valor, retencaoIrComplemento: conta.complemento, retencaoIrCheck: true });
                        break;
                    case "ISS":
                        this.setState({ retencaoIss: conta.valor, retencaoIssComplemento: conta.complemento, retencaoIssCheck: true });
                        break;
                    case "PIS":
                        this.setState({ retencaoPis: conta.valor, retencaoPisComplemento: conta.complemento, retencaoPisCheck: true });
                        break;
                    case "COFINS":
                        this.setState({ retencaoCofins: conta.valor, retencaoCofinsComplemento: conta.complemento, retencaoCofinsCheck: true });
                        break;
                    case "CRF":
                        this.setState({ retencaoCsll: conta.valor, retencaoCsllComplemento: conta.complemento, retencaoCsllCheck: true });
                        break;
                }
            })

            if (this.state.tipo == 1) {
                this.setState({ contaProvisao: await loader.getContaPessoa(this.state.pessoa, "provisao") });
            }

        }

        const planosContasOptions = this.state.planosContasOptions;
        planosContasOptions.unshift({ label: "Select...", value: "" });

        await this.setState({
            planosContasOptions,
            descontoConta: this.state.parametros[0].conta_desconto,
            parametroInss: this.state.parametros[0].conta_retencao_inss,
            parametroIr: this.state.parametros[0].conta_retencao_ir,
            parametroIss: this.state.parametros[0].conta_retencao_iss,
            parametroPis: this.state.parametros[0].conta_retencao_pis,
            parametroCofins: this.state.parametros[0].conta_retencao_cofins,
            parametroCsll: this.state.parametros[0].conta_retencao_csll,

            acessosPermissoes: await loader.testaAcesso(this.state.acessos, this.state.permissoes, this.state.usuarioLogado),
            loading: false
        })
    }

    getPessoas = async () => {
        if (this.state.tipo == '0') {
            this.setState({
                pessoas: await loader.getBase('getClientes.php'),
                pessoasOptions: await loader.getBaseOptionsCustomLabel('getClientes.php', "Nome", "Cnpj_Cpf", "Chave")
            })
        } else if (this.state.tipo == '1') {
            this.setState({
                pessoas: await loader.getBase('getFornecedores.php'),
                pessoasOptions: await loader.getBaseOptionsCustomLabel('getFornecedores.php', "Nome", "Cnpj_Cpf", "Chave")
            });
        }
    }

    getContasComplementar = async () => {
        await apiEmployee.post('getContasComplementar.php', {
            token: true,
            chave: this.state.chave
        }).then(
            async res => {
                if (res.data[0]) {
                    await this.setState({ contaComplementar: res.data[0] })

                    await this.setState({
                        codigoReceita: this.state.contaComplementar.codigo_receita,
                        contribuinte: this.state.contaComplementar.contribuinte,
                        codigoIdentificadorTributo: this.state.contaComplementar.codigo_identificador_tributo,
                        mesCompetNumRef: this.state.contaComplementar.mes_compet_num_ref,
                        dataApuracao: this.state.contaComplementar.data_apuracao,
                        darfValor: new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.state.contaComplementar.valor),
                        darfMulta: new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.state.contaComplementar.valor_multa),
                        darfJuros: new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.state.contaComplementar.valor_juros),
                        darfOutros: new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.state.contaComplementar.valor_outros),
                        darfPagamento: new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.state.contaComplementar.valor_pagamento),
                        tipoPix: this.state.contaComplementar.tipo_pix
                    })

                    await this.setState({
                        dadosIniciaisDarf: [
                            { titulo: 'codigo_receita', valor: this.state.codigoReceita },
                            { titulo: 'contribuinte', valor: this.state.contribuinte },
                            { titulo: 'codigo_identificador_tributo', valor: this.state.codigoIdentificadorTributo },
                            { titulo: 'mes_compet_num_ref', valor: this.state.mesCompetNumRef },
                            { titulo: 'data_apuracao', valor: this.state.dataApuracao },
                            { titulo: 'valor', valor: this.state.darfValor },
                            { titulo: 'valor_multa', valor: this.state.darfMulta },
                            { titulo: 'valor_juros', valor: this.state.darfJuros },
                            { titulo: 'valor_outros', valor: this.state.darfOutros },
                            { titulo: 'valor_pagamento', valor: this.state.darfPagamento },
                            { titulo: 'tipo_pix', valor: this.state.tipoPix }
                        ]
                    })


                } else {
                }
            },
            async err => console.log(`erro: ` + err)
        )
    }


    salvarConta = async (validForm) => {
        this.setState({ ...util.cleanStates(this.state) })

        this.setState({ bloqueado: true, loading: true });

        if (this.state.meioPagamentoNome === "PIX") {
            const contatos = await loader.getBody(`getContatos.php`, { pessoa: this.state.pessoa });

            const chave = contatos.find((cont) => cont.Tipo === "PX");

            if (chave) {
                switch (chave.Campo2) {
                    case "Telefone":
                        this.setState({ tipoPix: 1 });
                        break;
                    case "E-mail":
                        this.setState({ tipoPix: 2 });
                        break;
                    case "CPF/CNPJ":
                        this.setState({ tipoPix: 3 });
                        break;
                }
            }

            if (!this.state.tipoPix) {
                this.setState({ loading: false });
                return;
            }
        }

        await this.setState({
            dadosFinais: [
                { titulo: 'Tipo', valor: util.formatForLogs(this.state.tipo, 'options', '', '', this.state.tiposOptions) },
                { titulo: 'Lançamento', valor: util.formatForLogs(this.state.lancamento, 'date') },
                { titulo: 'Documento', valor: util.formatForLogs(this.state.documento) },
                { titulo: 'Parcela Inicial', valor: util.formatForLogs(this.state.parcelaInicial) },
                { titulo: 'Parcela Final', valor: util.formatForLogs(this.state.parcelaFinal) },
                { titulo: 'Histórico', valor: util.formatForLogs(this.state.historico) },
                { titulo: 'Vencimento', valor: util.formatForLogs(this.state.vencimento, 'date') },
                { titulo: 'Vencimento Original', valor: util.formatForLogs(this.state.vencimentoOrig, 'date') },
                { titulo: 'Valor', valor: util.formatForLogs(this.state.valor, 'money') },
                { titulo: 'Saldo', valor: util.formatForLogs(this.state.saldo, 'money') },
                { titulo: 'Centro Custo', valor: util.formatForLogs(this.state.centroCusto, 'options', '', '', this.state.centrosCustosOptions) },
                { titulo: 'Conta Provisão', valor: util.formatForLogs(this.state.contaProvisao, 'options', '', '', this.state.planosContasOptions) },
                { titulo: 'Conta Débito', valor: util.formatForLogs(this.state.contaContabil, 'options', '', '', this.state.planosContasOptions) },
                { titulo: 'Conta Desconto', valor: util.formatForLogs(this.state.contaDesconto, 'options', '', '', this.state.planosContasOptions) },
                { titulo: 'Pessoa', valor: util.formatForLogs(this.state.pessoa, 'options', '', '', this.state.pessoasOptions) },
                { titulo: 'Operador', valor: util.formatForLogs(this.state.usuarioLogado.nome) },
                { titulo: 'Conta Bloqueto', valor: util.formatForLogs(this.state.contaBloqueto, 'options', '', '', this.state.planosContasOptions) },
                { titulo: 'Tipo de Documento', valor: util.formatForLogs(this.state.tipoDocumento, 'options', '', '', this.state.tiposDocumentosOptions) },
                { titulo: 'Meio Pagamento', valor: util.formatForLogs(this.state.meioPagamento, 'options', '', '', this.state.meiosPagamentos) },
            ],
            loading: true
        })

        if (validForm) {

            if (parseInt(this.state.chave) === 0) {
                if (this.state.tipo == 0) {
                    await apiEmployee.post(`insertContaCliente.php`, {
                        token: true,
                        values: `'${this.state.lancamento}', '${this.state.tipo}', '${this.state.pessoa}', '${this.state.contaContabil}', '${this.state.centroCusto}', '${this.state.contaDesconto}', '${this.state.historico}', '${this.state.parcelaInicial}', '${this.state.parcelaFinal}', '${this.state.numBoleto}', '${parseFloat(this.state.valor.replaceAll('.', '').replaceAll(',', '.'))}', '${this.state.vencimento}', '${this.state.vencimentoOrig}', '${this.state.contaProvisao}', '${parseFloat(this.state.valor.replaceAll('.', '').replaceAll(',', '.'))}', '${this.state.usuarioLogado.codigo}', '${this.state.empresa}', '${this.state.documento}', '${this.state.tipoDocumento}', '${this.state.meioPagamento}'`,
                        meioPagamento: this.state.meioPagamentoNome,
                        valuesDarf: this.state.meioPagamentoNome == 'GRU' ? `'${this.state.contribuinte}'` : this.state.meioPagamentoNome === "PIX" ? `'${this.state.tipoPix}'` : `'${this.state.codigoReceita}', '${this.state.contribuinte}', '${this.state.codigoIdentificadorTributo}', '${this.state.mesCompetNumRef}', '${moment(this.state.dataApuracao).format('YYYY-MM-DD')}', '${parseFloat(this.state.darfValor.replaceAll('.', '').replaceAll(',', '.'))}', '${parseFloat(this.state.darfMulta.replaceAll('.', '').replaceAll(',', '.'))}', '${parseFloat(this.state.darfJuros.replaceAll('.', '').replaceAll(',', '.'))}', '${parseFloat(this.state.darfOutros.replaceAll('.', '').replaceAll(',', '.'))}', '${parseFloat(this.state.darfPagamento.replaceAll('.', '').replaceAll(',', '.'))}'`,
                        dadosManuais: this.state.manual ? `'${this.state.os}', '${this.state.navio}', '${this.state.porto}', '${this.state.roe}', '${this.state.discount}', '${this.state.received}', ${moment(this.state.sailed).isValid() ? moment(this.state.sailed).format("YYY-MM-DD") : ''}` : ""
                    }).then(
                        async res => {
                            console.log(res.data);
                            if (res.data[0].Chave) {
                                await this.setState({ chave: res.data[0].Chave })
                                await loader.salvaLogs('contas_aberto', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].Chave);
                                if (this.state.meioPagamentoNome == 'DARF' || this.state.meioPagamentoNome == 'GPS' || this.state.meioPagamentoNome == 'GRU') {
                                    await loader.salvaLogs('contas_aberto_complementar', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].Chave);
                                }
                                await this.setState({ loading: false, bloqueado: false })
                            } else {
                                await alert(`Erro ${JSON.stringify(res.data)}`)
                            }
                        },
                        async res => await console.log(`Erro: ${res.data}`)
                    )
                } else {
                    await apiEmployee.post(`insertContaFornecedor.php`, {
                        token: true,
                        values: `'${this.state.lancamento}', '${this.state.tipo}', '${this.state.pessoa}', '${this.state.contaContabil}', '${this.state.codBarras}', '${this.state.centroCusto}', '${this.state.historico}',  '${this.state.contaDesconto}','${this.state.parcelaInicial}', '${this.state.parcelaFinal}', '${parseFloat(this.state.valor.replaceAll('.', '').replaceAll(',', '.'))}', '${this.state.vencimento}', '${this.state.vencimentoOrig}', '${this.state.contaProvisao}', '${parseFloat(this.state.valor.replaceAll('.', '').replaceAll(',', '.'))}', '${this.state.usuarioLogado.codigo}', '${this.state.empresa}', '${this.state.documento}', '${this.state.tipoDocumento}', '${this.state.meioPagamento}', ''`,
                        meioPagamento: this.state.meioPagamentoNome,
                        valuesDarf: this.state.meioPagamentoNome == 'GRU' ? `'${this.state.contribuinte}'` : this.state.meioPagamentoNome === "PIX" ? `'${this.state.tipoPix}'` : `'${this.state.codigoReceita}', '${this.state.contribuinte}', '${this.state.codigoIdentificadorTributo}', '${this.state.mesCompetNumRef}', '${moment(this.state.dataApuracao).format('YYYY-MM-DD')}', '${parseFloat(this.state.darfValor.replaceAll('.', '').replaceAll(',', '.'))}', '${parseFloat(this.state.darfMulta.replaceAll('.', '').replaceAll(',', '.'))}', '${parseFloat(this.state.darfJuros.replaceAll('.', '').replaceAll(',', '.'))}', '${parseFloat(this.state.darfOutros.replaceAll('.', '').replaceAll(',', '.'))}', '${parseFloat(this.state.darfPagamento.replaceAll('.', '').replaceAll(',', '.'))}'`,
                        dadosManuais: this.state.manual ? `'${this.state.os}', '${this.state.navio}', '${this.state.porto}', '${this.state.roe}', '${this.state.discount}', '${this.state.received}', ${moment(this.state.sailed).isValid() ? moment(this.state.sailed).format("YYY-MM-DD") : ''}` : ""
                    }).then(
                        async res => {
                            console.log(res.data);
                            if (res.data[0].Chave) {
                                await this.setState({ chave: res.data[0].Chave })
                                await loader.salvaLogs('contas_aberto', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].Chave);
                                if (this.state.meioPagamentoNome == 'DARF' || this.state.meioPagamentoNome == 'GPS' || this.state.meioPagamentoNome == 'GRU' || this.state.meioPagamentoNome === "PIX") {
                                    await loader.salvaLogs('contas_aberto_complementar', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].Chave);
                                }

                                await this.setState({ loading: false, bloqueado: false })
                            } else {
                                await alert(`Erro ${JSON.stringify(res.data)}`)
                            }
                        },
                        async res => await console.log(`Erro: ${res.data}`)
                    )
                }
            } else {
                if (this.state.tipo == 0) {
                    await apiEmployee.post(`updateContaCliente.php`, {
                        token: true,
                        Chave: this.state.chave,
                        Lancto: moment(this.state.lancamento).format('YYYY-MM-DD'),
                        Tipo: this.state.tipo,
                        Pessoa: this.state.pessoa,
                        Conta_Contabil: this.state.contaContabil,
                        Centro_Custo: this.state.centroCusto,
                        Conta_Desconto: this.state.contaDesconto,
                        Historico: this.state.historico,
                        Parc_Ini: this.state.parcelaInicial,
                        Parc_Fim: this.state.parcelaFinal,
                        RepCodBar: this.state.numBoleto,
                        Valor: parseFloat(this.state.valor.replaceAll('.', '').replaceAll(',', '.')),
                        Saldo: this.state.valorInicial == this.state.saldo ? parseFloat(this.state.valor.replaceAll('.', '').replaceAll(',', '.')) : parseFloat(this.state.saldo.replaceAll('.', '').replaceAll(',', '.')),
                        Vencimento: moment(this.state.vencimento).format('YYYY-MM-DD'),
                        Vencimento_Original: moment(this.state.vencimentoOrig).format('YYYY-MM-DD'),
                        Conta_Provisao: this.state.contaProvisao,
                        Empresa: this.state.empresa,
                        Docto: this.state.documento,
                        tipodocto: this.state.tipoDocumento,
                        meioPagamento: this.state.meioPagamento,

                        meioPagamentoNome: this.state.meioPagamentoNome,

                        codigo_receita: this.state.codigoReceita,
                        contribuinte: this.state.contribuinte,
                        codigo_identificador_tributo: this.state.codigoIdentificadorTributo,
                        mes_compet_num_ref: this.state.mesCompetNumRef,
                        data_apuracao: this.state.dataApuracao,
                        darfValor: parseFloat(this.state.darfValor.replaceAll('.', '').replaceAll(',', '.')),
                        darfMulta: parseFloat(this.state.darfMulta.replaceAll('.', '').replaceAll(',', '.')),
                        darfJuros: parseFloat(this.state.darfJuros.replaceAll('.', '').replaceAll(',', '.')),
                        darfOutros: parseFloat(this.state.darfOutros.replaceAll('.', '').replaceAll(',', '.')),
                        darfPagamento: parseFloat(this.state.darfPagamento.replaceAll('.', '').replaceAll(',', '.')),
                        tipo_pix: this.state.tipoPix,

                        os_manual: this.state.os,
                        navio_manual: this.state.navio,
                        porto_manual: this.state.porto,
                        roe_manual: this.state.roe,
                        discount_manual: this.state.discount,
                        received_manual: this.state.received,
                        sailed_manual: this.state.sailed,
                    }).then(
                        async res => {
                            if (res.data === true) {
                                await loader.salvaLogs('contas_aberto', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.chave, `CONTAS EM ABERTO: ${this.state.historico}`);
                                if (this.state.meioPagamentoNome == 'DARF' || this.state.meioPagamentoNome == 'GPS' || this.state.meioPagamentoNome == 'GRU' || this.state.meioPagamentoNome === "PIX") {
                                    if (this.state.dadosIniciaisDarf[0].valor == '') {
                                        await loader.salvaLogs('contas_aberto_complementar', this.state.usuarioLogado.codigo, null, "Inclusão", this.state.chave);
                                    } else {
                                        await loader.salvaLogs('contas_aberto_complementar', this.state.usuarioLogado.codigo, this.state.dadosIniciaisDarf, this.state.dadosFinaisDarf, this.state.chave, `CONTAS EM ABERTO COMPLEMENTAR: ${this.state.chave}`);
                                    }
                                }
                                await this.setState({ loading: false, bloqueado: false })
                            } else {
                                await alert(`Erro ${JSON.stringify(res.data)}`)
                            }
                        },
                        async res => await console.log(`Erro: ${res.data}`)
                    )
                } else {
                    await apiEmployee.post(`updateContaFornecedor.php`, {
                        token: true,
                        Chave: this.state.chave,
                        Lancto: moment(this.state.lancamento).format('YYYY-MM-DD'),
                        Tipo: this.state.tipo,
                        Pessoa: this.state.pessoa,
                        Conta_Contabil: this.state.contaContabil,
                        RepCodBar: this.state.codBarras,
                        Centro_Custo: this.state.centroCusto,
                        Historico: this.state.historico,
                        Conta_Desconto: this.state.contaDesconto,
                        Parc_Ini: this.state.parcelaInicial,
                        Parc_Fim: this.state.parcelaFinal,
                        Valor: parseFloat(this.state.valor.replaceAll('.', '').replaceAll(',', '.')),
                        Saldo: this.state.valorInicial == this.state.saldo ? parseFloat(this.state.valor.replaceAll('.', '').replaceAll(',', '.')) : parseFloat(this.state.saldo.replaceAll('.', '').replaceAll(',', '.')),
                        Vencimento: moment(this.state.vencimento).format('YYYY-MM-DD'),
                        Vencimento_Original: moment(this.state.vencimentoOrig).format('YYYY-MM-DD'),
                        Conta_Provisao: this.state.contaProvisao,
                        Empresa: this.state.empresa,
                        Docto: this.state.documento,
                        tipodocto: this.state.tipoDocumento,
                        meioPagamento: this.state.meioPagamento,

                        meioPagamentoNome: this.state.meioPagamentoNome,

                        codigo_receita: this.state.codigoReceita,
                        contribuinte: this.state.contribuinte,
                        codigo_identificador_tributo: this.state.codigoIdentificadorTributo,
                        mes_compet_num_ref: this.state.mesCompetNumRef,
                        data_apuracao: this.state.dataApuracao,
                        darfValor: parseFloat(this.state.darfValor.replaceAll('.', '').replaceAll(',', '.')),
                        darfMulta: parseFloat(this.state.darfMulta.replaceAll('.', '').replaceAll(',', '.')),
                        darfJuros: parseFloat(this.state.darfJuros.replaceAll('.', '').replaceAll(',', '.')),
                        darfOutros: parseFloat(this.state.darfOutros.replaceAll('.', '').replaceAll(',', '.')),
                        darfPagamento: parseFloat(this.state.darfPagamento.replaceAll('.', '').replaceAll(',', '.')),
                        tipo_pix: this.state.tipoPix,

                        os_manual: this.state.os,
                        navio_manual: this.state.navio,
                        porto_manual: this.state.porto,
                        roe_manual: this.state.roe,
                        discount_manual: this.state.discount,
                        received_manual: this.state.received,
                        sailed_manual: this.state.sailed,
                    }).then(
                        async res => {
                            if (res.data === true) {
                                await loader.salvaLogs('contas_aberto', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.chave, `CONTAS EM ABERTO: ${this.state.historico}`);
                                if (this.state.meioPagamentoNome == 'DARF' || this.state.meioPagamentoNome == 'GPS' || this.state.meioPagamentoNome == 'GRU' || this.state.meioPagamentoNome === "PIX") {
                                    if (this.state.dadosIniciaisDarf[0].valor == '') {
                                        await loader.salvaLogs('contas_aberto_complementar', this.state.usuarioLogado.codigo, null, "Inclusão", this.state.chave);
                                    } else {
                                        await loader.salvaLogs('contas_aberto_complementar', this.state.usuarioLogado.codigo, this.state.dadosIniciaisDarf, this.state.dadosFinaisDarf, this.state.chave, `CONTAS EM ABERTO COMPLEMENTAR: ${this.state.chave}`);
                                    }
                                }
                                await this.setState({ loading: false, bloqueado: false })
                            } else {
                                await alert(`Erro ${JSON.stringify(res.data)}`)
                            }
                        },
                        async res => await console.log(`Erro: ${res.data}`)
                    )
                }
            }
            this.salvaRetencoes();
        }

    }

    salvaRetencoes = async () => {
        const descontos = [
            {
                valor: this.state.desconto,
                complemento: this.state.descontoComplemento,
                conta: this.state.descontoConta,
                check: true,
                tipo: "DESCONTO"
            }, {
                valor: this.state.retencaoInss,
                complemento: this.state.retencaoInssComplemento,
                conta: this.state.retencaoInssConta,
                check: this.state.retencaoInssCheck,
                tipo: "INSS"
            }, {
                valor: this.state.retencaoIr,
                complemento: this.state.retencaoIrComplemento,
                conta: this.state.retencaoIrConta,
                check: this.state.retencaoIrCheck,
                tipo: "IR"
            }, {
                valor: this.state.retencaoIss,
                complemento: this.state.retencaoIssComplemento,
                conta: this.state.retencaoIssConta,
                check: this.state.retencaoIssCheck,
                tipo: "ISS"
            },/* {
                valor: this.state.retencaoPis,
                complemento: this.state.retencaoPisComplemento,
                conta: this.state.retencaoPisConta,
                check: this.state.retencaoPisCheck,
                tipo: "PIS"
            }, {
                valor: this.state.retencaoCofins,
                complemento: this.state.retencaoCofinsComplemento,
                conta: this.state.retencaoCofinsConta,
                check: this.state.retencaoCofinsCheck,
                tipo: "COFINS"
            },*/ {
                valor: this.state.retencaoCsll,
                complemento: this.state.retencaoCsllComplemento,
                conta: this.state.retencaoCsllConta,
                check: this.state.retencaoCsllCheck,
                tipo: "CRF"
            }
        ]

        await loader.postContasDescontos(descontos, this.state.chave);


    }

    contabilizarConta = async (validForm) => {
        await this.salvarConta(validForm);

        this.setState({ bloqueado: true, loading: true });

        const descontos = [
            {
                valor: this.state.desconto,
                complemento: this.state.descontoComplemento,
                conta: this.state.descontoConta,
                check: !!this.state.desconto
            }, {
                valor: this.state.retencaoInss,
                complemento: this.state.retencaoInssComplemento,
                conta: this.state.retencaoInssConta,
                check: this.state.retencaoInssCheck,
            }, {
                valor: this.state.retencaoIr,
                complemento: this.state.retencaoIrComplemento,
                conta: this.state.retencaoIrConta,
                check: this.state.retencaoIrCheck,
            }, {
                valor: this.state.retencaoIss,
                complemento: this.state.retencaoIssComplemento,
                conta: this.state.retencaoIssConta,
                check: this.state.retencaoIssCheck,
            }, {
                valor: this.state.retencaoPis,
                complemento: this.state.retencaoPisComplemento,
                conta: this.state.retencaoPisConta,
                check: this.state.retencaoPisCheck,
            }, {
                valor: this.state.retencaoCofins,
                complemento: this.state.retencaoCofinsComplemento,
                conta: this.state.retencaoCofinsConta,
                check: this.state.retencaoCofinsCheck,
            }, {
                valor: this.state.retencaoCsll,
                complemento: this.state.retencaoCsllComplemento,
                conta: this.state.retencaoCsllConta,
                check: this.state.retencaoCsllCheck,
            }
        ]

        if (validForm) {
            await apiEmployee.post(`contabilizaContasAberto.php`, {
                token: true,
                data: this.state.lancamento,
                conta_credito: this.state.tipo == 1 ? this.state.contaProvisao : this.state.contaContabil,
                conta_debito: this.state.tipo == 1 ? this.state.contaContabil : this.state.contaProvisao,
                tipo_documento: this.state.tipoDocumento,
                centro_custo: this.state.centroCusto,
                historico_padrao: this.state.historicoPadrao,
                historico: this.state.historico,
                pessoa: this.state.pessoa,
                valor: parseFloat(this.state.valor.replaceAll('.', '').replaceAll(',', '.')),
                chavePr: this.state.chave,
                usuario_inclusao: this.state.usuarioLogado.codigo,
                usuario_alteracao: this.state.usuarioLogado.codigo,
                data_inclusao: moment().format("YYYY-MM-DD"),
                data_alteracao: moment().format("YYYY-MM-DD"),
                extras: descontos
            }).then(
                async res => {
                    if (res.data[0] && res.data[0][0].Chave) {
                        await this.setState({ contabilizada: res.data[0].Chave })
                        await loader.salvaLogs('lancamentos', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].chave);

                        //alert('Serviço Inserido!')
                        await this.setState({ loading: false, bloqueado: false })
                    } else {
                        //alert(`Erro: ${res.data}`)
                    }
                },
                async res => await console.log(`Erro: ${res.data}`)
            )
        }
    }

    alteraModal = async (valor) => {
        this.setState({ modal: valor });
    }

    alteraPessoa = async (valor, categoria) => {
        if (this.state.tipo == '0' && categoria.split('')[0] == '1') {
            await this.setState({ pessoa: valor });
        }

        if (this.state.tipo == '1' && categoria.split('')[1] == '1') {
            await this.setState({ pessoa: valor });
        }

        await this.setState({ modalAberto: false })
        await this.getPessoas();

    }

    alteraCentroCusto = async (valor) => {
        await this.setState({ centroCusto: valor });
        await this.setState({ modalAberto: false });
        await this.setState({
            centrosCustos: await loader.getBase('getCentrosCustos.php'),
        })

        await this.setState({
            centrosCustosOptions: this.state.centrosCustos.map((c) => ({ label: `CC: ${c.Codigo} - ${c.Descricao}`, value: c.chave }))
        })

    }

    alteraNavio = async (valor) => {
        await this.setState({ navio: valor });
        await this.setState({ modalAberto: false });
        await this.setState({
            navios: await loader.getBase('getNavios.php'),
        })

        await this.setState({
            naviosOptions: this.state.navios.map((c) => ({ label: `${c.nome}`, value: c.chave }))
        })

    }

    alteraPorto = async (valor) => {
        await this.setState({ porto: valor });
        await this.setState({ modalAberto: false });
        await this.setState({
            portos: await loader.getBase('getPortos.php'),
        })

        await this.setState({
            portosOptions: this.state.portos.map((c) => ({ label: `${c.Descricao}`, value: c.Chave }))
        })

    }
    procuraOS = async () => {
        const os = await loader.getBody(`getOSConta.php`, {
            token: true,
            codigo: this.state.os,
        });

        if (os && os[0] && os[0].Chave) {
            if (os[0].Data_Faturamento && moment(os[0].Data_Faturamento).isValid() && os[0].centro_custo) {
                this.setState({
                    alert: {
                        type: "error",
                        msg: "Já há uma conta com essa ST!"
                    },
                    osExiste: true
                })
            } else {
                this.setState({
                    alert: {
                        type: "error",
                        msg: "OS já existe no sistema!"
                    },
                    osExiste: true
                })
            }
        } else if (os && os[0]?.conta) {
            this.setState({
                alert: {
                    type: "error",
                    msg: "Já há uma conta com essa ST!"
                },
                osExiste: true
            })
        }
    }
    erroApi = async (res) => {
        console.log(res)
        await this.setState({ redirect: true })
    }

    filterSearch = (e, state) => {
        if (e == "") {
            return true
        }

        const text = state.toUpperCase();
        return (e.label.toUpperCase().includes(text))
    }

    openLogs = async () => {
        await this.setState({ logs: await loader.getLogs("contas_aberto", this.state.chave) })
        await this.setState({ modalLog: true })
    }

    mudaRetencao = async (tipo) => {
        if (tipo == "INSS") {
            if (this.state.retencaoInssCheck) {
                await this.setState({
                    retencaoInssCheck: false,
                    retencaoInssConta: 0,
                    retencaoInss: '',
                    retencaoInssComplemento: ''
                })
            } else {
                await this.setState({
                    retencaoInssCheck: true,
                    retencaoInssConta: this.state.parametroInss
                })
            }
        } else if (tipo == "IR") {
            if (this.state.retencaoIrCheck) {
                await this.setState({
                    retencaoIrCheck: false,
                    retencaoIrConta: 0,
                    retencaoIr: '',
                    retencaoIrComplemento: ''
                })
            } else {
                await this.setState({
                    retencaoIrCheck: true,
                    retencaoIrConta: this.state.parametroIr
                })
            }
        } else if (tipo == "ISS") {
            if (this.state.retencaoIssCheck) {
                await this.setState({
                    retencaoIssCheck: false,
                    retencaoIssConta: 0,
                    retencaoIss: '0',
                    retencaoIssComplemento: ''
                })
            } else {
                await this.setState({
                    retencaoIssCheck: true,
                    retencaoIssConta: this.state.parametroIss
                })
            }
        } else if (tipo == "PIS") {
            if (this.state.retencaoPisCheck) {
                await this.setState({
                    retencaoPisCheck: false,
                    retencaoPisConta: 0,
                    retencaoPis: '',
                    retencaoPisComplemento: ''
                })
            } else {
                await this.setState({
                    retencaoPisCheck: true,
                    retencaoPisConta: this.state.parametroPis
                })
            }
        } else if (tipo == "COFINS") {
            if (this.state.retencaoCofinsCheck) {
                await this.setState({
                    retencaoCofinsCheck: false,
                    retencaoCofinsConta: 0,
                    retencaoCofins: '',
                    retencaoCofinsComplemento: ''
                })
            } else {
                await this.setState({
                    retencaoCofinsCheck: true,
                    retencaoCofinsConta: this.state.parametroCofins
                })
            }
        } else if (tipo == "CSLL") {
            if (this.state.retencaoCsllCheck) {
                await this.setState({
                    retencaoCsllCheck: false,
                    retencaoCsllConta: 0,
                    retencaoCsll: '',
                    retencaoCsllComplemento: ''
                })
            } else {
                await this.setState({
                    retencaoCsllCheck: true,
                    retencaoCsllConta: this.state.parametroCsll
                })
            }
        }
    }

    testaValores = () => {
        return parseFloat(this.state.desconto.replaceAll(".", "").replaceAll(",", ".")) + parseFloat(this.state.retencaoPis.replaceAll(".", "").replaceAll(",", ".")) + parseFloat(this.state.retencaoCofins.replaceAll(".", "").replaceAll(",", ".")) + parseFloat(this.state.retencaoCsll.replaceAll(".", "").replaceAll(",", ".")) + parseFloat(this.state.retencaoInss.replaceAll(".", "").replaceAll(",", ".")) + parseFloat(this.state.retencaoIr.replaceAll(".", "").replaceAll(",", ".")) + parseFloat(this.state.retencaoIss.replaceAll(".", "").replaceAll(",", ".")) > parseFloat(this.state.valor.replaceAll(".", "").replaceAll(",", "."));
    }


    render() {

        const validations = []
        validations.push(this.state.tipo)
        validations.push(this.state.pessoa)
        validations.push(!this.state.ultimaTransacao[0] || this.state.ultimaTransacao[0].id_status == 0 || this.state.ultimaTransacao[0].id_status == 1)
        validations.push(this.state.vencimento || this.state.tipo == 0)
        validations.push(this.state.vencimentoOrig || this.state.tipo == 0)
        validations.push(this.state.valor && this.state.valor.replaceAll('.', '').replaceAll(',', '.') == parseFloat(this.state.valor.replaceAll('.', '').replaceAll(',', '.')))
        validations.push(this.state.meioPagamento || this.state.tipo == 0)
        validations.push(this.state.tipo == 0 || this.state.contaDesconto)
        validations.push(this.state.meioPagamentoNome != 'GRU' && this.state.meioPagamentoNome != 'BOL' || this.state.codBarras)
        validations.push(this.state.meioPagamentoNome != 'DARF' && this.state.meioPagamentoNome != 'GPS' || this.state.codigoReceita)
        validations.push(this.state.meioPagamentoNome != 'DARF' && this.state.meioPagamentoNome != 'GPS' && this.state.meioPagamentoNome != 'GRU' || this.state.contribuinte)
        validations.push(this.state.meioPagamentoNome != 'DARF' && this.state.meioPagamentoNome != 'GPS' || this.state.codigoIdentificadorTributo)
        validations.push(this.state.meioPagamentoNome != 'DARF' && this.state.meioPagamentoNome != 'GPS' || this.state.mesCompetNumRef)
        validations.push(this.state.meioPagamentoNome != 'DARF' && this.state.meioPagamentoNome != 'GPS' || this.state.dataApuracao)
        validations.push(this.state.meioPagamentoNome != 'DARF' && this.state.meioPagamentoNome != 'GPS' || this.state.darfValor && this.state.darfValor.replaceAll('.', '').replaceAll(',', '.') == parseFloat(this.state.darfValor.replaceAll('.', '').replaceAll(',', '.')))
        validations.push(this.state.meioPagamentoNome != 'DARF' && this.state.meioPagamentoNome != 'GPS' || this.state.darfPagamento && this.state.darfPagamento.replaceAll('.', '').replaceAll(',', '.') == parseFloat(this.state.darfPagamento.replaceAll('.', '').replaceAll(',', '.')))
        validations.push(!this.state.osExiste)
        validations.push(!this.state.bloqueado)
        console.log(validations);

        const validForm = validations.reduce((t, a) => t && a)

        return (
            <div className='allContent'>

                {this.state.loading &&
                    <Skeleton />
                }

                {this.state.redirect &&
                    <Redirect to={'/'} />
                }

                {!this.state.loading &&
                    <>
                        <section>
                            {this.props.location.state.to == 'contasabertas' &&
                                <Header voltarContasAbertas titulo="Conta" chave={this.state.chave != 0 ? this.state.chave : ''} />
                            }
                            {this.props.location.state.to == 'contasreceber' &&
                                <Header voltarContasReceber titulo="Conta" chave={this.state.chave != 0 ? this.state.chave : ''} />
                            }
                            {this.props.location.state.to == 'contaspagar' &&
                                <Header voltarContasPagar titulo="Conta" chave={this.state.chave != 0 ? this.state.chave : ''} />
                            }
                            {this.props.location.state.to == 'pagamentoslote' &&
                                <Header voltarPagamentosLote titulo="Conta" chave={this.state.chave != 0 ? this.state.chave : ''} />
                            }
                            {this.props.location.state.to == 'recebimentospix' &&
                                <Header voltarRecebimentosPix titulo="Conta" chave={this.state.chave != 0 ? this.state.chave : ''} />
                            }
                            {this.props.location.state.to == 'contasliquidadas' &&
                                <Header voltarContasLiquidadas titulo="Conta" chave={this.state.chave != 0 ? this.state.chave : ''} />
                            }
                            {this.props.location.state.to == 'contasrecebidas' &&
                                <Header voltarContasRecebidas titulo="Conta" chave={this.state.chave != 0 ? this.state.chave : ''} />
                            }
                            {this.props.location.state.to == 'contaspagas' &&
                                <Header voltarContasPagas titulo="Conta" chave={this.state.chave != 0 ? this.state.chave : ''} />
                            }
                            <br />
                            <br />
                            <br />

                        </section>

                        <Alert
                            alert={this.state.alert}
                            setAlert={(e) => this.setState({ alert: e })}
                        />
                        {this.state.chave != 0 && this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'LOGS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                            <div className="logButton">
                                <button onClick={() => this.openLogs()}>Logs</button>
                            </div>
                        }

                        <ModalLogs
                            closeModal={() => { this.setState({ modalLog: false }) }}
                            logs={this.state.logs}
                            nome={this.state.historico}
                            chave={this.state.chave}
                            modalAberto={this.state.modalLog}
                        />
                        <ModalListas
                            alteraModal={this.alteraModal}
                            alteraCliente={this.alteraPessoa}
                            alteraCentroCusto={this.alteraCentroCusto}
                            alteraNavio={this.alteraNavio}
                            alteraPorto={this.alteraPorto}
                            modalAberto={this.state.modalAberto}
                            modal={this.state.modal}
                            modalLista={this.state.modalLista}
                            pesquisa={this.state.modalPesquisa}
                            acessosPermissoes={this.state.acessosPermissoes}
                            closeModal={() => { this.setState({ modalAberto: false }) }}
                        />

                        <Modal
                            aria-labelledby="transition-modal-title"
                            aria-describedby="transition-modal-description"
                            style={{ display: 'flex', justifyContent: 'center', paddingTop: '5%', paddingBottom: '5%', overflow: 'scroll' }}
                            open={this.state.descontosModal}
                            onClose={async () => { await this.setState({ descontosModal: false }) }}
                        >
                            <div className='modalContainer'>
                                <div className='modalCriar'>
                                    <div className='containersairlistprodmodal'>
                                        <div className='botaoSairModal' onClick={async () => await this.setState({ descontosModal: false })}>
                                            <span>X</span>
                                        </div>
                                    </div>
                                    <div className="modalContent">
                                        <div className='modalForm'>
                                            <Formik
                                                initialValues={{
                                                    name: '',
                                                }}
                                                onSubmit={async values => {
                                                    await new Promise(r => setTimeout(r, 1000))
                                                }}
                                            >
                                                <Form className="contact-form" >


                                                    <div className="row">

                                                        <div className="row addservicos">
                                                            <div className="col-12 checkboxesDiv">
                                                                <div>
                                                                    <label className='smallCheckbox'>INSS</label>
                                                                    <input className='smallCheckbox' type='checkbox' checked={this.state.retencaoInssCheck} onChange={async (e) => { await this.mudaRetencao("INSS") }} />
                                                                </div>
                                                                <div>
                                                                    <label className='smallCheckbox'>IR</label>
                                                                    <input className='smallCheckbox' type='checkbox' checked={this.state.retencaoIrCheck} onChange={async (e) => { await this.mudaRetencao("IR") }} />
                                                                </div>
                                                                <div>
                                                                    <label className='smallCheckbox'>ISS</label>
                                                                    <input className='smallCheckbox' type='checkbox' checked={this.state.retencaoIssCheck} onChange={async (e) => { await this.mudaRetencao("ISS") }} />
                                                                </div>
                                                                <div>
                                                                    <label className='smallCheckbox'>CRF</label>
                                                                    <input className='smallCheckbox' type='checkbox' checked={this.state.retencaoCsllCheck} onChange={async (e) => { await this.mudaRetencao("CSLL") }} />
                                                                </div>
                                                            </div>
                                                            <div className='col-1 errorMessage'>
                                                            </div>
                                                            <div><hr /></div>
                                                            <div className='col-12 text-center' style={{ height: '25px' }}>
                                                                <label>Desconto</label>
                                                            </div>
                                                            <div className='col-4 text-center' style={{ height: '25px' }}>
                                                                <label>Conta</label>
                                                            </div>
                                                            <div className='col-4 text-center' style={{ height: '25px' }}>
                                                                <label>Valor</label>
                                                            </div>
                                                            <div className='col-4 text-center' style={{ height: '25px' }}>
                                                                <label>Complem.</label>
                                                            </div>
                                                            <div className="col-4">
                                                                <Select isDisabled className='SearchSelect' options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ planosContasOptionsTexto: e }) }} value={this.state.planosContasOptions.filter(option => option.value == this.state.descontoConta)[0]} />
                                                            </div>
                                                            <div className='col-4'>
                                                                <Field className="form-control nextToSelect text-right" type="text" onClick={(e) => e.target.select()} value={this.state.desconto} onChange={async e => { this.setState({ desconto: e.currentTarget.value }) }} onBlur={async e => { this.setState({ desconto: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
                                                            </div>
                                                            <div className='col-4'>
                                                                <Field className="form-control nextToSelect" type="text" value={this.state.descontoComplemento} onChange={async e => { this.setState({ descontoComplemento: e.currentTarget.value }) }} />
                                                            </div>
                                                            {this.state.retencaoInssCheck &&
                                                                <>
                                                                    <div><hr /></div>
                                                                    <div className='col-12 text-center' style={{ height: '25px' }}>
                                                                        <label>Retenção INSS</label>
                                                                    </div>
                                                                    <div className='col-4 text-center' style={{ height: '25px' }}>
                                                                        <label>Conta</label>
                                                                    </div>
                                                                    <div className='col-4 text-center' style={{ height: '25px' }}>
                                                                        <label>Valor</label>
                                                                    </div>
                                                                    <div className='col-4 text-center' style={{ height: '25px' }}>
                                                                        <label>Complem.</label>
                                                                    </div>
                                                                    <div className="col-4">
                                                                        <Select className='SearchSelect' options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ planosContasOptionsTexto: e }) }} value={this.state.planosContasOptions.filter(option => option.value == this.state.retencaoInssConta)[0]} search={true} isDisabled />
                                                                    </div>
                                                                    <div className='col-4'>
                                                                        <Field className="form-control nextToSelect text-right" type="text" onClick={(e) => e.target.select()} value={this.state.retencaoInss} onChange={async e => { this.setState({ retencaoInss: e.currentTarget.value }) }} onBlur={async e => { this.setState({ retencaoInss: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
                                                                    </div>
                                                                    <div className='col-4'>
                                                                        <Field className="form-control nextToSelect" type="text" value={this.state.retencaoInssComplemento} onChange={async e => { this.setState({ retencaoInssComplemento: e.currentTarget.value }) }} />

                                                                    </div>
                                                                </>
                                                            }
                                                            {this.state.retencaoIrCheck &&
                                                                <>
                                                                    <div><hr /></div>
                                                                    <div className='col-12 text-center' style={{ height: '25px' }}>
                                                                        <label>Retenção IR</label>
                                                                    </div>
                                                                    <div className='col-4 text-center' style={{ height: '25px' }}>
                                                                        <label>Conta</label>
                                                                    </div>
                                                                    <div className='col-4 text-center' style={{ height: '25px' }}>
                                                                        <label>Valor</label>
                                                                    </div>
                                                                    <div className='col-4 text-center' style={{ height: '25px' }}>
                                                                        <label>Complem.</label>
                                                                    </div>
                                                                    <div className="col-4">
                                                                        <Select className='SearchSelect' options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ planosContasOptionsTexto: e }) }} value={this.state.planosContasOptions.filter(option => option.value == this.state.retencaoIrConta)[0]} search={true} isDisabled />
                                                                    </div>
                                                                    <div className='col-4'>
                                                                        <Field className="form-control nextToSelect text-right" type="text" onClick={(e) => e.target.select()} value={this.state.retencaoIr} onChange={async e => { this.setState({ retencaoIr: e.currentTarget.value }) }} onBlur={async e => { this.setState({ retencaoIr: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
                                                                    </div>
                                                                    <div className='col-4'>
                                                                        <Field className="form-control nextToSelect" type="text" value={this.state.retencaoIrComplemento} onChange={async e => { this.setState({ retencaoIrComplemento: e.currentTarget.value }) }} />

                                                                    </div>
                                                                </>
                                                            }
                                                            {this.state.retencaoIssCheck &&
                                                                <>
                                                                    <div><hr /></div>
                                                                    <div className='col-12 text-center' style={{ height: '25px' }}>
                                                                        <label>Retenção ISS</label>
                                                                    </div>
                                                                    <div className='col-4 text-center' style={{ height: '25px' }}>
                                                                        <label>Conta</label>
                                                                    </div>
                                                                    <div className='col-4 text-center' style={{ height: '25px' }}>
                                                                        <label>Valor</label>
                                                                    </div>
                                                                    <div className='col-4 text-center' style={{ height: '25px' }}>
                                                                        <label>Complem.</label>
                                                                    </div>
                                                                    <div className="col-4">
                                                                        <Select className='SearchSelect' options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ planosContasOptionsTexto: e }) }} value={this.state.planosContasOptions.filter(option => option.value == this.state.retencaoIssConta)[0]} search={true} isDisabled />
                                                                    </div>
                                                                    <div className='col-4'>
                                                                        <Field className="form-control nextToSelect text-right" type="text" onClick={(e) => e.target.select()} value={this.state.retencaoIss} onChange={async e => { this.setState({ retencaoIss: e.currentTarget.value }) }} onBlur={async e => { this.setState({ retencaoIss: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
                                                                    </div>
                                                                    <div className='col-4'>
                                                                        <Field className="form-control nextToSelect" type="text" value={this.state.retencaoIssComplemento} onChange={async e => { this.setState({ retencaoIssComplemento: e.currentTarget.value }) }} />

                                                                    </div>
                                                                </>
                                                            }
                                                            {this.state.retencaoPisCheck &&
                                                                <>
                                                                    <div><hr /></div>
                                                                    <div className='col-12 text-center' style={{ height: '25px' }}>
                                                                        <label>Retenção PIS</label>
                                                                    </div>
                                                                    <div className='col-4 text-center' style={{ height: '25px' }}>
                                                                        <label>Conta</label>
                                                                    </div>
                                                                    <div className='col-4 text-center' style={{ height: '25px' }}>
                                                                        <label>Valor</label>
                                                                    </div>
                                                                    <div className='col-4 text-center' style={{ height: '25px' }}>
                                                                        <label>Complem.</label>
                                                                    </div>
                                                                    <div className="col-4">
                                                                        <Select className='SearchSelect' options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ planosContasOptionsTexto: e }) }} value={this.state.planosContasOptions.filter(option => option.value == this.state.retencaoPisConta)[0]} search={true} isDisabled />
                                                                    </div>
                                                                    <div className='col-4'>
                                                                        <Field className="form-control nextToSelect text-right" type="text" onClick={(e) => e.target.select()} value={this.state.retencaoPis} onChange={async e => { this.setState({ retencaoPis: e.currentTarget.value }) }} onBlur={async e => { this.setState({ retencaoPis: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
                                                                    </div>
                                                                    <div className='col-4'>
                                                                        <Field className="form-control nextToSelect" type="text" value={this.state.retencaoPisComplemento} onChange={async e => { this.setState({ retencaoPisComplemento: e.currentTarget.value }) }} />

                                                                    </div>
                                                                </>
                                                            }
                                                            {this.state.retencaoCofinsCheck &&
                                                                <>
                                                                    <div><hr /></div>
                                                                    <div className='col-12 text-center' style={{ height: '25px' }}>
                                                                        <label>Retenção COFINS</label>
                                                                    </div>
                                                                    <div className='col-4 text-center' style={{ height: '25px' }}>
                                                                        <label>Conta</label>
                                                                    </div>
                                                                    <div className='col-4 text-center' style={{ height: '25px' }}>
                                                                        <label>Valor</label>
                                                                    </div>
                                                                    <div className='col-4 text-center' style={{ height: '25px' }}>
                                                                        <label>Complem.</label>
                                                                    </div>
                                                                    <div className="col-4">
                                                                        <Select className='SearchSelect' options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ planosContasOptionsTexto: e }) }} value={this.state.planosContasOptions.filter(option => option.value == this.state.retencaoCofinsConta)[0]} search={true} isDisabled />
                                                                    </div>
                                                                    <div className='col-4'>
                                                                        <Field className="form-control nextToSelect text-right" type="text" onClick={(e) => e.target.select()} value={this.state.retencaoCofins} onChange={async e => { this.setState({ retencaoCofins: e.currentTarget.value }) }} onBlur={async e => { this.setState({ retencaoCofins: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
                                                                    </div>
                                                                    <div className='col-4'>
                                                                        <Field className="form-control nextToSelect" type="text" value={this.state.retencaoCofinsComplemento} onChange={async e => { this.setState({ retencaoCofinsComplemento: e.currentTarget.value }) }} />

                                                                    </div>
                                                                </>
                                                            }
                                                            {this.state.retencaoCsllCheck &&
                                                                <>
                                                                    <div><hr /></div>
                                                                    <div className='col-12 text-center' style={{ height: '25px' }}>
                                                                        <label>Retenções CRF</label>
                                                                    </div>
                                                                    <div className='col-4 text-center' style={{ height: '25px' }}>
                                                                        <label>Conta</label>
                                                                    </div>
                                                                    <div className='col-4 text-center' style={{ height: '25px' }}>
                                                                        <label>Valor</label>
                                                                    </div>
                                                                    <div className='col-4 text-center' style={{ height: '25px' }}>
                                                                        <label>Complem.</label>
                                                                    </div>
                                                                    <div className="col-4">
                                                                        <Select className='SearchSelect' options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ planosContasOptionsTexto: e }) }} value={this.state.planosContasOptions.filter(option => option.value == this.state.retencaoCsllConta)[0]} search={true} isDisabled />
                                                                    </div>
                                                                    <div className='col-4'>
                                                                        <Field className="form-control nextToSelect text-right" type="text" onClick={(e) => e.target.select()} value={this.state.retencaoCsll} onChange={async e => { this.setState({ retencaoCsll: e.currentTarget.value }) }} onBlur={async e => { this.setState({ retencaoCsll: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
                                                                    </div>
                                                                    <div className='col-4'>
                                                                        <Field className="form-control nextToSelect" type="text" value={this.state.retencaoCsllComplemento} onChange={async e => { this.setState({ retencaoCsllComplemento: e.currentTarget.value }) }} />

                                                                    </div>
                                                                </>
                                                            }
                                                        </div>
                                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                                    </div>

                                                </Form>
                                            </Formik>
                                        </div>

                                    </div >
                                </div>
                            </div >
                        </Modal >

                        <div className="contact-section">

                            <div className="row">
                                <div className="col-lg-12">
                                    <Formik
                                        initialValues={{
                                            name: '',
                                        }}
                                        onSubmit={async values => {
                                            await new Promise(r => setTimeout(r, 1000))
                                            this.salvarConta(validForm)
                                        }}
                                    >
                                        <Form className="contact-form" onBlur={() => {/*this.verificadorspans()*/ }} >

                                            <div className="row">
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2"></div>

                                                <div className="col-xl-8 col-lg-8 col-md-8 col-sm-8 col-12 ">

                                                    <div className="row addservicos">
                                                        {this.state.chave != 0 &&
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel">
                                                                <label>Chave</label>
                                                            </div>
                                                        }
                                                        {this.state.chave != 0 &&
                                                            <div className='col-1'></div>
                                                        }
                                                        {this.state.chave != 0 &&
                                                            <div className="col-xl-2 col-lg-2 col-md-3 col-sm-10 col-10 ">
                                                                <Field className="form-control" style={{ backgroundColor: '#dddddd' }} type="text" disabled value={this.state.chave} />
                                                            </div>
                                                        }
                                                        {this.state.chave != 0 &&
                                                            <div className="col-xl-4 col-lg-4 col-md-3 col-sm-1 col-1 ">
                                                            </div>
                                                        }
                                                        {this.state.chave == 0 &&
                                                            <div className={this.state.chave == 0 ? "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel" : "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm"}>
                                                                <label>Tipo</label>
                                                            </div>
                                                        }
                                                        {this.state.chave == 0 &&
                                                            <div className='col-1 errorMessage'>
                                                                {!this.state.tipo &&
                                                                    <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                }
                                                            </div>
                                                        }
                                                        {this.state.chave == 0 &&
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                <select value={this.state.tipo} onChange={async (e) => { await this.setState({ tipo: e.currentTarget.value, pessoa: '' }); await this.getPessoas() }} className='form-control'>
                                                                    {this.state.tiposOptions.map((t) => (
                                                                        <option value={t.value}>{t.label}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        }
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Lançamento</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="date" value={this.state.lancamento} onChange={async e => { this.setState({ lancamento: e.currentTarget.value }) }} />
                                                        </div>
                                                        {this.state.tipo &&
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                {this.state.tipo === '0' &&
                                                                    <label>Cliente</label>
                                                                }
                                                                {this.state.tipo == 1 &&
                                                                    <label>Fornecedor</label>
                                                                }
                                                            </div>
                                                        }
                                                        {this.state.tipo &&
                                                            <div className='col-1 errorMessage'>
                                                                {!this.state.pessoa &&
                                                                    <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                }
                                                            </div>
                                                        }
                                                        {this.state.tipo &&
                                                            <>
                                                                <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                                                    <Select className='SearchSelect' options={this.state.pessoasOptions.filter(e => this.filterSearch(e, this.state.pessoasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ pessoasOptionsTexto: e }) }} value={this.state.pessoasOptions.filter(option => option.value == this.state.pessoa)[0]} search={true} onChange={async (e) => { await this.setState({ pessoa: e.value, }); if (this.state.tipo == 1 && this.state.provisaoCheck) { await this.setState({ contaProvisao: await loader.getContaPessoa(this.state.pessoa, 'provisao') }) } else if (this.state.tipo == 0) { await this.setState({ contaDesconto: await loader.getContaPessoa(this.state.pessoa) }); } }} />
                                                                </div>
                                                                <div className="col-xl-1 col-lg-2 col-md-2 col-sm-12 col-12">
                                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                                                        <div className='insideFormButton' onClick={async () => {
                                                                            if (this.state.pessoas[0]) { } else {
                                                                                if (this.state.tipo == '0') {
                                                                                    await this.setState({
                                                                                        pessoas: await loader.getBase('getClientes.php')
                                                                                    })
                                                                                } else if (this.state.tipo == '1') {
                                                                                    await this.setState({
                                                                                        pessoas: await loader.getBase('getFornecedores.php')
                                                                                    })
                                                                                }
                                                                            }
                                                                            await this.setState({ modalAberto: true, modal: 'listarCliente', modalPesquisa: this.state.pessoa, modalLista: this.state.pessoas })
                                                                        }}>...</div>
                                                                    }
                                                                </div>
                                                            </>
                                                        }
                                                        {this.state.tipo == 1 &&
                                                            <>
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Conta Débito</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Select className='SearchSelect' options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ planosContasOptionsTexto: e }) }} value={this.state.planosContasOptions.filter(option => option.value == this.state.contaContabil)[0]} search={true} onChange={(e) => { this.setState({ contaContabil: e.value, }) }} />
                                                                </div>
                                                            </>}

                                                        {/* <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Centro de Custo</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.centrosCustosOptions.filter(e => this.filterSearch(e, this.state.centrosCustosOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ centrosCustosOptionsTexto: e }) }} value={this.state.centrosCustosOptions.filter(option => option.value == this.state.centroCusto)[0]} search={true} onChange={(e) => { this.setState({ centroCusto: e.value }) }} />
                                                        </div>
                                                        <div className="col-xl-1 col-lg-2 col-md-2 col-sm-12 col-12">
                                                            {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'CENTROS_CUSTOS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                                                <div className='insideFormButton' onClick={async () => {
                                                                    if (this.state.centrosCustos[0]) { } else {
                                                                        await this.setState({
                                                                            centrosCustos: await loader.getBase('getCentroCustos.php')
                                                                        })
                                                                    }
                                                                    await this.setState({ modalAberto: true, modal: 'listarCentrosCustos', modalPesquisa: this.state.centroCusto, modalLista: this.state.centrosCustos })
                                                                }}>...</div>
                                                            }
                                                        </div> */}
                                                        {this.state.tipo == 1 &&
                                                            <>
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Histórico Padrão</label>
                                                                </div>
                                                                <div className='col-1'></div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Select className='SearchSelect' options={this.state.historicosOptions.filter(e => this.filterSearch(e, this.state.historicosOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ historicosOptionsTexto: e }) }} value={this.state.historicosOptions.filter(option => option.label == this.state.historico)[0]} search={true} onChange={(e) => { this.setState({ historico: e.label, }) }} />
                                                                </div>
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Histórico</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Field className="form-control" type="text" value={this.state.historico} onChange={async e => { this.setState({ historico: e.currentTarget.value }) }} />
                                                                </div>
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Documento</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Field className="form-control" type="text" value={this.state.documento} onChange={async e => { this.setState({ documento: e.currentTarget.value }) }} />
                                                                </div>
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Tipo de Documento</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Select className='SearchSelect' options={this.state.tiposDocumentosOptions.filter(e => this.filterSearch(e, this.state.tiposDocumentosOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ tiposDocumentosOptionsTexto: e }) }} value={this.state.tiposDocumentosOptions.filter(option => option.value == this.state.tipoDocumento)[0]} search={true} onChange={(e) => { this.setState({ tipoDocumento: e.value }) }} />
                                                                </div>
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Parcelas</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                </div>
                                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-4 col-4">
                                                                    <Field className="form-control" type="number" value={this.state.parcelaInicial} onChange={async e => { this.setState({ parcelaInicial: e.currentTarget.value }) }} />
                                                                </div>
                                                                <div className='col-xl-1 col-lg-1 col-md-1 col-sm-1 col-1 labelForm'>
                                                                    <label>/</label>
                                                                </div>
                                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-4 col-4">
                                                                    <Field className="form-control" type="number" value={this.state.parcelaFinal} onChange={async e => { this.setState({ parcelaFinal: e.currentTarget.value }) }} />
                                                                </div>
                                                                <div className='col-1'></div>
                                                            </>
                                                        }
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Valor</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.valor &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            {this.state.saldo == this.state.valorInicial &&
                                                                <Field className="form-control text-right" type="text" value={this.state.valor} onClick={(e) => e.target.select()} onChange={async e => { this.setState({ valor: e.currentTarget.value }) }} onBlur={async e => { this.setState({ valor: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
                                                            }
                                                            {this.state.saldo != this.state.valorInicial &&
                                                                <Field className="form-control text-right" disabled type="text" value={this.state.valor} />
                                                            }
                                                        </div>

                                                        {this.state.tipo == 1 &&
                                                            <>
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Vencimento</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                    {!this.state.vencimento &&
                                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                    }
                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Field className="form-control" type="date" value={this.state.vencimento} onChange={async e => { this.setState({ vencimento: e.currentTarget.value }) }} onBlur={async e => this.state.vencimentoOrig ? {} : this.setState({ vencimentoOrig: this.state.vencimento })} />
                                                                </div>
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Venc. Original</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                    {!this.state.vencimentoOrig &&
                                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                    }
                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Field className="form-control" type="date" value={this.state.vencimentoOrig} onChange={async e => { this.setState({ vencimentoOrig: e.currentTarget.value }) }} />
                                                                </div>
                                                            </>
                                                        }

                                                        {this.state.tipo == 1 &&
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Cód. Barras</label>
                                                            </div>
                                                        }
                                                        {this.state.tipo == 1 &&
                                                            <div className='col-1 errorMessage'>
                                                                {(this.state.meioPagamentoNome == 'GRU' || this.state.meioPagamentoNome == 'BOL') && !this.state.codBarras &&
                                                                    <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                }
                                                            </div>
                                                        }
                                                        {this.state.tipo == 1 &&
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                <Field className="form-control" type="text" value={this.state.codBarras} onChange={async e => { this.setState({ codBarras: e.currentTarget.value }) }} />
                                                            </div>
                                                        }
                                                        {this.state.tipo == 1 &&
                                                            <>
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Banco</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                    {!this.state.contaDesconto &&
                                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                    }
                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Select className='SearchSelect' options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ planosContasOptionsTexto: e }) }} value={this.state.planosContasOptions.filter(option => option.value == this.state.contaDesconto)[0]} search={true} onChange={(e) => { this.setState({ contaDesconto: e.value, }) }} />
                                                                </div>
                                                            </>
                                                        }
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Inserção manual</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <input className='form_control' checked={this.state.manual} onChange={(e) => { this.setState({ manual: e.currentTarget.checked }) }} type="checkbox" />
                                                        </div>
                                                        <div className='col-1'></div>
                                                        {this.state.manual &&
                                                            <>
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>OS</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Field className="form-control" type="text" value={this.state.os} onChange={async e => { this.setState({ os: e.currentTarget.value, osExiste: false }); }} onBlur={() => this.procuraOS()} />
                                                                </div>
                                                                <div className='col-1'></div>

                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Navio</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Select className='SearchSelect' options={this.state.naviosOptions.filter(e => this.filterSearch(e, this.state.optionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ optionsTexto: e }) }} value={this.state.naviosOptions.find(option => option.value == this.state.navio)} search={true} onChange={(e) => { this.setState({ navio: e.value, }) }} />
                                                                </div>
                                                                <div className='col-1'>
                                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'NAVIOS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                                                        <div className='insideFormButton' onClick={async () => {
                                                                            if (this.state.navios[0]) { } else {
                                                                                await this.setState({
                                                                                    navios: await loader.getBase('getNavios.php')
                                                                                })
                                                                            }
                                                                            await this.setState({ modalAberto: true, modal: 'listarNavios', modalPesquisa: this.state.navio, modalLista: this.state.navios })
                                                                        }}>...</div>
                                                                    }
                                                                </div>
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Porto</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Select className='SearchSelect' options={this.state.portosOptions.filter(e => this.filterSearch(e, this.state.optionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ optionsTexto: e }) }} value={this.state.portosOptions.find(option => option.value == this.state.porto)} search={true} onChange={(e) => { this.setState({ porto: e.value, }) }} />
                                                                </div>
                                                                <div className='col-1'>
                                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PORTOS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                                                        <div className='insideFormButton' onClick={async () => {
                                                                            if (this.state.portos[0]) { } else {
                                                                                await this.setState({
                                                                                    portos: await loader.getBase('getPortos.php')
                                                                                })
                                                                            }
                                                                            await this.setState({ modalAberto: true, modal: 'listarPortos', modalPesquisa: this.state.porto, modalLista: this.state.portos })
                                                                        }}>...</div>
                                                                    }
                                                                </div>

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Sailed</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="date" value={this.state.sailed} onChange={async e => { this.setState({ sailed: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className='col-1'></div>

                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>ROE</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Field className="form-control" type="text" value={this.state.roe} onChange={async e => { this.setState({ roe: e.currentTarget.value }) }} />
                                                                </div>
                                                                <div className='col-1'></div>


                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Descontos</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Field className="form-control text-right" type="text" value={this.state.discount} onClick={(e) => e.target.select()} onChange={async e => { this.setState({ discount: e.currentTarget.value }) }} onBlur={async e => { this.setState({ discount: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
                                                                </div>
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Recebimento de Remessa</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Field className="form-control text-right" type="text" value={this.state.received} onClick={(e) => e.target.select()} onChange={async e => { this.setState({ received: e.currentTarget.value }) }} onBlur={async e => { this.setState({ received: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
                                                                </div>
                                                            </>
                                                        }

                                                        {this.state.tipo == 1 &&
                                                            <>
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Meio de Pagamento</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                    {!this.state.meioPagamento &&
                                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                    }
                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Select className='SearchSelect' options={this.state.meiosPagamentosOptions.filter(e => this.filterSearch(e, this.state.meiosPagamentosOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ meiosPagamentosOptionsTexto: e }) }} value={this.state.meiosPagamentosOptions.filter(option => option.value == this.state.meioPagamento)[0]} search={true} onChange={(e) => { this.setState({ meioPagamento: e.value, meioPagamentoNome: e.label }) }} />
                                                                </div>
                                                            </>}

                                                        {(this.state.meioPagamentoNome == 'DARF' || this.state.meioPagamentoNome == 'GPS' || this.state.meioPagamentoNome == 'GRU') &&
                                                            <>
                                                                <div>
                                                                    <hr />
                                                                </div>
                                                                {(this.state.meioPagamentoNome == 'DARF' || this.state.meioPagamentoNome == 'GPS') &&
                                                                    <>
                                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                            <label>Código da receita</label>
                                                                        </div>
                                                                        <div className='col-1 errorMessage'>
                                                                            {!this.state.codigoReceita &&
                                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                            }
                                                                        </div>
                                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                            <Field className="form-control" type="text" value={this.state.codigoReceita} onChange={async e => { this.setState({ codigoReceita: e.currentTarget.value }) }} />
                                                                        </div>
                                                                    </>
                                                                }
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Contribuinte</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                    {!this.state.contribuinte &&
                                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                    }
                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Field className="form-control" type="text" value={this.state.contribuinte} onChange={async e => { this.setState({ contribuinte: e.currentTarget.value }) }} />
                                                                </div>
                                                                {(this.state.meioPagamentoNome == 'DARF' || this.state.meioPagamentoNome == 'GPS') &&
                                                                    <>
                                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                            <label>Código identicador do tributo</label>
                                                                        </div>
                                                                        <div className='col-1 errorMessage'>
                                                                            {!this.state.codigoIdentificadorTributo &&
                                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                            }
                                                                        </div>
                                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                            <Field className="form-control" type="text" value={this.state.codigoIdentificadorTributo} onChange={async e => { this.setState({ codigoIdentificadorTributo: e.currentTarget.value }) }} />
                                                                        </div>
                                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                            <label>Número de referência</label>
                                                                        </div>
                                                                        <div className='col-1 errorMessage'>
                                                                            {!this.state.mesCompetNumRef &&
                                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                            }
                                                                        </div>
                                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                            <Field className="form-control" type="text" value={this.state.mesCompetNumRef} onChange={async e => { this.setState({ mesCompetNumRef: e.currentTarget.value }) }} />
                                                                        </div>
                                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                            <label>Data de Apuração</label>
                                                                        </div>
                                                                        <div className='col-1 errorMessage'>
                                                                            {!this.state.dataApuracao &&
                                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                            }
                                                                        </div>
                                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                            <Field className="form-control" type="date" value={this.state.dataApuracao} onChange={async e => { this.setState({ dataApuracao: e.currentTarget.value }) }} />
                                                                        </div>
                                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                            <label>Valor</label>
                                                                        </div>
                                                                        <div className='col-1 errorMessage'>
                                                                            {!this.state.darfValor &&
                                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                            }
                                                                        </div>
                                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                            <Field className="form-control text-right" type="text" value={this.state.darfValor} onChange={async e => { this.setState({ darfValor: e.currentTarget.value }) }} onBlur={async e => { this.setState({ darfValor: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
                                                                        </div>
                                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                            <label>Multa</label>
                                                                        </div>
                                                                        <div className='col-1 errorMessage'>
                                                                        </div>
                                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                            <Field className="form-control text-right" type="text" value={this.state.darfMulta} onChange={async e => { this.setState({ darfMulta: e.currentTarget.value }) }} onBlur={async e => { this.setState({ darfValor: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
                                                                        </div>
                                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                            <label>Juros</label>
                                                                        </div>
                                                                        <div className='col-1 errorMessage'>
                                                                        </div>
                                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                            <Field className="form-control text-right" type="text" value={this.state.darfJuros} onChange={async e => { this.setState({ darfJuros: e.currentTarget.value }) }} onBlur={async e => { this.setState({ darfValor: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
                                                                        </div>
                                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                            <label>Valor de Pagamento</label>
                                                                        </div>
                                                                        <div className='col-1 errorMessage'>
                                                                            {!this.state.darfPagamento &&
                                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                            }
                                                                        </div>
                                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                            <Field className="form-control text-right" type="text" value={this.state.darfPagamento} onChange={async e => { this.setState({ darfPagamento: e.currentTarget.value }) }} onBlur={async e => { this.setState({ darfPagamento: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
                                                                        </div>
                                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                            <label>Outros Valores</label>
                                                                        </div>
                                                                        <div className='col-1 errorMessage'>
                                                                        </div>
                                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                            <Field className="form-control text-right" type="text" value={this.state.darfOutros} onChange={async e => { this.setState({ darfOutros: e.currentTarget.value }) }} onBlur={async e => { this.setState({ darfValor: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
                                                                        </div>
                                                                    </>
                                                                }
                                                            </>
                                                        }

                                                    </div>


                                                </div>
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                            </div>

                                            <div className="row">
                                                <div className="col-1"></div>
                                                <div className="col-4" style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <button disabled={!validForm} type="submit" style={validForm ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} >Salvar</button>
                                                </div>
                                                <div className="col-2"></div>
                                                <div className="col-4" style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <button disabled={!validForm || this.state.chave == 0 || this.state.contabilizada != 0 || this.testaValores()} title={this.state.contabilizada ? "Já foi contabilizada" : this.testaValores() ? "Valores de retenções ultrapassam o valor da conta" : ""} onClick={() => { this.contabilizarConta(validForm && this.state.chave != 0 && this.state.contabilizada == 0 && !this.testaValores()); }} style={validForm && this.state.chave != 0 && this.state.contabilizada == 0 && !this.testaValores() ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} >Contabilizar</button>
                                                </div>
                                                <div className="col-1"></div>
                                            </div>

                                        </Form>
                                    </Formik>
                                </div>

                                <br />

                                {this.state.chave != 0 &&
                                    <>
                                        <div className="centerDiv">
                                            <div className="relatoriosSection centerDiv">
                                                <div className="relatorioButton">
                                                    <button className="btn btn-danger" onClick={() => this.setState({ descontosModal: true })}>Descontos e Retenções</button>
                                                </div>
                                            </div>
                                        </div>

                                    </>
                                }

                            </div>

                        </div>
                        <Rodape />
                    </>
                }
            </div >
        )

    }
}

const mapStateToProps = ({ user, servidor }) => {
    return {
        user: user,
        online: servidor.online
    }
}

export default connect(mapStateToProps, null)(AddConta)

