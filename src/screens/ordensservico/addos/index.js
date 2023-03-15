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
import { NOME_EMPRESA, CAMINHO_DOCUMENTOS } from '../../../config'
import { connect } from 'react-redux'
import { Link, Redirect } from 'react-router-dom'
import ModalLogs from '../../../components/modalLogs'
import { apiEmployee } from '../../../services/apiamrg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faTrashAlt, faPen, faPlus, faDollarSign, faTimes } from '@fortawesome/free-solid-svg-icons'
import moment from 'moment'
import Select from 'react-select';
import { confirmAlert } from 'react-confirm-alert'
import { PDFExport } from "@progress/kendo-react-pdf";
import Modal from '@material-ui/core/Modal';
import Alert from '../../../components/alert'


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

    governmentTaxes: false,
    bankCharges: false,

    data_saida: '',
    encerramento: '',
    faturamento: '',
    centroCusto: '',
    roe: 5,
    comentario: '',
    encerradoPor: '',
    faturadoPor: '',
    empresa: '',
    operador: '',

    deleteSolicitao: false,

    eventoChave: '',
    eventoMoeda: '',
    eventoValor: '',

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
    operadoresOptions: [],
    operadoresOptionsTexto: '',

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

    eventos: [],
    todasEventos: [],
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

    error: { msg: "", type: "" },

    loading: true,
    recarregaPagina: false,

    eventosTotal: 0,

    cabecalhoModal: false,
    cabecalho: "",
    company: "",
    address: ""
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
            await this.setState({ os: await loader.getOne('getOSUma.php', null, null, { chave_os: this.state.chave }) })
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
                data_saida: moment(this.state.os.Data_Saida).format("YYYY-MM-DD") != "Invalid date" ? moment(this.state.os.Data_Saida).format('YYYY-MM-DD') : 'T.B.I.',

                encerramento: moment(this.state.os.Data_Encerramento).format("YYYY-MM-DD") != "Invalid date" ? moment(this.state.os.Data_Encerramento).format('YYYY-MM-DD') : 'T.B.I.',
                faturamento: moment(this.state.os.Data_Faturamento).format("YYYY-MM-DD") != "Invalid date" ? moment(this.state.os.Data_Faturamento).format('YYYY-MM-DD') : 'T.B.I.',
                centroCusto: this.state.os.centro_custo,
                roe: parseFloat(this.state.os.ROE) == 0 ? "5.00000" : this.state.os.ROE,
                comentario: this.state.os.Comentario_Voucher,
                encerradoPor: this.state.os.encerradoPor,
                faturadoPor: this.state.os.faturadoPor,
                cabecalho: this.state.os.cabecalho,
                empresa: this.state.os.Empresa,
                operador: this.state.os.operador
            })

            if (this.state.faturamento != "T.B.I.") {
                let permissao = false;
                this.state.acessosPermissoes.map((e) => {
                    if ((e.acessoAcao == "EVENTOS_FINANCEIRO" && e.permissaoEdita == 0)) {
                        permissao = true;
                    }
                })

                if (!permissao) {
                    this.setState({ bloqueado: true });
                }
            }

            if (this.state.cabecalho) {
                const cabecalho = JSON.parse(this.state.cabecalho);

                await this.setState({
                    company: cabecalho.company,
                    address: cabecalho.address
                })
            }

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
                    { titulo: 'Data_Saida', valor: this.state.data_saida },
                    { titulo: 'Data_Encerramento', valor: this.state.encerramento },
                    { titulo: 'Data_Faturamento', valor: this.state.faturamento },
                    { titulo: 'centro_custo', valor: this.state.centroCusto },
                    { titulo: 'ROE', valor: this.state.roe },
                    { titulo: 'Comentario_Voucher', valor: this.state.comentario },
                    { titulo: 'encerradoPor', valor: this.state.encerradoPor },
                    { titulo: 'faturadoPor', valor: this.state.faturadoPor },
                    { titulo: 'operador', valor: this.state.operador },
                ]
            })
        }
        await this.loadAll()
        await this.calculaTotal();
        await this.getDadosCliente();

        this.state.acessosPermissoes.map((e) => {
            if ((e.acessoAcao == "OS" && e.permissaoInsere == 0 && this.state.chave == 0) || (e.acessoAcao == "OS" && e.permissaoEdita == 0 && this.state.chave != 0)) {
                this.setState({ bloqueado: true })
            }
        })

        this.setState({ loading: false });
    }

    componentDidUpdate = async (prevProps, prevState) => {
        if (this.state.deleteSolicitao && this.state.modalItemAberto != prevState.modalItemAberto) {
            await this.setState({
                modalItemAberto: false,
                deleteSolicitao: false
            })
        }
    }

    calculaTotal = async () => {
        let eventosTotal = 0;

        this.state.eventos.map((evento) => {
            if (evento.Moeda == 5) {
                eventosTotal += parseFloat(evento.valor);
            } else if (evento.Moeda == 6) {
                eventosTotal += (parseFloat(evento.valor) * (parseFloat(this.state.os.ROE) == 0 ? 5 : parseFloat(this.state.os.ROE)));
            }
        })

        this.setState({ eventosTotal });
    }

    getDadosCliente = async () => {
        const info = await loader.getBody(`getContatos.php`, { token: true, pessoa: this.state.cliente })

        this.setState({ bankCharges: false, governmentTaxes: false });

        for (let i = 0; i < info.length; i++) {
            const e = info[i];

            if (e.Tipo == "BK" && ["SIM", "S"].includes(e.Campo1.toUpperCase())) {
                const parametros = await loader.getBody(`getParametros.php`, { token: true, empresa: this.state.usuarioLogado.empresa });

                if (parametros[0].bank_charges) {
                    this.setState({ bankCharges: new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parametros[0].bank_charges) });
                } else {
                    this.setState({ bankCharges: "0,00" })
                }
            } else if (e.Tipo == "GT" && ["SIM", "S"].includes(e.Campo1.toUpperCase())) {
                let valor = 0;

                this.state.eventos.filter((evento) => evento.Fornecedor_Custeio != 0).map((evento) => {
                    if (evento.Moeda == 5) {
                        valor += parseFloat(evento.valor) * 0.05;
                    } else if (evento.Moeda == 6) {
                        let roe = 5;
                        if (this.state.os && parseFloat(this.state.os.ROE) != 0) {
                            roe = parseFloat(this.state.os.ROE);
                        }
                        valor += (parseFloat(evento.valor) * roe) * 0.05;
                    }
                })

                this.setState({ governmentTaxes: new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor) });

            }
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
        });
    }

    reloadItemEditMini = async () => {
        await this.setState({
            itemEditMini: {
                onSubmit: async () => await this.mudaValorEvento(),
                valores: [
                    {
                        half: true,
                        titulo: "Valor",
                        valor1: this.state.eventoMoeda,
                        tipo1: "select",
                        options1: this.state.moedasOptions,
                        onChange1: async (valor) => { await this.setState({ eventoMoeda: valor }); await this.reloadItemEditMini() },
                        valor2: this.state.eventoValor,
                        tipo2: "text",
                        onChange2: async (valor) => { await this.setState({ eventoValor: valor }); await this.reloadItemEditMini() },
                        onBlur2: async (valor) => { await this.setState({ eventoValor: Number(valor.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR').format(valor.replaceAll('.', '').replaceAll(',', '.')) : '' }); await this.reloadItemEditMini() },
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
                const todasEventos = [... this.state.todasEventos, ...response.data];

                const eventos = [... this.state.eventos, ...response.data.filter((e) => e.cancelada != 1)]

                if (eventos.find((evento) => evento.Moeda == 0)) {
                    this.setState({ error: { type: "error", msg: "Foram encontrados eventos sem valor de moeda. Por favor contate o setor de desenvolvimento" } });
                }

                await this.setState({ eventos, todasEventos })

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
                        <p>Deseja remover este evento? ({nome}) </p>
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
                const options = this.state.operadores.map((e) => {
                    return { label: e.Nome, value: e.Codigo }
                })
                options.unshift({ label: 'NENHUM', value: '' })

                await this.setState({ operadoresOptions: options })
            },
            async err => { this.erroApi(err) }
        )
    }

    finalizaSalvamento = async () => {
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>OS salva!</p>
                        <p>Deseja criar mais?</p>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-danger w-50"
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


    salvarOS = async (validForm) => {
        await this.setState({
            governmentTaxes: this.state.governmentTaxes ? this.state.governmentTaxes : 0,
            bankCharges: this.state.bankCharges ? this.state.bankCharges : 0,
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
                { titulo: 'Data_Saida', valor: this.state.data_saida },
                { titulo: 'Data_Encerramento', valor: this.state.encerramento },
                { titulo: 'Data_Faturamento', valor: this.state.faturamento },
                { titulo: 'centro_custo', valor: this.state.centroCusto },
                { titulo: 'ROE', valor: this.state.roe },
                { titulo: 'Comentario_Voucher', valor: this.state.comentario },
                { titulo: 'encerradoPor', valor: this.state.encerradoPor },
                { titulo: 'faturadoPor', valor: this.state.faturadoPor },
                { titulo: 'operador', valor: this.state.operador },
            ],
            loading: true,
            bloqueado: true
        })

        if (parseInt(this.state.chave) === 0 && validForm) {
            await this.getCodigo();
            await apiEmployee.post(`insertOS.php`, {
                token: true,
                values: `'${this.state.usuarioLogado.codigo}', '${this.state.descricao}', 'ST${this.state.codigo.Proximo}', '${this.state.cliente}', '${this.state.navio}', '${moment(this.state.abertura).format('YYYY-MM-DD')}', '${moment(this.state.chegada).format('YYYY-MM-DD')}', '${moment(this.state.data_saida).format('YYYY-MM-DD')}', '${this.state.tipoServico}', '${this.state.viagem}', '${this.state.porto}', '${this.state.encerradoPor}', '${this.state.faturadoPor}', '${this.state.empresa}', '${this.state.eta}', '${this.state.atb}', '${this.state.etb}', '${this.state.governmentTaxes ? parseFloat(this.state.governmentTaxes.replaceAll('.', '').replaceAll(',', '.')) : 0}', '${this.state.bankCharges ? parseFloat(this.state.bankCharges.replaceAll('.', '').replaceAll(',', '.')) : 0}', '${this.state.operador}'`,
                codigo: this.state.codigo.Proximo,
                tipo: this.state.codigo.Tipo
            }).then(
                async res => {
                    if (res.data[0].Chave) {
                        await this.setState({ codigo: res.data[0].codigo, chave: res.data[0].Chave, os: res.data[0] })
                        await this.GerarEtiqueta(res.data[0].codigo);
                        await loader.salvaLogs('os', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].Chave);

                        await this.setState({ loading: false, bloqueado: false });
                        this.setState({ recarregaPagina: true });
                    } else {
                        console.log(res.data)
                    }
                },
                async res => await console.log(`Erro: ${res}`)
            )

        } else if (validForm) {
            if (this.state.os.Data_Faturamento && this.state.faturamento) {
                //await this.faturaOS();
            }


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

                Data_Saida: this.state.data_saida ? moment(this.state.data_saida).format('YYYY-MM-DD') : '',
                Data_Encerramento: this.state.encerramento ? moment(this.state.encerramento).format('YYYY-MM-DD') : '',
                Data_Faturamento: this.state.faturamento ? moment(this.state.faturamento).format('YYYY-MM-DD') : '',
                centro_custo: this.state.centroCusto,
                ROE: this.state.roe,
                Comentario_Voucher: this.state.comentario,
                encerradoPor: this.state.encerradoPor,
                faturadoPor: this.state.faturadoPor,
                Empresa: this.state.empresa,
                governmentTaxes: this.state.governmentTaxes ? parseFloat(this.state.governmentTaxes.replaceAll(".", "").replaceAll(",", ".")) : 0,
                bankCharges: this.state.bankCharges ? parseFloat(this.state.bankCharges.replaceAll(".", "").replaceAll(",", ".")) : 0,
                operador: this.state.operador

            }).then(
                async res => {
                    if (res.data === true) {
                        await loader.salvaLogs('os', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.chave, `OS: ${this.state.codigo}`);
                        await this.setState({ loading: false, bloqueado: false })
                    } else {
                        await alert(`Erro ${JSON.stringify(res)}`)
                    }
                },
                async res => await console.log(`Erro: ${res}`)
            )

        }

    }

    faturaOS = async () => {
        const valor = this.calculaTotal();

        await apiEmployee.post(`insertContaFornecedor.php`, {
            token: true,
            values: `'${this.state.faturamento}', '0', '${this.state.cliente}', '0', '0', '${this.state.centroCusto}', '',  0,0, 0, '${parseFloat(valor.replaceAll('.', '').replaceAll(',', '.'))}', '0', '0', '0', '${0}', '${this.state.usuarioLogado.codigo}', '${this.state.empresa}', 0, 0, 0, ''`,
        }).then(
            async res => {
                console.log(res.data);
            },
            async res => await console.log(`Erro: ${res.data}`)
        )
    }

    calculaValorTotal = async () => {
        const values = await loader.valoresOS(this.state.chave);

        let valorTotal = 0;

        if (values[0].governmentTaxes > 0) {
            valorTotal += parseFloat(values[0].governmentTaxes);
        }
        if (values[0].bankCharges > 0) {
            valorTotal += parseFloat(this.state.pdfContent[0].bankCharges);
        }

        {
            values.map((e, index) => {
                if (e.moeda == 5) {
                    valorTotal += parseFloat(e.valor);
                } else {
                    valorTotal += parseFloat(parseFloat(e.valor * this.state.roe).toFixed(2));
                }
            })
        }

        return valorTotal;
    }

    salvarCabecalho = async () => {
        await this.setState({ loading: true, cabecalhoModal: false });

        const cabecalho = `{"company": "${this.state.company.replaceAll('"', '\\"')}", "address": "${this.state.address.replaceAll('"', '\\"')}"}`

        await apiEmployee.post(`updateOSCabecalho.php`, {
            token: true,
            Chave: this.state.chave,
            cabecalho
        }).then(
            async res => {
                if (res.data === true) {
                    console.log(res.data);
                    await this.setState({ loading: false })
                } else {
                    await alert(`Erro ${JSON.stringify(res)}`)
                }
            },
            async res => await console.log(`Erro: ${res}`)
        )
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
            await this.getDadosCliente();
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

    //ALERTA: As funções abaixo (CapaVoucher, FaturamentoCusteio, RelatorioVoucher e CloseToReal) possuem valores e styles hardcoded e uma dependência depreciada; Sua existência e difícil manutenção é um lembrete para que isso não ocorra novamente. 
    CapaVoucher = async (codigo, validForm) => {
        try {
            if (!validForm) {
                await this.setState({ error: { type: "error", msg: "Verifique se as informações estão corretas!" } });
                return;
            }

            await this.salvarOS(validForm)

            this.setState({ pdfNome: "Capa" })
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

            if (!this.state.pdfContent || !this.state.pdfContent[0]) {
                return this.setState({ error: { type: "error", msg: "Sem informações necessárias" }, loading: false })
            }

            if (this.state.pdfContent.find((os) => !os.chavTaxa)) {
                return this.setState({ error: { type: "error", msg: "Há eventos sem taxas" }, loading: false })
            }

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
            let totalFinal = 0;
            let totalFinalDolar = 0;
            let descontoFinal = 0;
            let descontoFinalDolar = 0;

            let company = util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].cliente);
            let address = `${util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].complemento)} ${util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].rua)} ${this.state.pdfContent[0].numero && this.state.pdfContent[0].numero != "0" ? this.state.pdfContent[0].numero : ""} ${this.state.pdfContent[0].cep && this.state.pdfContent[0].cep != "0" ? this.state.pdfContent[0].cep : ""}`;

            if (this.state.pdfContent[0].cabecalho) {
                const cabecalho = JSON.parse(this.state.pdfContent[0].cabecalho);

                if (cabecalho.company) {
                    company = cabecalho.company;
                }

                if (cabecalho.address) {
                    address = cabecalho.address;
                }
            }

            if (this.state.pdfContent[0].GT && ["SIM", "S"].includes(this.state.pdfContent[0].GT.toUpperCase())) {
                totalFinal += parseFloat(this.state.pdfContent[0].governmentTaxes);
                totalFinalDolar += parseFloat(parseFloat(this.state.pdfContent[0].governmentTaxes / this.state.pdfContent[0].roe).toFixed(2));
            }

            if (this.state.pdfContent[0].BK && ["SIM", "S"].includes(this.state.pdfContent[0].BK.toUpperCase())) {
                totalFinal += parseFloat(this.state.pdfContent[0].bankCharges);
                totalFinalDolar += parseFloat(parseFloat(this.state.pdfContent[0].bankCharges / this.state.pdfContent[0].roe).toFixed(2));
            }

            if (this.state.pdfContent[0]) {
                pdf =
                    <div key={546546554654}>
                        <br />
                        <h5 style={{ width: "100%", textAlign: "center" }}><b>AGENT DISBURSEMENT ACCOUNT</b></h5>
                        <h4 style={{ width: "100%", textAlign: "center" }}>SULTRADE SHIPPING AGENCY</h4>
                        <div className='voucherImagem'>
                            <img className="img-fluid" src="https://i.ibb.co/n69ZD86/logo-Vertical.png" alt="logo-lpc" border="0" style={{ width: '130px', height: '100px' }} />
                        </div>
                        <br />
                        {/*
                    <div className='pdfHeader'>
                        <img className="img-fluid" src="https://i.ibb.co/vmKJkx4/logo.png" alt="logo-lpc" border="0" style={{ width: '30%', height: '150px' }} />
                        <h3 className='pdfTitle'>AGENT DISBURSEMENT ACCOUNT</h3>
                        <h3>SULTRADE SHIPPING AGENCY</h3>
                    </div>
        */}
                        <div style={{ width: "80%", marginLeft: "5%" }}>
                            <table>
                                <tr>
                                    <td colSpan={4} style={{ padding: "0px 3px 0px 3px", paddingRight: 10 }}><b>Company:</b> {company}</td>
                                </tr>
                                <tr>
                                    <td colSpan={4} style={{ padding: "0px 3px 0px 3px", paddingRight: 10 }}><b>Address:</b> {address}</td>
                                </tr>
                                <tr>
                                    <td colSpan={4} style={{ padding: "0px 3px 0px 3px", paddingRight: 10 }}><b>Vessel Name:</b> {util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].nomeNavio)}</td>
                                </tr>
                                <tr>
                                    <td colSpan={4} style={{ padding: "0px 3px 0px 3px", paddingRight: 10 }}><b>Name of Port:</b> {util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].nomePorto)}</td>
                                </tr>
                                <tr>
                                    <td colSpan={4} style={{ padding: "0px 3px 0px 3px", paddingRight: 10 }}><b>Arrived:</b> {moment(this.state.pdfContent[0].data_chegada).format('MMMM DD, YYYY') != "Invalid date" ? moment(this.state.pdfContent[0].data_chegada).format('MMMM DD, YYYY') : 'T.B.I.'}</td>
                                </tr>
                                <tr>
                                    <td colSpan={4} style={{ padding: "0px 3px 0px 3px", paddingRight: 10 }}><b>Sailed:</b> {moment(this.state.pdfContent[0].data_saida).format('MMMM DD, YYYY') != "Invalid date" ? moment(this.state.pdfContent[0].data_saida).format('MMMM DD, YYYY') : 'T.B.I.'}</td>
                                </tr>
                                <tr>
                                    <td colSpan={2} style={{ padding: "0px 3px 0px 3px", paddingRight: 10 }}><b>Date of Billing:</b> {moment(this.state.pdfContent[0].data_faturamento).format('MMMM DD, YYYY') != "Invalid date" ? moment(this.state.pdfContent[0].data_faturamento).format('MMMM DD, YYYY') : 'T.B.I.'}</td>
                                    <td colSpan={2} style={{ padding: "0px 3px 0px 3px", textAlign: "right" }}><b>PO:</b> {util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].codigo)}</td>
                                </tr>
                            </table>
                        </div>
                        <br />
                        <div className='pdfContent'>
                            <div>
                                {/* <table className='pdfTable'>
                                <tr>
                                    <td style={{ padding: "0px 3px 0px 3px" }} colSpan='2' className=' pdfTitle'>COMPANY: {company}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: "0px 3px 0px 3px" }} colSpan='2' className=' pdfTitle'>ADDRESS: {address}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: "0px 3px 0px 3px" }} colSpan='2' className=' pdfTitle'>Vessel Name: {util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].nomeNavio)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: "0px 3px 0px 3px" }} colSpan='2' className=' pdfTitle'>Name of Port: {util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].nomePorto)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: "0px 3px 0px 3px" }} colSpan='2' className=' pdfTitle'>Arrived: {moment(this.state.pdfContent[0].data_chegada).format('MMMM DD, YYYY') != "Invalid date" ? moment(this.state.pdfContent[0].data_chegada).format('MMMM DD, YYYY') : 'T.B.I.'}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: "0px 3px 0px 3px" }} colSpan='2' className=' pdfTitle'>Sailed: {moment(this.state.pdfContent[0].data_saida).format('MMMM DD, YYYY') != "Invalid date" ? moment(this.state.pdfContent[0].data_saida).format('MMMM DD, YYYY') : 'T.B.I.'}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: "0px 3px 0px 3px" }} colSpan='2' className=' pdfTitle'>Date Of Billing: {moment(this.state.pdfContent[0].data_faturamento).format('MMMM DD, YYYY') != "Invalid date" ? moment(this.state.pdfContent[0].data_faturamento).format('MMMM DD, YYYY') : 'T.B.I.'}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: "0px 3px 0px 3px" }} colSpan='2' className=' pdfTitle'>PO: {util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].codigo)}</td>
                                </tr>


                            </table>*/}
                                <br />

                                <table className={`voucherTable`}>
                                    <tr>
                                        <td className='pdfTitle' style={{ width: 75 }}>Voucher</td>
                                        <td colSpan='2' className='pdfTitle'>Description</td>
                                        <td className='pdfTitle'>Expense Type</td>
                                        <td className='pdfTitle'>Final USD</td>
                                        <td className='pdfTitle'>Final BRL</td>
                                    </tr>
                                    {vouchers.map((voucher, index) => {
                                        const voucherInfo = this.state.pdfContent.find((e) => e.chavTaxa == voucher);
                                        if (index % 2 == 0) {
                                            backgroundColor = '#FFFFFF';
                                        } else {
                                            backgroundColor = '#BBBBBB';
                                        }

                                        let valorTotal = 0;



                                        return (
                                            <>
                                                {this.state.pdfContent.filter((e) => e.tipo != 2 && e.chavTaxa == voucher).map((e, i) => {

                                                    if (e.tipo != 3) {
                                                        if (e.moeda == 5) {
                                                            valorTotal += parseFloat(e.valor);
                                                            totalFinal += parseFloat(e.valor);
                                                            totalFinalDolar += parseFloat(parseFloat(e.valor / this.state.pdfContent[0].roe).toFixed(2));
                                                        } else {
                                                            valorTotal += parseFloat(parseFloat(e.valor * this.state.pdfContent[0].roe).toFixed(2));
                                                            totalFinal += parseFloat(parseFloat(e.valor * this.state.pdfContent[0].roe).toFixed(2));
                                                            totalFinalDolar += parseFloat(e.valor);
                                                        }
                                                    } else {
                                                        if (e.moeda == 5) {
                                                            valorTotal -= parseFloat(e.valor);
                                                            descontoFinal += parseFloat(e.valor);
                                                            descontoFinalDolar += parseFloat(parseFloat(e.valor / this.state.pdfContent[0].roe).toFixed(2));
                                                        } else {
                                                            valorTotal -= parseFloat(parseFloat(e.valor * this.state.pdfContent[0].roe).toFixed(2));
                                                            descontoFinal += parseFloat(parseFloat(e.valor * this.state.pdfContent[0].roe).toFixed(2));
                                                            descontoFinalDolar += parseFloat(e.valor);
                                                        }
                                                    }
                                                })}
                                                {this.state.pdfContent.filter((e) => e.tipo == 2).map((e) => {
                                                    if (e.moeda == 5) {
                                                        valorTotal -= parseFloat(e.valor);
                                                        descontoFinal += parseFloat(e.valor);
                                                        descontoFinalDolar += parseFloat(parseFloat(e.valor / this.state.pdfContent[0].roe).toFixed(2));
                                                    } else {
                                                        valorTotal -= parseFloat(parseFloat(e.valor * this.state.pdfContent[0].roe).toFixed(2));
                                                        descontoFinal += parseFloat(parseFloat(e.valor * this.state.pdfContent[0].roe).toFixed(2));
                                                        descontoFinalDolar += parseFloat(e.valor);
                                                    }
                                                })}

                                                <tr>
                                                    <td style={{ backgroundColor: backgroundColor, padding: "0px 3px 0px 3px", fontSize: 13 }}>{voucherInfo.chavTaxa}</td>
                                                    <td colSpan='2' style={{ backgroundColor: backgroundColor, padding: "0px 3px 0px 3px", paddingRight: 25, fontSize: 13 }}>{voucherInfo.descSubgrupo}</td>
                                                    <td style={{ backgroundColor: backgroundColor, padding: "0px 3px 0px 3px", paddingRight: 25, fontSize: 13 }}>{voucherInfo.descGrupo}</td>
                                                    <td style={{ backgroundColor: backgroundColor, padding: "0px 3px 0px 3px", fontSize: 13 }} className="text-right">{util.formataDinheiroBrasileiro(parseFloat(valorTotal / this.state.pdfContent[0].roe))}</td>
                                                    <td style={{ backgroundColor: backgroundColor, padding: "0px 3px 0px 3px", fontSize: 13 }} className="text-right">{util.formataDinheiroBrasileiro(parseFloat(valorTotal))}</td>
                                                </tr>


                                            </>
                                        )
                                    })
                                    }
                                    {this.state.pdfContent[0].GT && ["SIM", "S"].includes(this.state.pdfContent[0].GT.toUpperCase()) &&
                                        <tr>
                                            <td></td>
                                            <td colSpan='2' style={{ fontWeight: "bold", padding: "0px 3px 0px 3px", fontSize: 14 }}>GOVERNMENT TAXES</td>
                                            <td style={{ fontWeight: "bold", padding: "0px 3px 0px 3px", fontSize: 14 }}></td>
                                            <td style={{ fontWeight: "bold", padding: "0px 3px 0px 3px", fontSize: 14 }} className="text-right">{util.formataDinheiroBrasileiro(parseFloat(this.state.pdfContent[0].governmentTaxes / this.state.pdfContent[0].roe))}</td>
                                            <td style={{ fontWeight: "bold", padding: "0px 3px 0px 3px", fontSize: 14 }} className="text-right">{util.formataDinheiroBrasileiro(parseFloat(this.state.pdfContent[0].governmentTaxes))}</td>
                                        </tr>
                                    }
                                    {this.state.pdfContent[0].BK && ["SIM", "S"].includes(this.state.pdfContent[0].BK.toUpperCase()) &&
                                        <tr>
                                            <td></td>
                                            <td colSpan='2' style={{ fontWeight: "bold", padding: "0px 3px 0px 3px", fontSize: 14 }}>BANK CHARGES</td>
                                            <td style={{ fontWeight: "bold", padding: "0px 3px 0px 3px", fontSize: 14 }}></td>
                                            <td style={{ fontWeight: "bold", padding: "0px 3px 0px 3px", fontSize: 14 }} className="text-right">{util.formataDinheiroBrasileiro(parseFloat(this.state.pdfContent[0].bankCharges / this.state.pdfContent[0].roe))}</td>
                                            <td style={{ fontWeight: "bold", padding: "0px 3px 0px 3px", fontSize: 14 }} className="text-right">{util.formataDinheiroBrasileiro(parseFloat(this.state.pdfContent[0].bankCharges))}</td>
                                        </tr>
                                    }

                                </table>
                                <br />
                                <table className='voucherTableFinal'>
                                    <tr>
                                        <td style={{ padding: "0px 3px 0px 3px", fontSize: 14 }} colSpan='4' className='pdfTitle'>Total Final Costs</td>
                                        <td style={{ padding: "0px 3px 0px 3px", fontSize: 14 }} className='pdfTitle text-right'>{util.formataDinheiroBrasileiro(parseFloat(totalFinalDolar))}</td>
                                        <td style={{ padding: "0px 3px 0px 3px", fontSize: 14 }} className='pdfTitle text-right'>{util.formataDinheiroBrasileiro(parseFloat(totalFinal))}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "0px 3px 0px 3px", fontSize: 14 }} colSpan='4' className='pdfTitle'>Total Final Discounts</td>
                                        <td style={{ padding: "0px 3px 0px 3px", fontSize: 14 }} className='pdfTitle text-right'>{util.formataDinheiroBrasileiro(parseFloat(descontoFinal))}</td>
                                        <td style={{ padding: "0px 3px 0px 3px", fontSize: 14 }} className='pdfTitle text-right'>{util.formataDinheiroBrasileiro(parseFloat(descontoFinalDolar))}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "0px 3px 0px 3px", fontSize: 14 }} colSpan='4' className='pdfTitle'>Final Blce/Debit Customer</td>
                                        <td style={{ padding: "0px 3px 0px 3px", fontSize: 14 }} className='pdfTitle text-right'>{util.formataDinheiroBrasileiro(parseFloat(totalFinalDolar) - parseFloat(descontoFinalDolar))}</td>
                                        <td style={{ padding: "0px 3px 0px 3px", fontSize: 14 }} className='pdfTitle text-right'>{util.formataDinheiroBrasileiro(parseFloat(totalFinal) - parseFloat(descontoFinal))}</td>
                                    </tr>
                                </table>
                                <table className='pdfTable' style={{ width: "80%", marginLeft: "5%" }}>
                                    <tr>
                                        <td style={{ padding: "0px 3px 0px 3px" }}>ISSUED BY:</td>
                                        <td style={{ padding: "0px 3px 0px 3px" }} colSpan='2'>{operador ? operador.Nome : ''}</td>
                                        <td style={{ padding: "0px 3px 0px 3px" }}>ROE:</td>
                                        <td style={{ padding: "0px 3px 0px 3px" }}>{util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].roe.replaceAll('.', ','))}</td>
                                    </tr>
                                </table>
                                <br />
                                <br />
                                <br />

                                <h5 style={{ width: "100%", textAlign: "center" }}>BANKING DETAILS</h5>
                                <table style={{ width: "80%", marginLeft: "5%" }}>
                                    <tr>
                                        <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}><b style={{ paddingRight: 5 }}>Bank's name:</b> Banco do Brasil</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}><b style={{ paddingRight: 5 }}>Branch's name:</b> Rio Grande</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}><b style={{ paddingRight: 5 }}>Address:</b> Benjamin Constant St, 72</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}><b style={{ paddingRight: 5 }}>Swift Code:</b> BRASBRRJCTA</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}><b style={{ paddingRight: 5 }}>IBAN:</b> BR640000000002694000161440C1</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}><b style={{ paddingRight: 5 }}>Branch's number:</b> 2694-8</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}><b style={{ paddingRight: 5 }}>Account number:</b> 161441-X</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}><b style={{ paddingRight: 5 }}>Account name:</b> SUL TRADE AGENCIAMENTOS MARITIMOS LTDA-ME</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}><b style={{ paddingRight: 5 }}>Phone:</b> +55 53 3235 3500</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}><b style={{ paddingRight: 5 }}>CNPJ:</b> 10.432.546/0001-75</td>
                                    </tr>

                                </table>
                                {/*
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
*/}
                            </div>
                        </div>

                    </div>

            } else {
                await this.setState({ erro: "Sem as informações necessárias para criar o pdf", loading: false });
                return;
            }
            await this.setState({ pdfgerado: pdf })
            this.handleExportWithComponent()
        } catch (err) {
            await this.setState({ erro: "Erro ao criar pdf", loading: false });
        }
    }

    FaturamentoCusteio = async (codigo, validForm) => {
        try {
            if (!validForm) {
                await this.setState({ error: { type: "error", msg: "Verifique se as informações estão corretas!" } });
                return;
            }

            await this.salvarOS(validForm)

            this.setState({ pdfNome: "Relatorio_liquidos" })
            if (!this.state.moedas) {
                await this.getMoedas();
            }

            await this.setState({
                loading: true,
                pdfContent: await loader.getBody(`faturamentoCusteio.php`, { token: true, codigo: codigo })
            })

            console.log(this.state.pdfContent);

            if (!this.state.pdfContent || !this.state.pdfContent[0]) {
                return this.setState({ error: { type: "error", msg: "Sem informações necessárias" }, loading: false })
            }

            let totalConsolidado = 0;
            let valorTotal = 0;
            let valorTotalCobrar = 0;
            let valorTotalPago = 0;
            let pdf = '';

            const { pdfContent } = this.state;

            const pdfCusteio = [];

            if (!pdfContent[0]) {
                await this.setState({ erro: 'Sem as informações necessárias para gerar o pdf!', loading: false })
                return;
            }

            pdfContent.map((content) => {
                if (!pdfCusteio.includes(content.fornecedor_custeio)) {
                    pdfCusteio.push(content.fornecedor_custeio);
                }
            })

            let roe = 5;

            if (pdfContent[0].ROE && pdfContent[0].ROE != 0) {
                roe = pdfContent[0].ROE;
            }

            if (pdfContent) {
                pdf =
                    <div style={{ zoom: 1 }} key={546546554654}>

                        <div className={`faturamentoCabecalho`}>NAVIO: {pdfContent[0].nome_navio ? pdfContent[0].nome_navio.toUpperCase() : ""}</div>
                        <br />
                        {pdfCusteio.map((custeio) => {
                            valorTotalCobrar = 0;
                            valorTotalPago = 0;
                            valorTotal = 0;

                            if (custeio) {
                                return (
                                    <>
                                        <div className={`faturamentoTitulo`}>FATURAMENTO <span style={{ marginLeft: 10 }}>{custeio}</span></div>
                                        <table style={{ width: "100%", padding: "0px 3px 0px 3px" }}>
                                            <tr>
                                                <th colSpan={2} style={{ fontSize: '0.95em', border: "1px solid black", padding: "0px 3px 0px 3px" }}>EVENTO</th>
                                                <th style={{ fontSize: '0.95em', border: "1px solid black", padding: "0px 3px 0px 3px" }}>CONTA</th>
                                                <th style={{ fontSize: '0.95em', border: "1px solid black", padding: "0px 3px 0px 3px" }}>VALOR A COBRAR</th>
                                                <th style={{ fontSize: '0.95em', border: "1px solid black", padding: "0px 3px 0px 3px" }}>VALOR PAGO</th>
                                                <th style={{ fontSize: '0.95em', border: "1px solid black", padding: "0px 3px 0px 3px" }}>VALOR LIQUIDO</th>
                                            </tr>
                                            {pdfContent.filter((content) => content.fornecedor_custeio == custeio).map((content, index) => {
                                                let valor_cobrar = content.valor_cobrar;
                                                let valor_pago = content.valor_pago;

                                                if (content.moeda == 6) {
                                                    valor_cobrar = parseFloat((parseFloat(valor_cobrar) * parseFloat(roe)).toFixed(2));
                                                }

                                                valorTotalCobrar += parseFloat(valor_cobrar);
                                                valorTotalPago += parseFloat(valor_pago);

                                                let valor_liquido = parseFloat(valor_cobrar) - parseFloat(valor_pago);

                                                valorTotal += valor_liquido;
                                                totalConsolidado += valor_liquido;

                                                return (
                                                    <>
                                                        <tr>
                                                            <td colSpan={2} style={{ fontSize: '0.95em', border: "1px solid black", padding: "0px 3px 0px 3px", paddingRight: 75 }}>{content.evento}</td>
                                                            <td style={{ fontSize: '0.95em', border: "1px solid black", padding: "0px 3px 0px 3px" }} className='text-right'>{content.uf == 81 ? content.contaEstrangeiraNome : content.contaNome}</td>
                                                            <td style={{ fontSize: '0.95em', border: "1px solid black", padding: "0px 3px 0px 3px" }} className='text-right'>R$ {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor_cobrar)}</td>
                                                            <td style={{ fontSize: '0.95em', border: "1px solid black", padding: "0px 3px 0px 3px" }} className='text-right'>R$ {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor_pago)}</td>
                                                            <td style={{ fontSize: '0.95em', border: "1px solid black", padding: "0px 3px 0px 3px" }} className='text-right'>R$ {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor_liquido)}</td>
                                                        </tr>
                                                    </>
                                                )
                                            })}
                                            <tr style={{ backgroundColor: "#9a9a9a" }}>
                                                <td colSpan={2} style={{ fontSize: '0.95em', border: "1px solid black" }}><b>VALOR DA NF A SER EMITIDA</b></td>
                                                <td style={{ fontSize: '0.95em', border: "1px solid black" }}></td>
                                                <td style={{ fontSize: '0.95em', border: "1px solid black", padding: "0px 3px 0px 3px" }} className='text-right'><b>R$ {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valorTotalCobrar)}</b></td>
                                                <td style={{ fontSize: '0.95em', border: "1px solid black", padding: "0px 3px 0px 3px" }} className='text-right'><b>R$ {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valorTotalPago)}</b></td>
                                                <td style={{ fontSize: '0.95em', border: "1px solid black", padding: "0px 3px 0px 3px" }} className='text-right'><b>R$ {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valorTotal)}</b></td>
                                            </tr>
                                        </table>
                                    </>
                                )
                            }
                        })}
                        <div className="faturamentoFooter">
                            VALOR CONSOLIDADO: R$<span style={{ marginLeft: "40px" }}>{new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalConsolidado)}</span>
                        </div>
                    </div>
            } else {
                await this.setState({ erro: 'Sem as informações necessárias para gerar o pdf!', loading: false })
                return;
            }

            await this.setState({ pdfgerado: pdf })
            this.handleExportWithComponent()
        } catch (err) {
            await this.setState({ erro: "Erro ao criar o pdf", loading: false });
        }
    }

    RelatorioVoucher = async (codigo, validForm) => {
        try {
            if (!validForm) {
                await this.setState({ error: { type: "error", msg: "Verifique se as informações estão corretas!" } });
                return;
            }

            await this.salvarOS(validForm)

            this.setState({ pdfNome: "Vouchers" })
            if (!this.state.moedas) {
                await this.getMoedas();
            }

            await this.setState({
                loading: true,
                pdfContent: await loader.getBody(`relatorioVoucher.php`, { token: true, codigo: codigo })
            })

            if (!this.state.pdfContent || !this.state.pdfContent.itens || !this.state.pdfContent.chaves) {
                return this.setState({ error: { type: "error", msg: "Sem informações necessárias" }, loading: false })
            }
            if (this.state.pdfContent.itens.find((os) => !os.codsubgrupo_taxas)) {
                return this.setState({ error: { type: "error", msg: "Há eventos sem taxas" }, loading: false })
            }

            const pdfContent = this.state.pdfContent.itens;
            const pdfChaves = this.state.pdfContent.chaves;


            const getDescricaoItem = (item) => {
                if (item.tipo_op == 'R') {
                    if (item.fornecedor_custeio && item.descricao_item) {
                        return `Expenses incurred with ${item.descricao_item}, as per attached bill from ${item.fornecedor_custeio}`
                    } else {
                        return `Expenses incurred with ${item.descricao_item}, as per attached bill from ${item.fornecedor}`
                    }
                } else if (item.repasse != 0) {
                    if (item.fornecedor && item.descricao_item) {
                        return `Expenses incurred with ${item.descricao_item}, as per attached bill from ${item.fornecedor}`
                    }
                } else {
                    if (item.fornecedor_custeio && item.descricao_item) {
                        return `Expenses incurred with ${item.descricao_item}, as per attached bill from ${item.fornecedor_custeio}`
                    } else {
                        return `Expenses incurred with ${item.descricao_item}, as per attached bill from ${item.fornecedor}`
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
                            let company = chave.company;
                            let address = chave.address;

                            if (chave.cabecalho) {
                                const cabecalho = JSON.parse(chave.cabecalho);

                                if (cabecalho.company) {
                                    company = cabecalho.company;
                                }

                                if (cabecalho.address) {
                                    address = cabecalho.address;
                                }
                            }

                            valorTotalReais = 0;
                            valorTotalDolares = 0;
                            return (
                                <>
                                    <br />
                                    <div className={`voucherCabecalho ${index == 0 ? "" : "page-break"}`} style={{ marginRight: 55 }}>Voucher nr. {chave.codsubgrupo}</div>
                                    <br />
                                    <div style={{ float: "right", marginRight: 55, marginTop: 25 }}>
                                        <img className="img-fluid" src="https://i.ibb.co/n69ZD86/logo-Vertical.png" alt="logo-lpc" border="0" style={{ width: '130px', height: '100px' }} />
                                    </div>
                                    <div style={{ width: "70%", marginLeft: "5%" }}>
                                        <table style={{ width: "100%" }}>
                                            <tr>
                                                {company &&
                                                    <td colSpan={4} style={{ padding: "0px 3px 0px 3px", paddingRight: 10 }}><b>Company:</b> {company}</td>
                                                }
                                            </tr>
                                            <tr>
                                                {address &&
                                                    <td colSpan={3} style={{ padding: "0px 3px 0px 3px", paddingRight: 10 }}><b>Address:</b> {address}</td>
                                                }
                                                {chave.codigo &&
                                                    <td colSpan={1} style={{ padding: "0px 3px 0px 3px", textAlign: address ? "right" : "left", paddingRight: 5 }}><b>PO:</b> {chave.codigo}</td>
                                                }
                                            </tr>
                                            <tr>
                                                {chave.data_faturamento && moment(chave.data_faturamento).format("DD/MM/YYYY") != "Invalid date" &&
                                                    <td colSpan={2} style={{ padding: "0px 3px 0px 3px", paddingRight: 10 }}><b>Date of Billing:</b> {moment(chave.data_faturamento).format('DD/MM/YYYY')}</td>
                                                }
                                                {chave.eta && moment(chave.eta).format("DD/MM/YYYY") != "Invalid date" &&
                                                    <td colSpan={2} style={{ padding: "0px 3px 0px 3px", textAlign: chave.data_faturamento && moment(chave.data_faturamento).format("DD/MM/YYYY") != "Invalid date" ? "right" : "left" }}><b>Arrived:</b> {moment(chave.eta).format('DD/MM/YYYY')}</td>
                                                }
                                            </tr>
                                            <tr>
                                                {chave.vessel_name && moment(chave.vessel_name).format("DD/MM/YYYY") != "Invalid date" &&
                                                    <td colSpan={2} style={{ padding: "0px 3px 0px 3px", paddingRight: 10 }}><b>Vessel Name:</b> {chave.vessel_name}</td>
                                                }
                                                {chave.data_saida && moment(chave.data_saida).format("DD/MM/YYYY") != "Invalid date" &&
                                                    <td colSpan={2} style={{ padding: "0px 3px 0px 3px", textAlign: chave.vessel_name && moment(chave.vessel_name).format("DD/MM/YYYY") != "Invalid date" ? "right" : "left" }}><b>Sailed:</b> {moment(chave.Data_Saida).format('DD/MM/YYYY')}</td>
                                                }
                                            </tr>
                                            <tr>
                                                {chave.name_of_port && moment(chave.name_of_port).format("DD/MM/YYYY") != "Invalid date" &&
                                                    <td colSpan={2} style={{ padding: "0px 3px 0px 3px", paddingRight: 10 }}><b>Name of Port:</b> {chave.name_of_port}</td>
                                                }
                                                <td colSpan={2} style={{ padding: "0px 3px 0px 3px", textAlign: chave.name_of_port && moment(chave.name_of_port).format("DD/MM/YYYY") != "Invalid date" ? "right" : "left", paddingRight: 8 }}>{mconversao()}</td>
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
                                                <th style={{ padding: "0px 3px 0px 3px", paddingRight: 10 }} colSpan={2}>Services</th>
                                                <th style={{ padding: "0px 3px 0px 3px" }}>Debit BRL</th>
                                                <th style={{ padding: "0px 3px 0px 3px" }}>Debit USD</th>
                                            </tr>
                                            {pdfContent.filter((e) => e.codsubgrupo_taxas == chave.codsubgrupo_taxas).map((e, i) => {
                                                valorTotalReais += parseFloat(parseFloat(getValorItemReal(e)).toFixed(2));
                                                valorTotalDolares += parseFloat(parseFloat(getValorItemDolar(e)).toFixed(2));
                                                return (
                                                    <tr>
                                                        <td style={{ padding: "0px 3px 0px 3px", paddingRight: 50 }} colSpan={2}>{getDescricaoItem(e)}</td>
                                                        <td style={{ padding: "0px 3px 0px 3px" }}>{new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(getValorItemReal(e))}</td>
                                                        <td style={{ padding: "0px 3px 0px 3px" }}>{new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(getValorItemDolar(e))}</td>
                                                    </tr>

                                                )
                                            })
                                            }
                                            <tr>
                                                <td colSpan={2} style={{ padding: "0px 3px 0px 3px", paddingRight: 50 }}><b>TOTAL</b></td>
                                                <td style={{ padding: "0px 3px 0px 3px" }}><b>{new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valorTotalReais)}</b></td>
                                                <td style={{ padding: "0px 3px 0px 3px" }}><b>{new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valorTotalDolares)}</b></td>
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
        } catch (err) {
            console.log(err);
            await this.setState({ erro: "Erro ao criar o pdf", loading: false });
        }
    }

    CloseToReal = async (codigo, validForm) => {
        try {
            if (!validForm) {
                await this.setState({ error: { type: "error", msg: "Verifique se as informações estão corretas!" } });
                return;
            }

            await this.salvarOS(validForm)

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
            let valorTotalDolar = 0;
            let pdf = '';


            if (!this.state.pdfContent || !this.state.pdfContent[0]) {
                return this.setState({ error: { type: "error", msg: "Sem informações necessárias" }, loading: false })
            }

            if (this.state.pdfContent[0]) {
                if (this.state.pdfContent[0].governmentTaxes > 0) {
                    valorTotal += parseFloat(this.state.pdfContent[0].governmentTaxes);
                    valorTotalDolar += parseFloat(parseFloat(this.state.pdfContent[0].governmentTaxes / this.state.pdfContent[0].roe).toFixed(2));
                }
                if (this.state.pdfContent[0].bankCharges > 0) {
                    valorTotal += parseFloat(this.state.pdfContent[0].bankCharges);
                    valorTotalDolar += parseFloat(parseFloat(this.state.pdfContent[0].bankCharges / this.state.pdfContent[0].roe));
                }

                if (this.state.pdfContent.find((os) => !os.chavTaxa)) {
                    return this.setState({ error: { type: "error", msg: "Há eventos sem taxas" }, loading: false })
                }

                pdf =
                    <div style={{ zoom: 1 }} key={546546554654}>

                        <div className='pdfHeader'>
                            <img className="img-fluid" src="https://i.ibb.co/vmKJkx4/logo.png" alt="logo-lpc" border="0" style={{ width: '24%', height: '150px' }} />
                            <h3 className='pdfTitle'></h3>
                            <h4>Close to Real</h4>
                        </div>
                        <hr />
                        <div className='pdfContent'>
                            <div>
                                <table className='pdfTableCabecalho'>
                                    <tr>
                                        <td style={{ padding: "0px 3px 0px 3px" }} colSpan='2'><b style={{ paddingRight: 5 }}>COMPANY:</b> {util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].cliente)}</td>
                                        <td style={{ padding: "0px 3px 0px 3px" }}></td>
                                        <td style={{ padding: "0px 3px 0px 3px" }}></td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "0px 3px 0px 3px" }} colSpan='2'><b style={{ paddingRight: 5 }}>ADDRESS:</b> {`${util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].complemento)} ${util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].rua)} ${this.state.pdfContent[0].numero && this.state.pdfContent[0].numero != "0" ? this.state.pdfContent[0].numero : ""} ${this.state.pdfContent[0].cep && this.state.pdfContent[0].cep != "0" ? this.state.pdfContent[0].cep : ""}`}</td>
                                        <td style={{ padding: "0px 3px 0px 3px" }}></td>
                                        <td style={{ padding: "0px 3px 0px 3px" }}></td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "0px 3px 0px 3px" }} colSpan='2'><b style={{ paddingRight: 5 }}>Vessel Name:</b> {util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].nomeNavio)}</td>
                                        <td style={{ padding: "0px 3px 0px 3px", textAlign: "right" }} colSpan='2'><b style={{ paddingRight: 5 }}>Name of Port:</b> {util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].nomePorto)}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "0px 3px 0px 3px" }} colSpan='2'><b style={{ paddingRight: 5 }}>Arrived:</b> {moment(util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].data_chegada)).format('MMMM DD, YYYY')}</td>
                                        {this.state.pdfContent[0].data_saida && moment(this.state.pdfContent[0].data_saida).format("DD/MM/YYYY") != "Invalid date" &&
                                            <td style={{ padding: "0px 3px 0px 3px", textAlign: "right" }} colSpan='2'><b style={{ paddingRight: 5 }}>Sailed:</b> {moment(util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].data_saida)).format('MMMM DD, YYYY')}</td>
                                        }
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "0px 3px 0px 3px" }} colSpan='2'><b style={{ paddingRight: 5 }}>PO:</b> {util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].codigo)}</td>
                                        <td style={{ padding: "0px 3px 0px 3px", textAlign: "right" }} colSpan='2'><b style={{ paddingRight: 5 }}>O.C.C:</b> {util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].centro_custo)}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "0px 3px 0px 3px" }} colSpan='2'><b style={{ paddingRight: 5 }}>ROE:</b> {util.returnIfExists(this.state.pdfContent[0], this.state.pdfContent[0].roe.replaceAll('.', ','))}</td>
                                        <td style={{ padding: "0px 3px 0px 3px" }}></td>
                                        <td style={{ padding: "0px 3px 0px 3px" }}></td>
                                    </tr>
                                </table>
                                <br />
                            </div>
                        </div>
                        <div>
                            <table style={{ width: "90%", marginLeft: "5%" }}>
                                <tr>
                                    <td style={{ padding: "0px 3px 0px 3px" }} colSpan='2' className=' pdfTitle'></td>
                                    <td style={{ padding: "0px 3px 0px 3px" }}></td>
                                    <td style={{ padding: "0px 3px 0px 3px" }}></td>
                                </tr>
                                <tr>
                                </tr>
                                <tr>
                                    <td colSpan='2' style={{ padding: "0px 3px 0px 3px", paddingRight: 25, backgroundColor: "#ff5555" }}>DESCRICAO:</td>
                                    <td className='text-right' style={{ padding: "0px 3px 0px 3px", paddingRight: 25, backgroundColor: "#ff5555" }}>VALOR (USD)</td>
                                    <td className='text-right' style={{ padding: "0px 3px 0px 3px", paddingRight: 25, backgroundColor: "#ff5555" }}>VALOR (R$)</td>
                                </tr>
                                {this.state.pdfContent.map((e, index) => {
                                    if (e.moeda == 5) {
                                        valorTotal += parseFloat(e.valor);
                                        valorTotalDolar += parseFloat(parseFloat(e.valor / this.state.pdfContent[0].roe).toFixed(2))
                                    } else {
                                        valorTotal += parseFloat(parseFloat(e.valor * this.state.pdfContent[0].roe).toFixed(2));
                                        valorTotalDolar += parseFloat(e.valor)
                                    }
                                    return (
                                        <tr style={{ background: index % 2 == 0 ? "white" : "#dddddd" }}>
                                            <td colSpan='2' className='' style={{ padding: "0px 3px 0px 3px", background: index % 2 == 0 ? "white" : "#ccc", paddingRight: 50 }}>{e.descos}</td>
                                            <td className='text-right' style={{ padding: "0px 3px 0px 3px", background: index % 2 == 0 ? "white" : "#ccc", paddingRight: 25 }}>{e.moeda == 5 ? util.formataDinheiroBrasileiro(parseFloat(e.valor / this.state.pdfContent[0].roe)) : util.formataDinheiroBrasileiro(parseFloat(e.valor))}</td>
                                            <td className='text-right' style={{ padding: "0px 3px 0px 3px", background: index % 2 == 0 ? "white" : "#ccc", paddingRight: 25 }}>{e.moeda == 6 ? util.formataDinheiroBrasileiro(parseFloat(e.valor * this.state.pdfContent[0].roe)) : util.formataDinheiroBrasileiro(parseFloat(e.valor))}</td>
                                        </tr>
                                    )
                                })}
                                {this.state.pdfContent[0].governmentTaxes > 0 &&
                                    <tr>
                                        <td colSpan='2' className='' style={{ padding: "0px 3px 0px 3px" }}><b>GOVERNMENT TAXES</b></td>
                                        <td className='text-right' style={{ padding: "0px 3px 0px 3px", paddingRight: 25 }}><b>{util.formataDinheiroBrasileiro(parseFloat(this.state.pdfContent[0].governmentTaxes / this.state.pdfContent[0].roe))}</b></td>
                                        <td className='text-right' style={{ padding: "0px 3px 0px 3px", paddingRight: 25 }}><b>{util.formataDinheiroBrasileiro(parseFloat(this.state.pdfContent[0].governmentTaxes))}</b></td>
                                    </tr>
                                }
                                {this.state.pdfContent[0].bankCharges > 0 &&
                                    <tr styles={{ padding: "37px 0px 37px 0px" }}>
                                        <td colSpan='2' className='' style={{ padding: "0px 3px 0px 3px" }}><b>BANK CHARGES</b></td>
                                        <td className='text-right' style={{ padding: "0px 3px 0px 3px", paddingRight: 25 }}><b>{util.formataDinheiroBrasileiro(parseFloat(this.state.pdfContent[0].bankCharges / this.state.pdfContent[0].roe))}</b></td>
                                        <td className='text-right' style={{ padding: "0px 3px 0px 3px", paddingRight: 25 }}><b>{util.formataDinheiroBrasileiro(parseFloat(this.state.pdfContent[0].bankCharges))}</b></td>
                                    </tr>
                                }
                                <tr>
                                    <td style={{ padding: "0px 3px 0px 3px" }} colSpan='2' className=' pdfTitle'>Total</td>
                                    <td style={{ padding: "0px 3px 0px 3px", paddingRight: 25 }} className='text-right'><b>{util.formataDinheiroBrasileiro(parseFloat(valorTotalDolar))}</b></td>
                                    <td style={{ padding: "0px 3px 0px 3px", paddingRight: 25 }} className='text-right'><b>{util.formataDinheiroBrasileiro(parseFloat(valorTotal))}</b></td>
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
        } catch (err) {
            await this.setState({ erro: "Erro ao criar o pdf", loading: false });
        }
    }
    //

    GerarEtiqueta = async (codigo) => {
        await apiEmployee.post(`enviaEtiquetaOS.php`, {
            os: codigo,
            navio: this.state.naviosOptions.find((navio) => navio.value == this.state.navio) ? this.state.naviosOptions.find((navio) => navio.value == this.state.navio).label : "",
            cliente: this.state.clientesOptions.find((cliente) => cliente.value == this.state.cliente) ? this.state.clientesOptions.find((cliente) => cliente.value == this.state.cliente).label : "",
            servico: this.state.tiposServicosOptions.find((tipoServico) => tipoServico.value == this.state.tipoServico) ? this.state.tiposServicosOptions.find((tipoServico) => tipoServico.value == this.state.tipoServico).label : "",
            operador: this.state.operadoresOptions.find((operador) => operador.value == this.state.operador) ? this.state.operadoresOptions.find((operador) => operador.value == this.state.operador).label : "",
            porto: this.state.portosOptions.find((porto) => porto.value == this.state.porto) ? this.state.portosOptions.find((porto) => porto.value == this.state.porto).label : "",
            eta: moment(this.state.eta).format("DD/MM/YYYY") != "Invalid date" ? moment(this.state.eta).format("DD/MM/YYYY") : "T.B.I.",
            etb: moment(this.state.etb).format("DD/MM/YYYY") != "Invalid date" ? moment(this.state.etb).format("DD/MM/YYYY") : "T.B.I.",
            data_saida: moment(this.state.data_saida).format("DD/MM/YYYY") != "Invalid date" ? moment(this.state.data_saida).format("DD/MM/YYYY") : "T.B.I."
        })
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

    mudaValorEvento = async () => {
        this.setState({
            dadosFinaisSol: [
                { titulo: 'Moeda', valor: this.state.eventoMoeda },
                { titulo: 'valor', valor: this.state.eventoValor }
            ]
        })

        await apiEmployee.post(`updateSolicitacaoValor.php`, {
            chave: this.state.eventoChave,
            Moeda: this.state.eventoMoeda,
            valor: this.state.eventoValor,
        }).then(
            async res => {
                await loader.salvaLogs('os_servicos_itens', this.state.usuarioLogado.codigo, this.state.dadosIniciaisSol, this.state.dadosFinaisSol, this.state.eventoChave);

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
        let logs = await loader.getLogsOS(this.state.chave, this.state.todasEventos.map((e) => e.chave));

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
        validations.push(this.state.roe && this.state.roe == parseFloat(this.state.roe));
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
                        className={"pdfExp"}
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

                {this.state.recarregaPagina &&
                    <>
                        <Redirect to={{ pathname: `/ordensservico/addos/${this.state.chave}`, state: { ... this.props.location.state, os: { ... this.state.os } } }} />
                        {window.location.reload()}
                    </>
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
                        <Modal
                            aria-labelledby="transition-modal-title"
                            aria-describedby="transition-modal-description"
                            style={{ display: 'flex', justifyContent: 'center', paddingTop: '5%', paddingBottom: '5%', overflow: 'scroll' }}
                            open={this.state.cabecalhoModal}
                            onClose={async () => { await this.setState({ cabecalhoModal: false }); await this.salvarCabecalho() }}
                        >
                            <div className='modalContainer'>
                                <div className='modalCriar'>
                                    <div className='containersairlistprodmodal'>
                                        <div className='botaoSairModal' onClick={async () => await this.setState({ cabecalhoModal: false })}>
                                            <span>X</span>
                                        </div>
                                    </div>
                                    <div className='modalContent'>
                                        <div className='tituloModal'>
                                            <span>Cabeçalho:</span>
                                        </div>


                                        <div className='modalForm'>
                                            <Formik
                                                initialValues={{
                                                    name: '',
                                                }}
                                                onSubmit={async values => {
                                                    await new Promise(r => setTimeout(r, 1000))
                                                    await this.salvarCabecalho();

                                                }}
                                            >
                                                <Form className="contact-form" >


                                                    <div className="row">

                                                        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 ">

                                                            <div className="row addservicos">
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Company:</label>
                                                                </div>
                                                                <div className="col-1 errorMessage">

                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Field className="form-control" type="text" value={this.state.company} onChange={async e => { this.setState({ company: e.currentTarget.value }) }} />
                                                                </div>
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Address:</label>
                                                                </div>
                                                                <div className="col-1 errorMessage">

                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Field className="form-control" type="text" value={this.state.address} onChange={async e => { this.setState({ address: e.currentTarget.value }) }} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                                    </div>

                                                    <div className="row">
                                                        <div className="col-2"></div>
                                                        <div className="col-8" style={{ display: 'flex', justifyContent: 'center' }}>
                                                            <button type="submit" style={{ width: 300 }} >Salvar</button>
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
                            evento
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
                            <Alert alert={this.state.error} setAlert={(value) => this.setState({ error: value })} />

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
                                                                <Select className='SearchSelect' options={this.state.clientesOptions.filter(e => this.filterSearch(e, this.state.clientesOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ clientesOptionsTexto: e }) }} value={this.state.clientesOptions.filter(option => option.value == this.state.cliente)[0]} search={true} onChange={async (e) => { await this.setState({ cliente: e.value, }); await this.getDadosCliente() }} />
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
                                                                <label>Operador</label>
                                                            </div>
                                                            <div className="col-1 errorMessage">
                                                            </div>
                                                            <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                                                <Select className='SearchSelect' options={this.state.operadoresOptions.filter(e => this.filterSearch(e, this.state.operadoresOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ operadoresOptionsTexto: e }) }} value={this.state.operadoresOptions.filter(option => option.value == this.state.operador)[0]} search={true} onChange={(e) => { this.setState({ operador: e.value, }) }} />
                                                            </div>
                                                            <div className="col-xl-1 col-lg-2 col-md-2 col-sm-12 col-12"></div>
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
                                                                <label>E.T.S</label>
                                                            </div>
                                                            <div className="col-1 errorMessage">
                                                            </div>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                                <Field className="form-control" type="date" value={this.state.data_saida} onChange={async e => { this.setState({ data_saida: e.currentTarget.value }) }} />
                                                            </div>
                                                            <div className="col-1"></div>
                                                            {this.state.governmentTaxes &&
                                                                <>
                                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                        <label>Government Taxes</label>
                                                                    </div>
                                                                    <div className='col-1 errorMessage'>
                                                                    </div>
                                                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                        <Field className="form-control text-right" type="text" step="0.1" value={this.state.governmentTaxes} disabled />
                                                                    </div>
                                                                    <div className='col-1 errorMessage'>
                                                                    </div>
                                                                </>
                                                            }
                                                            {this.state.bankCharges &&
                                                                <>
                                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                        <label>Bank Charges</label>
                                                                    </div>
                                                                    <div className='col-1 errorMessage'>
                                                                    </div>
                                                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                        <Field className="form-control text-right" type="text" step="0.1" value={this.state.bankCharges} disabled />
                                                                    </div>
                                                                    <div className='col-1 errorMessage'>
                                                                    </div>
                                                                </>
                                                            }

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
                                                            <div className='col-xl-5 col-lg-5 col-md-5 col-sm-12 col-12 labelForm'>
                                                                <button
                                                                    disabled={!validForm}
                                                                    type="button"
                                                                    style={validForm ? { width: 150, height: 50, padding: 5, color: "white", border: "1px solid #efefef", marginBottom: 25 } : { backgroundColor: '#999', opacity: 0.3, width: 150, height: 50, padding: 5, color: "#ccc", border: "1px solid #ccc", marginBottom: 25 }}
                                                                    onClick={() => { this.setState({ cabecalhoModal: true }) }}
                                                                >Editar Cabeçalho
                                                                </button>
                                                            </div>
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
                                                                <Select className='SearchSelect' options={this.state.clientesOptions.filter(e => this.filterSearch(e, this.state.clientesOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ clientesOptionsTexto: e }) }} value={this.state.clientesOptions.filter(option => option.value == this.state.cliente)[0]} search={true} onChange={async (e) => { await this.setState({ cliente: e.value, }); await this.getDadosCliente() }} />
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
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Operador</label>
                                                            </div>
                                                            <div className="col-1 errorMessage">
                                                            </div>
                                                            <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                                                <Select className='SearchSelect' options={this.state.operadoresOptions.filter(e => this.filterSearch(e, this.state.operadoresOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ operadoresOptionsTexto: e }) }} value={this.state.operadoresOptions.filter(option => option.value == this.state.operador)[0]} search={true} onChange={(e) => { this.setState({ operador: e.value, }) }} />
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
                                                                <label>E.T.S</label>
                                                            </div>
                                                            <div className="col-1 errorMessage">
                                                            </div>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                                <Field className="form-control" type="date" value={this.state.data_saida} onChange={async e => { this.setState({ data_saida: e.currentTarget.value }) }} />
                                                            </div>
                                                            <div className="col-1"></div>
                                                            {this.state.governmentTaxes &&
                                                                <>
                                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                        <label>Government Taxes</label>
                                                                    </div>
                                                                    <div className='col-1 errorMessage'>
                                                                    </div>
                                                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                        <Field className="form-control text-right" type="text" step="0.1" value={this.state.governmentTaxes} disabled />
                                                                    </div>
                                                                    <div className='col-1 errorMessage'>
                                                                    </div>
                                                                </>
                                                            }
                                                            {this.state.bankCharges &&
                                                                <>
                                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                        <label>Bank Charges</label>
                                                                    </div>
                                                                    <div className='col-1 errorMessage'>
                                                                    </div>
                                                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                        <Field className="form-control text-right" type="text" step="0.1" value={this.state.bankCharges} disabled />
                                                                    </div>
                                                                    <div className='col-1 errorMessage'>
                                                                    </div>
                                                                </>
                                                            }
                                                            <div>
                                                                <hr />
                                                            </div>
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
                                    <>

                                        <div>
                                            <div className="page-breadcrumb2"><h3>Relatórios</h3></div>
                                        </div>
                                        <br />
                                        <div className="relatoriosSection">
                                            <div className="relatorioButton">
                                                <button className="btn btn-danger" onClick={() => this.CloseToReal(this.state.os.codigo, validForm)}>Close to Real</button>
                                            </div>
                                            <div className="relatorioButton">
                                                <button className="btn btn-danger" onClick={() => this.RelatorioVoucher(this.state.os.codigo, validForm)}>Vouchers</button>
                                            </div>
                                            <div className="relatorioButton">
                                                <button className="btn btn-danger" onClick={() => this.CapaVoucher(this.state.os.codigo, validForm)}>Capa</button>
                                            </div>
                                            <div className="relatorioButton">
                                                <button className="btn btn-danger" onClick={() => this.FaturamentoCusteio(this.state.os.codigo, validForm)}>Relatório Líquidos</button>
                                            </div>
                                            <div className="relatorioButton">
                                                <button className="btn btn-danger" onClick={() => this.GerarEtiqueta(this.state.os.codigo)}>Enviar Etiqueta</button>
                                            </div>
                                            <div className="relatorioButton">
                                                <button className="btn btn-danger"><Link style={{ color: "inherit", textDecoration: "none" }} to={{ pathname: "/financeiro/addFatura/0", state: { backTo: `/ordensservicos/os/${this.state.chave}`, os: this.state.os } }}>Emitir NF</Link></button>
                                            </div>
                                        </div>

                                    </>
                                }

                                {this.props.match.params.id != 0 && this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'SERVICOS_ITENS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&

                                    <div>
                                        <br />
                                        <br />
                                        <div>
                                            <div>
                                                <div className="page-breadcrumb2"><h3>Eventos</h3></div>
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
                                                                                <span>Valor (USD)</span>
                                                                            </th>
                                                                            <th className='text-center'>
                                                                                <span>Valor (R$)</span>
                                                                            </th>
                                                                            <th className='text-center'>
                                                                                <span>
                                                                                    {!this.state.eventos[1] &&

                                                                                        <Link to=
                                                                                            {{
                                                                                                pathname: `/ordensservico/addevento/0`,
                                                                                                state: { evento: {}, os: { ...this.state.os, addOS: true } }
                                                                                            }}
                                                                                        >
                                                                                            <FontAwesomeIcon icon={faPlus} />
                                                                                        </Link>
                                                                                    }
                                                                                </span>
                                                                            </th>
                                                                        </tr>
                                                                        {this.state.eventos[0] != undefined && this.state.eventos.map((feed, index) => (
                                                                            <>
                                                                                {window.innerWidth < 500 &&
                                                                                    <tr
                                                                                        onClick={() => {
                                                                                            this.setState({
                                                                                                eventoChave: feed.chave,
                                                                                                eventoMoeda: feed.Moeda,
                                                                                                eventoValor: new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(feed.valor),
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
                                                                                                    pathname: `/ordensservico/addevento/0`,
                                                                                                    state: { evento: { ...feed }, os: { ...this.state.os, addOS: true } }
                                                                                                },
                                                                                                itemEdit: {
                                                                                                    pathname: `/ordensservico/addevento/${feed.chave}`,
                                                                                                    state: { evento: { ...feed }, os: { ... this.state.os, addOS: true } }
                                                                                                },
                                                                                                itemFinanceiro: {
                                                                                                    pathname: `/ordensservico/addeventofinanceiro/${feed.chave}`,
                                                                                                    state: { evento: { ...feed }, os: { ...this.state.os, addOS: true } }
                                                                                                },
                                                                                                itemEditMini: feed.repasse == 0 ? {
                                                                                                    onSubmit: async () => await this.mudaValorEvento(),
                                                                                                    valores: [
                                                                                                        {
                                                                                                            half: true,
                                                                                                            titulo: "Valor",
                                                                                                            valor1: feed.Moeda,
                                                                                                            tipo1: "select",
                                                                                                            options1: this.state.moedasOptions,
                                                                                                            onChange1: async (valor) => { await this.setState({ eventoMoeda: valor }); await this.reloadItemEditMini() },
                                                                                                            valor2: new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(feed.valor),
                                                                                                            tipo2: "text",
                                                                                                            onChange2: async (valor) => { await this.setState({ eventoValor: valor }); await this.reloadItemEditMini() },
                                                                                                            onBlur2: async (valor) => { await this.setState({ eventoValor: Number(valor.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR').format(valor.replaceAll('.', '').replaceAll(',', '.')) : '' }); await this.reloadItemEditMini() },
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
                                                                                            <p>USD {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(feed.Moeda == 6 ? feed.valor : feed.valor / (parseFloat(this.state.os.ROE) != 0 ? parseFloat(this.state.os.ROE) : 5))}</p>
                                                                                        </td>
                                                                                        <td className="text-center">
                                                                                            <p>R$ {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(feed.Moeda == 5 ? feed.valor : feed.valor * (parseFloat(this.state.os.ROE) != 0 ? parseFloat(this.state.os.ROE) : 5))}</p>
                                                                                        </td>
                                                                                        <td>
                                                                                            <span className='iconelixo giveMargin' type='button' >
                                                                                                <Link to=
                                                                                                    {{
                                                                                                        pathname: `/ordensservico/addevento/0`,
                                                                                                        state: { evento: { ...feed }, os: { ...this.state.os } }
                                                                                                    }}
                                                                                                >
                                                                                                    <FontAwesomeIcon icon={faPlus} />
                                                                                                </Link>
                                                                                            </span>


                                                                                            <span className='iconelixo giveMargin' type='button' >
                                                                                                <Link to=
                                                                                                    {{
                                                                                                        pathname: `/ordensservico/addevento/${feed.chave}`,
                                                                                                        state: { evento: { ...feed }, os: { ... this.state.os } }
                                                                                                    }}
                                                                                                >
                                                                                                    <FontAwesomeIcon icon={faPen} />
                                                                                                </Link>
                                                                                            </span>

                                                                                            <span className='iconelixo giveMargin' type='button' >
                                                                                                <Link to=
                                                                                                    {{
                                                                                                        pathname: `/ordensservico/addeventofinanceiro/${feed.chave}`,
                                                                                                        state: { evento: { ...feed }, os: { ...this.state.os } }
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
                                                                                                eventoChave: feed.chave,
                                                                                                eventoMoeda: feed.Moeda,
                                                                                                eventoValor: new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(feed.valor),
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
                                                                                                    pathname: `/ordensservico/addevento/0`,
                                                                                                    state: { evento: { ...feed }, os: { ...this.state.os, addOS: true } }
                                                                                                },
                                                                                                itemEdit: {
                                                                                                    pathname: `/ordensservico/addevento/${feed.chave}`,
                                                                                                    state: { evento: { ...feed }, os: { ... this.state.os, addOS: true } }
                                                                                                },
                                                                                                itemFinanceiro: {
                                                                                                    pathname: `/ordensservico/addeventofinanceiro/${feed.chave}`,
                                                                                                    state: { evento: { ...feed }, os: { ...this.state.os, addOS: true } }
                                                                                                },
                                                                                                itemEditMini: feed.repasse == 0 ? {
                                                                                                    onSubmit: async () => await this.mudaValorEvento(),
                                                                                                    valores: [
                                                                                                        {
                                                                                                            half: true,
                                                                                                            titulo: "Valor",
                                                                                                            valor1: feed.Moeda,
                                                                                                            tipo1: "select",
                                                                                                            options1: this.state.moedasOptions,
                                                                                                            onChange1: async (valor) => { await this.setState({ eventoMoeda: valor }); await this.reloadItemEditMini() },
                                                                                                            valor2: new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(feed.valor),
                                                                                                            tipo2: "text",
                                                                                                            onChange2: async (valor) => { await this.setState({ eventoValor: valor }); await this.reloadItemEditMini() },
                                                                                                            onBlur2: async (valor) => { await this.setState({ eventoValor: Number(valor.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR').format(valor.replaceAll('.', '').replaceAll(',', '.')) : '' }); await this.reloadItemEditMini() },
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
                                                                                            <p>USD {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(feed.Moeda == 6 ? feed.valor : feed.valor / (parseFloat(this.state.os.ROE) != 0 ? parseFloat(this.state.os.ROE) : 5))}</p>
                                                                                        </td>
                                                                                        <td className="text-center">
                                                                                            <p>R$ {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(feed.Moeda == 5 ? feed.valor : feed.valor * (parseFloat(this.state.os.ROE) != 0 ? parseFloat(this.state.os.ROE) : 5))}</p>
                                                                                        </td>
                                                                                        <td>
                                                                                            <span className='iconelixo giveMargin' type='button' >
                                                                                                <Link to=
                                                                                                    {{
                                                                                                        pathname: `/ordensservico/addevento/0`,
                                                                                                        state: { evento: { ...feed }, os: { ...this.state.os } }
                                                                                                    }}
                                                                                                >
                                                                                                    <FontAwesomeIcon icon={faPlus} />
                                                                                                </Link>
                                                                                            </span>


                                                                                            <span className='iconelixo giveMargin' type='button' >
                                                                                                <Link to=
                                                                                                    {{
                                                                                                        pathname: `/ordensservico/addevento/${feed.chave}`,
                                                                                                        state: { evento: { ...feed }, os: { ... this.state.os } }
                                                                                                    }}
                                                                                                >
                                                                                                    <FontAwesomeIcon icon={faPen} />
                                                                                                </Link>
                                                                                            </span>

                                                                                            <span className='iconelixo giveMargin' type='button' >
                                                                                                <Link to=
                                                                                                    {{
                                                                                                        pathname: `/ordensservico/addeventofinanceiro/${feed.chave}`,
                                                                                                        state: { evento: { ...feed }, os: { ...this.state.os } }
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
                                                                        )
                                                                        )}
                                                                        {this.state.eventos[0] &&
                                                                            <>
                                                                                {
                                                                                    window.innerWidth < 500 &&
                                                                                    <tr className={this.state.eventos.length % 2 == 0 ? "parTr" : "imparTr"}>
                                                                                        <td className="text-center"></td>
                                                                                        <td className="text-center">Total</td>
                                                                                        <td className="text-center">
                                                                                            <p>USD {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.state.eventosTotal / (parseFloat(this.state.os.ROE) != 0 ? parseFloat(this.state.os.ROE) : 5))}</p>
                                                                                        </td>
                                                                                        <td className="text-center">
                                                                                            <p>R$ {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.state.eventosTotal)}</p>
                                                                                        </td>
                                                                                        <td></td>
                                                                                    </tr>
                                                                                }
                                                                                {window.innerWidth >= 500 &&
                                                                                    <tr className={this.state.eventos.length % 2 == 0 ? "parTr" : "imparTr"}>
                                                                                        <td className="text-center"></td>
                                                                                        <td className="text-center">Total</td>
                                                                                        <td className="text-center"></td>
                                                                                        <td className="text-center"></td>
                                                                                        <td className="text-center">
                                                                                            <p>USD {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.state.eventosTotal / (parseFloat(this.state.os.ROE) != 0 ? parseFloat(this.state.os.ROE) : 5))}</p>
                                                                                        </td>
                                                                                        <td className="text-center">
                                                                                            <p>R$ {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.state.eventosTotal)}</p>
                                                                                        </td>
                                                                                        <td></td>
                                                                                    </tr>
                                                                                }
                                                                            </>
                                                                        }
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

