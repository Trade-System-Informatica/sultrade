import React, { Component } from 'react'
import './styles.css'
import { Formik, Field, Form } from 'formik'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import util from '../../../classes/util'
import loader from '../../../classes/loader'
import { NOME_EMPRESA, CAMINHO_DOCUMENTOS } from '../../../config'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faTrashAlt, faPaperclip, faPen, faPlus, faDollarSign, faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { apiEmployee } from '../../../services/apiamrg'
import Skeleton from '../../../components/skeleton'
import 'moment-timezone';
import moment from 'moment';
import { confirmAlert } from 'react-confirm-alert'
import ModalListas from '../../../components/modalListas'
import Select from 'react-select';
import Modal from '@material-ui/core/Modal';
import ModalLogs from '../../../components/modalLogs'
import Alert from '../../../components/alert'

const estadoInicial = {
    evento: '',
    os: '',

    chave: '',
    chave_os: '',
    navio_os: '',
    viagem_os: '',
    data: moment().format('YYYY-MM-DD'),
    fornecedor: '',
    fornecedorInicial: '',
    fornecedorCusteio: '',
    fornecedorEmail: '',
    taxa: '',
    repasse: false,
    moeda: 6,
    valor: '0,00',
    vlrc: '0,00',
    descricao: '',
    tipo: 0,
    ordem: '',
    remarks: '',
    contatos: [],

    campos: [],
    eventoComplementar: [],

    camposCopiar: [],

    eventosIrmaos: [],

    moedas: [],

    logs: [],
    modalLog: false,

    corpo: '',
    assunto: '',
    anexos: [],
    anexosNomes: [],
    formats: [],
    exts: [],

    dadosIniciais: '',
    dadosFinais: '',

    fornecedorEmail: '',
    emails: [],

    recarregaPagina: "",
    redirectOS: false,

    pessoas: [],
    pessoasOptions: [],
    pessoasOptionsTexto: '',

    taxas: [],
    taxasOptions: [],
    taxasOptionsTexto: '',

    todasOs: [],
    osOptions: [],
    osOptionsTexto: '',

    descricoesPadrao: [],
    descricoesPadraoOptions: [],
    descricoesPadraoOptionsTexto: '',

    tiposSubOptions: [
        { value: 0, label: 'Pagar' },
        { value: 1, label: 'Receber' },
        { value: 2, label: 'Recebimento de Remessa' },
        { value: 3, label: 'Desconto' }
    ],

    acessos: [],
    permissoes: [],
    acessosPermissoes: [],

    bloqueado: false,
    emailBloqueado: false,
    ordemBloqueado: true,

    modal: '',
    modalAberto: false,
    modalLista: [],
    modalPesquisa: '',
    fornecedorCusteioAtivo: false,

    financeiro: false,
    irParaFinanceiro: false,
    email: false,
    emails: [],
    hasEmail: false,
    failures: [],
    successes: [],

    documentos: [],
    documentoModal: false,

    tiposDocumento: [],
    tiposDocumentoOptions: [],
    tiposDocumentoOptionsTexto: '',

    documento: [],
    documentoDescricao: '',
    documentoNome: '',
    documentoTipo: '',
    documentoChave: '',
    documentoCaminho: '',
    documentoTrocar: true,
    documentoEditar: false,
    loading: true,

    emailEnviado: [],
    dataEmail: '',
    emailsIniciais: [],
    emailsFinais: [],

    alert: { type: "", msg: "" },

    anexosForn: [],

    optionsTexto: '',
    gruposOptions: [],
    gruposIniciais: [],
    gruposEscolhidos: [],

    anexosValidadosOptions: [
        { label: "Aguardando...", value: 0 },
        { label: "Invalidado", value: 1 },
        { label: "Aprovado", value: 2 },
        { label: "Validado", value: 3, nonSelectable: true }
    ]
}

class AddEventoTemplate extends Component {

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        window.scrollTo(0, 0)
        const id = await this.props.match.params.id

        await this.setState({ chave: id })


        if (parseInt(id) != 0) {
            const evento = await loader.getBody(`getEventoTemplate.php`, { chave: this.state.chave });
            await this.setState({ evento: evento[0] });

            await this.setState({
                data: this.state.evento.data,
                fornecedor: this.state.evento.fornecedor,
                moeda: this.state.evento.Moeda,
                fornecedorInicial: this.state.evento.fornecedor,
                taxa: this.state.evento.taxa,
                descricao: this.state.evento.descricao,
                tipo: this.state.evento.tipo_sub,
                remarks: this.state.evento.remarks,
                valor: new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.state.evento.valor),
                vlrc: new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.state.evento.valor1),
                repasse: this.state.evento.repasse == 1 ? true : false,
                fornecedorCusteio: this.state.evento.Fornecedor_Custeio,
                gruposIniciais: this.state.evento.gruposChaves != null ? this.state.evento.gruposChaves?.split('@.@') : [],
                gruposEscolhidos: this.state.evento.gruposChaves != null ? this.state.evento.gruposChaves?.split('@.@') : []
            })

            if (this.state.repasse) {
                this.setState({
                    valor: this.state.vlrc
                });
            }
        }
        await this.carregaTiposAcessos()
        await this.carregaPermissoes()
        await this.testaAcesso()
        await this.getTaxas();
        await this.getMoedas();
        await this.getPessoas();
        await this.getDescricaoPadrao();
        await this.getGruposTemplates();

        if (this.state.chave != 0) {
            await this.setState({
                dadosIniciais: [
                    { titulo: 'Data', valor: util.formatForLogs(this.state.data, 'date') },
                    { titulo: 'Fornecedor', valor: util.formatForLogs(this.state.fornecedor, 'options', '', '', this.state.pessoasOptions) },
                    { titulo: 'Taxa', valor: util.formatForLogs(this.state.taxa, 'options', '', '', this.state.taxasOptions) },
                    { titulo: 'Moeda', valor: util.formatForLogs(this.state.moeda, 'options', '', '', this.state.moedas, 'Chave', 'Sigla') },
                    { titulo: 'Valor', valor: util.formatForLogs(this.state.valor, 'money', '0,00') },
                    { titulo: 'VCP', valor: util.formatForLogs(this.state.vlrc, 'money', '0,00') },
                    { titulo: 'Repasse', valor: util.formatForLogs(this.state.repasse, 'bool') },
                    { titulo: 'Descrição', valor: util.formatForLogs(this.state.descricao) },
                    { titulo: 'Tipo', valor: util.formatForLogs(this.state.tipo, 'options', '', '', this.state.tiposSubOptions) },
                    { titulo: 'Ordem', valor: util.formatForLogs(this.state.ordem) },
                    { titulo: 'Remarks', valor: util.formatForLogs(this.state.remarks) },
                    { titulo: 'Fornecedor Custeio', valor: util.formatForLogs(this.state.fornecedorCusteio, 'options', '', '', this.state.fornecedoresOptions) }
                ]
            })
        }

        this.state.acessosPermissoes.map((e) => {
            if ((e.acessoAcao == "SERVICOS_ITENS" && e.permissaoInsere == 0 && this.state.chave == 0) || (e.acessoAcao == "SERVICOS_ITENS" && e.permissaoEdita == 0 && this.state.chave != 0)) {
                this.setState({ bloqueado: true })
            }
        })

        await this.setState({ loading: false })
    }

    carregaTiposAcessos = async () => {
        await apiEmployee.post(`getTiposAcessos.php`, {
            token: true,
        }).then(
            async res => {
                await this.setState({ acessos: res.data });
            },
            async err => { this.erroApi(err) }
        )
    }

    carregaPermissoes = async () => {
        await apiEmployee.post(`getPermissoes.php`, {
            token: true,
        }).then(
            async res => {
                await this.setState({ permissoes: res.data })
            },
            async err => { this.erroApi(err) }
        )
    }

    testaAcesso = async () => {
        let permissao = '';

        const acessosPermissoes = this.state.acessos.map((e, i) => {
            permissao = this.state.permissoes.filter((permissao) => {
                if (permissao.Usuario == this.state.usuarioLogado.codigo && permissao.Acessos == e.Chave && permissao.Empresa == this.state.usuarioLogado.empresa) {
                    return permissao;
                }
            })[0]
            return {
                acesso: e.Chave,
                acessoAcao: e.Acao,
                permissaoInsere: permissao ? permissao.Liberacao.split(``)[0] : 0,
                permissaoEdita: permissao ? permissao.Liberacao.split(``)[1] : 0,
                permissaoConsulta: permissao ? permissao.Liberacao.split(``)[2] : 0,
                permissaoDeleta: permissao ? permissao.Liberacao.split(``)[3] : 0
            }
        })

        await this.setState({ acessosPermissoes: acessosPermissoes });
    }

    getTaxas = async () => {
        await apiEmployee.post(`getTaxas.php`, {
            token: true,
        }).then(
            async res => {
                await this.setState({ taxas: res.data })

                await this.getTaxasOptions();
            },
            async err => { this.erroApi(err) }
        )
    }

    getTaxasOptions = async () => {
        if (this.state.tipo == 0) {
            const options = this.state.taxas.filter((taxa) => taxa.Tipo == "P").map((e) => {
                return { label: e.descricao, value: e.chave, money: e.valor }
            })

            await this.setState({ taxasOptions: options })
        } else if (this.state.tipo == 1) {
            const options = this.state.taxas.filter((taxa) => taxa.Tipo == "R").map((e) => {
                return { label: e.descricao, value: e.chave, money: e.valor }
            })

            await this.setState({ taxasOptions: options })
        } else {
            const options = this.state.taxas.map((e) => {
                return { label: e.descricao, value: e.chave, money: e.valor }
            })

            await this.setState({ taxasOptions: options })
        }
    }

    getMoedas = async () => {
        await this.setState({
            moedas: await loader.getBase('getMoedas.php')
        })
    }

    getPessoas = async () => {
        await apiEmployee.post(`getFornecedores.php`, {
            token: true,
        }).then(
            async res => {
                await this.setState({ pessoas: res.data })

                const options = this.state.pessoas.map((e) => {
                    return { label: `${e.Nome_Fantasia ? e.Nome_Fantasia : e.Nome}${e.Cnpj_Cpf ? ` - ${util.formataCPF(e.Cnpj_Cpf)}` : ""}`, value: e.Chave }
                })

                options.unshift({ label: 'Nenhum', value: '' })

                await this.setState({ pessoasOptions: options })
            },
            async err => { this.erroApi(err) }
        )
    }

    getOrdem = async () => {
        await apiEmployee.post(`getOrdem.php`, {
            token: true,
            chave_os: this.state.chave_os
        }).then(
            async res => {
                await this.setState({ ordem: res.data[0] ? (Math.floor(res.data[0].ordem) + 1).toFixed(2).replaceAll('.', ',') : '1,0', ordemBloqueado: false })
            },
            async err => { this.erroApi(err) }
        )
    }

    getGruposTemplates = async () => {

        const value = await loader.getBaseOptions(`getGruposTemplates.php`, 'nome', 'chave', {token:true, offset: 0})

        this.setState({
            gruposOptions: value,
        });
    }

    getDescricaoPadrao = async () => {
        await apiEmployee.post(`getDescricaoPadrao.php`, {
            token: true,
        }).then(
            async res => {
                await this.setState({ descricoesPadrao: res.data })

                const options = this.state.descricoesPadrao.map((e) => {
                    return { label: e.descricao, value: e.chave }
                })

                await this.setState({ descricoesPadraoOptions: options })
            },
            async err => { this.erroApi(err) }
        )
    }

    getTiposDocumento = async () => {
        await apiEmployee.post('getTiposDocumento.php', {
            token: true
        }).then(
            async res => {
                await this.setState({ tiposDocumento: res.data })

                const options = this.state.tiposDocumento.map((e) => {
                    return { label: e.Descricao, value: e.Chave }
                })

                await this.setState({ tiposDocumentoOptions: options })
            },
            async err => console.log(`erro: ` + err)
        )
    }

    alteraModal = async (valor) => {
        this.setState({ modal: valor });
    }

    alteraCliente = async (valor, categoria) => {
        if (categoria.split('')[1] == '1' && !this.state.fornecedorCusteioAtivo) {
            await this.setState({ fornecedor: valor });
        } else if (categoria.split('')[1] == '1') {
            await this.setState({ fornecedorCusteio: valor });
        }
        await this.setState({ modalAberto: false });
        await this.getPessoas()
    }

    alteraTaxa = async (valor, tipo) => {
        await this.getTaxas()

        if (tipo == "P" && this.state.tipo != 1) {
            await this.setState({ taxa: valor });

            const taxa = this.state.taxasOptions.find((option) => option.value = valor);

            if (taxa) {
                await this.setState({ valor: taxa.money })
            }

        } else if (tipo == "R" && this.state.tipo != 0) {
            await this.setState({ taxa: valor });

            const taxa = this.state.taxasOptions.find((option) => option.value = valor);

            if (taxa) {
                await this.setState({ valor: taxa.money })
            }
        } else if (tipo != "P" && tipo != "R") {
            await this.setState({ taxa: valor });

            const taxa = this.state.taxasOptions.find((option) => option.value = valor);

            if (taxa) {
                await this.setState({ valor: taxa.money })
            }
        }

        await this.setState({ modalAberto: false });
    }

    alteraDescricaoPadrao = async (valor) => {
        await this.setState({ descricao: valor });

        await this.setState({ modalAberto: false });
        await this.getDescricaoPadrao()
    }

    salvarEventoTemplate = async (validForm) => {
        this.setState({ ...util.cleanStates(this.state) })

        this.setState({ bloqueado: true });


        await this.setState({
            dadosFinais: [
                { titulo: 'Data', valor: util.formatForLogs(this.state.data, 'date') },
                { titulo: 'Fornecedor', valor: util.formatForLogs(this.state.fornecedor, 'options', '', '', this.state.pessoasOptions) },
                { titulo: 'Taxa', valor: util.formatForLogs(this.state.taxa, 'options', '', '', this.state.taxasOptions) },
                { titulo: 'Moeda', valor: util.formatForLogs(this.state.moeda, 'options', '', '', this.state.moedas, 'Chave', 'Sigla') },
                { titulo: 'Valor', valor: util.formatForLogs(this.state.valor, 'money', '0,00') },
                { titulo: 'VCP', valor: util.formatForLogs(this.state.vlrc, 'money', '0,00') },
                { titulo: 'Repasse', valor: util.formatForLogs(this.state.repasse, 'bool') },
                { titulo: 'Descrição', valor: util.formatForLogs(this.state.descricao) },
                { titulo: 'Tipo', valor: util.formatForLogs(this.state.tipo, 'options', '', '', this.state.tiposSubOptions) },
                { titulo: 'Ordem', valor: util.formatForLogs(this.state.ordem) },
                { titulo: 'Remarks', valor: util.formatForLogs(this.state.remarks) },
                { titulo: 'Fornecedor Custeio', valor: util.formatForLogs(this.state.fornecedorCusteio, 'options', '', '', this.state.fornecedoresOptions) }
            ],
            loading: true
        })



        if (parseInt(this.state.chave) === 0 && validForm) {
            await apiEmployee.post(`insertEventoTemplate.php`, {
                token: true,
                values: `'${this.state.data}', '${this.state.fornecedor}', '${this.state.taxa}', '${this.state.descricao}', '${this.state.tipo}', '${this.state.fornecedorCusteio}', '${this.state.remarks}', '${this.state.moeda}', '${parseFloat(this.state.valor == "" ? 0 : this.state.valor.replaceAll('.', '').replaceAll(',', '.'))}', '${parseFloat(this.state.vlrc == "" ? 0 : this.state.vlrc.replaceAll('.', '').replaceAll(',', '.'))}', '${this.state.repasse ? 1 : 0}', 1`,
                grupos: this.state.gruposEscolhidos
            }).then(
                async res => {
                    await this.setState({
                        evento: res.data[0],
                        chave: this.state.evento.chave,
                        loading: false,
                    });
                    await loader.salvaLogs('os_servicos_itens', this.state.usuarioLogado.codigo, null, "Inclusão (template)", res.data[0].chave);

                    await this.setState({
                        redirectVoltar: true,
                    })
                },
                async res => await console.log(`Erro: ${res.data}`)
            )
        } else if (validForm) {
            
            const gruposNovos = this.state.gruposEscolhidos.map((e) => {
                if (!this.state.gruposIniciais.includes(e)) {
                  return e;
                }
              })
              .filter((e) => e);

            const gruposDeletados = this.state.gruposIniciais.map((e) => {
                if (!this.state.gruposEscolhidos.includes(e)) {
                  return e;
                }
              })
              .filter((e) => e);

            await apiEmployee.post(`updateEventoTemplate.php`, {
                token: true,
                chave: this.state.chave,
                data: this.state.data,
                Moeda: this.state.moeda,
                valor: parseFloat(this.state.valor == "" ? 0 : this.state.valor.replaceAll('.', '').replaceAll(',', '.')),
                valor1: parseFloat(this.state.vlrc.replaceAll('.', '').replaceAll(',', '.')),
                repasse: this.state.repasse ? 1 : 0,
                fornecedor: this.state.fornecedor,
                taxa: this.state.taxa,
                descricao: this.state.descricao,
                ordem: this.state.ordem.replaceAll(',', '.'),
                tipo_sub: this.state.tipo,
                Fornecedor_Custeio: this.state.fornecedorCusteio,
                gruposNovos,
                gruposDeletados
            }).then(
                async res => {
                    if (res.data[0]) {
                        await loader.salvaLogs('os_servicos_itens', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.chave, `TEMPLATE DE EVENTO: ${this.state.descricao}`);
                        this.setState({
                            loading: false,
                            redirectVoltar: true,
                        })
                    } else {
                        await alert(`Erro ${JSON.stringify(res)}`)
                    }
                },
                async res => await console.log(`Erro: ${res}`)
            )
        }

    }

    erroApi = async (res) => {
        alert(res)
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
        await this.setState({ logs: await loader.getLogs("os_servicos_itens", this.state.chave) })
        await this.setState({ modalLog: true })
    }

    finalizaSalvamento = async () => {
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Template salva!</p>
                        <p>Deseja criar mais?</p>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-danger w-50"
                            onClick={
                                async () => {
                                    this.setState({ redirectVoltar: true });
                                    onClose()
                                }
                            }
                        >
                            Não
                        </button>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-success w-50"
                            onClick={
                                async () => {
                                    await this.setState({
                                        recarregaPagina: true
                                    })

                                    onClose()
                                }
                            }

                        >
                            Sim
                        </button>
                    </div>
                )
            }
        })
    }

    render() {
        const validations = []
        validations.push(this.state.valor && this.state.valor.replaceAll('.', '').replaceAll(',', '.') == parseFloat(this.state.valor.replaceAll('.', '').replaceAll(',', '.')));
        validations.push((!this.state.repasse && !this.state.vlrc) || this.state.vlrc.replaceAll('.', '').replaceAll(',', '.') == parseFloat(this.state.vlrc.replaceAll('.', '').replaceAll(',', '.')) && (!this.state.repasse || this.state.vlrc == this.state.valor));
        validations.push(this.state.descricao);

        validations.push(!this.state.bloqueado);

        const validForm = validations.reduce((t, a) => t && a)



        return (
            <div className='allContent'>
                {this.state.loading &&
                    <Skeleton />
                }

                {this.state.redirect &&
                    <Redirect to={'/'} />
                }
                {this.state.recarregaPagina &&
                    <>
                        <Redirect to={{ pathname: '/ordensservico/addeventotemplate/0', state: { ...this.props.location.state, evento: {} } }} />
                        {window.location.reload()}
                    </>
                }
                {this.state.redirectVoltar &&
                    <Redirect to={{ pathname: `/utilitarios/eventostemplates/` }} />
                }
                {this.state.irParaFinanceiro && this.props.location.state && this.props.location.state.os &&
                    <Redirect to={{ pathname: `/ordensservico/addeventotemplatefinanceiro/${this.state.evento.chave}`, state: { evento: { ...this.state.evento } } }} />
                }
                {this.state.irParaFinanceiro && (!this.props.location.state || !this.props.location.state.os) &&
                    <Redirect to={{ pathname: `/ordensservico/addeventotemplatefinanceiro/${this.state.evento.chave}`, state: { evento: { ...this.state.evento } } }} />
                }

                {!this.state.loading &&
                    <>
                        <section>
                            <Header voltarEventosTemplates titulo="Template de Eventos" chave={this.state.chave != 0 ? this.state.chave : ''} />
                            <div className="col-2"></div>
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
                            nome={this.state.descricao}
                            chave={this.state.chave}
                            modalAberto={this.state.modalLog}
                        />

                        <Alert
                            alert={this.state.alert}
                            setAlert={(e) => this.setState({ alert: e })}
                        />

                        <ModalListas
                            pesquisa={this.state.modalPesquisa}
                            alteraModal={this.alteraModal}
                            alteraCliente={this.alteraCliente}
                            alteraTaxa={this.alteraTaxa}
                            alteraDescricaoPadrao={this.alteraDescricaoPadrao}
                            acessosPermissoes={this.state.acessosPermissoes}
                            modalAberto={this.state.modalAberto}
                            modal={this.state.modal}
                            modalLista={this.state.modalLista}
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
                                            this.salvarEventoTemplate(validForm)
                                        }}
                                    >
                                        <Form className="contact-form">

                                            <div className="row">
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2"></div>

                                                <div className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12 ">

                                                    <div className="row addservicos">
                                                        {this.state.chave == 0 &&
                                                            <>
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstlabel">
                                                                    <label>Chave</label>
                                                                </div>
                                                                <div className='col-1'></div>
                                                                <div className="col-xl-2 col-lg-2 col-md-3 col-sm-10 col-10 ">
                                                                    <Field className="form-control" style={{ backgroundColor: '#dddddd' }} type="text" disabled value={this.state.chave} />
                                                                </div>
                                                                <div className="col-xl-4 col-lg-4 col-md-3 col-sm-1 col-1 ">
                                                                </div>
                                                            </>
                                                        }
                                                        <div className={this.state.chave == 0 ? "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel" : "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm"}>
                                                            <label>Data</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className='form-control' type='date' value={this.state.data} onChange={(e) => { this.setState({ data: e.currentTarget.value }) }} />
                                                        </div>

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Tipo</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <select className='form-control' value={this.state.tipo} onChange={async e => { await this.setState({ tipo: e.currentTarget.value }); if (this.state.tipo == 1) { await this.setState({ fornecedor: '' }) } else if (this.state.fornecedor == '' && this.state.chave != 0) { await this.setState({ fornecedor: this.state.fornecedorInicial }) } await this.getTaxasOptions() }}>
                                                                {this.state.tiposSubOptions.map((t) => (
                                                                    <option value={t.value}>{t.label}</option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        {this.state.tipo == 0 &&
                                                            <>
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Repasse (reembolso)</label>
                                                                </div>
                                                                <div className='col-1'></div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <input className='form_control' checked={this.state.repasse} onChange={(e) => { this.setState({ repasse: e.target.checked, pessoa: '', tipo: '', contaDesconto: '', fornecedorCusteio: "", vlrc: e.target.checked ? this.state.valor : '0,00' }) }} type="checkbox" />
                                                                </div>
                                                                <div className='col-1'></div>
                                                            </>
                                                        }

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Taxa</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.taxa && this.state.tipo != 2 && this.state.tipo != 3 &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>

                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.taxasOptions.filter(e => this.filterSearch(e, this.state.taxasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ taxasOptionsTexto: e }) }} value={this.state.taxasOptions.filter(option => option.value == this.state.taxa)[0]} search={true} onChange={(e) => { if (!this.state.valor || parseFloat(this.state.valor.replaceAll('.', "").replaceAll(",", ".")) == 0) { this.setState({ taxa: e.value, valor: e.money.replaceAll(",", "").replaceAll(".", ",") }) } else { this.setState({ taxa: e.value }) } }} />
                                                        </div>
                                                        <div className="col-xl-1 col-lg-2 col-md-2 col-sm-12 col-12">
                                                            {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'TAXAS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                                                <div className='insideFormButton' onClick={() => { this.setState({ modalAberto: true, modal: 'listarTaxas', modalPesquisa: this.state.taxa, modalLista: this.state.tipo == 0 ? this.state.taxas.filter((taxa) => taxa.Tipo == "P") : this.state.tipo == 1 ? this.state.taxas.filter((taxa) => taxa.Tipo == "R") : this.state.taxas }) }}>...</div>
                                                            }
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Fornecedor</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.fornecedor && this.state.tipo != 1 && this.state.tipo != 2 && this.state.tipo != 3 &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' isDisabled={this.state.tipo == 1} options={this.state.pessoasOptions.filter(e => this.filterSearch(e, this.state.pessoasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ pessoasOptionsTexto: e }) }} value={this.state.pessoasOptions.filter(option => option.value == this.state.fornecedor)[0]} search={true} onChange={(e) => { if (this.state.tipo != 1) { this.setState({ fornecedor: e.value }) } }} />
                                                        </div>
                                                        <div className="col-xl-1 col-lg-2 col-md-2 col-sm-12 col-12">
                                                            {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 && this.state.tipo != 1 &&
                                                                <div className='insideFormButton' onClick={() => { this.setState({ modalAberto: true, modal: 'listarCliente', modalPesquisa: this.state.fornecedor, modalLista: this.state.pessoas, fornecedorCusteioAtivo: false }) }}>...</div>
                                                            }
                                                        </div>
                                                        {!this.state.repasse &&
                                                            <>
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Fornecedor Custeio</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                    {!this.state.fornecedorCusteio && this.state.tipo == 1 &&
                                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                    }
                                                                </div>
                                                                <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                                                    <Select className='SearchSelect' options={this.state.pessoasOptions.filter(e => this.filterSearch(e, this.state.pessoasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ pessoasOptionsTexto: e }) }} value={this.state.pessoasOptions.filter(option => option.value == this.state.fornecedorCusteio)[0]} search={true} onChange={(e) => { this.setState({ fornecedorCusteio: e.value, }) }} />
                                                                </div>
                                                                <div className="col-xl-1 col-lg-2 col-md-2 col-sm-12 col-12">
                                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                                                        <div className='insideFormButton' onClick={() => { this.setState({ modalAberto: true, modal: 'listarCliente', modalPesquisa: this.state.fornecedorCusteio, modalLista: this.state.pessoas, fornecedorCusteioAtivo: true }) }}>...</div>
                                                                    }
                                                                </div>
                                                                <div className='col-1'>
                                                                </div>
                                                            </>
                                                        }
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Descrição Padrão</label>
                                                        </div>
                                                        <div className="col-1 errorMessage">
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.descricoesPadraoOptions.filter(e => this.filterSearch(e, this.state.descricoesPadraoOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ descricoesPadraoOptionsTexto: e }) }} value={this.state.descricoesPadraoOptions.filter(option => option.label == this.state.descricao)[0]} search={true} onChange={(e) => { this.setState({ descricao: e.label, }) }} />
                                                        </div>
                                                        <div className="col-xl-1 col-lg-2 col-md-2 col-sm-12 col-12">
                                                            {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'DESCRICOES_PADRAO') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                                                <div className='insideFormButton' onClick={() => { this.setState({ modalAberto: true, modal: 'listarDescricoesPadrao', modalLista: this.state.descricoesPadrao }) }}>...</div>
                                                            }
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Descrição</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.descricao &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control textareaFix" as={"textarea"} value={this.state.descricao} onChange={async e => { this.setState({ descricao: e.currentTarget.value }) }} />
                                                        </div>

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Valor</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.valor || !this.state.moeda &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="fieldDividido col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <select disabled={this.state.repasse} className='form-control nextToInput fieldDividido_1' value={this.state.moeda} onChange={(e) => { if (!this.state.repasse) { this.setState({ moeda: e.target.value }) } }}>
                                                                {this.state.moedas.map((e) => (
                                                                    <option value={e.Chave}>{e.Sigla}</option>
                                                                ))}
                                                            </select>
                                                            <Field disabled={this.state.repasse} className="form-control fieldDividido_2 text-right " type="text" onClick={(e) => e.target.select()} value={this.state.valor} onChange={async e => { if (!this.state.repasse) { this.setState({ valor: e.currentTarget.value }) } }} onBlur={async e => { this.setState({ valor: e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.') ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '0,00' }) }} />
                                                        </div>

                                                        <div className='col-1'></div>

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>VCP</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control text-right" type="text" step="0.1" value={this.state.vlrc} onClick={(e) => e.target.select()} onChange={async e => { this.setState({ vlrc: e.currentTarget.value }); if (this.state.repasse) { this.setState({ valor: e.currentTarget.value }) } }} onBlur={async e => { this.setState({ vlrc: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '0,00' }); if (this.state.repasse) { this.setState({ valor: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '0,00' }) } }} />
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Remarks</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control textareaFix" as={"textarea"} value={this.state.remarks} onChange={async e => { this.setState({ remarks: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className='col-1'></div>

                                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'GRUPOS_TEMPLATES') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                                            <>
                                                                <div><hr /></div>

                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Grupos de Templates</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Select className='SearchSelect' options={this.state.gruposOptions.filter(e => this.filterSearch(e, this.state.optionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ optionsTexto: e }) }} search={true} onChange={(e) => { if (!this.state.gruposEscolhidos.find((g) => g == e.value)) this.setState({ gruposEscolhidos: [...this.state.gruposEscolhidos, e.value] }) }} />
                                                                    <div style={{ marginBottom: 20, color: 'white', fontSize: 13 }}>
                                                                        {this.state.gruposEscolhidos?.map((e, i) => (
                                                                            <span class="click_to_erase" onClick={() => this.setState({ gruposEscolhidos: this.state.gruposEscolhidos.filter((c) => c != e) })}>{`${this.state.gruposOptions.find((g) => g.value == e)?.label}${i != this.state.gruposEscolhidos.length - 1 ? ', ' : ' '}`}</span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </>
                                                        }
                                                    </div>




                                                </div>
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                            </div>

                                            <div className="row">
                                                <div className="col-2"></div>
                                                <div className="col-8" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                    <button disabled={!validForm} type="submit" style={validForm ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} >Salvar</button>
                                                </div>
                                                <div className="col-2"></div>
                                                <div className="col-2"></div>

                                                <div className="col-8" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                    {/* {validForm && this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'EVENTOS_FINANCEIRO') { return e } }).map((e) => e.permissaoInsere)[0] == 1 && this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'EVENTOS_FINANCEIRO') { return e } }).map((e) => e.permissaoEdita)[0] == 1 &&
                                                        <button title="Financeiro" style={{ borderRadius: 15, margin: 3 }} onClick={async () => { await this.setState({ financeiro: true }); await this.salvarEventoTemplate(validForm) }}>
                                                            <FontAwesomeIcon icon={faDollarSign} />
                                                        </button>
                                                    } */}

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

export default connect(mapStateToProps, null)(AddEventoTemplate)

