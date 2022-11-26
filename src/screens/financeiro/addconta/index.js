import React, { Component } from 'react'
import './styles.css'
import { Formik, Field, Form } from 'formik'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import ModalListas from '../../../components/modalListas'
import Skeleton from '../../../components/skeleton'
import util from '../../../classes/util'
import { PRECISA_LOGAR } from '../../../config'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import Image from 'react-bootstrap/Image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import ModalLogs from '../../../components/modalLogs'
import { apiEmployee } from '../../../services/apiamrg'
import moment from 'moment'
import loader from '../../../classes/loader'
import Select from 'react-select';

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
        { titulo: 'valor_pagamento', valor: '' }
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
        { titulo: 'valor_pagamento', valor: '' }
    ],


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

    bloqueado: false,
    loading: true
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
        if (this.props.location.state.tipo) {
            this.setState({ tipo: this.props.location.state.tipo })
        }
        if (parseInt(id) !== 0) {
            await this.setState({ conta: this.props.location.state.conta })
            //console.log('Servicos: ' + JSON.stringify(this.state.tiposervico))
            //await this.loadData(this.state.tiposervico)
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
                valor: new Intl.NumberFormat('pt-BR').format(this.state.conta.Valor),
                saldo: parseFloat(this.state.conta.Saldo).toFixed(2).replaceAll('.', ','),
                valorInicial: parseFloat(this.state.conta.Valor).toFixed(2).replaceAll('.', ','),
                vencimento: moment(this.state.conta.Vencimento).format('YYYY-MM-DD'),
                vencimentoOrig: moment(this.state.conta.Vencimento_Original).format('YYYY-MM-DD'),
                contaProvisao: this.state.conta.Conta_Provisao,
                empresa: this.state.conta.Empresa,
                documento: this.state.conta.Docto,
                tipoDocumento: this.state.conta.tipodocto,
                meioPagamento: this.state.conta.meio_pagamento
            })

            await this.setState({
                dadosIniciais: [
                    { titulo: 'Tipo', valor: this.state.Tipo },
                    { titulo: 'Lancto', valor: this.state.lancamento },
                    { titulo: 'Docto', valor: this.state.documento },
                    { titulo: 'Parc_Ini', valor: this.state.parcelaInicial },
                    { titulo: 'Parc_Fim', valor: this.state.parcelaFinal },
                    { titulo: 'Historico', valor: this.state.historico },
                    { titulo: 'Vencimento', valor: this.state.vencimento },
                    { titulo: 'Vencimento_Original', valor: this.state.vencimentoOrig },
                    { titulo: 'Valor', valor: this.state.valor },
                    { titulo: 'Saldo', valor: this.state.saldo },
                    { titulo: 'Centro_Custo', valor: this.state.centroCusto },
                    { titulo: 'Conta_Provisao', valor: this.state.contaProvisao },
                    { titulo: 'Conta_Contabil', valor: this.state.contaContabil },
                    { titulo: 'Conta_Desconto', valor: this.state.contaDesconto },
                    { titulo: 'Pessoa', valor: this.state.pessoa },
                    { titulo: 'Operador', valor: this.state.conta.Operador },
                    { titulo: 'Conta_Bloqueto', valor: this.state.contaBloqueto },
                    { titulo: 'tipodocto', valor: this.state.tipoDocumento },
                    { titulo: 'meio_pagamento', valor: this.state.meioPagamento },
                ]


            })
            if (this.state.contaProvisao != 0) {
                await this.setState({ provisaoCheck: true })
            }

            await this.setState({ ultimaTransacao: await loader.getBody(`getUltimaTransacaoConta.php`, { chave: this.state.chave }) });
        }
        await this.loadAll();

        const meioPagamentoNome = this.state.meiosPagamentos.filter((e) => e.chave == this.state.meioPagamento);
        if (meioPagamentoNome && meioPagamentoNome[0]) {
            await this.setState({ meioPagamentoNome: meioPagamentoNome[0].descricao });

            if (this.state.meioPagamentoNome == 'DARF' || this.state.meioPagamentoNome == 'GPS' || this.state.meioPagamentoNome == 'GRU') {
                await this.getContasComplementar();
            }

        }
        this.state.acessosPermissoes.map((e) => {
            if ((e.acessoAcao == "CONTAS_ABERTAS" && e.permissaoInsere == 0 && this.state.chave == 0) || (e.acessoAcao == "CONTAS_ABERTAS" && e.permissaoEdita == 0 && this.state.chave != 0)) {
                this.setState({ bloqueado: true })
            }
        })

    }

    loadAll = async () => {
        await this.getPessoas();

        await this.setState({
            historicos: await loader.getBase('getHistoricos.php'),
            historicosOptions: await loader.getHistoricosOptions(),

            planosContas: await loader.getBase('getPlanosContasAnaliticas.php'),
            planosContasOptions: await loader.getPlanosContasAnaliticasOptions(),

            centrosCustos: await loader.getBase('getCentrosCustos.php'),
            centrosCustosOptions: await loader.getBaseOptions('getCentrosCustos.php', 'Descricao', 'Chave'),

            tiposDocumentos: await loader.getBase('getTiposLancamento.php'),
            tiposDocumentosOptions: await loader.getTiposLancamentoOptions(),

            meiosPagamentos: await loader.getBase('getMeiosPagamentos.php'),
            meiosPagamentosOptions: await loader.getMeiosPagamentosOptions(),

            acessos: await loader.getBase('getTiposAcessos.php'),
            permissoes: await loader.getBase('getPermissoes.php')
        })

        await this.setState({
            acessosPermissoes: await loader.testaAcesso(this.state.acessos, this.state.permissoes, this.state.usuarioLogado),
            loading: false
        })
    }

    getPessoas = async () => {
        if (this.state.tipo == '0') {
            this.setState({
                pessoas: await loader.getBase('getClientes.php'),
                pessoasOptions: await loader.getBaseOptions('getClientes.php', "Nome", "Chave")
            })
        } else if (this.state.tipo == '1') {
            this.setState({
                pessoas: await loader.getBase('getFornecedores.php'),
                pessoasOptions: await loader.getBaseOptions('getFornecedores.php', "Nome", "Chave")
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
                        darfValor: new Intl.NumberFormat('pt-BR').format(this.state.contaComplementar.valor),
                        darfMulta: new Intl.NumberFormat('pt-BR').format(this.state.contaComplementar.valor_multa),
                        darfJuros: new Intl.NumberFormat('pt-BR').format(this.state.contaComplementar.valor_juros),
                        darfOutros: new Intl.NumberFormat('pt-BR').format(this.state.contaComplementar.valor_outros),
                        darfPagamento: new Intl.NumberFormat('pt-BR').format(this.state.contaComplementar.valor_pagamento)
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
                            { titulo: 'valor_pagamento', valor: this.state.darfPagamento }
                        ]
                    })


                } else {
                }
            },
            async err => console.log(`erro: ` + err)
        )
    }


    salvarConta = async (validForm) => {
        this.setState({ bloqueado: true });

        await this.setState({
            dadosFinais: [
                { titulo: 'Tipo', valor: this.state.Tipo },
                { titulo: 'Lancto', valor: this.state.lancamento },
                { titulo: 'Docto', valor: this.state.documento },
                { titulo: 'Parc_Ini', valor: this.state.parcelaInicial },
                { titulo: 'Parc_Fim', valor: this.state.parcelaFinal },
                { titulo: 'Historico', valor: this.state.historico },
                { titulo: 'Vencimento', valor: this.state.vencimento },
                { titulo: 'Vencimento_Original', valor: this.state.vencimentoOrig },
                { titulo: 'Valor', valor: this.state.valor },
                { titulo: 'Saldo', valor: this.state.saldo },
                { titulo: 'Centro_Custo', valor: this.state.centroCusto },
                { titulo: 'Conta_Provisao', valor: this.state.contaProvisao },
                { titulo: 'Conta_Contabil', valor: this.state.contaContabil },
                { titulo: 'Conta_Desconto', valor: this.state.contaDesconto },
                { titulo: 'Pessoa', valor: this.state.pessoa },
                { titulo: 'Operador', valor: this.state.usuarioLogado.codigo },
                { titulo: 'Conta_Bloqueto', valor: this.state.contaBloqueto },
                { titulo: 'tipodocto', valor: this.state.tipoDocumento },
                { titulo: 'meio_pagamento', valor: this.state.meioPagamento },
            ]
        })

        if (parseInt(this.state.chave) === 0 && validForm) {
            if (this.state.tipo == 0) {
                await apiEmployee.post(`insertContaCliente.php`, {
                    token: true,
                    values: `'${this.state.lancamento}', '${this.state.tipo}', '${this.state.pessoa}', '${this.state.contaContabil}', '${this.state.centroCusto}', '${this.state.contaDesconto}', '${this.state.historico}', '${this.state.parcelaInicial}', '${this.state.parcelaFinal}', '${this.state.numBoleto}', '${parseFloat(this.state.valor.replaceAll('.', '').replaceAll(',', '.'))}', '${this.state.vencimento}', '${this.state.vencimentoOrig}', '${this.state.contaProvisao}', '${parseFloat(this.state.valor.replaceAll('.', '').replaceAll(',', '.'))}', '${this.state.usuarioLogado.codigo}', '${this.state.empresa}', '${this.state.documento}', '${this.state.tipoDocumento}', '${this.state.meioPagamento}'`,
                    meioPagamento: this.state.meioPagamentoNome,
                    valuesDarf: `'${this.state.codigoReceita}', '${this.state.contribuinte}', '${this.state.codigoIdentificadorTributo}', '${this.state.mesCompetNumRef}', '${moment(this.state.dataApuracao).format('YYYY-MM-DD')}', '${parseFloat(this.state.darfValor.replaceAll('.', '').replaceAll(',', '.'))}', '${parseFloat(this.state.darfMulta.replaceAll('.', '').replaceAll(',', '.'))}', '${parseFloat(this.state.darfJuros.replaceAll('.', '').replaceAll(',', '.'))}', '${parseFloat(this.state.darfOutros.replaceAll('.', '').replaceAll(',', '.'))}', '${parseFloat(this.state.darfPagamento.replaceAll('.', '').replaceAll(',', '.'))}'`
                }).then(
                    async res => {
                        if (res.data[0].Chave) {
                            await this.setState({ chave: res.data[0].Chave })
                            await loader.salvaLogs('contas_aberto', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].Chave);
                            if (this.state.meioPagamentoNome == 'DARF' || this.state.meioPagamentoNome == 'GPS' || this.state.meioPagamentoNome == 'GRU') {
                                await loader.salvaLogs('contas_aberto_complementar', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].Chave);
                            }
                            await this.setState({ finalizaOperacao: true })
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
                    valuesDarf: this.state.meioPagamentoNome == 'GRU' ? `'${this.state.contribuinte}'` : `'${this.state.codigoReceita}', '${this.state.contribuinte}', '${this.state.codigoIdentificadorTributo}', '${this.state.mesCompetNumRef}', '${moment(this.state.dataApuracao).format('YYYY-MM-DD')}', '${parseFloat(this.state.darfValor.replaceAll('.', '').replaceAll(',', '.'))}', '${parseFloat(this.state.darfMulta.replaceAll('.', '').replaceAll(',', '.'))}', '${parseFloat(this.state.darfJuros.replaceAll('.', '').replaceAll(',', '.'))}', '${parseFloat(this.state.darfOutros.replaceAll('.', '').replaceAll(',', '.'))}', '${parseFloat(this.state.darfPagamento.replaceAll('.', '').replaceAll(',', '.'))}'`
                }).then(
                    async res => {
                        if (res.data[0].Chave) {
                            await this.setState({ chave: res.data[0].Chave })
                            await loader.salvaLogs('contas_aberto', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].Chave);
                            if (this.state.meioPagamentoNome == 'DARF' || this.state.meioPagamentoNome == 'GPS' || this.state.meioPagamentoNome == 'GRU') {
                                await loader.salvaLogs('contas_aberto_complementar', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].Chave);
                            }

                            await this.setState({ finalizaOperacao: true })
                        } else {
                            await alert(`Erro ${JSON.stringify(res.data)}`)
                        }
                    },
                    async res => await console.log(`Erro: ${res.data}`)
                )
            }
        } else if (validForm) {
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
                    darfPagamento: parseFloat(this.state.darfPagamento.replaceAll('.', '').replaceAll(',', '.'))
                }).then(
                    async res => {
                        if (res.data === true) {
                            await loader.salvaLogs('contas_aberto', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.chave, `CONTAS EM ABERTO: ${this.state.historico}`);
                            if (this.state.meioPagamentoNome == 'DARF' || this.state.meioPagamentoNome == 'GPS' || this.state.meioPagamentoNome == 'GRU') {
                                if (this.state.dadosIniciaisDarf[0].valor == '') {
                                    await loader.salvaLogs('contas_aberto_complementar', this.state.usuarioLogado.codigo, null, "Inclusão", this.state.chave);
                                } else {
                                    await loader.salvaLogs('contas_aberto_complementar', this.state.usuarioLogado.codigo, this.state.dadosIniciaisDarf, this.state.dadosFinaisDarf, this.state.chave, `CONTAS EM ABERTO COMPLEMENTAR: ${this.state.chave}`);
                                }
                            }
                            await this.setState({ finalizaOperacao: true })
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
                    darfPagamento: parseFloat(this.state.darfPagamento.replaceAll('.', '').replaceAll(',', '.'))

                }).then(
                    async res => {
                        if (res.data === true) {
                            await loader.salvaLogs('contas_aberto', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.chave, `CONTAS EM ABERTO: ${this.state.historico}`);
                            if (this.state.meioPagamentoNome == 'DARF' || this.state.meioPagamentoNome == 'GPS' || this.state.meioPagamentoNome == 'GRU') {
                                if (this.state.dadosIniciaisDarf[0].valor == '') {
                                    await loader.salvaLogs('contas_aberto_complementar', this.state.usuarioLogado.codigo, null, "Inclusão", this.state.chave);
                                } else {
                                    await loader.salvaLogs('contas_aberto_complementar', this.state.usuarioLogado.codigo, this.state.dadosIniciaisDarf, this.state.dadosFinaisDarf, this.state.chave, `CONTAS EM ABERTO COMPLEMENTAR: ${this.state.chave}`);
                                }
                            }
                            await this.setState({ finalizaOperacao: true })
                        } else {
                            await alert(`Erro ${JSON.stringify(res.data)}`)
                        }
                    },
                    async res => await console.log(`Erro: ${res.data}`)
                )
            }

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
            centrosCustosOptions: await loader.getBaseOptions('getCentrosCustos.php', 'Descricao', 'Chave')
        })
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


    render() {

        const validations = []
        validations.push(this.state.tipo)
        validations.push(this.state.pessoa)
        validations.push(!this.state.ultimaTransacao[0] || this.state.ultimaTransacao[0].id_status == 0 || this.state.ultimaTransacao[0].id_status == 1)
        validations.push(this.state.vencimento)
        validations.push(this.state.vencimentoOrig)
        validations.push(this.state.valor && this.state.valor.replaceAll('.', '').replaceAll(',', '.') == parseFloat(this.state.valor.replaceAll('.', '').replaceAll(',', '.')))
        validations.push(this.state.meioPagamento)
        validations.push(this.state.tipo == 0 || this.state.contaDesconto)
        validations.push(this.state.meioPagamentoNome != 'GRU' && this.state.meioPagamentoNome != 'BOL' || this.state.codBarras)
        validations.push(this.state.meioPagamentoNome != 'DARF' && this.state.meioPagamentoNome != 'GPS' || this.state.codigoReceita)
        validations.push(this.state.meioPagamentoNome != 'DARF' && this.state.meioPagamentoNome != 'GPS' && this.state.meioPagamentoNome != 'GRU' || this.state.contribuinte)
        validations.push(this.state.meioPagamentoNome != 'DARF' && this.state.meioPagamentoNome != 'GPS' || this.state.codigoIdentificadorTributo)
        validations.push(this.state.meioPagamentoNome != 'DARF' && this.state.meioPagamentoNome != 'GPS' || this.state.mesCompetNumRef)
        validations.push(this.state.meioPagamentoNome != 'DARF' && this.state.meioPagamentoNome != 'GPS' || this.state.dataApuracao)
        validations.push(this.state.meioPagamentoNome != 'DARF' && this.state.meioPagamentoNome != 'GPS' || this.state.darfValor && this.state.darfValor.replaceAll('.', '').replaceAll(',', '.') == parseFloat(this.state.darfValor.replaceAll('.', '').replaceAll(',', '.')))
        validations.push(this.state.meioPagamentoNome != 'DARF' && this.state.meioPagamentoNome != 'GPS' || this.state.darfPagamento && this.state.darfPagamento.replaceAll('.', '').replaceAll(',', '.') == parseFloat(this.state.darfPagamento.replaceAll('.', '').replaceAll(',', '.')))
        validations.push(!this.state.bloqueado)

        const validForm = validations.reduce((t, a) => t && a)

        return (
            <div className='allContent'>

                {this.state.loading &&
                    <Skeleton />
                }

                {this.state.redirect &&
                    <Redirect to={'/'} />
                }

                {this.state.finalizaOperacao && this.props.location.state.to &&
                    <Redirect to={{ pathname: `/financeiro/${this.props.location.state.to}`, state: { chave: this.state.chave } }} />
                }
                {this.state.finalizaOperacao && !this.props.location.state.to &&
                    <Redirect to={`/financeiro`} />
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
                            modalAberto={this.state.modalAberto}
                            modal={this.state.modal}
                            modalLista={this.state.modalLista}
                            pesquisa={this.state.modalPesquisa}
                            acessosPermissoes={this.state.acessosPermissoes}
                            closeModal={() => { this.setState({ modalAberto: false }) }}
                        />

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
                                                                    <option value=''></option>
                                                                    <option value='0'>Receber</option>
                                                                    <option value='1'>Pagar</option>
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
                                                                    <Select className='SearchSelect' options={this.state.pessoasOptions.filter(e => this.filterSearch(e, this.state.pessoasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ pessoasOptionsTexto: e }) }} value={this.state.pessoasOptions.filter(option => option.value == this.state.pessoa)[0]} search={true} onChange={async (e) => { await this.setState({ pessoa: e.value, }); if (this.state.tipo == 1 && this.state.provisaoCheck) { await this.setState({ contaProvisao: await loader.getContaPessoa(this.state.pessoa, 'provisao') }) } else if (this.state.tipo == 0) { await this.setState({ contaDesconto: await loader.getContaPessoa(this.state.pessoa) }) } }} />
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
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Conta Contabil</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ planosContasOptionsTexto: e }) }} value={this.state.planosContasOptions.filter(option => option.value == this.state.contaContabil)[0]} search={true} onChange={(e) => { this.setState({ contaContabil: e.value, }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Provisão</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <input className='form_control' checked={this.state.provisaoCheck} onChange={async (e) => { await this.setState({ provisaoCheck: e.target.checked }); if (this.state.provisaoCheck && this.state.pessoa && this.state.tipo == 1) { await this.setState({ contaProvisao: await loader.getContaPessoa(this.state.pessoa, 'provisao') }) } else { await this.setState({ contaProvisao: '' }) } }} type="checkbox" />
                                                        </div>
                                                        {this.state.provisaoCheck &&
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Conta Provisão</label>
                                                            </div>
                                                        }
                                                        {this.state.provisaoCheck &&
                                                            <div className='col-1 errorMessage'>
                                                            </div>
                                                        }
                                                        {this.state.provisaoCheck &&
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                <Select className='SearchSelect' isDisabled={this.state.tipo == 1} options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)} value={this.state.planosContasOptions.filter(option => option.value == this.state.contaProvisao)[0]} onInputChange={e => { this.setState({ planosContasOptionsTexto: e }) }} search={true} onChange={(e) => { if (this.state.tipo != 1) { this.setState({ contaProvisao: e.value, }) } }} />
                                                            </div>
                                                        }
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Centro de Custo</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.centrosCustosOptions.filter(e => this.filterSearch(e, this.state.centrosCustosOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ centrosCustosOptionsTexto: e }) }} value={this.state.centrosCustosOptions.filter(option => option.value == this.state.centroCusto)[0]} search={true} onChange={(e) => { this.setState({ centroCusto: e.value, }) }} />
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
                                                        </div>
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
                                                        {this.state.tipo === '0' &&
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Boleto</label>
                                                            </div>
                                                        }
                                                        {this.state.tipo === '0' &&
                                                            <div className='col-1 errorMessage'>
                                                            </div>
                                                        }
                                                        {this.state.tipo === '0' &&
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                <Field className="form-control" type="text" value={this.state.numBoleto} onChange={async e => { this.setState({ numBoleto: e.currentTarget.value }) }} />
                                                            </div>
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
                                                                <Field className="form-control text-right" type="text" value={this.state.valor} onClick={(e) => e.target.select()} onChange={async e => { this.setState({ valor: e.currentTarget.value }) }} onBlur={async e => { this.setState({ valor: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR').format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
                                                            }
                                                            {this.state.saldo != this.state.valorInicial &&
                                                                <Field className="form-control text-right" disabled type="text" value={this.state.valor} />
                                                            }
                                                        </div>

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
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Conta Baixa</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.contaDesconto &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ planosContasOptionsTexto: e }) }} value={this.state.planosContasOptions.filter(option => option.value == this.state.contaDesconto)[0]} search={true} onChange={(e) => { this.setState({ contaDesconto: e.value, }) }} />
                                                        </div>

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
                                                                            <Field className="form-control text-right" type="text" value={this.state.darfValor} onChange={async e => { this.setState({ darfValor: e.currentTarget.value }) }} onBlur={async e => { this.setState({ darfValor: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR').format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
                                                                        </div>
                                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                            <label>Multa</label>
                                                                        </div>
                                                                        <div className='col-1 errorMessage'>
                                                                        </div>
                                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                            <Field className="form-control text-right" type="text" value={this.state.darfMulta} onChange={async e => { this.setState({ darfMulta: e.currentTarget.value }) }} onBlur={async e => { this.setState({ darfValor: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR').format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
                                                                        </div>
                                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                            <label>Juros</label>
                                                                        </div>
                                                                        <div className='col-1 errorMessage'>
                                                                        </div>
                                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                            <Field className="form-control text-right" type="text" value={this.state.darfJuros} onChange={async e => { this.setState({ darfJuros: e.currentTarget.value }) }} onBlur={async e => { this.setState({ darfValor: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR').format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
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
                                                                            <Field className="form-control text-right" type="text" value={this.state.darfPagamento} onChange={async e => { this.setState({ darfPagamento: e.currentTarget.value }) }} onBlur={async e => { this.setState({ darfPagamento: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR').format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
                                                                        </div>
                                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                            <label>Outros Valores</label>
                                                                        </div>
                                                                        <div className='col-1 errorMessage'>
                                                                        </div>
                                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                            <Field className="form-control text-right" type="text" value={this.state.darfOutros} onChange={async e => { this.setState({ darfOutros: e.currentTarget.value }) }} onBlur={async e => { this.setState({ darfValor: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR').format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
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
                                                <div className="col-2"></div>
                                                <div className="col-8" style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <button disabled={!validForm} type="submit" style={validForm ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} >Salvar</button>
                                                </div>
                                                <div className="col-2"></div>
                                            </div>

                                        </Form>
                                    </Formik>
                                </div>
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

