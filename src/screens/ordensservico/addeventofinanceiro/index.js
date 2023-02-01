import React, { Component } from 'react'
import './styles.css'
import { Formik, Field, Form } from 'formik'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import loader from '../../../classes/loader'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { apiEmployee } from '../../../services/apiamrg'
import moment from 'moment'
import Skeleton from '../../../components/skeleton'
import ModalListas from '../../../components/modalListas'
import Select from 'react-select';
import Modal from '@material-ui/core/Modal';

const estadoInicial = {
    evento: '',
    os: '',

    chave: '',
    moeda: 6,
    valor: '',
    vlrc: '',
    repasse: false,
    emissao: '',
    vencimento: '',
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
    complemento: '',
    historico: '',
    historicoPadrao: '',

    contabiliza: false,

    moedas: [],

    planosContas: [],
    planosContasOptions: [],
    planosContasOptionsTexto: '',
    historicos: [],
    historicosOptions: [],
    historicosOptionsTexto: '',
    centrosCustos: [],
    centrosCustosOptions: [],
    centrosCustosOptionsTexto: '',
    tiposDocumentos: [],
    tiposDocumentosOptions: [],
    tiposDocumentosOptionsTexto: '',
    meiosPagamentos: [],
    meiosPagamentosOptions: [],
    meiosPagamentosOptionsTexto: '',

    tipo: '',
    contaContabil: '',
    contaDesconto: '',
    contaCredito: '',
    provisaoCheck: false,
    contaProvisao: '',
    centroCusto: '',
    historico: '',
    tipoDocumento: '',
    parcelaInicial: 1,
    parcelaFinal: 1,
    numBoleto: '',
    codBarras: '',
    meioPagamento: '',
    meioPagamentoNome: '',
    codigoReceita: '',
    contribuinte: '',
    codigoIdentificadorTributo: '',
    mesCompetNumRef: '',
    dataApuracao: '',
    darfValor: '',
    darfMulta: '',
    darfJuros: '',
    darfPagamento: '',
    darfOutros: '',

    chavePr: 0,

    acessos: [],
    permissoes: [],
    acessosPermissoes: [],

    bloqueado: false,
    bloqueadoContabiliza: false,
    loading: true,
    modalPesquisa: ''

}

class AddEventoFinanceiro extends Component {


    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        window.scrollTo(0, 0)
        var id = await this.props.match.params.id
        if (this.state.usuarioLogado.empresa != 0) {
            await this.setState({ empresa: this.state.usuarioLogado.empresa })
        }
        await this.setState({ chave: id })
        if (parseInt(id) != 0) {
            await this.loadAll()
            await this.setState({
                tipo: this.state.evento.tipo_sub == 0 ? 1 : 0,
                moeda: this.state.evento.Moeda,
                valor: new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.state.evento.valor),
                vlrc: new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.state.evento.valor1),
                repasse: this.state.evento.repasse == 1 ? true : false,
                emissao: moment(this.state.evento.emissao).format('YYYY-MM-DD'),
                vencimento: moment(this.state.evento.vencimento).format('YYYY-MM-DD'),
                desconto: new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.state.evento.desconto_valor),
                descontoComplemento: this.state.evento.desconto_cpl,
                descontoConta: this.state.evento.desconto_conta,
                retencaoInss: new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.state.evento.retencao_inss_valor),
                retencaoInssComplemento: this.state.evento.retencao_inss_cpl,
                retencaoInssConta: this.state.evento.retencao_inss_conta,
                retencaoIr: new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.state.evento.retencao_ir_valor),
                retencaoIrComplemento: this.state.evento.retencao_ir_cpl,
                retencaoIrConta: this.state.evento.retencao_ir_conta,
                retencaoIss: new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.state.evento.retencao_iss_valor),
                retencaoIssComplemento: this.state.evento.retencao_iss_cpl,
                retencaoIssConta: this.state.evento.retencao_iss_conta,
                retencaoPis: new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.state.evento.retencao_pis_valor),
                retencaoPisComplemento: this.state.evento.retencao_pis_cpl,
                retencaoPisConta: this.state.evento.retencao_pis_conta,
                retencaoCofins: new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.state.evento.retencao_cofins_valor),
                retencaoCofinsComplemento: this.state.evento.retencao_cofins_cpl,
                retencaoCofinsConta: this.state.evento.retencao_cofins_conta,
                retencaoCsll: new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.state.evento.retencao_csll_valor),
                retencaoCsllComplemento: this.state.evento.retencao_csll_cpl,
                retencaoCsllConta: this.state.evento.retencao_csll_conta,
                complemento: this.state.evento.complemento,
                contaTaxa: this.state.evento.contaTaxa,
                contaCliente: this.state.evento.contaCliente,
                contaFornecedor: this.state.evento.contaFornecedor,
                contaFornecedorCusteio: this.state.evento.contaFornecedorCusteio,

                navio: this.state.evento.navioNome,
                fornecedorNome: this.state.evento.fornecedorNome,

            })

            this.setState({
                historico: `VLR ${this.state.fornecedorNome} ST ${this.state.evento.centroCusto} NAVIO ${this.state.navio}`
            })

            if (!this.state.descontoConta || this.state.descontoConta == '0') {
                await this.setState({
                    descontoConta: this.state.parametros[0].conta_desconto
                })
            }

            await this.setState({
                retencaoInssCheck: this.state.evento.retencao_inss_conta && this.state.evento.retencao_inss_conta != '0',
                retencaoIrCheck: this.state.evento.retencao_ir_conta && this.state.evento.retencao_ir_conta != '0',
                retencaoIssCheck: this.state.evento.retencao_iss_conta && this.state.evento.retencao_iss_conta != '0',
                retencaoPisCheck: this.state.evento.retencao_pis_conta && this.state.evento.retencao_pis_conta != '0',
                retencaoCofinsCheck: this.state.evento.retencao_cofins_conta && this.state.evento.retencao_cofins_conta != '0',
                retencaoCsllCheck: this.state.evento.retencao_csll_conta && this.state.evento.retencao_csll_conta != '0',
            })

            await this.setState({
                dadosIniciais: [
                    { titulo: 'Moeda', valor: this.state.moeda },
                    { titulo: 'valor', valor: this.state.valor },
                    { titulo: 'valor1', valor: this.state.vlrc },
                    { titulo: 'repasse', valor: this.state.repasse },
                    { titulo: 'emissao', valor: this.state.emissao },
                    { titulo: 'vencimento', valor: this.state.vencimento },
                    { titulo: 'desconto_valor', valor: this.state.desconto },
                    { titulo: 'desconto_cpl', valor: this.state.descontoComplemento },
                    { titulo: 'desconto_conta', valor: this.state.descontoConta },
                    { titulo: 'retencao_inss_valor', valor: this.state.retencaoInss },
                    { titulo: 'retencao_inss_cpl', valor: this.state.retencaoInssComplemento },
                    { titulo: 'retencao_inss_conta', valor: this.state.retencaoInssConta },
                    { titulo: 'retencao_ir_valor', valor: this.state.retencaoIr },
                    { titulo: 'retencao_ir_cpl', valor: this.state.retencaoIrComplemento },
                    { titulo: 'retencao_ir_conta', valor: this.state.retencaoIrConta },
                    { titulo: 'retencao_iss_valor', valor: this.state.retencaoIss },
                    { titulo: 'retencao_iss_cpl', valor: this.state.retencaoIssComplemento },
                    { titulo: 'retencao_iss_conta', valor: this.state.retencaoIssConta },
                    { titulo: 'retencao_pis_valor', valor: this.state.retencaoPis },
                    { titulo: 'retencao_pis_cpl', valor: this.state.retencaoPisComplemento },
                    { titulo: 'retencao_pis_conta', valor: this.state.retencaoPisConta },
                    { titulo: 'retencao_cofins_valor', valor: this.state.retencaoCofins },
                    { titulo: 'retencao_cofins_cpl', valor: this.state.retencaoCofinsComplemento },
                    { titulo: 'retencao_cofins_conta', valor: this.state.retencaoCofinsConta },
                    { titulo: 'retencao_csll_valor', valor: this.state.retencaoCsll },
                    { titulo: 'retencao_csll_cpl', valor: this.state.retencaoCsllComplemento },
                    { titulo: 'retencao_csll_conta', valor: this.state.retencaoCsllConta },
                    { titulo: 'complemento', valor: this.state.complemento },
                    { titulo: 'contaContabil', valor: this.state.contaContabil }
                ],
                loading: false
            })
        } else {
            this.setState({ loading: false })
        }

        this.state.acessosPermissoes.map((e) => {
            if ((e.acessoAcao == "SERVICOS_ITENS" && e.permissaoInsere == 0 && this.state.chave == 0) || (e.acessoAcao == "SERVICOS_ITENS" && e.permissaoEdita == 0 && this.state.chave != 0)) {
                this.setState({ bloqueado: true })
            }
        })
    }

    loadAll = async () => {
        await this.setState({
            evento: await loader.getOne('getSolicitacao.php', this.state.chave),
            conta: await loader.getContaSolicitacao(this.state.chave),

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

            moedas: await loader.getBase('getMoedas.php'),

            parametros: await loader.getBody('getParametros.php', { token: true, empresa: this.state.usuarioLogado.empresa }),

            acessos: await loader.getBase('getTiposAcessos.php'),
            permissoes: await loader.getBase('getPermissoes.php')
        })

        const planosContasOptions = this.state.planosContasOptions;
        planosContasOptions.unshift({ label: "Select...", value: "" });

        await this.setState({
            planosContasOptions,
            parametroInss: this.state.parametros[0].conta_retencao_inss,
            parametroIr: this.state.parametros[0].conta_retencao_ir,
            parametroIss: this.state.parametros[0].conta_retencao_iss,
            parametroPis: this.state.parametros[0].conta_retencao_pis,
            parametroCofins: this.state.parametros[0].conta_retencao_cofins,
            parametroCsll: this.state.parametros[0].conta_retencao_csll,

            acessosPermissoes: await loader.testaAcesso(this.state.acessos, this.state.permissoes, this.state.usuarioLogado),
            loading: false
        })

        await this.getOSUma();
    }

    salvarServicoItem = async (validForm) => {
        this.setState({ bloqueado: true });

        await this.setState({
            dadosFinais: [
                { titulo: 'Moeda', valor: this.state.moeda },
                { titulo: 'valor', valor: this.state.valor },
                { titulo: 'valor1', valor: this.state.vlrc },
                { titulo: 'repasse', valor: this.state.repasse },
                { titulo: 'emissao', valor: this.state.emissao },
                { titulo: 'vencimento', valor: this.state.vencimento },
                { titulo: 'desconto_valor', valor: this.state.desconto },
                { titulo: 'desconto_cpl', valor: this.state.descontoComplemento },
                { titulo: 'desconto_conta', valor: this.state.descontoConta },
                { titulo: 'retencao_inss_valor', valor: this.state.retencaoInss },
                { titulo: 'retencao_inss_cpl', valor: this.state.retencaoInssComplemento },
                { titulo: 'retencao_inss_conta', valor: this.state.retencaoInssConta },
                { titulo: 'retencao_ir_valor', valor: this.state.retencaoIr },
                { titulo: 'retencao_ir_cpl', valor: this.state.retencaoIrComplemento },
                { titulo: 'retencao_ir_conta', valor: this.state.retencaoIrConta },
                { titulo: 'retencao_iss_valor', valor: this.state.retencaoIss },
                { titulo: 'retencao_iss_cpl', valor: this.state.retencaoIssComplemento },
                { titulo: 'retencao_iss_conta', valor: this.state.retencaoIssConta },
                { titulo: 'retencao_pis_valor', valor: this.state.retencaoPis },
                { titulo: 'retencao_pis_cpl', valor: this.state.retencaoPisComplemento },
                { titulo: 'retencao_pis_conta', valor: this.state.retencaoPisConta },
                { titulo: 'retencao_cofins_valor', valor: this.state.retencaoCofins },
                { titulo: 'retencao_cofins_cpl', valor: this.state.retencaoCofinsComplemento },
                { titulo: 'retencao_cofins_conta', valor: this.state.retencaoCofinsConta },
                { titulo: 'retencao_csll_valor', valor: this.state.retencaoCsll },
                { titulo: 'retencao_csll_cpl', valor: this.state.retencaoCsllComplemento },
                { titulo: 'retencao_csll_conta', valor: this.state.retencaoCsllConta },
                { titulo: 'complemento', valor: this.state.complemento },
                { titulo: 'contaContabil', valor: this.state.contaContabil }
            ],
            loading: true
        })

        if (parseInt(this.state.chave) === 0 && validForm) {
            return;
        } else if (validForm) {
            await apiEmployee.post(`updateServicoItemFinanceiro.php`, {
                token: true,
                chave: this.state.chave,
                Moeda: this.state.moeda,
                valor: parseFloat(this.state.valor.replaceAll('.', '').replaceAll(',', '.')),
                valor1: parseFloat(this.state.vlrc.replaceAll('.', '').replaceAll(',', '.')),
                repasse: this.state.repasse ? 1 : 0,
                emissao: moment(this.state.emissao).format('YYYY-MM-DD'),
                vencimento: moment(this.state.vencimento).format('YYYY-MM-DD'),
                desconto_valor: parseFloat(this.state.desconto.replaceAll('.', '').replaceAll(',', '.')),
                desconto_cpl: this.state.descontoComplemento,
                desconto_conta: this.state.descontoConta,
                retencao_inss_valor: parseFloat(this.state.retencaoInss.replaceAll('.', '').replaceAll(',', '.')),
                retencao_inss_cpl: this.state.retencaoInssComplemento,
                retencao_inss_conta: this.state.retencaoInssConta,
                retencao_ir_valor: parseFloat(this.state.retencaoIr.replaceAll('.', '').replaceAll(',', '.')),
                retencao_ir_cpl: this.state.retencaoIrComplemento,
                retencao_ir_conta: this.state.retencaoIrConta,
                retencao_iss_valor: parseFloat(this.state.retencaoIss.replaceAll('.', '').replaceAll(',', '.')),
                retencao_iss_cpl: this.state.retencaoIssComplemento,
                retencao_iss_conta: this.state.retencaoIssConta,
                retencao_pis_valor: parseFloat(this.state.retencaoPis.replaceAll('.', '').replaceAll(',', '.')),
                retencao_pis_cpl: this.state.retencaoPisComplemento,
                retencao_pis_conta: this.state.retencaoPisConta,
                retencao_cofins_valor: parseFloat(this.state.retencaoCofins.replaceAll('.', '').replaceAll(',', '.')),
                retencao_cofins_cpl: this.state.retencaoCofinsComplemento,
                retencao_cofins_conta: this.state.retencaoCofinsConta,
                retencao_csll_valor: parseFloat(this.state.retencaoCsll.replaceAll('.', '').replaceAll(',', '.')),
                retencao_csll_cpl: this.state.retencaoCsllComplemento,
                retencao_csll_conta: this.state.retencaoCsllConta,
                complemento: this.state.complemento,
            }).then(
                async res => {
                    if (res.data === true) {
                        await loader.salvaLogs('os_servicos_itens', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.chave);

                        await this.setState({ loading: false });
                        if (!this.state.contabiliza) {
                            await this.setState({ loading: false, bloqueado: false })
                        }
                    } else {
                        await alert(`Erro ${JSON.stringify(res)}`)
                    }
                },
                async res => await console.log(`Erro: ${res}`)
            )

        }

    }

    contabilizar = async (validForm) => {
        this.setState({
            contaDebito: this.state.tipo == 1 ? this.state.repasse ? this.state.contaCliente : "" : this.state.contaCliente,
            contaCredito: this.state.tipo == 1 ? this.state.repasse ? this.state.evento.fornecedor ? this.state.contaFornecedor : this.state.contaFornecedorCusteio : this.state.evento.fornecedor ? this.state.contaFornecedor : this.state.contaFornecedorCusteio : this.state.contaTaxa,
        });

        await this.setState({ contabiliza: true });
        await this.salvarServicoItem(validForm);
    }

    salvarConta = async (validFormContabiliza) => {

        this.setState({ bloqueadoContabiliza: true, loading: true });

        if (validFormContabiliza) {
            await apiEmployee.post(`insertContaFornecedor.php`, {
                token: true,
                values: `'${this.state.emissao}', '${this.state.tipo}', '${this.state.evento.fornecedor}', '${this.state.evento.contaContabil}', '${this.state.codBarras}', '${this.state.evento.centroCusto}', '${this.state.historico}',  '${this.state.contaDesconto}','${1}', '${1}', '${parseFloat(this.state.vlrc.replaceAll('.', '').replaceAll(',', '.'))}', '${this.state.vencimento}', '${this.state.vencimento}', '${this.state.contaProvisao}', '${parseFloat(this.state.vlrc.replaceAll('.', '').replaceAll(',', '.'))}', '${this.state.usuarioLogado.codigo}', '${this.state.empresa}', '${this.state.documento}', '${this.state.tipoDocumento}', '${this.state.meioPagamento}', '${this.state.chave}'`,
                meioPagamento: this.state.meioPagamentoNome,
                valuesDarf: `'${this.state.codigoReceita}', '${this.state.contribuinte}', '${this.state.codigoIdentificadorTributo}', '${this.state.mesCompetNumRef}', '${moment(this.state.dataApuracao).format('YYYY-MM-DD')}', '${parseFloat(this.state.darfValor.replaceAll('.', '').replaceAll(',', '.'))}', '${parseFloat(this.state.darfMulta.replaceAll('.', '').replaceAll(',', '.'))}', '${parseFloat(this.state.darfJuros.replaceAll('.', '').replaceAll(',', '.'))}', '${parseFloat(this.state.darfOutros.replaceAll('.', '').replaceAll(',', '.'))}', '${parseFloat(this.state.darfPagamento.replaceAll('.', '').replaceAll(',', '.'))}'`
            }).then(
                async res => {
                    if (res.data[0]) {
                        await this.setState({chavePr: res.data[0].Chave});
                        await loader.salvaLogs('os_contas_aberto', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].chave);

                    } else {
                        await alert(`Erro ${JSON.stringify(res.data)}`)
                    }
                },
                async res => await console.log(`Erro: ${res.data}`)
            )

            await apiEmployee.post(`contabilizaEvento.php`, {
                token: true,
                repasse: this.state.repasse,
                tipoEvento: this.state.evento.tipo_sub,
                tipo: this.state.tipo,
                values: `'${moment().format("YYYY-MM-DD")}', '${this.state.tipoDocumento}', '${this.state.evento.centroCusto}', '${this.state.historicoPadrao}', '${this.state.os.Chave_Cliente}', '${this.state.chavePr}', '${this.state.usuarioLogado.codigo}', '${this.state.usuarioLogado.codigo}', '${moment().format('YYYY-MM-DD')}', '${moment().format('YYYY-MM-DD')}'`,
                historico: `'${this.state.historico}'`,
                chave_evento: this.state.chave,
                chave_taxa: this.state.evento.taxa,
                contaDebito: this.state.contaDesconto,
            }).then(
                async res => {
                    console.log(res);
                    console.log(res.data);
                    console.log(res.data[0]);
                },
                async res => await console.log(`Erro: ${res.data}`)
            )

        }

        await this.setState({ loading: false, bloqueado: false })
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

    erroApi = async (res) => {
        alert(res)
        await this.setState({ redirect: true })
    }

    alteraModal = async (valor) => {
        this.setState({ modal: valor });
    }

    alteraPlanoConta = async (valor, indicador) => {
        if (indicador == 'A') {
            if (this.state.formAtivo == 'desc') {
                await this.setState({ descontoConta: valor });
            } else if (this.state.formAtivo == 'ret1') {
                await this.setState({ retencao1Conta: valor });
            } else if (this.state.formAtivo == 'ret2') {
                await this.setState({ retencao2Conta: valor })
            }
        }
        await this.setState({
            modalAberto: false,
            planosContas: await loader.getBase('getPlanosContasAnaliticas.php'),
            planosContas: await loader.getBaseOptions('getPlanosContasAnaliticas.php', 'Descricao', 'Chave'),
            planosContasOptions: await loader.getPlanosContasAnaliticasOptions(),
        });
    }

    getOSUma = async () => {
        await apiEmployee.post(`getOSUma.php`, {
            token: true,
            chave_os: this.state.evento.chave_os
        }).then(
            async res => {
                await this.setState({ os: res.data[0] })
            },
            async err => { this.erroApi(err) }
        )
    }

    trocarTipoContabilizar = async (value) => {
        console.log(this.state.evento)
        await this.setState({ tipo: value, pessoa: '', contaDesconto: '' });

        if (this.state.evento.tipo_sub == 2) {
            if (this.state.tipo == '0') {
                this.setState({ contaDesconto: await loader.getContaTaxa(this.state.evento.taxa) })
                console.log(this.state.contaDesconto);
            } else if (this.state.tipo == 1) {
                this.setState({ contaDesconto: await loader.getContaPessoa(this.state.os.Chave_Cliente) })
            }
        } else {
            if (this.state.repasse) {
                if (this.state.tipo == '0') {
                    this.setState({
                        contaDesconto: await loader.getContaPessoa(!this.state.evento.fornecedor || this.state.evento.fornecedor === "0" ? this.state.evento.Fornecedor_Custeio : this.state.evento.fornecedor, "provisao"),
                        contaCredito: await loader.getContaPessoa(this.state.os.Chave_Cliente)
                    })
                } else if (this.state.tipo == 1) {
                    this.setState({
                        contaDesconto: await loader.getContaPessoa(this.state.os.Chave_Cliente),
                        contaCredito: await loader.getContaPessoa(!this.state.evento.fornecedor || this.state.evento.fornecedor === "0" ? this.state.evento.Fornecedor_Custeio : this.state.evento.fornecedor, "provisao"),
                    })
                }
            } else {
                if (this.state.tipo == '0') {
                    this.setState({
                        contaDesconto: await loader.getContaPessoa(!this.state.evento.fornecedor || this.state.evento.fornecedor === "0" ? this.state.evento.Fornecedor_Custeio : this.state.evento.fornecedor, "provisao")
                    });
                } else if (this.state.tipo == '1') {
                    this.setState({
                        contaCredito: await loader.getContaPessoa(!this.state.evento.fornecedor || this.state.evento.fornecedor === "0" ? this.state.evento.Fornecedor_Custeio : this.state.evento.fornecedor, "provisao")
                    });
                }
            }
        }
    }

    filterSearch = (e, state) => {
        if (e == "") {
            return true
        }

        const text = state.toUpperCase();
        return (e.label.toUpperCase().includes(text))

    }

    testaValores = () => {
        return parseFloat(this.state.desconto) + parseFloat(this.state.retencaoPis) + parseFloat(this.state.retencaoCofins) + parseFloat(this.state.retencaoCsll) + parseFloat(this.state.retencaoInss) + parseFloat(this.state.retencaoIr) + parseFloat(this.state.retencaoIss) > parseFloat(this.state.valor);
    }


    render() {
        const validations = []
        validations.push(this.state.valor && this.state.valor.replaceAll('.', '').replaceAll(',', '.') == parseFloat(this.state.valor.replaceAll('.', '').replaceAll(',', '.')))
        validations.push((!this.state.repasse && !this.state.vlrc) || this.state.vlrc.replaceAll('.', '').replaceAll(',', '.') == parseFloat(this.state.vlrc.replaceAll('.', '').replaceAll(',', '.')) && (!this.state.repasse || this.state.vlrc == this.state.valor))
        validations.push(!this.state.desconto || this.state.desconto.replaceAll('.', '').replaceAll(',', '.') == parseFloat(this.state.desconto.replaceAll('.', '').replaceAll(',', '.')))
        validations.push(!this.state.retencao1 || this.state.retencao1.replaceAll('.', '').replaceAll(',', '.') == parseFloat(this.state.retencao1.replaceAll('.', '').replaceAll(',', '.')))
        validations.push(!this.state.retencao2 || this.state.retencao2.replaceAll('.', '').replaceAll(',', '.') == parseFloat(this.state.retencao2.replaceAll('.', '').replaceAll(',', '.')))
        validations.push(this.state.moeda)
        validations.push(!this.state.bloqueado)

        const validForm = validations.reduce((t, a) => t && a)

        const validationsContabiliza = []
        validationsContabiliza.push(this.state.valor && this.state.valor.replaceAll('.', '').replaceAll(',', '.') == parseFloat(this.state.valor.replaceAll('.', '').replaceAll(',', '.')))
        validationsContabiliza.push((!this.state.repasse && !this.state.vlrc) || this.state.vlrc.replaceAll('.', '').replaceAll(',', '.') == parseFloat(this.state.vlrc.replaceAll('.', '').replaceAll(',', '.')) && (!this.state.repasse || this.state.vlrc == this.state.valor))
        validationsContabiliza.push(!this.state.desconto || this.state.desconto.replaceAll('.', '').replaceAll(',', '.') == parseFloat(this.state.desconto.replaceAll('.', '').replaceAll(',', '.')))
        validationsContabiliza.push(!this.state.retencao1 || this.state.retencao1.replaceAll('.', '').replaceAll(',', '.') == parseFloat(this.state.retencao1.replaceAll('.', '').replaceAll(',', '.')))
        validationsContabiliza.push(!this.state.retencao2 || this.state.retencao2.replaceAll('.', '').replaceAll(',', '.') == parseFloat(this.state.retencao2.replaceAll('.', '').replaceAll(',', '.')))
        validationsContabiliza.push(this.state.vencimento)
        validationsContabiliza.push(this.state.meioPagamento)
        validationsContabiliza.push(this.state.meioPagamentoNome != 'DARF' && this.state.meioPagamentoNome != 'GPS' || this.state.codigoReceita)
        validationsContabiliza.push(this.state.meioPagamentoNome != 'DARF' && this.state.meioPagamentoNome != 'GPS' || this.state.contribuinte)
        validationsContabiliza.push(this.state.meioPagamentoNome != 'DARF' && this.state.meioPagamentoNome != 'GPS' || this.state.codigoIdentificadorTributo)
        validationsContabiliza.push(this.state.meioPagamentoNome != 'DARF' && this.state.meioPagamentoNome != 'GPS' || this.state.mesCompetNumRef)
        validationsContabiliza.push(this.state.meioPagamentoNome != 'DARF' && this.state.meioPagamentoNome != 'GPS' || this.state.dataApuracao)
        validationsContabiliza.push(this.state.meioPagamentoNome != 'DARF' && this.state.meioPagamentoNome != 'GPS' || this.state.darfValor && this.state.darfValor.replaceAll('.', '').replaceAll(',', '.') == parseFloat(this.state.darfValor.replaceAll('.', '').replaceAll(',', '.')))
        validationsContabiliza.push(this.state.meioPagamentoNome != 'DARF' && this.state.meioPagamentoNome != 'GPS' || this.state.darfPagamento && this.state.darfPagamento.replaceAll('.', '').replaceAll(',', '.') == parseFloat(this.state.darfPagamento.replaceAll('.', '').replaceAll(',', '.')))
        validationsContabiliza.push(!this.state.bloqueadoContabiliza)

        const validFormContabiliza = validationsContabiliza.reduce((t, a) => t && a)

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
                            {this.props.location.state.os &&
                                <Header voltarAddEvento evento={this.state.evento} os={this.props.location.state.os} titulo="Eventos" />
                            }
                            {!this.props.location.state.os &&
                                <Header voltarAddEvento evento={this.state.evento} titulo="Eventos" />
                            }
                            <div className="col-2"></div>
                            <br />
                            <br />
                        </section>

                        <ModalListas alteraModal={this.alteraModal} alteraSubgrupo={this.alteraSubgrupo} alteraPlanoConta={this.alteraPlanoConta} acessosPermissoes={this.state.acessosPermissoes} modalAberto={this.state.modalAberto} modal={this.state.modal} modalLista={this.state.modalLista} closeModal={() => { this.setState({ modalAberto: false }) }} pesquisa={this.state.modalPesquisa} />

                        <Modal
                            aria-labelledby="transition-modal-title"
                            aria-describedby="transition-modal-description"
                            style={{ display: 'flex', justifyContent: 'center', paddingTop: '5%', paddingBottom: '5%', overflow: 'scroll' }}
                            open={this.state.contabiliza}
                            onClose={async () => await this.setState({ contabiliza: false, bloqueado: false, bloqueadoContabiliza: false })}
                        >
                            <div className='modalContainer'>
                                <div className='modalCriar'>
                                    <div className='containersairlistprodmodal'>
                                        <div className='botaoSairModal' onClick={async () => await this.setState({ contabiliza: false, bloqueado: false, bloqueadoContabiliza: false })}>
                                            <span>X</span>
                                        </div>
                                    </div>
                                    <div className='modalContent'>
                                        <div className='tituloModal'>
                                            <span>Informações para contabilização:</span>
                                        </div>


                                        <div className='modalForm'>
                                            <Formik
                                                initialValues={{
                                                    name: '',
                                                }}
                                                onSubmit={async values => {
                                                    await new Promise(r => setTimeout(r, 1000))
                                                    this.salvarConta(validFormContabiliza)
                                                }}
                                            >
                                                <Form className="contact-form" >

                                                    <div className="row">

                                                        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 ">

                                                            <div className="row addservicos">
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Documento</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                    {!this.state.documento &&
                                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                    }
                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Field className="form-control" type="text" value={this.state.documento} onChange={async e => { this.setState({ documento: e.currentTarget.value }) }} />
                                                                </div>
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Tipo de Documento</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                    {!this.state.tipoDocumento &&
                                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                    }
                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Select className='SearchSelect' options={this.state.tiposDocumentosOptions.filter(e => this.filterSearch(e, this.state.tiposDocumentosOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ tiposDocumentosOptionsTexto: e }) }} value={this.state.tiposDocumentosOptions.filter(option => option.label == this.state.tipoDocumento)[0]} search={true} onChange={(e) => { this.setState({ tipoDocumento: e.value }) }} />
                                                                </div>
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Histórico Padrão</label>
                                                                </div>
                                                                <div className='col-1'></div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Select className='SearchSelect' options={this.state.historicosOptions.filter(e => this.filterSearch(e, this.state.historicosOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ historicosOptionsTexto: e }) }} value={this.state.historicosOptions.filter(option => option.chave == this.state.historicoPadrao)[0]} search={true} onChange={(e) => { this.setState({ historico: e.label, historicoPadrao: e.chave }) }} />
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
                                                                    <label>Provisão</label>
                                                                </div>
                                                                <div className='col-1'></div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <input className='form_control' checked={this.state.provisaoCheck} onChange={async (e) => { await this.setState({ provisaoCheck: e.target.checked }); if (this.state.provisaoCheck) { await this.setState({ contaProvisao: await loader.getContaPessoa(this.state.evento.fornecedor, 'provisao') }) } else { await this.setState({ contaProvisao: '' }) } }} type="checkbox" />
                                                                </div>
                                                                {this.state.provisaoCheck &&
                                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                        <label>Conta Provisão</label>
                                                                    </div>
                                                                }
                                                                {this.state.provisaoCheck &&
                                                                    <div className='col-1 errorMessage'>
                                                                        {!this.state.contaProvisao &&
                                                                            <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                        }
                                                                    </div>
                                                                }
                                                                {this.state.provisaoCheck &&
                                                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                        <Select className='SearchSelect' options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ planosContasOptionsTexto: e }) }} value={this.state.planosContasOptions.filter(option => option.value == this.state.contaProvisao)[0]} search={true} onChange={(e) => { this.setState({ contaProvisao: e.value, }) }} />
                                                                    </div>
                                                                }
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Cód. Barras</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Field className="form-control" type="text" value={this.state.codBarras} onChange={async e => { this.setState({ codBarras: e.currentTarget.value }) }} />
                                                                </div>
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Conta Débito</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                    {!this.state.contaDesconto &&
                                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                    }
                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Select className='SearchSelect'
                                                                        isDisabled={!(this.state.evento.tipo_sub != 2 && !this.state.repasse && this.state.tipo == 1)}
                                                                        options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)}
                                                                        onInputChange={e => { this.setState({ planosContasOptionsTexto: e }) }}
                                                                        value={this.state.planosContasOptions.filter(option => option.value == this.state.contaDesconto)[0]}
                                                                        search={true}
                                                                        onChange={(e) => { if (this.state.tipo != 0 || !this.state.repasse) { this.setState({ contaDesconto: e.value, }) } }}
                                                                    />
                                                                </div> <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Conta Crédito</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                    {!this.state.contaCredito &&
                                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                    }
                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Select className='SearchSelect'
                                                                        isDisabled={!(this.state.evento.tipo_sub != 2 && !this.state.repasse && this.state.tipo === "0")}
                                                                        options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)}
                                                                        value={this.state.planosContasOptions.filter(option => option.value == this.state.contaCredito)[0]}
                                                                        onChange={(e) => { if (this.state.tipo != 1 || !this.state.repasse) { this.setState({ contaCredito: e.value, }) } }}
                                                                    />
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

                                                                {(this.state.meioPagamentoNome == 'DARF' || this.state.meioPagamentoNome == "GPS") &&
                                                                    <>
                                                                        <div>
                                                                            <hr />
                                                                        </div>
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
                                                                            {!this.state.darfMulta &&
                                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                            }
                                                                        </div>
                                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                            <Field className="form-control text-right" type="text" value={this.state.darfMulta} onChange={async e => { this.setState({ darfMulta: e.currentTarget.value }) }} onBlur={async e => { this.setState({ darfMulta: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR').format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
                                                                        </div>
                                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                            <label>Juros</label>
                                                                        </div>
                                                                        <div className='col-1 errorMessage'>
                                                                            {!this.state.darfJuros &&
                                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                            }
                                                                        </div>
                                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                            <Field className="form-control text-right" type="text" value={this.state.darfJuros} onChange={async e => { this.setState({ darfJuros: e.currentTarget.value }) }} onBlur={async e => { this.setState({ darfJuros: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR').format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
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
                                                                            {!this.state.darfOutros &&
                                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                            }
                                                                        </div>
                                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                            <Field className="form-control text-right" type="text" value={this.state.darfOutros} onChange={async e => { this.setState({ darfOutros: e.currentTarget.value }) }} onBlur={async e => { this.setState({ darfOutros: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR').format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
                                                                        </div>
                                                                    </>
                                                                }

                                                            </div>
                                                        </div>
                                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                                    </div>

                                                    <div className="row">
                                                        <div className="col-2"></div>
                                                        <div className="col-8" style={{ display: 'flex', justifyContent: 'center' }}>
                                                            <button disabled={!validFormContabiliza} type="submit" style={validFormContabiliza ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} >Enviar</button>
                                                        </div>
                                                        <div className="col-2"></div>
                                                    </div>

                                                </Form>
                                            </Formik>

                                        </div>
                                    </div>





                                </div >

                            </div >
                        </Modal >

                        <div className="page-breadcrumb2">
                            <h2>{parseInt(this.state.chave) === 0 ? 'Adicionar nova Solicitação' : 'Editar Solicitação'}</h2>
                        </div>


                        <div className="contact-section">

                            <div className="row">
                                <div className="col-lg-12">
                                    <Formik
                                        initialValues={{
                                            name: '',
                                        }}
                                        onSubmit={async values => {
                                            await new Promise(r => setTimeout(r, 1000))
                                            this.salvarServicoItem(validForm)
                                        }}
                                    >
                                        <Form className="contact-form" >

                                            <div className="row">
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2"></div>

                                                <div className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12 ">

                                                    <div className="row addservicos">
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel">
                                                            <label>Chave</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-2 col-lg-2 col-md-3 col-sm-10 col-10">
                                                            <Field className="form-control" style={{ backgroundColor: '#dddddd' }} type="text" disabled value={this.state.chave} />
                                                        </div>
                                                        <div className="col-xl-4 col-lg-4 col-md-3 col-sm-1 col-1">
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Emissão</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="date" value={this.state.emissao} onChange={async e => { this.setState({ emissao: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>


                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Vencimento</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="date" value={this.state.vencimento} onChange={async e => { this.setState({ vencimento: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-12 labelForm text-center">
                                                            <label>Retenções</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
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
                                                                <label className='smallCheckbox'>PIS</label>
                                                                <input className='smallCheckbox' type='checkbox' checked={this.state.retencaoPisCheck} onChange={async (e) => { await this.mudaRetencao("PIS") }} />
                                                            </div>
                                                            <div>
                                                                <label className='smallCheckbox'>COFINS</label>
                                                                <input className='smallCheckbox' type='checkbox' checked={this.state.retencaoCofinsCheck} onChange={async (e) => { await this.mudaRetencao("COFINS") }} />
                                                            </div>
                                                            <div>
                                                                <label className='smallCheckbox'>CSLL</label>
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
                                                            <Field className="form-control nextToSelect text-right" type="text" onClick={(e) => e.target.select()} value={this.state.desconto} onChange={async e => { this.setState({ desconto: e.currentTarget.value }) }} onBlur={async e => { this.setState({ desconto: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR').format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
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
                                                                    <Field className="form-control nextToSelect text-right" type="text" onClick={(e) => e.target.select()} value={this.state.retencaoInss} onChange={async e => { this.setState({ retencaoInss: e.currentTarget.value }) }} onBlur={async e => { this.setState({ retencaoInss: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR').format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
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
                                                                    <Field className="form-control nextToSelect text-right" type="text" onClick={(e) => e.target.select()} value={this.state.retencaoIr} onChange={async e => { this.setState({ retencaoIr: e.currentTarget.value }) }} onBlur={async e => { this.setState({ retencaoIr: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR').format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
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
                                                                    <Field className="form-control nextToSelect text-right" type="text" onClick={(e) => e.target.select()} value={this.state.retencaoIss} onChange={async e => { this.setState({ retencaoIss: e.currentTarget.value }) }} onBlur={async e => { this.setState({ retencaoIss: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR').format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
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
                                                                    <Field className="form-control nextToSelect text-right" type="text" onClick={(e) => e.target.select()} value={this.state.retencaoPis} onChange={async e => { this.setState({ retencaoPis: e.currentTarget.value }) }} onBlur={async e => { this.setState({ retencaoPis: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR').format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
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
                                                                    <Field className="form-control nextToSelect text-right" type="text" onClick={(e) => e.target.select()} value={this.state.retencaoCofins} onChange={async e => { this.setState({ retencaoCofins: e.currentTarget.value }) }} onBlur={async e => { this.setState({ retencaoCofins: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR').format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
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
                                                                    <label>Retenção CSLL</label>
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
                                                                    <Field className="form-control nextToSelect text-right" type="text" onClick={(e) => e.target.select()} value={this.state.retencaoCsll} onChange={async e => { this.setState({ retencaoCsll: e.currentTarget.value }) }} onBlur={async e => { this.setState({ retencaoCsll: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR').format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
                                                                </div>
                                                                <div className='col-4'>
                                                                    <Field className="form-control nextToSelect" type="text" value={this.state.retencaoCsllComplemento} onChange={async e => { this.setState({ retencaoCsllComplemento: e.currentTarget.value }) }} />

                                                                </div>
                                                            </>
                                                        }
                                                    </div>
                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                                </div>

                                                <div className="row">
                                                    {!this.state.conta && this.state.evento.centroCusto != '0' && (this.state.tipo == 1 && (this.state.repasse && this.state.contaCliente && (this.state.contaFornecedor || this.state.contaFornecedorCusteio)) || (!this.state.repasse && (this.state.contaFornecedor || this.state.contaFornecedorCusteio)) || this.state.tipo == 0 && (this.state.contaCliente && this.state.contaTaxa)) && !this.testaValores() &&
                                                        <>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-12" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                                <button disabled={!validForm} type="submit" style={validForm ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} >Salvar</button>
                                                            </div>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-12" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                                <button disabled={!validForm} onClick={() => { this.contabilizar(validForm) }} style={validForm ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} >Contabilizar</button>
                                                            </div>
                                                        </>
                                                    }
                                                    {!(!this.state.conta && this.state.evento.centroCusto != '0' && (this.state.tipo == 1 && (this.state.repasse && this.state.contaCliente && (this.state.contaFornecedor || this.state.contaFornecedorCusteio)) || (!this.state.repasse && (this.state.contaFornecedor || this.state.contaFornecedorCusteio)) || this.state.tipo == 0 && (this.state.contaCliente && this.state.contaTaxa)) && this.testaValores()) &&
                                                        <>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-12" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                                <button disabled={!validForm} type="submit" style={validForm ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} >Salvar</button>
                                                            </div>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-12" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                                <button
                                                                    title={this.state.conta ? "Esta solicitação já foi contabilizada" : this.state.evento.centroCusto == '0' ? "Nenhum centro de custo vinculado" : this.testaValores() ? "Valores de retenções ultrapassam o valor do evento" : "Faltam contas (débito e/ou crédito)"}
                                                                    disabled
                                                                    style={{ backgroundColor: '#eee', opacity: 0.3, width: 300 }}
                                                                >Contabilizar</button>
                                                            </div>
                                                        </>
                                                    }
                                                </div>
                                            </div>

                                        </Form>
                                    </Formik>
                                </div>
                            </div>

                        </div>
                        <Rodape />
                    </>
                }
            </div>
        )

    }
}

const mapStateToProps = ({ user, servidor }) => {
    return {
        user: user,
        online: servidor.online
    }
}

export default connect(mapStateToProps, null)(AddEventoFinanceiro)

