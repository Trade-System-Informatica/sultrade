import React, { Component } from 'react'
import './styles.css'
import { Formik, Field, Form } from 'formik'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import ModalListas from '../../../components/modalListas'
import ModalItem from '../../../components/modalItem'
import Skeleton from '../../../components/skeleton'
import util from '../../../classes/util'
import loader from '../../../classes/loader'
import { PRECISA_LOGAR, NOME_EMPRESA, CAMINHO_DOCUMENTOS } from '../../../config'
import { connect } from 'react-redux'
import { Link, useHistory, Redirect } from 'react-router-dom'
import Image from 'react-bootstrap/Image'
import ModalLogs from '../../../components/modalLogs'
import { apiEmployee } from '../../../services/apiamrg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faTrashAlt, faPen, faPlus, faDollarSign, faEye, faTimes } from '@fortawesome/free-solid-svg-icons'
import moment from 'moment'
import Select from 'react-select';
import { confirmAlert } from 'react-confirm-alert'
import { PDFExport, savePDF } from "@progress/kendo-react-pdf";
import Modal from '@material-ui/core/Modal';
import { letterSpacing } from '@mui/system'
import { ConsoleLogger } from '@nestjs/common'


const estadoInicial = {
    os: '',

    chave: 0,
    descricao: '',
    codigo: '',
    cliente: '',
    navio: '',
    abertura: moment().format('YYYY-MM-DD'),
    chegada: moment().format('YYYY-MM-DD'),
    tipoServico: '',
    viagem: '',
    porto: '',
    eta: '',
    atb: '',
    etb: '',
    governmentTaxes: '',
    bankCharges: '',

    saida: '',
    encerramento: '',
    faturamento: '',
    centroCusto: '',
    roe: '',
    comentario: '',
    encerradoPor: '',
    faturadoPor: '',
    empresa: '',

    deleteSolicitao: false,

    solicitacaoChave: '',
    solicitacaoMoeda: '',
    solicitacaoValor: '',

    clientes: [],
    clientesOptions: [],
    clientesOptionsTexto: '',
    navios: [],
    naviosOptions: [],
    naviosOptionsTexto: '',
    portos: [],
    portosOptions: [],
    portosOptionsTexto: '',
    tiposServicos: [],
    tiposServicosOptions: [],
    tiposServicosOptionsTexto: '',
    operadores: [],

    tiposDocumento: [],
    tiposDocumentoOptions: [],
    tiposDocumentoOptionsTexto: '',

    documentoDescricao: '',
    documentoTipo: 1,

    acessos: [],
    permissoes: [],
    acessosPermissoes: [],

    bloqueado: false,

    modalAberto: false,
    modal: 0,
    modalLista: '',
    modalPesquisa: '',

    logs: [],
    modalLog: false,

    dadosIniciais: [],
    dadosFinais: [],
    dadosIniciaisDoc: [],
    dadosFinaisDoc: [],

    modalItemAberto: false,
    itemPermissao: '',
    itemInfo: [],
    itemNome: '',
    itemChave: '',
    itemAdd: {},
    itemEdit: {},
    itemFinanceiro: {},
    itemEditMini: {},
    itemDelete: '',

    navioNome: '',
    navioBloqueado: false,

    portoNome: '',
    portoSigla: '',
    portoBloqueado: false,

    clienteNome: '',
    clienteCpf: '',
    clienteCpfLimpo: '',
    clienteBloqueado: false,

    tipoServicoNome: '',
    tipoServicoPrazo: '',
    tipoServicoBloqueado: false,

    centrosCustos: [],
    centrosCustosOptions: [],
    centrosCustosOptionsTexto: '',

    empresas: [],
    empresasOptions: [],
    empresasOptionsTexto: '',

    cpfAprovado: false,

    solicitacoes: [],
    todasSolicitacoes: [],
    documentos: [],

    documentoModal: false,
    documento: [],
    documentoNome: '',
    documentoChave: '',
    documentoCaminho: '',
    documentoTrocar: true,
    documentoEditar: false,

    tiposServicosItens: ['Pagar', 'Receber', 'Adiantamento', 'Desconto'],

    pdfNome: "",
    pdfgerado: [],
    pdfContent: [],
    moedas: '',

    loading: true,
}

class AddOS extends Component {

    constructor(props) {
        super(props);
        this.pdfExportComponent = React.createRef(null);
    }

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        window.scrollTo(0, 0)
        var id = await this.props.match.params.id
        await this.setState({ chave: id })

        if (this.state.usuarioLogado.empresa != 0) {
            await this.setState({ empresa: this.state.usuarioLogado.empresa })
        }


        if (parseInt(id) !== 0) {
            if (!this.props.location.state || !this.props.location.state.os) {
                await this.setState({ os: await loader.getOne('getOSUma.php', null, null, { chave_os: this.state.chave }) })
            } else {
                await this.setState({ os: this.props.location.state.os })
            }
            //console.log('Servicos: ' + JSON.stringify(this.state.tiposervico))
            //await this.loadData(this.state.tiposervico)
            await this.setState({
                descricao: this.state.os.Descricao,
                codigo: this.state.os.codigo,
                cliente: this.state.os.Chave_Cliente,
                navio: this.state.os.chave_navio,
                abertura: moment(this.state.os.Data_Abertura).format('YYYY-MM-DD'),
                chegada: moment(this.state.os.Data_Chegada).format('YYYY-MM-DD'),
                tipoServico: this.state.os.chave_tipo_servico,
                viagem: this.state.os.viagem,
                porto: this.state.os.porto,
                eta: moment(this.state.os.eta).format('YYYY-MM-DD'),
                atb: moment(this.state.os.atb).format('YYYY-MM-DD'),
                etb: moment(this.state.os.etb).format('YYYY-MM-DD'),
                governmentTaxes: this.state.os.governmentTaxes,
                bankCharges: this.state.os.bankCharges,

                saida: moment(this.state.os.Data_Faturamento).format("YYYY-MM-DD") != "Invalid Date" ? moment(this.state.os.Data_Saida).format('YYYY-MM-DD') : '',
                encerramento: moment(this.state.os.Data_Encerramento).format("YYYY-MM-DD") != "Invalid Date" ? moment(this.state.os.Data_Encerramento).format('YYYY-MM-DD') : '',
                faturamento: moment(this.state.os.Data_Faturamento).format("YYYY-MM-DD") != "Invalid Date" ? moment(this.state.os.Data_Faturamento).format('YYYY-MM-DD') : '',
                centroCusto: this.state.os.centro_custo,
                roe: this.state.os.ROE,
                comentario: this.state.os.Comentario_Voucher,
                encerradoPor: this.state.os.encerradoPor,
                faturadoPor: this.state.os.faturadoPor,
                empresa: this.state.os.Empresa
            })

            await this.setState({
                dadosIniciais: [
                    { titulo: 'Descricao', valor: this.state.descricao },
                    { titulo: 'codigo', valor: this.state.codigo },
                    { titulo: 'Chave_Cliente', valor: this.state.cliente },
                    { titulo: 'chave_navio', valor: this.state.navio },
                    { titulo: 'Data_Abertura', valor: this.state.abertura },
                    { titulo: 'Data_Chegada', valor: this.state.chegada },
                    { titulo: 'chave_tipo_servico', valor: this.state.tipoServico },
                    { titulo: 'viagem', valor: this.state.viagem },
                    { titulo: 'porto', valor: this.state.porto },
                    { titulo: 'eta', valor: this.state.eta },
                    { titulo: 'atb', valor: this.state.atb },
                    { titulo: 'etb', valor: this.state.etb },
                    { titulo: 'governmentTaxes', valor: this.state.governmentTaxes },
                    { titulo: 'bankCharges', valor: this.state.bankCharges },
                    { titulo: 'etb', valor: this.state.etb },
                    { titulo: 'Data_Saida', valor: this.state.saida },
                    { titulo: 'Data_Encerramento', valor: this.state.encerramento },
                    { titulo: 'Data_Faturamento', valor: this.state.faturamento },
                    { titulo: 'centro_custo', valor: this.state.centroCusto },
                    { titulo: 'ROE', valor: this.state.roe },
                    { titulo: 'Comentario_Voucher', valor: this.state.comentario },
                    { titulo: 'encerradoPor', valor: this.state.encerradoPor },
                    { titulo: 'faturadoPor', valor: this.state.faturadoPor },
                ]
            })
        }
        await this.loadAll()

        this.state.acessosPermissoes.map((e) => {
            if ((e.acessoAcao == "OS" && e.permissaoInsere == 0 && this.state.chave == 0) || (e.acessoAcao == "OS" && e.permissaoEdita == 0 && this.state.chave != 0)) {
                this.setState({ bloqueado: true })
            }
        })
    }

    componentDidUpdate = async (prevProps, prevState) => {
        if (this.state.deleteSolicitao && this.state.modalItemAberto != prevState.modalItemAberto) {
            await this.setState({
                modalItemAberto: false,
                deleteSolicitao: false
            })
        }
    }

    loadAll = async () => {
        await this.setState({
            naviosOptions: await loader.getBaseOptions('getNavios.php', 'nome', 'chave'),
            clientesOptions: await loader.getBaseOptions('getClientes.php', 'Nome', 'Chave'),
            tiposServicosOptions: await loader.getBaseOptions('getTiposServicos.php', 'descricao', 'chave'),
            portosOptions: await loader.getBaseOptions('getPortos.php', 'Descricao', 'Chave'),
            tiposDocumento: await loader.getBase('getTiposDocumento.php'),
            tiposDocumentoOptions: await loader.getBaseOptions('getTiposDocumento.php', 'descricao', 'chave'),
            moedas: await loader.getBase('getMoedas.php'),
            moedasOptions: await loader.getBaseOptions('getMoedas.php', 'Sigla', 'Chave'),
            acessos: await loader.getBase('getTiposAcessos.php'),
            permissoes: await loader.getBase('getPermissoes.php'),
        });

        await this.getOperadores();
        if (this.state.chave) {
            await this.getCentrosCustos();
            await this.getServicosItens();
            await this.getDocumentos();
        }

        await this.setState({
            acessosPermissoes: await loader.testaAcesso(this.state.acessos, this.state.permissoes, this.state.usuarioLogado),
            loading: false
        });
    }

    reloadItemEditMini = async () => {
        await this.setState({
            itemEditMini: {
                onSubmit: async () => await this.mudaValorSolicitacao(),
                valores: [
                    {
                        half: true,
                        titulo: "Valor",
                        valor1: this.state.solicitacaoMoeda,
                        tipo1: "select",
                        options1: this.state.moedasOptions,
                        onChange1: async (valor) => { await this.setState({ solicitacaoMoeda: valor }); await this.reloadItemEditMini() },
                        valor2: this.state.solicitacaoValor,
                        tipo2: "text",
                        onChange2: async (valor) => { await this.setState({ solicitacaoValor: valor }); await this.reloadItemEditMini() },
                        onBlur2: async (valor) => { await this.setState({ solicitacaoValor: Number(valor.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR').format(valor.replaceAll('.', '').replaceAll(',', '.')) : '' }); await this.reloadItemEditMini() },
                    }
                ]
            }
        })
    }

    getServicosItens = async () => {
        await apiEmployee.post(`getServicosItensOs.php`, {
            token: true,
            chave_os: this.state.chave

        }).then(
            async response => {
                const todasSolicitacoes = [... this.state.todasSolicitacoes, ...response.data];

                const solicitacoes = [... this.state.solicitacoes, ...response.data.filter((e) => e.cancelada != 1)]
                await this.setState({ solicitacoes, todasSolicitacoes })

            },
            response => { this.erroApi(response) }

        )
    }

    getDocumentos = async () => {
        await apiEmployee.post(`getDocumentosOS.php`, {
            token: true,
            chave_os: this.state.chave

        }).then(
            async response => {
                const documentos = [... this.state.documentos, ...response.data]
                await this.setState({ documentos: documentos })

            },
            response => { this.erroApi(response) }

        )
    }

    deleteServicoItem = async (chave, nome) => {
        this.setState({ deleteSolicitao: true })

        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        {this.setState({ modalItemAberto: false })}
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja remover esta solicitação? ({nome}) </p>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-danger w-25"
                            onClick={
                                async () => {
                                    onClose()
                                }
                            }
                        >
                            Não
                        </button>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-success w-25"
                            onClick={
                                async () => {
                                    await apiEmployee.post(`deleteServicoItem.php`, {
                                        token: true,
                                        chave: chave,
                                        canceladaPor: this.state.usuarioLogado.codigo
                                    }).then(
                                        async response => {
                                            if (response.data == true) {
                                                await loader.salvaLogs('os_servicos_itens', this.state.usuarioLogado.codigo, null, "Cancelamento", chave);

                                                document.location.reload()
                                            }
                                        },
                                        async response => {
                                            this.erroApi(response)
                                        }
                                    )
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

    deleteDocumento = async (chave, nome, caminho) => {
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja remover este Documento? ({nome}) </p>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-danger w-25"
                            onClick={
                                async () => {
                                    onClose()
                                }
                            }
                        >
                            Não
                        </button>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-success w-25"
                            onClick={
                                async () => {
                                    await apiEmployee.post(`deleteDocumento.php`, {
                                        token: true,
                                        chave: chave,
                                        nome: caminho
                                    }).then(
                                        async response => {
                                            if (response.data == true) {
                                                await loader.salvaLogs('os_documentos', this.state.usuarioLogado.codigo, null, "Exclusão", chave);

                                                document.location.reload()
                                            }
                                        },
                                        async response => {
                                            this.erroApi(response)
                                        }
                                    )
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

    getCodigo = async () => {
        await apiEmployee.post('getCodigos.php', {
            token: true,
            tipo: 'OS'
        }).then(
            async res => {
                await this.setState({ codigo: res.data[0] })
            },
            async err => console.log(`erro: ` + err)
        )
    }

    getCentrosCustos = async () => {
        await apiEmployee.post('getCentrosCustosAtivos.php', {
            token: true
        }).then(
            async res => {
                await this.setState({ centrosCustos: res.data })

                const options = this.state.centrosCustos.map((e) => {
                    return { label: e.Descricao, value: e.Chave }
                })
                options.unshift({ label: '--', value: '' })

                await this.setState({ centrosCustosOptions: options })
            },
            async err => console.log(`erro: ` + err)
        )
    }

    getOperadores = async () => {
        await apiEmployee.post(`getOperadores.php`, {
            token: true,
            empresa: this.state.usuarioLogado.empresa
        }).then(
            async res => {
                await this.setState({ operadores: res.data })
                /*
                                const options = this.state.operadores.map((e) => {
                                    return { label: e.Nome, value: e.Codigo }
                                })
                                options.unshift({ label: 'NENHUM', value: '' })
                
                                await this.setState({ operadoresOptions: options })*/
            },
            async err => { this.erroApi(err) }
        )
    }

    salvarOS = async (validForm) => {
        await this.setState({
            dadosFinais: [
                { titulo: 'Descricao', valor: this.state.descricao },
                { titulo: 'codigo', valor: this.state.codigo },
                { titulo: 'Chave_Cliente', valor: this.state.cliente },
                { titulo: 'chave_navio', valor: this.state.navio },
                { titulo: 'Data_Abertura', valor: this.state.abertura },
                { titulo: 'Data_Chegada', valor: this.state.chegada },
                { titulo: 'chave_tipo_servico', valor: this.state.tipoServico },
                { titulo: 'viagem', valor: this.state.viagem },
                { titulo: 'porto', valor: this.state.porto },
                { titulo: 'eta', valor: this.state.eta },
                { titulo: 'atb', valor: this.state.atb },
                { titulo: 'etb', valor: this.state.etb },
                { titulo: 'governmentTaxes', valor: this.state.governmentTaxes },
                { titulo: 'bankCharges', valor: this.state.bankCharges },
                { titulo: 'Data_Saida', valor: this.state.saida },
                { titulo: 'Data_Encerramento', valor: this.state.encerramento },
                { titulo: 'Data_Faturamento', valor: this.state.faturamento },
                { titulo: 'centro_custo', valor: this.state.centroCusto },
                { titulo: 'ROE', valor: this.state.roe },
                { titulo: 'Comentario_Voucher', valor: this.state.comentario },
                { titulo: 'encerradoPor', valor: this.state.encerradoPor },
                { titulo: 'faturadoPor', valor: this.state.faturadoPor },
            ]
        })

        this.setState({ bloqueado: true })

        if (parseInt(this.state.chave) === 0 && validForm) {
            await this.getCodigo();
            await apiEmployee.post(`insertOS.php`, {
                token: true,
                values: `'${this.state.usuarioLogado.codigo}', '${this.state.descricao}', 'ST${this.state.codigo.Proximo}', '${this.state.cliente}', '${this.state.navio}', '${moment(this.state.abertura).format('YYYY-MM-DD')}', '${moment(this.state.chegada).format('YYYY-MM-DD')}', '${this.state.tipoServico}', '${this.state.viagem}', '${this.state.porto}', '${this.state.encerradoPor}', '${this.state.faturadoPor}', '${this.state.empresa}', '${this.state.eta}', '${this.state.atb}', '${this.state.etb}', '${parseFloat(this.state.governmentTaxes.replaceAll('.', '').replaceAll(',', '.'))}', '${parseFloat(this.state.bankCharges.replaceAll('.', '').replaceAll(',', '.'))}'`,
                codigo: this.state.codigo.Proximo,
                tipo: this.state.codigo.Tipo
            }).then(
                async res => {
                    if (res.data[0].Chave) {
                        await this.setState({ codigo: res.data[0].codigo })
                        await this.GerarEtiqueta(res.data[0].codigo);
                        await loader.salvaLogs('os', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].Chave);

                        await this.setState({ finalizaOperacao: true })
                    } else {
                        console.log(res.data)
                    }
                },
                async res => await console.log(`Erro: ${res}`)
            )

        } else if (validForm) {
            await apiEmployee.post(`updateOS.php`, {
                token: true,
                Chave: this.state.chave,
                Descricao: this.state.descricao,
                Codigo: this.state.codigo,
                Chave_Cliente: this.state.cliente,
                chave_navio: this.state.navio,
                Data_Abertura: this.state.abertura ? moment(this.state.abertura).format('YYYY-MM-DD') : '',
                Data_Chegada: this.state.chegada ? moment(this.state.chegada).format('YYYY-MM-DD') : '',
                chave_tipo_servico: this.state.tipoServico,
                viagem: this.state.viagem,
                porto: this.state.porto,
                eta: this.state.eta ? moment(this.state.eta).format('YYYY-MM-DD') : '',
                atb: this.state.atb ? moment(this.state.atb).format('YYYY-MM-DD') : '',
                etb: this.state.etb ? moment(this.state.etb).format('YYYY-MM-DD') : '',

                Data_Saida: this.state.saida ? moment(this.state.saida).format('YYYY-MM-DD') : '',
                Data_Encerramento: this.state.encerramento ? moment(this.state.encerramento).format('YYYY-MM-DD') : '',
                Data_Faturamento: this.state.abertura ? moment(this.state.faturamento).format('YYYY-MM-DD') : '',
                centro_custo: this.state.centroCusto,
                ROE: this.state.roe,
                Comentario_Voucher: this.state.comentario,
                encerradoPor: this.state.encerradoPor,
                faturadoPor: this.state.faturadoPor,
                Empresa: this.state.empresa,
                governmentTaxes: this.state.governmentTaxes,
                bankCharges: this.state.bankCharges

            }).then(
                async res => {
                    if (res.data === true) {
                        await loader.salvaLogs('os', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.chave, `OS: ${this.state.codigo}`);
                        await this.setState({ finalizaOperacao: true })
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

    filterSearchCentroCusto = (e, state) => {
        if (e == "") {
            return true
        }

        const text = state.toUpperCase();
        return (e.label.toUpperCase().includes(text) || e.value.toUpperCase().includes(text))
    }

    alteraModal = async (valor) => {
        this.setState({ modal: valor });
    }

    alteraNavio = async (valor) => {
        await this.setState({
            navio: valor,
            modalAberto: false,
            navios: await loader.getBase('getNavios.php'),
            naviosOptions: await loader.getBaseOptions('getNavios.php', 'nome', 'chave')
        });
    }

    alteraPorto = async (valor) => {
        await this.setState({
            porto: valor,
            modalAberto: false,
            portos: await loader.getBase('getPortos.php'),
            portosOptions: await loader.getBaseOptions('getPortos.php', 'Descricao', 'Chave')
        })
    }

    alteraCliente = async (valor, categoria) => {
        if (categoria.split('')[0] == '1') {
            await this.setState({ cliente: valor });
        }
        await this.setState({
            modalAberto: false,
            clientes: await loader.getBase('getClientes.php'),
            clientesOptions: await loader.getBaseOptions('getClientes.php', 'Nome', 'Chave')
        })

    }

    alteraTipoServico = async (valor) => {
        await this.setState({
            tipoServico: valor,
            modalAberto: false,
            tiposServicos: await loader.getBase('getTiposServicos.php'),
            tiposServicosOptions: await loader.getBaseOptions('getTiposServicos.php', 'descricao', 'chave'),
        });
    }

    alteraCentroCusto = async (valor) => {
        await this.setState({ centroCusto: valor });
        await this.setState({ modalAberto: false });
        await this.getCentrosCustos()
    }

    CapaVoucher = async (codigo) => {
        this.setState({ pdfNome: "Capa_Voucher" })
        if (!this.state.moedas) {
            await this.getMoedas();
        }

        await this.setState({ loading: true })
        await apiEmployee.post(`getCapaVoucher.php`, {
            token: true,
            codigo: codigo
        })
            .then(
                async response => { await this.setState({ pdfContent: response.data }) },
                async response => { console.log(response) }
            )
        console.log(this.state.pdfContent)

        const vouchers = [];
        this.state.pdfContent.filter((content) => content.tipo != 2).map((content) => {
            if (!vouchers.includes(content.chavTaxa)) {
                vouchers.push(content.chavTaxa)
            }
        })

        let backgroundColor = '#ffffff';

        let operador = '';
        if (this.state.pdfContent[0]) {
            operador = this.state.operadores.filter((e) => e.Codigo == this.state.pdfContent[0].faturadoPor)[0];
        }
        let pdf = '';

        if (this.state.pdfContent[0]) {
            pdf =
                <div key={546546554654}>

                    <div className='pdfHeader'>
                        <img className="img-fluid" src="https://i.ibb.co/vmKJkx4/logo.png" alt="logo-lpc" border="0" style={{ width: '30%', height: '150px' }} />
                        <h3 className='pdfTitle'>AGENT DISBURSEMENT ACCOUNT</h3>
                        <h3>SULTRADE SHIPPING AGENCY</h3>
                    </div>
                    <hr />
                    <div className='pdfContent'>
                        <div>
                            <table className='pdfTable'>
                                <tr>
                                    <td colSpan='2' className=' pdfTitle'>COMPANY: {util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].cliente)}</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td colSpan='2' className=' pdfTitle'>ADDRESS: {`${util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].complemento)} ${util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].rua)} ${util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].numero)} ${util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].estado)} ${util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].pais)} ${util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].cep)}`}</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td colSpan='2' className=' pdfTitle'>Vessel Name: {util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].nomeNavio)}</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td colSpan='2' className=' pdfTitle'>Name of Port: {util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].nomePorto)}</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td colSpan='2' className=' pdfTitle'>Arrived: {moment(util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].data_chegada)).format('MMMM DD, YYYY')}</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td colSpan='2' className=' pdfTitle'>Sailed: {moment(util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].data_saida)).format('MMMM DD, YYYY')}</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td colSpan='2' className=' pdfTitle'>Date Of Billing: {moment(this.state.pdfContent[0].data_faturamento).format('MMMM DD, YYYY') != "Invalid date" ? moment(this.state.pdfContent[0].data_faturamento).format('MMMM DD, YYYY') : ''}</td>
                                    <td className='pdfTitle'>PO: {util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].codigo)}</td>
                                    <td></td>
                                </tr>
                            </table>
                            <br />
                            {vouchers.map((voucher, index) => {

                                let valorTotal = 0;
                                return (
                                    <>
                                        <table className={`voucherTable ${index != 0 ? 'page-break' : ''}`}>
                                            <tr>
                                                <td className='pdfTitle'>Voucher</td>
                                                <td colSpan='2' className='pdfTitle'>Description</td>
                                                <td className='pdfTitle'>Expense Type</td>
                                                <td className='pdfTitle'>Final USD</td>
                                                <td className='pdfTitle'>Final BRL</td>
                                            </tr>
                                            {this.state.pdfContent.filter((e) => e.tipo != 2 && e.chavTaxa == voucher).map((e, i) => {
                                                if (i % 2 == 0) {
                                                    backgroundColor = '#CCE4FF';
                                                } else {
                                                    backgroundColor = '#CCCCCC';
                                                }

                                                if (e.moeda == 5) {
                                                    valorTotal += parseFloat(e.valor);
                                                } else {
                                                    valorTotal += parseFloat(e.valor * this.state.pdfContent[0].roe);
                                                }

                                                return (
                                                    <tr>
                                                        <td style={{ backgroundColor: backgroundColor, padding: 5 }}>{e.chavTaxa}</td>
                                                        <td colSpan='2' style={{ backgroundColor: backgroundColor, padding: 5 }}>{e.descSubgrupo}</td>
                                                        <td style={{ backgroundColor: backgroundColor, padding: 5 }}>{e.descGrupo}</td>
                                                        <td style={{ backgroundColor: backgroundColor, padding: 5 }} className="text-right">{e.moeda == 5 ? parseFloat(e.valor / this.state.pdfContent[0].roe).toFixed(2).replaceAll('.', ',') : parseFloat(e.valor).toFixed(2).replaceAll('.', ',')}</td>
                                                        <td style={{ backgroundColor: backgroundColor, padding: 5 }} className="text-right">{e.moeda == 6 ? parseFloat(e.valor * this.state.pdfContent[0].roe).toFixed(2).replaceAll('.', ',') : parseFloat(e.valor).toFixed(2).replaceAll('.', ',')}</td>
                                                    </tr>
                                                )
                                            })}
                                            {this.state.pdfContent[0].BK == "SIM" && parseFloat(this.state.pdfContent[0].governmentTaxes) == this.state.pdfContent[0].governmentTaxes &&
                                                <tr>
                                                    <td></td>
                                                    <td colSpan='2' style={{ fontWeight: "bold" }}>GOVERNMENT TAXES</td>
                                                    <td style={{ fontWeight: "bold", padding: 5 }}></td>
                                                    <td style={{ fontWeight: "bold", padding: 5 }} className="text-right">{parseFloat(this.state.pdfContent[0].governmentTaxes / this.state.pdfContent[0].roe).toFixed(2).replaceAll('.', ',')}</td>
                                                    <td style={{ fontWeight: "bold", padding: 5 }} className="text-right">{parseFloat(this.state.pdfContent[0].governmentTaxes).toFixed(2).replaceAll('.', ',')}</td>
                                                </tr>
                                            }
                                            {this.state.pdfContent[0].GT == "SIM" && parseFloat(this.state.pdfContent[0].bankCharges) == this.state.pdfContent[0].bankCharges &&
                                                <tr>
                                                    <td></td>
                                                    <td colSpan='2' style={{ fontWeight: "bold", padding: 5 }}>BANK CHARGES</td>
                                                    <td style={{ fontWeight: "bold", padding: 5 }}></td>
                                                    <td style={{ fontWeight: "bold", padding: 5 }} className="text-right">{parseFloat(this.state.pdfContent[0].bankCharges / this.state.pdfContent[0].roe).toFixed(2).replaceAll('.', ',')}</td>
                                                    <td style={{ fontWeight: "bold", padding: 5 }} className="text-right">{parseFloat(this.state.pdfContent[0].bankCharges).toFixed(2).replaceAll('.', ',')}</td>
                                                </tr>
                                            }
                                        </table>
                                        <br />
                                        <table className='voucherTableFinal'>
                                            <tr>
                                                <td colSpan='4' className='pdfTitle'>Total Final Costs</td>
                                                <td className='pdfTitle'>{parseFloat(valorTotal / this.state.pdfContent[0].roe).toFixed(2).replaceAll('.', ',')}</td>
                                                <td className='pdfTitle'>{parseFloat(valorTotal).toFixed(2).replaceAll('.', ',')}</td>
                                            </tr>
                                            {this.state.pdfContent.filter((e) => e.tipo == 2).map((e) => {
                                                if (e.moeda == 5) {
                                                    valorTotal -= parseFloat(e.valor);
                                                } else {
                                                    valorTotal -= parseFloat(e.valor * this.state.pdfContent[0].roe);
                                                }

                                                return (
                                                    <tr>
                                                        <td colSpan='4'>Funds Received</td>
                                                        <td>{e.moeda == 5 ? parseFloat(e.valor / this.state.pdfContent[0].roe).toFixed(2).replaceAll('.', ',') : parseFloat(e.valor).toFixed(2).replaceAll('.', ',')}</td>
                                                        <td>{e.moeda == 6 ? parseFloat(e.valor * this.state.pdfContent[0].roe).toFixed(2).replaceAll('.', ',') : parseFloat(e.valor).toFixed(2).replaceAll('.', ',')}</td>
                                                    </tr>

                                                )
                                            })}
                                            <tr>
                                                <td colSpan='4' className='pdfTitle'>Final Blce/Debit Customer</td>
                                                <td className='pdfTitle'>{parseFloat(valorTotal / this.state.pdfContent[0].roe).toFixed(2).replaceAll('.', ',')}</td>
                                                <td className='pdfTitle'>{parseFloat(valorTotal).toFixed(2).replaceAll('.', ',')}</td>
                                            </tr>
                                        </table>
                                        <table className='pdfTable'>
                                            <tr>
                                                <td>ISSUED BY:</td>
                                                <td colSpan='2'>{operador ? operador.Nome : ''}</td>
                                                <td>ROE:</td>
                                                <td>{util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].roe.replaceAll('.', ','))}</td>
                                            </tr>
                                        </table>
                                    </>
                                )
                            })
                            }
                            <br />
                            <br />
                            <br />

                            <h2 className={`center page-break`}>BANKING DETAILS</h2>
                            <div><span className='pdfTitle'>Bank's name:</span> <span>Banco do Brasil S/A</span></div>
                            <div><span className='pdfTitle'>Branch's name:</span> <span>Rio Grande</span></div>
                            <div><span className='pdfTitle'>Address:</span> <span>Benjamin Constant St, 72</span></div>
                            <div><span className='pdfTitle'>Swift Code:</span> <span>BRASBRRJCTA</span></div>
                            <div><span className='pdfTitle'>IBAN:</span> <span>BR640000000002694000161440C1</span></div>
                            <div><span className='pdfTitle'>Branch's number:</span> <span>2694-8</span></div>
                            <div><span className='pdfTitle'>Account number:</span> <span>161441-X</span></div>
                            <div><span className='pdfTitle'>Account name:</span> <span>SUL TRADE AGENCIAMENTOS MARITIMOS LTDA-ME</span></div>
                            <div><span className='pdfTitle'>Phone:</span> <span>+55 53 3235 3500</span></div>
                            <div><span className='pdfTitle'>CNPJ:</span> <span>10.432.546/0001-75</span></div>
                        </div>
                    </div>

                </div>

        } else {
            await this.setState({ erro: "Sem as informações necessárias para criar o pdf", loading: false });
            return;
        }
        await this.setState({ pdfgerado: pdf })
        this.handleExportWithComponent()
    }

    RelatorioVoucher = async (codigo) => {
        this.setState({ pdfNome: "Relatorio_Voucher" })
        if (!this.state.moedas) {
            await this.getMoedas();
        }

        await this.setState({
            loading: true,
            pdfContent: await loader.getBody(`relatorioVoucher.php`, { token: true, codigo: codigo })
        })

        const pdfContent = this.state.pdfContent.itens;
        const pdfChaves = this.state.pdfContent.chaves;


        const getDescricaoItem = (item) => {
            if (item.tipo_op == 'R') {
                if (item.fornecedor_custeio && item.descricao_item) {
                    return `Expenses incurred with ${item.descricao_item}, as per attached bill from ${item.fornecedor_custeio}`
                }
            } else if (item.repasse != 0) {
                if (item.fornecedor && item.descricao_item) {
                    return `Expenses incurred with ${item.descricao_item}, as per attached bill from ${item.fornecedor}`
                }
            } else {
                if (item.fornecedor_custeio && item.descricao_item) {
                    return `Expenses incurred with ${item.descricao_item}, as per attached bill from ${item.fornecedor_custeio}`
                }
            }
        }

        const getValorItemReal = (item) => {
            if (item.moeda_item == 6 && item.ROE != 0) {
                return item.valor_item * item.ROE
            } else {
                return item.valor_item
            }
        }

        const getValorItemDolar = (item) => {
            if (item.moeda_item == 5 && item.ROE != 0) {
                return item.valor_item / item.ROE
            } else {
                return item.valor_item
            }
        }

        const mconversao = () => {
            if (pdfContent[0].ROE != 0) {
                return `Exchange Rate US$ 1,00 = R$${pdfContent[0].ROE}`;
            }
        }

        let valorTotalReais = 0;
        let valorTotalDolares = 0;
        let pdf = '';

        if (pdfContent) {
            pdf =
                <div style={{ zoom: 1 }} key={546546554654}>

                    {pdfChaves.map((chave, index) => {
                        valorTotalReais = 0;
                        valorTotalDolares = 0;
                        return (
                            <>
                                <div className={`voucherCabecalho ${index == 0 ? "" : "page-break"}`}>Voucher nr. {chave.codsubgrupo}</div>
                                <br />
                                <div className='voucherImagem'>
                                    <img className="img-fluid" src="https://i.ibb.co/n69ZD86/logo-Vertical.png" alt="logo-lpc" border="0" style={{ width: '130px', height: '100px' }} />
                                </div>
                                <div className='voucherHeader'>
                                    <table>
                                        <tr>
                                            <td colSpan={2}>Company: {chave.company}</td>
                                            <td>PO: {chave.codigo}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan={2}>Address: {chave.address}</td>
                                            <td>Arrived: {moment(chave.data_chegada).format('DD/MM/YYYY')}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan={2}>Date of Billing: {moment(chave.data_faturamento).format('DD/MM/YYYY')}</td>
                                            <td>Sailed: {moment(chave.data_saida).format('DD/MM/YYYY')}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan={3}>Vessel Name: {chave.vessel_name}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan={2}>Name of Port: {chave.name_of_port}</td>
                                            <td>{mconversao()}</td>
                                        </tr>
                                    </table>
                                </div>
                                <br />
                                <br />
                                <br />
                                <div className='voucherContent'>

                                    <div className='center'>{chave.subgrupos}</div>
                                    <table>
                                        <tr>
                                            <th colSpan={2}>Services</th>
                                            <th>Debit R$</th>
                                            <th>Debit U$</th>
                                        </tr>
                                        {pdfContent.filter((e) => e.codsubgrupo_taxas == chave.codsubgrupo_taxas).map((e, i) => {
                                            valorTotalReais += parseFloat(getValorItemReal(e));
                                            valorTotalDolares += parseFloat(getValorItemDolar(e));
                                            return (
                                                <tr>
                                                    <td style={{ paddingRight: 50 }} colSpan={2}>{getDescricaoItem(e)}</td>
                                                    <td style={{ paddingRight: 5 }}>R${new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(getValorItemReal(e))}</td>
                                                    <td style={{ paddingRight: 5 }}>U${new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(getValorItemDolar(e))}</td>
                                                </tr>

                                            )
                                        })
                                        }
                                        <tr>
                                            <td colSpan={2}><b>TOTAL</b></td>
                                            <td><b>R${new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valorTotalReais)}</b></td>
                                            <td><b>U${new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valorTotalDolares)}</b></td>
                                        </tr>

                                    </table>
                                </div>

                                <div className='voucherFooter'>Comments: {chave.Comentario_Voucher}</div>
                            </>
                        )
                    })}
                </div>
        } else {
            await this.setState({ erro: 'Sem as informações necessárias para gerar o pdf!', loading: false })
            return;
        }

        await this.setState({ pdfgerado: pdf })
        this.handleExportWithComponent()
    }

    GerarEtiqueta = async (codigo) => {
        await apiEmployee.post(`enviaEtiquetaOS.php`, {
            os: codigo,
            navio: this.state.naviosOptions.find((navio) => navio.value == this.state.navio) ? this.state.naviosOptions.find((navio) => navio.value == this.state.navio).label : "",  
            cliente: this.state.clientesOptions.find((cliente) => cliente.value == this.state.cliente) ? this.state.clientesOptions.find((cliente) => cliente.value == this.state.cliente).label : "",  
            servico: this.state.tiposServicosOptions.find((tipoServico) => tipoServico.value == this.state.tipoServico) ? this.state.tiposServicosOptions.find((tipoServico) => tipoServico.value == this.state.tipoServico).label : "",  
            porto: this.state.portosOptions.find((porto) => porto.value == this.state.porto) ? this.state.portosOptions.find((porto) => porto.value == this.state.porto).label : "",  
            ets: moment(this.state.atb).format("DD/MM/YYYY") != "Invalid date" ? moment(this.state.atb).format("DD/MM/YYYY") : ""           
        })
    }

    CloseToReal = async (codigo) => {
        this.setState({ pdfNome: "Close_to_Real" })
        if (!this.state.moedas) {
            await this.getMoedas();
        }
        await this.setState({ loading: true })
        await apiEmployee.post(`getCloseToReal.php`, {
            token: true,
            codigo: codigo
        })
            .then(
                async response => {
                    await this.setState({ pdfContent: response.data })
                },
                async response => { console.log(response) }
            )
        let valorTotal = 0;
        let pdf = '';


        if (this.state.pdfContent[0]) {
            pdf =
                <div style={{ zoom: 1 }} key={546546554654}>

                    <div className='pdfHeader'>
                        <img className="img-fluid" src="https://i.ibb.co/vmKJkx4/logo.png" alt="logo-lpc" border="0" style={{ width: '45%', height: '270px' }} />
                        <h3 className='pdfTitle'></h3>
                        <h3>Close to Real</h3>
                    </div>
                    <hr />
                    <div className='pdfContent'>
                        <div>
                            <table className='pdfTable'>
                                <tr>
                                    <td colSpan='2' className=' pdfTitle'>COMPANY: {util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].cliente)}</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td colSpan='2' className=' pdfTitle'>ADDRESS: {`${util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].complemento)} ${util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].rua)} ${util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].numero)} ${util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].estado)} ${util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].pais)} ${util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].cep)}`}</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td colSpan='2' className=' pdfTitle'>Vessel Name: {util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].nomeNavio)}</td>
                                    <td></td>
                                    <td className=' pdfTitle'>Name of Port: {util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].nomePorto)}</td>
                                </tr>
                                <tr>
                                    <td colSpan='2' className=' pdfTitle'>Arrived: {moment(util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].data_chegada)).format('MMMM DD, YYYY')}</td>
                                    <td></td>
                                    <td className=' pdfTitle'>Sailed: {moment(util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].data_saida)).format('MMMM DD, YYYY')}</td>
                                </tr>
                                <tr>
                                    <td colSpan='2' className='pdfTitle'>PO: {util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].codigo)}</td>
                                    <td></td>
                                    <td className='pdfTitle'>O.C.C: {util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].centro_custo)}</td>
                                </tr>
                                <tr>
                                    <td colSpan='2' className=' pdfTitle'>ROE: {util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].roe.replaceAll('.', ','))}</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                            </table>
                            <br />
                        </div>
                    </div>
                    <div>
                        <table className='pdfTable'>
                            <tr>
                                <td colSpan='2' className=' pdfTitle'></td>
                                <td></td>
                                <td></td>
                            </tr>
                            <tr>
                            </tr>
                            <tr>
                                <td colSpan='2' className=' red'>DESCRICAO:</td>
                                <td className=' red'>VALOR (USD)</td>
                                <td className=' red'>VALOR (R$)</td>
                            </tr>
                            {this.state.pdfContent.map((e) => {
                                if (e.moeda == 5) {
                                    valorTotal += parseFloat(e.valor);
                                } else {
                                    valorTotal += parseFloat(e.valor * this.state.pdfContent[0].roe);
                                }
                                return (
                                    <tr>

                                        <td colSpan='2' className=''>{e.descos}</td>
                                        <td className=''>{e.moeda == 5 ? parseFloat(e.valor / this.state.pdfContent[0].roe).toFixed(2).replaceAll('.', ',') : parseFloat(e.valor).toFixed(2).replaceAll('.', ',')} USD</td>
                                        <td className=''>{e.moeda == 6 ? parseFloat(e.valor * this.state.pdfContent[0].roe).toFixed(2).replaceAll('.', ',') : parseFloat(e.valor).toFixed(2).replaceAll('.', ',')} R$</td>
                                    </tr>
                                )
                            })}
                            {this.state.pdfContent[0].governmentTaxes > 0 &&
                                <tr>
                                    <td colSpan='2' className=''>GOVERNMENT TAXES</td>
                                    <td className=''>{parseFloat(this.state.pdfContent[0].governmentTaxes / this.state.pdfContent[0].roe).toFixed(2).replaceAll('.', ',')} USD</td>
                                    <td className=''>{parseFloat(this.state.pdfContent[0].governmentTaxes).toFixed(2).replaceAll('.', ',')} R$</td>
                                </tr>
                            }
                            {this.state.pdfContent[0].bankCharges > 0 &&
                                <tr>
                                    <td colSpan='2' className=''>BANK CHARGES</td>
                                    <td className=''>{parseFloat(this.state.pdfContent[0].bankCharges / this.state.pdfContent[0].roe).toFixed(2).replaceAll('.', ',')} USD</td>
                                    <td className=''>{parseFloat(this.state.pdfContent[0].bankCharges).toFixed(2).replaceAll('.', ',')} R$</td>
                                </tr>
                            }
                            <tr>
                                <td colSpan='2' className=' pdfTitle'>Total</td>
                                <td className=''>{parseFloat(valorTotal / this.state.pdfContent[0].roe).toFixed(2).replaceAll('.', ',')} USD</td>
                                <td className=''>{parseFloat(valorTotal).toFixed(2).replaceAll('.', ',')} R$</td>
                            </tr>
                        </table>
                    </div>
                </div>
        } else {
            await this.setState({ erro: 'Sem as informações necessárias para gerar o pdf!', loading: false })
            return;
        }

        await this.setState({ pdfgerado: pdf })
        this.handleExportWithComponent()
    }

    enviaDocumento = async () => {
        await this.setState({ loading: true })
        let documento = '';
        let format = '';
        let ext = '';
        if (this.state.documento[0]) {
            documento = await util.getBase64(this.state.documento[0]);
            format = this.state.documento[0].type;
            ext = this.state.documentoNome.split('.')[this.state.documentoNome.split('.').length - 1];
        }
        if (!this.state.documentoEditar) {
            let documentoDescricao = this.state.documentoCaminho.split('.')

            documentoDescricao[documentoDescricao.length - 1] = ext

            await this.setState({
                dadosFinaisDoc: [
                    { titulo: 'descricao', valor: this.state.documentoDescricao },
                    { titulo: 'tipo_doto', valor: this.state.documentoTipo },
                    { titulo: 'caminho', valor: documentoDescricao.join('') }
                ]
            })

            await apiEmployee.post(`enviaDocumento.php`, {
                documento: documento,
                format: format,
                ext: ext,
                chave_os: this.state.chave,
                chave_osi: 0,
                descricao: this.state.documentoDescricao,
                tipo: this.state.documentoTipo,
            }).then(
                async res => {
                    await loader.salvaLogs('os_documentos', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].chave);

                    window.location.reload();
                },
                async res => await console.log(`Erro: ${res}`)
            )
        } else {
            if (this.state.documentoTrocar) {
                await apiEmployee.post(`trocaDocumento.php`, {
                    documento: documento,
                    format: format,
                    ext: ext,
                    chave: this.state.documentoChave,
                    descricao: this.state.documentoDescricao,
                    tipo: this.state.documentoTipo,
                    caminho: this.state.documentoCaminho
                }).then(
                    async res => {
                        await loader.salvaLogs('os_documentos', this.state.usuarioLogado.codigo, this.state.dadosIniciaisDoc, this.state.dadosFinaisDoc, this.state.documentoChave);

                        window.location.reload();
                    },
                    async res => await console.log(`Erro: ${res}`)
                )
            } else {
                await apiEmployee.post(`updateDocumento.php`, {
                    chave: this.state.documentoChave,
                    descricao: this.state.documentoDescricao,
                    tipo: this.state.documentoTipo,
                }).then(
                    async res => {
                        await loader.salvaLogs('os_documentos', this.state.usuarioLogado.codigo, this.state.dadosIniciaisDoc, this.state.dadosFinaisDoc, this.state.documentoChave);

                        window.location.reload();
                    },
                    async res => await console.log(`Erro: ${res}`)
                )
            }
        }
    }

    mudaValorSolicitacao = async () => {
        this.setState({
            dadosFinaisSol: [
                { titulo: 'Moeda', valor: this.state.solicitacaoMoeda },
                { titulo: 'valor', valor: this.state.solicitacaoValor }
            ]
        })

        await apiEmployee.post(`updateSolicitacaoValor.php`, {
            chave: this.state.solicitacaoChave,
            Moeda: this.state.solicitacaoMoeda,
            valor: this.state.solicitacaoValor,
        }).then(
            async res => {
                await loader.salvaLogs('os_servicos_itens', this.state.usuarioLogado.codigo, this.state.dadosIniciaisSol, this.state.dadosFinaisSol, this.state.solicitacaoChave);

                await this.setState({ loading: true })
                window.location.reload();
            },
            async err => await console.log(`Erro: ${err}`)
        )
    }

    handleExportWithComponent = event => {
        this.pdfExportComponent.current.save();
        this.setState({ loading: false })
    };

    openLogs = async () => {
        let logs = await loader.getLogsOS(this.state.chave, this.state.todasSolicitacoes.map((e) => e.chave));

        logs = logs.map((e) => {
            if (e.Tabela == "os_servicos_itens" && (e.Campos.includes('Inclusão') || e.Campos.includes('Cancelamento'))) {
                return { ...e, Campos: `Solicitação de Serviço: ${e.Campos}` }
            } else {
                return { ...e }
            }
        })


        await this.setState({ logs, modalLog: true })
    }


    render() {
        const validations = []
        validations.push(this.state.abertura)
        validations.push(this.state.chegada)
        validations.push(this.state.cliente)
        validations.push(this.state.navio)
        validations.push(this.state.tipoServico)
        validations.push(this.state.empresa)
        validations.push(!this.state.bloqueado)

        const validForm = validations.reduce((t, a) => t && a)


        return (
            <div className='allContent'>
                <div
                    style={{
                        position: "absolute",
                        left: "-900000px",
                        top: 0,
                    }}


                >
                    <PDFExport
                        fileName={this.state.pdfNome}
                        scale={0.6}
                        landscape={false}

                        paperSize="A4"
                        margin="0.5cm"
                        forcePageBreak=".page-break"
                        ref={this.pdfExportComponent}>
                        {this.state.pdfgerado}
                    </PDFExport>
                </div>

                {this.state.loading &&
                    <Skeleton />
                }

                {this.state.redirect &&
                    <Redirect to={'/'} />
                }

                {this.state.finalizaOperacao &&
                    <Redirect to={{ pathname: '/ordensservico/os', state: { chave: this.state.codigo } }} />
                }

                {!this.state.loading &&
                    <>
                        <Modal
                            aria-labelledby="transition-modal-title"
                            aria-describedby="transition-modal-description"
                            style={{ display: 'flex', justifyContent: 'center', paddingTop: '5%', paddingBottom: '5%', overflow: 'scroll' }}
                            open={this.state.documentoModal}
                            onClose={async () => await this.setState({ documentoModal: false })}
                        >
                            <div className='modalContainer'>
                                <div className='modalCriar'>
                                    <div className='containersairlistprodmodal'>
                                        <div className='botaoSairModal' onClick={async () => await this.setState({ documentoModal: false, documentoTrocar: true })}>
                                            <span>X</span>
                                        </div>
                                    </div>
                                    <div className='modalContent'>
                                        <div className='tituloModal'>
                                            <span>Enviar documento:</span>
                                        </div>


                                        <div className='modalForm'>
                                            <Formik
                                                initialValues={{
                                                    name: '',
                                                }}
                                                onSubmit={async values => {
                                                    await new Promise(r => setTimeout(r, 1000))
                                                    await this.enviaDocumento();

                                                }}
                                            >
                                                <Form className="contact-form" >


                                                    <div className="row">

                                                        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 ">

                                                            <div className="row addservicos">
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Descrição:</label>
                                                                </div>
                                                                <div className="col-1 errorMessage">

                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Field className="form-control" type="text" value={this.state.documentoDescricao} onChange={async e => { this.setState({ documentoDescricao: e.currentTarget.value }) }} />
                                                                </div>
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Tipo:</label>
                                                                </div>
                                                                <div className="col-1 errorMessage">

                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Select className='SearchSelect' options={this.state.tiposDocumentoOptions.filter(e => this.filterSearch(e, this.state.tiposDocumentoOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ tiposDocumentoOptionsTexto: e }) }} value={this.state.tiposDocumentoOptions.filter(option => option.value == this.state.documentoTipo)[0]} search={true} onChange={(e) => { this.setState({ documentoTipo: e.value, }) }} />
                                                                </div>
                                                                {this.state.documentoEditar &&
                                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                        <label>Trocar documento?</label>
                                                                    </div>
                                                                }
                                                                {this.state.documentoEditar &&
                                                                    <div className='col-1'></div>
                                                                }
                                                                {this.state.documentoEditar &&
                                                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                        <input className='form_control' checked={this.state.documentoTrocar} onChange={(e) => { this.setState({ documentoTrocar: e.target.checked }) }} type="checkbox" />
                                                                    </div>
                                                                }
                                                                {this.state.documentoTrocar &&
                                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                        <label>Arquivo:</label>
                                                                    </div>
                                                                }
                                                                {this.state.documentoTrocar &&
                                                                    <div className="col-1 errorMessage">
                                                                    </div>
                                                                }
                                                                {this.state.documentoTrocar &&
                                                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                        <Field className="form-control" type="file" value={this.state.documentoNome} onChange={async e => { this.setState({ documento: e.currentTarget.files, documentoNome: e.currentTarget.value }) }} />
                                                                    </div>
                                                                }
                                                                {this.state.documentoTrocar &&
                                                                    <div className="col-1"></div>
                                                                }

                                                            </div>
                                                        </div>
                                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                                    </div>

                                                    <div className="row">
                                                        <div className="col-2"></div>
                                                        <div className="col-8" style={{ display: 'flex', justifyContent: 'center' }}>
                                                            <button type="submit" style={{ width: 300 }} >Enviar</button>
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
                        <ModalListas
                            alteraModal={this.alteraModal}
                            alteraNavio={this.alteraNavio}
                            alteraPorto={this.alteraPorto}
                            alteraCliente={this.alteraCliente}
                            alteraTipoServico={this.alteraTipoServico}
                            alteraCentroCusto={this.alteraCentroCusto}
                            acessosPermissoes={this.state.acessosPermissoes}
                            modalAberto={this.state.modalAberto}
                            modal={this.state.modal}
                            modalLista={this.state.modalLista}
                            pesquisa={this.state.modalPesquisa}
                            closeModal={() => { this.setState({ modalAberto: false }) }}
                        />
                        <ModalItem
                            closeModal={() => { this.setState({ modalItemAberto: false }) }}
                            itens={this.state.itemInfo}
                            nome={this.state.itemNome}
                            chave={this.state.itemChave}
                            modalAberto={this.state.modalItemAberto}
                            itemPermissao={this.state.itemPermissao}
                            itemAdd={this.state.itemAdd}
                            itemEdit={this.state.itemEdit}
                            itemDelete={this.state.itemDelete}
                            acessosPermissoes={this.state.acessosPermissoes}
                            solicitacao
                            itemFinanceiro={this.state.itemFinanceiro}
                            itemEditMini={this.state.itemEditMini}
                        />

                        <section>
                            <Header voltarOS titulo="OS" chave={this.state.codigo != 0 ? this.state.codigo : ''} />
                            <br />
                        </section>
                        <div style={{ width: '100%', textAlign: 'center', marginTop: '-20px', marginBottom: '2%' }}>
                            <h6 style={{ color: 'red' }}>{this.state.erro}</h6>
                        </div>
                        <br />
                        <br />
                        <br />

                        {this.state.chave != 0 && this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'LOGS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                            <div className="logButton">
                                <button onClick={() => this.openLogs()}>Logs</button>
                            </div>
                        }

                        <ModalLogs
                            closeModal={() => { this.setState({ modalLog: false }) }}
                            logs={this.state.logs}
                            nome={this.state.viagem}
                            chave={this.state.chave}
                            modalAberto={this.state.modalLog}
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
                                            this.salvarOS(validForm)
                                        }}
                                    >
                                        <Form className="contact-form" >

                                            <div className="row">
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2"></div>

                                                <div className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12 ">

                                                    {/*CRIAÇÃO*/}
                                                    {this.state.chave == 0 &&
                                                        <div className="row addservicos">
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel">
                                                                <label>Data Abertura</label>
                                                            </div>
                                                            <div className="col-1 errorMessage">
                                                                {!this.state.abertura &&
                                                                    <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                }
                                                            </div>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                                <Field className="form-control" type="date" disabled value={this.state.abertura} />
                                                            </div>
                                                            <div className="col-1"></div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Navio</label>
                                                            </div>
                                                            <div className="col-1 errorMessage">
                                                                {!this.state.navio &&
                                                                    <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                }
                                                            </div>
                                                            <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                                                <Select className='SearchSelect' onClick={async () => {

                                                                }} options={this.state.naviosOptions.filter(e => this.filterSearch(e, this.state.naviosOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ naviosOptionsTexto: e }) }} value={this.state.naviosOptions.filter(option => option.value == this.state.navio)[0]} search={true} onChange={(e) => { this.setState({ navio: e.value, }) }} />
                                                            </div>
                                                            <div className="col-xl-1 col-lg-2 col-md-2 col-sm-10 col-10">
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
                                                            <div className="col-1">
                                                            </div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Porto</label>
                                                            </div>
                                                            <div className="col-1 errorMessage">
                                                                {!this.state.porto &&
                                                                    <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                }
                                                            </div>
                                                            <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                                                <Select className='SearchSelect' options={this.state.portosOptions.filter(e => this.filterSearch(e, this.state.portosOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ portosOptionsTexto: e }) }} value={this.state.portosOptions.filter(option => option.value == this.state.porto)[0]} search={true} onChange={(e) => { this.setState({ porto: e.value, }) }} />
                                                            </div>
                                                            <div className="col-xl-1 col-lg-2 col-md-2 col-sm-12 col-12">
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
                                                            <div className="col-1">
                                                            </div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Cliente</label>
                                                            </div>
                                                            <div className="col-1 errorMessage">
                                                                {!this.state.cliente &&
                                                                    <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                }
                                                            </div>
                                                            <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                                                <Select className='SearchSelect' options={this.state.clientesOptions.filter(e => this.filterSearch(e, this.state.clientesOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ clientesOptionsTexto: e }) }} value={this.state.clientesOptions.filter(option => option.value == this.state.cliente)[0]} search={true} onChange={(e) => { this.setState({ cliente: e.value, }) }} />
                                                            </div>
                                                            <div className="col-xl-1 col-lg-2 col-md-2 col-sm-12 col-12">
                                                                {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                                                    <div className='insideFormButton' onClick={async () => {
                                                                        if (this.state.clientes[0]) { } else {
                                                                            await this.setState({
                                                                                clientes: await loader.getBase('getClientes.php')
                                                                            })
                                                                        }
                                                                        await this.setState({ modalAberto: true, modal: 'listarCliente', modalPesquisa: this.state.cliente, modalLista: this.state.clientes })
                                                                    }}>...</div>
                                                                }
                                                            </div>
                                                            <div className="col-1">
                                                            </div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Tipos de Serviço</label>
                                                            </div>
                                                            <div className="col-1 errorMessage">
                                                                {!this.state.tipoServico &&
                                                                    <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                }
                                                            </div>
                                                            <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                                                <Select className='SearchSelect' options={this.state.tiposServicosOptions.filter(e => this.filterSearch(e, this.state.tiposServicosOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ tiposServicosOptionsTexto: e }) }} value={this.state.tiposServicosOptions.filter(option => option.value == this.state.tipoServico)[0]} search={true} onChange={(e) => { this.setState({ tipoServico: e.value, }) }} />
                                                            </div>
                                                            <div className="col-xl-1 col-lg-2 col-md-2 col-sm-12 col-12">
                                                                {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'TIPOS_SERVICOS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                                                    <div className='insideFormButton' onClick={async () => {
                                                                        if (this.state.tiposServicos[0]) { } else {
                                                                            await this.setState({
                                                                                tiposServicos: await loader.getBase('getTiposServicos.php')
                                                                            })
                                                                        }
                                                                        await this.setState({ modalAberto: true, modal: 'listarTiposServicos', modalPesquisa: this.state.tipoServico, modalLista: this.state.tiposServicos })
                                                                    }}>...</div>
                                                                }
                                                            </div>
                                                            <div className="col-1">

                                                            </div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Remarks</label>
                                                            </div>
                                                            <div className="col-1 errorMessage">
                                                            </div>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                                <Field className="form-control" type="text" value={this.state.descricao} onChange={async e => { this.setState({ descricao: e.currentTarget.value }) }} />
                                                            </div>
                                                            <div className="col-1"></div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>E.T.A.</label>
                                                            </div>
                                                            <div className="col-1 errorMessage">
                                                            </div>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                                <Field className="form-control" type="date" value={this.state.eta} onChange={async e => { this.setState({ eta: e.currentTarget.value }) }} />
                                                            </div>
                                                            <div className="col-1"></div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>E.T.B.</label>
                                                            </div>
                                                            <div className="col-1 errorMessage">
                                                            </div>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                                <Field className="form-control" type="date" value={this.state.etb} onChange={async e => { this.setState({ etb: e.currentTarget.value }) }} />
                                                            </div>
                                                            <div className="col-1"></div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>A.T.B</label>
                                                            </div>
                                                            <div className="col-1 errorMessage">
                                                            </div>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                                <Field className="form-control" type="date" value={this.state.atb} onChange={async e => { this.setState({ atb: e.currentTarget.value }) }} />
                                                            </div>
                                                            <div className="col-1"></div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Government Taxes</label>
                                                            </div>
                                                            <div className='col-1 errorMessage'>
                                                            </div>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                <Field className="form-control text-right" type="text" step="0.1" value={this.state.governmentTaxes} onClick={(e) => e.target.select()} onChange={async e => { this.setState({ governmentTaxes: e.currentTarget.value }) }} onBlur={async e => { this.setState({ governmentTaxes: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR').format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
                                                            </div>
                                                            <div className='col-1 errorMessage'>
                                                            </div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Bank Charges</label>
                                                            </div>
                                                            <div className='col-1 errorMessage'>
                                                            </div>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                <Field className="form-control text-right" type="text" step="0.1" value={this.state.bankCharges} onClick={(e) => e.target.select()} onChange={async e => { this.setState({ bankCharges: e.currentTarget.value }) }} onBlur={async e => { this.setState({ bankCharges: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR').format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
                                                            </div>
                                                            <div className='col-1 errorMessage'>
                                                            </div>

                                                        </div>
                                                    }


                                                    {/*EDIÇÃO*/}
                                                    {this.state.chave != 0 &&

                                                        <div className="row addservicos">
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel">
                                                                <label>Codigo</label>
                                                            </div>
                                                            <div className='col-1'></div>
                                                            <div className="col-xl-2 col-lg-2 col-md-3 col-sm-10 col-10">
                                                                <Field className="form-control" type="text" disabled value={this.state.codigo.Proximo ? `TS${this.state.codigo.Proximo}` : this.state.codigo ? this.state.codigo : ''} />
                                                            </div>
                                                            <div className='col-xl-5 col-lg-5 col-md-3 col-sm-1 col-1'></div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Data Abertura</label>
                                                            </div>
                                                            <div className="col-1 errorMessage">
                                                                {!this.state.abertura &&
                                                                    <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                }
                                                            </div>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                                <Field className="form-control" type="date" disabled value={this.state.abertura} />
                                                            </div>
                                                            <div className="col-1"></div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Navio</label>
                                                            </div>
                                                            <div className="col-1 errorMessage">
                                                                {!this.state.navio &&
                                                                    <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                }
                                                            </div>
                                                            <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10 ">
                                                                <Select className='SearchSelect' options={this.state.naviosOptions.filter(e => this.filterSearch(e, this.state.naviosOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ naviosOptionsTexto: e }) }} value={this.state.naviosOptions.filter(option => option.value == this.state.navio)[0]} search={true} onChange={(e) => { this.setState({ navio: e.value, }) }} />
                                                            </div>
                                                            <div className="col-xl-1 col-lg-2 col-md-2 col-sm-12 col-12">
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
                                                            <div className="col-1">
                                                            </div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Porto</label>
                                                            </div>
                                                            <div className="col-1 errorMessage">
                                                                {!this.state.porto &&
                                                                    <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                }
                                                            </div>
                                                            <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                                                <Select className='SearchSelect' options={this.state.portosOptions.filter(e => this.filterSearch(e, this.state.portosOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ portosOptionsTexto: e }) }} value={this.state.portosOptions.filter(option => option.value == this.state.porto)[0]} search={true} onChange={(e) => { this.setState({ porto: e.value, }) }} />
                                                            </div>
                                                            <div className="col-xl-1 col-lg-2 col-md-2 col-sm-12 col-12">
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
                                                            <div className="col-1">
                                                            </div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Cliente</label>
                                                            </div>
                                                            <div className="col-1 errorMessage">
                                                                {!this.state.cliente &&
                                                                    <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                }
                                                            </div>
                                                            <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                                                <Select className='SearchSelect' options={this.state.clientesOptions.filter(e => this.filterSearch(e, this.state.clientesOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ clientesOptionsTexto: e }) }} value={this.state.clientesOptions.filter(option => option.value == this.state.cliente)[0]} search={true} onChange={(e) => { this.setState({ cliente: e.value, }) }} />
                                                            </div>
                                                            <div className="col-xl-1 col-lg-2 col-md-2 col-sm-12 col-12">
                                                                {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                                                    <div className='insideFormButton' onClick={async () => {
                                                                        if (this.state.clientes[0]) { } else {
                                                                            await this.setState({
                                                                                clientes: await loader.getBase('getClientes.php')
                                                                            })
                                                                        }
                                                                        await this.setState({ modalAberto: true, modal: 'listarCliente', modalPesquisa: this.state.cliente, modalLista: this.state.clientes })
                                                                    }}>...</div>
                                                                }
                                                            </div>
                                                            <div className="col-1">
                                                            </div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Tipos de Serviço</label>
                                                            </div>
                                                            <div className="col-1 errorMessage">
                                                                {!this.state.tipoServico &&
                                                                    <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                }
                                                            </div>
                                                            <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                                                <Select className='SearchSelect' options={this.state.tiposServicosOptions.filter(e => this.filterSearch(e, this.state.tiposServicosOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ tiposServicosOptionsTexto: e }) }} value={this.state.tiposServicosOptions.filter(option => option.value == this.state.tipoServico)[0]} search={true} onChange={(e) => { this.setState({ tipoServico: e.value, }) }} />
                                                            </div>
                                                            <div className="col-xl-1 col-lg-2 col-md-2 col-sm-12 col-12">
                                                                {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'TIPOS_SERVICOS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                                                    <div className='insideFormButton' onClick={async () => {
                                                                        if (this.state.tiposServicos[0]) { } else {
                                                                            await this.setState({
                                                                                tiposServicos: await loader.getBase('getTiposServicos.php')
                                                                            })
                                                                        }
                                                                        await this.setState({ modalAberto: true, modal: 'listarTiposServicos', modalPesquisa: this.state.tipoServico, modalLista: this.state.tiposServicos })
                                                                    }}>...</div>
                                                                }
                                                            </div>
                                                            <div className="col-1">

                                                            </div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Remarks</label>
                                                            </div>
                                                            <div className="col-1 errorMessage">
                                                            </div>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                                <Field className="form-control" type="text" value={this.state.descricao} onChange={async e => { this.setState({ descricao: e.currentTarget.value }) }} />
                                                            </div>
                                                            <div className="col-1"></div>

                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>E.T.A.</label>
                                                            </div>
                                                            <div className="col-1 errorMessage">
                                                            </div>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                                <Field className="form-control" type="date" value={this.state.eta} onChange={async e => { this.setState({ eta: e.currentTarget.value }) }} />
                                                            </div>
                                                            <div className="col-1"></div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>E.T.B.</label>
                                                            </div>
                                                            <div className="col-1 errorMessage">
                                                            </div>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                                <Field className="form-control" type="date" value={this.state.etb} onChange={async e => { this.setState({ etb: e.currentTarget.value }) }} />
                                                            </div>
                                                            <div className="col-1"></div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>A.T.B</label>
                                                            </div>
                                                            <div className="col-1 errorMessage">
                                                            </div>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                                <Field className="form-control" type="date" value={this.state.atb} onChange={async e => { this.setState({ atb: e.currentTarget.value }) }} />
                                                            </div>
                                                            <div className="col-1"></div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Government Taxes</label>
                                                            </div>
                                                            <div className='col-1 errorMessage'>
                                                            </div>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                <Field className="form-control text-right" type="text" step="0.1" value={this.state.governmentTaxes} onClick={(e) => e.target.select()} onChange={async e => { this.setState({ governmentTaxes: e.currentTarget.value }) }} onBlur={async e => { this.setState({ governmentTaxes: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR').format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
                                                            </div>
                                                            <div className='col-1 errorMessage'>
                                                            </div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Bank Charges</label>
                                                            </div>
                                                            <div className='col-1 errorMessage'>
                                                            </div>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                <Field className="form-control text-right" type="text" step="0.1" value={this.state.bankCharges} onClick={(e) => e.target.select()} onChange={async e => { this.setState({ bankCharges: e.currentTarget.value }) }} onBlur={async e => { this.setState({ bankCharges: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR').format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
                                                            </div>
                                                            <div className='col-1 errorMessage'>
                                                            </div>
                                                            <div>
                                                                <hr />
                                                            </div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>A.T.S</label>
                                                            </div>
                                                            <div className="col-1 errorMessage">
                                                            </div>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                                <Field className="form-control" type="date" value={this.state.saida} onChange={async e => { this.setState({ saida: e.currentTarget.value }) }} />
                                                            </div>
                                                            <div className="col-1"></div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Data Encerramento</label>
                                                            </div>
                                                            <div className="col-1 errorMessage">
                                                            </div>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                                <Field className="form-control" type="date" value={this.state.encerramento} onChange={async e => { await this.setState({ encerramento: e.currentTarget.value }); await this.setState({ encerradoPor: this.state.encerramento == '' ? '' : this.state.usuarioLogado.codigo }) }} />
                                                            </div>
                                                            <div className="col-1"></div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Data Faturamento</label>
                                                            </div>
                                                            <div className="col-1 errorMessage">
                                                            </div>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                                <Field className="form-control" type="date" value={this.state.faturamento} onChange={async e => { await this.setState({ faturamento: e.currentTarget.value }); await this.setState({ faturadoPor: this.state.faturamento == '' ? '' : this.state.usuarioLogado.codigo }) }} />
                                                            </div>
                                                            <div className="col-1"></div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Centro de Custo</label>
                                                            </div>
                                                            <div className="col-1 errorMessage">
                                                            </div>
                                                            <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                                                <Select className='SearchSelect' options={this.state.centrosCustosOptions.filter(e => this.filterSearchCentroCusto(e, this.state.centrosCustosOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ centrosCustosOptionsTexto: e }) }} value={this.state.centrosCustosOptions.filter(option => option.value == this.state.centroCusto)[0]} search={true} onChange={(e) => { this.setState({ centroCusto: e.value, }) }} />
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
                                                            <div className="col-1">
                                                            </div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>R.O.E.</label>
                                                            </div>
                                                            <div className="col-1 errorMessage">
                                                            </div>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                                <Field className="form-control" type="number" step="0.1" value={this.state.roe} onChange={async e => { this.setState({ roe: e.currentTarget.value }) }} />
                                                            </div>
                                                            <div className="col-1"></div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm ">
                                                                <label>Comentário Voucher</label>
                                                            </div>
                                                            <div className="col-1 errorMessage">
                                                            </div>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                                <Field className="form-control" type="text" value={this.state.comentario} onChange={async e => { this.setState({ comentario: e.currentTarget.value }) }} />
                                                            </div>
                                                            <div className="col-1"></div>

                                                        </div>
                                                    }


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

                                <br />

                                {this.props.match.params.id != 0 &&
                                    <div className='row'>
                                        <div className='col-2'></div>
                                        <div className='col-3'>
                                            <button className="btn btn-danger" onClick={() => this.CloseToReal(this.state.os.codigo)}>Close to Real</button>
                                        </div>
                                        <div className='col-3'>
                                            <button className="btn btn-danger" onClick={() => this.RelatorioVoucher(this.state.os.codigo)}>Relatório Voucher</button>
                                        </div>
                                        <div className='col-3'>
                                            <button className="btn btn-danger" onClick={() => this.CapaVoucher(this.state.os.codigo)}>Capa Voucher</button>
                                        </div>
                                    </div>
                                }

                                {this.props.match.params.id != 0 && this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'SERVICOS_ITENS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&

                                    <div>

                                        <div>
                                            <div>
                                                <div className="page-breadcrumb2"><h3>Solicitações de Serviços</h3></div>
                                            </div>
                                            <br />
                                            <div>
                                                <div>
                                                    <div className="row" id="product-list">
                                                        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 mix all dresses bags">
                                                            <div className="single-product-item">
                                                                <div className="row subtitulosTabela">
                                                                    <table className='addOsTable'>
                                                                        <tr>
                                                                            <th className='text-center'>
                                                                                <span>Chave</span>
                                                                            </th>
                                                                            {window.innerWidth >= 500 &&
                                                                                <th className='text-center'>
                                                                                    <span>Tipo</span>
                                                                                </th>
                                                                            }
                                                                            <th className='text-center'>
                                                                                <span>Ordem</span>
                                                                            </th>
                                                                            {window.innerWidth >= 500 &&
                                                                                <th className='text-center'>
                                                                                    <span>Descrição</span>
                                                                                </th>
                                                                            }
                                                                            <th className='text-center'>
                                                                                <span>Valor</span>
                                                                            </th>
                                                                            <th className='text-center'>
                                                                                <span>
                                                                                    {!this.state.solicitacoes[0] &&

                                                                                        <Link to=
                                                                                            {{
                                                                                                pathname: `/ordensservico/addsolicitacao/0`,
                                                                                                state: { solicitacao: {}, os: { ...this.state.os, addOS: true } }
                                                                                            }}
                                                                                        >
                                                                                            <FontAwesomeIcon icon={faPlus} />
                                                                                        </Link>
                                                                                    }
                                                                                </span>
                                                                            </th>
                                                                        </tr>
                                                                        {this.state.solicitacoes[0] != undefined && this.state.solicitacoes.map((feed, index) => (
                                                                            <>
                                                                                {window.innerWidth < 500 &&
                                                                                    <tr
                                                                                        onClick={() => {
                                                                                            this.setState({
                                                                                                solicitacaoChave: feed.chave,
                                                                                                solicitacaoMoeda: feed.Moeda,
                                                                                                solicitacaoValor: new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(feed.valor),
                                                                                                dadosIniciaisSol: [
                                                                                                    { titulo: 'Moeda', valor: feed.Moeda },
                                                                                                    { titulo: 'valor', valor: feed.valor },
                                                                                                ],
                                                                                                modalItemAberto: true,
                                                                                                itemInfo: [{ titulo: 'Chave', valor: feed.chave }, { titulo: 'Tipo', valor: this.state.tiposServicosItens[feed.tipo_sub] }, { titulo: 'Ordem', valor: feed.ordem.replaceAll(',', '.') }, { titulo: 'Fornecedor', valor: feed.fornecedorNome }, { titulo: "Fornecedor Custeio", valor: feed.fornecedorCusteioNome }],
                                                                                                itemNome: feed.descricao,
                                                                                                itemChave: feed.chave,
                                                                                                itemPermissao: "SERVICOS_ITENS",
                                                                                                itemAdd: {
                                                                                                    pathname: `/ordensservico/addsolicitacao/0`,
                                                                                                    state: { solicitacao: { ...feed }, os: { ...this.state.os, addOS: true } }
                                                                                                },
                                                                                                itemEdit: {
                                                                                                    pathname: `/ordensservico/addsolicitacao/${feed.chave}`,
                                                                                                    state: { solicitacao: { ...feed }, os: { ... this.state.os, addOS: true } }
                                                                                                },
                                                                                                itemFinanceiro: {
                                                                                                    pathname: `/ordensservico/addsolicitacaofinanceiro/${feed.chave}`,
                                                                                                    state: { solicitacao: { ...feed }, os: { ...this.state.os, addOS: true } }
                                                                                                },
                                                                                                itemEditMini: feed.repasse == 0 ? {
                                                                                                    onSubmit: async () => await this.mudaValorSolicitacao(),
                                                                                                    valores: [
                                                                                                        {
                                                                                                            half: true,
                                                                                                            titulo: "Valor",
                                                                                                            valor1: feed.Moeda,
                                                                                                            tipo1: "select",
                                                                                                            options1: this.state.moedasOptions,
                                                                                                            onChange1: async (valor) => { await this.setState({ solicitacaoMoeda: valor }); await this.reloadItemEditMini() },
                                                                                                            valor2: new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(feed.valor),
                                                                                                            tipo2: "text",
                                                                                                            onChange2: async (valor) => { await this.setState({ solicitacaoValor: valor }); await this.reloadItemEditMini() },
                                                                                                            onBlur2: async (valor) => { await this.setState({ solicitacaoValor: Number(valor.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR').format(valor.replaceAll('.', '').replaceAll(',', '.')) : '' }); await this.reloadItemEditMini() },
                                                                                                        }
                                                                                                    ]
                                                                                                } : false,
                                                                                                itemDelete: this.deleteServicoItem
                                                                                            })
                                                                                        }}
                                                                                        className={index % 2 == 0 ? "parTr" : "imparTr"}>
                                                                                        <td className="text-center">
                                                                                            <p>{feed.chave}</p>
                                                                                        </td>
                                                                                        <td className="text-center">
                                                                                            <p>{feed.ordem.replaceAll(',', '.')}</p>
                                                                                        </td>
                                                                                        <td className="text-center">
                                                                                            <p>{feed.Sigla}{new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(feed.valor)}</p>
                                                                                        </td>
                                                                                        <td>
                                                                                            <span className='iconelixo giveMargin' type='button' >
                                                                                                <Link to=
                                                                                                    {{
                                                                                                        pathname: `/ordensservico/addsolicitacao/0`,
                                                                                                        state: { solicitacao: { ...feed }, os: { ...this.state.os } }
                                                                                                    }}
                                                                                                >
                                                                                                    <FontAwesomeIcon icon={faPlus} />
                                                                                                </Link>
                                                                                            </span>


                                                                                            <span className='iconelixo giveMargin' type='button' >
                                                                                                <Link to=
                                                                                                    {{
                                                                                                        pathname: `/ordensservico/addsolicitacao/${feed.chave}`,
                                                                                                        state: { solicitacao: { ...feed }, os: { ... this.state.os } }
                                                                                                    }}
                                                                                                >
                                                                                                    <FontAwesomeIcon icon={faPen} />
                                                                                                </Link>
                                                                                            </span>

                                                                                            <span className='iconelixo giveMargin' type='button' >
                                                                                                <Link to=
                                                                                                    {{
                                                                                                        pathname: `/ordensservico/addsolicitacaofinanceiro/${feed.chave}`,
                                                                                                        state: { solicitacao: { ...feed }, os: { ...this.state.os } }
                                                                                                    }}
                                                                                                >
                                                                                                    <FontAwesomeIcon icon={faDollarSign} />
                                                                                                </Link>
                                                                                            </span>

                                                                                            {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'SERVICOS_ITENS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                                                                                <span type='button' className='iconelixo' onClick={(a) => this.deleteServicoItem(feed.chave, feed.descricao)} >
                                                                                                    <FontAwesomeIcon icon={faTimes} />
                                                                                                </span>
                                                                                            }
                                                                                        </td>
                                                                                    </tr>
                                                                                }
                                                                                {window.innerWidth >= 500 &&
                                                                                    <tr
                                                                                        onClick={() => {
                                                                                            this.setState({
                                                                                                solicitacaoChave: feed.chave,
                                                                                                solicitacaoMoeda: feed.Moeda,
                                                                                                solicitacaoValor: new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(feed.valor),
                                                                                                dadosIniciaisSol: [
                                                                                                    { titulo: 'Moeda', valor: feed.Moeda },
                                                                                                    { titulo: 'valor', valor: feed.valor },
                                                                                                ],
                                                                                                modalItemAberto: true,
                                                                                                itemInfo: [{ titulo: 'Chave', valor: feed.chave }, { titulo: 'Tipo', valor: this.state.tiposServicosItens[feed.tipo_sub] }, { titulo: 'Ordem', valor: feed.ordem.replaceAll(',', '.') }, { titulo: 'Fornecedor', valor: feed.fornecedorNome }, { titulo: "Fornecedor Custeio", valor: feed.fornecedorCusteioNome }],
                                                                                                itemNome: feed.descricao,
                                                                                                itemChave: feed.chave,
                                                                                                itemPermissao: "SERVICOS_ITENS",
                                                                                                itemAdd: {
                                                                                                    pathname: `/ordensservico/addsolicitacao/0`,
                                                                                                    state: { solicitacao: { ...feed }, os: { ...this.state.os, addOS: true } }
                                                                                                },
                                                                                                itemEdit: {
                                                                                                    pathname: `/ordensservico/addsolicitacao/${feed.chave}`,
                                                                                                    state: { solicitacao: { ...feed }, os: { ... this.state.os, addOS: true } }
                                                                                                },
                                                                                                itemFinanceiro: {
                                                                                                    pathname: `/ordensservico/addsolicitacaofinanceiro/${feed.chave}`,
                                                                                                    state: { solicitacao: { ...feed }, os: { ...this.state.os, addOS: true } }
                                                                                                },
                                                                                                itemEditMini: feed.repasse == 0 ? {
                                                                                                    onSubmit: async () => await this.mudaValorSolicitacao(),
                                                                                                    valores: [
                                                                                                        {
                                                                                                            half: true,
                                                                                                            titulo: "Valor",
                                                                                                            valor1: feed.Moeda,
                                                                                                            tipo1: "select",
                                                                                                            options1: this.state.moedasOptions,
                                                                                                            onChange1: async (valor) => { await this.setState({ solicitacaoMoeda: valor }); await this.reloadItemEditMini() },
                                                                                                            valor2: new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(feed.valor),
                                                                                                            tipo2: "text",
                                                                                                            onChange2: async (valor) => { await this.setState({ solicitacaoValor: valor }); await this.reloadItemEditMini() },
                                                                                                            onBlur2: async (valor) => { await this.setState({ solicitacaoValor: Number(valor.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR').format(valor.replaceAll('.', '').replaceAll(',', '.')) : '' }); await this.reloadItemEditMini() },
                                                                                                        }
                                                                                                    ]
                                                                                                } : false,
                                                                                                itemDelete: this.deleteServicoItem
                                                                                            })
                                                                                        }}
                                                                                        className={index % 2 == 0 ? "parTr" : "imparTr"}>
                                                                                        <td className="text-center">
                                                                                            <p>{feed.chave}</p>
                                                                                        </td>
                                                                                        <td className="text-center">
                                                                                            <p>{this.state.tiposServicosItens[feed.tipo_sub]}</p>
                                                                                        </td>
                                                                                        <td className="text-center">
                                                                                            <p>{feed.ordem.replaceAll(',', '.')}</p>
                                                                                        </td>
                                                                                        <td className="text-center">
                                                                                            <p>{feed.descricao}</p>
                                                                                        </td>
                                                                                        <td className="text-center">
                                                                                            <p>{feed.Sigla}{new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(feed.valor)}</p>
                                                                                        </td>
                                                                                        <td>
                                                                                            <span className='iconelixo giveMargin' type='button' >
                                                                                                <Link to=
                                                                                                    {{
                                                                                                        pathname: `/ordensservico/addsolicitacao/0`,
                                                                                                        state: { solicitacao: { ...feed }, os: { ...this.state.os } }
                                                                                                    }}
                                                                                                >
                                                                                                    <FontAwesomeIcon icon={faPlus} />
                                                                                                </Link>
                                                                                            </span>


                                                                                            <span className='iconelixo giveMargin' type='button' >
                                                                                                <Link to=
                                                                                                    {{
                                                                                                        pathname: `/ordensservico/addsolicitacao/${feed.chave}`,
                                                                                                        state: { solicitacao: { ...feed }, os: { ... this.state.os } }
                                                                                                    }}
                                                                                                >
                                                                                                    <FontAwesomeIcon icon={faPen} />
                                                                                                </Link>
                                                                                            </span>

                                                                                            <span className='iconelixo giveMargin' type='button' >
                                                                                                <Link to=
                                                                                                    {{
                                                                                                        pathname: `/ordensservico/addsolicitacaofinanceiro/${feed.chave}`,
                                                                                                        state: { solicitacao: { ...feed }, os: { ...this.state.os } }
                                                                                                    }}
                                                                                                >
                                                                                                    <FontAwesomeIcon icon={faDollarSign} />
                                                                                                </Link>
                                                                                            </span>

                                                                                            {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'SERVICOS_ITENS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                                                                                <span type='button' className='iconelixo' onClick={(a) => this.deleteServicoItem(feed.chave, feed.descricao)} >
                                                                                                    <FontAwesomeIcon icon={faTimes} />
                                                                                                </span>
                                                                                            }
                                                                                        </td>
                                                                                    </tr>
                                                                                }
                                                                            </>
                                                                        ))}

                                                                    </table>


                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                }
                                {this.props.match.params.id != 0 && this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'DOCUMENTOS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&

                                    <div>

                                        <div>
                                            <div>
                                                <div className="page-breadcrumb2"><h3>Documentos</h3></div>
                                            </div>
                                            <br />
                                            <div>
                                                <div>
                                                    <div className="row" id="product-list">
                                                        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 mix all dresses bags">
                                                            <div className="single-product-item">
                                                                <div className="row subtitulosTabela">
                                                                    <table className='addOsTable'>
                                                                        <tr>
                                                                            <th className='text-center'>
                                                                                <span>Chave</span>
                                                                            </th>
                                                                            <th className='text-center'>
                                                                                <span>Descrição</span>
                                                                            </th>
                                                                            <th className='text-center'>
                                                                                <span>Nome</span>
                                                                            </th>
                                                                            <th className='text-center'>
                                                                                <span>
                                                                                    <Link>
                                                                                        <FontAwesomeIcon icon={faPlus} onClick={() => this.setState({ documentoModal: true })} />
                                                                                    </Link>
                                                                                </span>
                                                                            </th>
                                                                        </tr>
                                                                        {this.state.documentos[0] != undefined && this.state.documentos.filter((e) => e.chave_os_itens == 0).map((feed, index) => (
                                                                            <tr className={index % 2 == 0 ? "parTr" : "imparTr"}>
                                                                                <td className="text-center">
                                                                                    <a href={`${CAMINHO_DOCUMENTOS}${feed.caminho}`} className='nonlink' target='_blank'>
                                                                                        <p>{feed.chave}</p>
                                                                                    </a>
                                                                                </td>
                                                                                <td className="text-center">
                                                                                    <a href={`${CAMINHO_DOCUMENTOS}${feed.caminho}`} className='nonlink' target='_blank'>
                                                                                        <p>{feed.descricao}</p>
                                                                                    </a>
                                                                                </td>
                                                                                <td className="text-center">
                                                                                    <a href={`${CAMINHO_DOCUMENTOS}${feed.caminho}`} className='nonlink' target='_blank'>
                                                                                        <p>{feed.caminho}</p>
                                                                                    </a>
                                                                                </td>
                                                                                <td>
                                                                                    <span className='iconelixo giveMargin' type='button' >
                                                                                        <FontAwesomeIcon icon={faPlus} onClick={() => this.setState({ documentoModal: true, documentoDescricao: '', documentoTipo: '', documentoNome: '', documentoEditar: false })} />
                                                                                    </span>

                                                                                    <span className='iconelixo giveMargin'>
                                                                                        <FontAwesomeIcon icon={faPen} onClick={() => this.setState({
                                                                                            documentoModal: true,
                                                                                            documentoDescricao: feed.descricao,
                                                                                            documentoTipo: feed.tipo_docto,
                                                                                            documentoNome: '',
                                                                                            documentoTrocar: false,
                                                                                            documentoEditar: true,
                                                                                            documentoChave: feed.chave,
                                                                                            documentoCaminho: feed.caminho,

                                                                                            dadosIniciaisDoc: [
                                                                                                { titulo: 'descricao', valor: feed.descricao },
                                                                                                { titulo: 'tipo_doto', valor: feed.tipo_docto },
                                                                                                { titulo: 'caminho', valor: feed.caminho },
                                                                                            ]
                                                                                        })} />
                                                                                    </span>

                                                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'DOCUMENTOS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                                                                        <span type='button' className='iconelixo' onClick={(a) => this.deleteDocumento(feed.chave, feed.descricao, feed.caminho)} >
                                                                                            <FontAwesomeIcon icon={faTrashAlt} />
                                                                                        </span>
                                                                                    }

                                                                                </td>
                                                                            </tr>
                                                                        ))}

                                                                    </table>


                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                }
                            </div>

                        </div>
                        <Rodape />
                    </>
                }
            </div>
        )

    }
}

const mapStateToProps = ({ user, empresa, servidor }) => {
    return {
        user: user,
        empresa: empresa,
        online: servidor.online
    }
}

export default connect(mapStateToProps, null)(AddOS)

