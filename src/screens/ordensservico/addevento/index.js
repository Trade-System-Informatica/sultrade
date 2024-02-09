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
import ModalCopiarCampos from '../../../components/modalCopiarCampos'

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
    valor: '',
    vlrc: '',
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

    templatesModal: false,
    templates: [],

    anexosForn: [],

    anexosValidadosOptions: [
        { label: "Aguardando...", value: 0 },
        { label: "Invalidado", value: 1 },
        { label: "Aprovado", value: 2 },
        { label: "Validado", value: 3, nonSelectable: true }
    ]
}

class AddEvento extends Component {

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        window.scrollTo(0, 0)
        var id = await this.props.match.params.id
        await this.setState({ chave: id })
        if (this.props.location?.state?.os) {
            const os = {
                value: this.props.location.state.os.Chave,
                navio: this.props.location.state.os.chave_navio,
                viagem: this.props.location.state.os.viagem
            }
            await this.changeOS(os);
            await this.getOrdem();
            if (!this.props.location.state.liberar_os) {
                await this.setState({ os: this.props.location.state.os })
            }
        }
        if (parseInt(id) != 0) {
            if (!this.props.location || !this.props.location.state || !this.props.location.state.evento) {
                const evento = await loader.getBody(`getSolicitacao.php`, { chave: this.state.chave });
                await this.setState({ evento: evento[0] });
            } else {
                await this.setState({ evento: this.props.location.state.evento });
            }

            await this.getOSUma();
            await this.getOrdem();
            await this.setState({
                data: this.state.evento.data,
                fornecedor: this.state.evento.fornecedor,
                moeda: this.state.evento.Moeda,
                fornecedorInicial: this.state.evento.fornecedor,
                taxa: this.state.evento.taxa,
                descricao: this.state.evento.descricao,
                tipo: this.state.evento.tipo_sub,
                ordem: this.state.evento.ordem,
                remarks: this.state.evento.remarks,
                valor: this.state.evento.valor,
                valor: new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.state.evento.valor),
                vlrc: new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.state.evento.valor1),
                repasse: this.state.evento.repasse == 1 ? true : false,
                fornecedorCusteio: this.state.evento.Fornecedor_Custeio,
                ordemBloqueado: false,
                emailEnviado: this.state.evento.email_enviado ? this.state.evento.email_enviado.split(';') : [],
                dataEmail: this.state.evento.data_email
            })

            if (this.state.repasse) {
                this.setState({
                    valor: this.state.vlrc
                });
            }

            this.changeTaxa(this.state.taxa);
            this.getdadosComplementares();
        }
        await this.carregaTiposAcessos()
        await this.carregaPermissoes()
        await this.testaAcesso()
        await this.getOS();
        await this.getTaxas();
        await this.getMoedas();
        await this.getPessoas();
        await this.getDescricaoPadrao();
        await this.getDocumentos();
        await this.getTiposDocumento();
        await this.getTemplates();

        if (this.state.chave != 0) {
            const anexos = await loader.getBody("getAnexos.php", { evento: this.state.chave, token: true });
            console.log(anexos);

            await this.setState({
                anexosForn: anexos?.filter((an) => (anexos.validado == 0 || !anexos.validado))
            });

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

    getTemplates = async () => {
        await apiEmployee.post(`getEventosTemplates.php`, {
            token: true,
            empresa: this.state.usuarioLogado.empresa
        }).then(
            async res => {
                await this.setState({ templates: res.data })
            },
            async err => { this.erroApi(err) }
        )
    }

    setTemplates = async (evento) => {
        this.setState({
            data: evento.data || this.state.data,
            fornecedor: evento.fornecedor || this.state.fornecedor,
            moeda: evento.Moeda || this.state.moeda,
            taxa: evento.taxa || this.state.taxa,
            descricao: evento.descricao || this.state.descricao,
            tipo: evento.tipo_sub || this.state.tipo,
            remarks: evento.remarks || this.state.remarks,
            valor: evento.valor || this.state.valor,
            valor: new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(evento.valor || this.state.valor),
            vlrc: new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(evento.valor1 || this.state.vlrc),
            repasse: evento.repasse == 1 ? true : false,
            fornecedorCusteio: evento.Fornecedor_Custeio || this.state.fornecedorCusteio,
        });
    }
    
    getOSUma = async () => {
        await apiEmployee.post(`getOSUma.php`, {
            token: true,
            chave_os: this.state.evento.chave_os
        }).then(
            async res => {
                await this.setState({ os: res.data[0] })
                const os = {
                    value: this.state.os.Chave,
                    navio: this.state.os.chave_navio,
                    viagem: this.state.os.viagem
                }
                await this.changeOS(os);

            },
            async err => { this.erroApi(err) }
        )
    }

    getOS = async () => {
        await apiEmployee.post(`getOS.php`, {
            token: true
        }).then(
            async res => {
                await this.setState({ todasOs: res.data })

                const options = this.state.todasOs?.map((e) => {
                    return { label: e.codigo, value: e.Chave, navio: e.chave_navio, navioNome: e.navioNome, porto: e.porto, portoNome: e.portoNome, viagem: e.viagem }
                })

                await this.setState({ osOptions: options })
            },
            async err => { this.erroApi(err) }
        )
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

    getdadosComplementares = async () => {
        await apiEmployee.post(`getEventoComplementar.php`, {
            token: true,
            chave: this.state.chave
        }).then(
            async res => {
                if (res.data[0]) {
                    await this.setState({ eventoComplementar: res.data })

                    res.data.forEach((res) => {
                        const idx = this.state.campos.findIndex((campo) => (res.subgrupo_campo == campo.chave));

                        if (idx !== -1) {
                            this.setState({ campos: this.state.campos.map((c, i) => i === idx ? ({ ...c, valor: res.valor }) : ({ ...c })) });
                        }
                    });
                }
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

    changeOS = async (e) => {
        if (e.viagem == null) {
            e.viagem = '';
        }
        this.setState({ chave_os: e.value, viagem_os: e.viagem });

        await apiEmployee.post('getNavio.php', {
            token: true,
            chave: e.navio
        }).then(
            async res => {
                if (res.data[0]) {
                    this.setState({ navio_os: res.data[0].nome })
                } else {
                    this.setState({ navio_os: '' })
                }
            },
            async err => { this.erroApi(err) }
        )

    }

    getDocumentos = async () => {
        await apiEmployee.post(`getDocumentosOSI.php`, {
            token: true,
            chave: this.state.chave

        }).then(
            async response => {
                await this.setState({ documentos: response.data })

            },
            response => { alert(response) }

        )
    }

    setCamposCopiar = async () => {
        this.setState({
            camposCopiar: this.state.campos.map((e, i) => ({
                ...e,
                checked: false,
                onChange: (index) => this.setState({ camposCopiar: this.state.camposCopiar.map((e, i) => i === index ? ({ ...e, checked: !e.checked }) : ({ ...e })) })
            })),
        })
        const eventosIrmaos = await loader.getBody(`getEventosIrmaos.php`, {
            os: this.state.osOptions.find(option => option.value == this.state.chave_os)?.label,
        });
        const camposEvento = this.state.campos?.map((c) => c.nome)?.toSorted();
        console.log(this.state.campos);

        this.setState({
            eventosIrmaos: eventosIrmaos.filter((e) => {
                if (e.chave == this.state.chave) {
                    return false;
                }

                const campos = e.campos?.split("@.@")?.toSorted();
                let camposIguais = true;

                if (campos) {
                    campos.forEach((c, i) => {
                        if (c != camposEvento[i]) {
                            camposIguais = false;
                        }
                    })

                    return camposIguais;
                } else {
                    return false;
                }
            })
        });
    }

    copiarCampos = async (eventos) => {
        await apiEmployee.post(`insertEventosCamposCopiados.php`, {
            valores: this.state.campos.filter((c) => this.state.camposCopiar.find((campo) => campo.checked && c.chave == campo.chave)).map((campo) => ({ valor: campo?.valor, subgrupo_campo: campo.chave })),
            eventos,
        }).then(
            async res => {
            },
            async err => {
                console.log(err);
            }
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

    enviaDocumento = async () => {
        let documento = '';
        let format = '';
        let ext = '';
        if (this.state.documento[0]) {
            documento = await util.getBase64(this.state.documento[0]);
            format = this.state.documento[0].type;
            ext = this.state.documentoNome.split('.')[this.state.documentoNome.split('.').length - 1];
        }
        if (!this.state.documentoEditar) {
            await apiEmployee.post(`enviaDocumento.php`, {
                documento: documento,
                format: format,
                ext: ext,
                chave_os: this.state.chave_os,
                chave_osi: this.state.chave,
                descricao: this.state.documentoDescricao,
                tipo: this.state.documentoTipo,
            }).then(
                async res => {
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
                        window.location.reload();
                    },
                    async res => await console.log(`Erro: ${res}`)
                )
            }
        }
    }

    removeEmail = async (email) => {
        const todasFailures = this.state.failures;

        const failures = todasFailures.filter((e) => e != email)
        await this.setState({ failures });
    }

    enviarEmail = async (validFormEmail) => {
        await this.setState({ successes: [] });
        if (!validFormEmail) {
            return;
        }

        await this.setState({ emailBloqueado: true, loading: true });
        await apiEmployee.post(`enviaEmail.php`, {
            token: true,
            emails: this.state.emails,
            remarks: this.state.remarks,
            os: this.state.osOptions.find((e) => e.value == this.state.chave_os).label,
            fornecedor: this.state.fornecedorCusteio != "" && this.state.fornecedorCusteio != "0" ? this.state.fornecedorCusteio : this.state.fornecedor,
            navio: this.state.osOptions.find((e) => e.value == this.state.chave_os).navioNome,
            porto: this.state.osOptions.find((e) => e.value == this.state.chave_os).portoNome,
            evento: this.state.chave,
            operador: this.state.usuarioLogado.nome,
            corpo: this.state.corpo,
            assunto: this.state.assunto,
            anexos: this.state.anexos,
            anexosNomes: this.state.anexosNomes,
        }).then(
            async res => {
                const { failures, successes } = res.data;


                await this.setState({ evento: await loader.getOne(`getSolicitacao.php`, this.state.chave) });
                await this.setState({
                    data: this.state.evento.data,
                    fornecedor: this.state.evento.fornecedor,
                    taxa: this.state.evento.taxa,
                    descricao: this.state.evento.descricao,
                    tipo: this.state.evento.tipo_sub,
                    ordem: this.state.evento.ordem,
                    remarks: this.state.evento.remarks,
                    fornecedorCusteio: this.state.evento.Fornecedor_Custeio,
                    ordemBloqueado: false,
                    emailEnviado: this.state.evento.email_enviado ? this.state.evento.email_enviado.split(';') : [],
                    dataEmail: this.state.evento.data_email
                })
                if (res.data.successes[0]) {
                    await this.registraEmails(res.data.successes);
                }

                await this.setState({ successes, failures, emails: [] });


                if (!failures[0]) {
                    await this.setState({ email: false });
                }

            },
            async res => await console.log(`Erro: ${JSON.stringify(res)}`)
        )
        await this.setState({ emailBloqueado: false, loading: false });
    }

    getPessoaContatos = async (pessoa) => {
        await apiEmployee.post(`getContatos.php`, {
            token: true,
            pessoa: pessoa
        }).then(
            async response => {
                await this.setState({ contatos: response.data, fornecedorEmail: response.data.find((e) => e.Tipo == "EM") ? response.data.find((e) => e.Tipo == "EM").Campo1 : "" })
                const emails = this.state.emails[0] ? this.state.emails : [];
                const emailsFornecedores = this.state.fornecedorEmail ? this.state.fornecedorEmail.split("; ") : [];
                console.log({ emails, emailsFornecedores });
                await this.setState({ emails: [...emails, ...emailsFornecedores], hasEmail: !![...emails, ...emailsFornecedores][0] })
                await this.setState({ loading: false })
            },
            response => { this.erroApi(response) }
        )
    }

    addAnexo = async (target) => {
        const anexos = this.state.anexos;
        const nomes = this.state.anexosNomes;
        const formats = this.state.formats;
        const exts = this.state.exts;

        const nome = target.files[0].name;
        const anexo = await util.getBase64(target.files[0]);

        anexos.push(anexo)
        formats.push(target.type);
        exts.push(nome.split('.')[nome.split('.').length - 1]);
        nomes.push(nome);

        this.setState({
            anexos,
            anexosNomes: nomes,
            formats,
            exts
        });
    }

    removeAnexo = async (index) => {
        const anexos = this.state.anexos.filter((e, i) => i != index);
        const nomes = this.state.anexosNomes.filter((e, i) => i != index);
        const formats = this.state.formats.filter((e, i) => i != index);
        const exts = this.state.exts.filter((e, i) => i != index);

        this.setState({
            anexos,
            anexosNomes: nomes,
            formats,
            exts
        });
    }

    registraEmails = async (emails) => {
        await this.setState({
            emailsIniciais: [
                { titulo: "email_enviado", valor: this.state.emailEnviado },
                { titulo: "data_email", valor: this.state.dataEmail }
            ]
        })
        const email_enviado = emails.join(';');

        await this.setState({
            emailsFinais: [
                { titulo: "email_enviado", valor: email_enviado },
                { titulo: "data_email", valor: moment().format('YYYY-MM-DD') }
            ]
        })

        await apiEmployee.post(`registraEmails.php`, {
            token: true,
            email_enviado,
            data_email: moment().format('YYYY-MM-DD'),
            chave: this.state.chave
        }).then(
            async res => {
                if (res.data == true) {
                    loader.salvaLogs("os_servicos_itens", this.state.usuarioLogado.codigo, this.state.emailsIniciais, this.state.emailsFinais, this.state.chave)
                } else {
                    console.log(res.data)
                }
            },
            async err => {
                console.log(err);
            }
        )
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
                                                //alert('Pessoa Removida!')
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

    salvarAnexos = async () => {
        this.setState({ loading: true, anexosModal: false })
        const validadoData = moment().format("YYYY-MM-DD HH:mm:ss");

        await apiEmployee.post(`updateAnexos.php`, {
            token: true,
            anexos: this.state.anexosForn.filter((anexo) => !anexo.validadoPor),
            validadoPor: this.state.usuarioLogado.codigo,
            validadoData,
        }).then(
            async res => {
                this.setState({
                    anexosForn: this.state.anexosForn.map((anexo) => !anexo.validadoPor ? ({ ...anexo, validadoData, validadoPor: this.state.usuarioLogado.codigo }) : ({ ...anexo })),
                    bloqueado: false,
                    loading: false
                });
            },
            async res => await console.log(`Erro: ${res}`)
        )

        this.setState({ loading: false });

    }

    salvarEvento = async (validForm) => {
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

        const os = this.state.osOptions.find(option => option.value == this.state.chave_os).label;
        const navio = this.state.osOptions.find((e) => e.value == this.state.chave_os).navioNome;
        const porto = this.state.osOptions.find((e) => e.value == this.state.chave_os).portoNome;

        this.setState({ assunto: `PO: ${os} - Nome do Navio: ${navio} - Porto: ${porto}\n` });

        if (parseInt(this.state.chave) === 0 && validForm) {
            await apiEmployee.post(`insertServicoItemBasico.php`, {
                token: true,
                values: `'${this.state.chave_os}', '${this.state.data}', '${this.state.fornecedor}', '${this.state.taxa}', '${this.state.descricao}', '${this.state.tipo}', '${this.state.fornecedorCusteio}', '${this.state.remarks}', '${this.state.moeda}', '${parseFloat(this.state.valor == "" ? 0 : this.state.valor.replaceAll('.', '').replaceAll(',', '.'))}', '${parseFloat(this.state.vlrc == "" ? 0 : this.state.vlrc.replaceAll('.', '').replaceAll(',', '.'))}', '${this.state.repasse ? 1 : 0}'`,
                chave_os: this.state.chave_os,
                ordem: this.state.ordem.replaceAll(',', '.')
            }).then(
                async res => {
                    await this.setState({
                        evento: res.data[0],

                    });
                    await this.setState({
                        chave: this.state.evento.chave,
                    })
                    await loader.salvaLogs('os_servicos_itens', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].chave);

                    if (!this.state.email) {
                        if (this.state.financeiro) {
                            await this.setState({ irParaFinanceiro: true })
                        } else {
                            await this.setState({ loading: false, bloqueado: false })
                            this.finalizaSalvamento()
                        }
                    } else {
                        await this.getPessoaContatos(this.state.fornecedor)
                        await this.getPessoaContatos(this.state.fornecedorCusteio)
                        await this.setState({ bloqueado: false, emailModal: true })
                        this.finalizaSalvamento()
                    }

                },
                async res => await console.log(`Erro: ${res.data}`)
            )

            if (this.state.campos[0]) {
                await apiEmployee.post(`insertEventoCampos.php`, {
                    token: true,
                    values: this.state.campos,
                    evento: this.state.chave
                }).then(
                    async res => {
                        this.getdadosComplementares();
                    },
                    async err => await console.log(`Erro: ${err.data}`)
                );
            }
        } else if (validForm) {
            await apiEmployee.post(`updateServicoItem.php`, {
                token: true,
                chave: this.state.chave,
                chave_os: this.state.chave_os,
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
                remarks: this.state.remarks,

            }).then(
                async res => {
                    if (res.data[0]) {
                        await loader.salvaLogs('os_servicos_itens', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.chave, `SOLICITAÇÃO DE SERVIÇO: ${this.state.descricao}`);
                        if (!this.state.email) {
                            if (this.state.financeiro) {
                                await this.setState({ irParaFinanceiro: true })
                            } else {
                                await this.setState({ loading: false, bloqueado: false })

                                this.finalizaSalvamento()
                            }
                        } else {
                            this.setState({ emails: "" });
                            await this.getPessoaContatos(this.state.fornecedor)
                            await this.getPessoaContatos(this.state.fornecedorCusteio)
                            await this.setState({ bloqueado: false, emailModal: true, loading: false })
                        }
                    } else {
                        await alert(`Erro ${JSON.stringify(res)}`)
                    }
                },
                async res => await console.log(`Erro: ${res}`)
            )

            if (this.state.eventoComplementar[0]) {
                await apiEmployee.post(`updateEventoCampos.php`, {
                    token: true,
                    values: this.state.eventoComplementar.map((e) => ({ ...e, valor: this.state.campos.find((c) => e.subgrupo_campo == c.chave)?.valor })),
                    evento: this.state.chave
                }).then(
                    async res => {
                        this.getdadosComplementares();
                    },
                    async err => await console.log(`Erro: ${err.data}`)
                );
            }
            if (this.state.campos.find((c) => !this.state.eventoComplementar.find((e) => e.subgrupo_campo == c.chave))) {
                await apiEmployee.post(`insertEventoCampos.php`, {
                    token: true,
                    values: this.state.campos,
                    evento: this.state.chave
                }).then(
                    async res => {
                        this.getdadosComplementares();
                    },
                    async err => await console.log(`Erro: ${err.data}`)
                );
            }
        }

    }

    validarAnexo = async () => {
        this.setState({ loading: true, anexosModal: false })
        const anexo = this.state.anexosForn.find((anexo) => anexo.validado == 2);
        const validadoData = moment().format("YYYY-MM-DD HH:mm:ss");

        if (anexo) {
            await apiEmployee.post(`updateAnexo.php`, {
                token: true,
                chave: anexo.chave,
                operador: this.state.usuarioLogado.codigo,
                evento: this.state.chave,
                validadoData
            }).then(
                async res => {
                    this.setState({ anexosForn: this.state.anexosForn.map((an) => an.chave == anexo.chave ? ({ ...an, validado: 3, validadoData, validadoPor: this.state.usuarioLogado.codigo }) : ({ ...an })) })
                },
                async res => await console.log(`Erro: ${res}`)
            )
        }

        this.setState({ loading: false, bloqueado: false });

    }

    saveEmail = async () => {
        this.setState({ alert: { type: "", msg: "" } });

        await apiEmployee.post(`insertContato.php`, {
            token: true,
            values: `'EM', '${this.state.emails.join(';')}', '', ${this.state.fornecedor}`
        }).then(
            async res => {
                if (res.data[0]) {
                    await loader.salvaLogs('pessoas_contatos', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].Chave);

                    await this.setState({ hasEmail: true, loading: false, bloqueado: false, savedRedirect: true })
                } else {
                    //alert(`Erro: ${res.data}`)
                }
            },
            async res => await console.log(`Erro: ${res.data}`)
        )
    }

    changeTaxa = async (taxa) => {
        await apiEmployee.post(`getCamposFromTaxa.php`, {
            token: true,
            taxa
        }).then(
            async res => {
                if (res.data[0]) {
                    await this.setState({ campos: res.data.map((c) => ({ ...c, valor: "" })) });
                } else {
                    await this.setState({ campos: [] });
                }
            },
            async res => await console.log(`Erro: ${res.data}`)
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
                        <p>Solicitação salva!</p>
                        <p>Deseja criar mais?</p>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-danger w-50"
                            onClick={
                                async () => {
                                    this.setState({ redirectOS: true });
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
        validations.push(this.state.chave_os);
        validations.push(this.state.data);
        validations.push(this.state.taxa || this.state.tipo == 2 || this.state.tipo == 3);
        validations.push(this.state.fornecedor || this.state.tipo == 1 || this.state.tipo == 2 || this.state.tipo == 3);
        validations.push(this.state.fornecedorCusteio || this.state.tipo != 1);
        validations.push(this.state.valor && this.state.valor.replaceAll('.', '').replaceAll(',', '.') == parseFloat(this.state.valor.replaceAll('.', '').replaceAll(',', '.')));
        validations.push((!this.state.repasse && !this.state.vlrc) || this.state.vlrc.replaceAll('.', '').replaceAll(',', '.') == parseFloat(this.state.vlrc.replaceAll('.', '').replaceAll(',', '.')) && (!this.state.repasse || this.state.vlrc == this.state.valor));
        validations.push(this.state.descricao);
        validations.push(!this.state.campos[0] || !this.state.campos.find((c) => c.valor == "" && c.obrigatorio == 1));
        validations.push(this.state.ordem && this.state.ordem.replaceAll(',', '.') == parseFloat(this.state.ordem.replaceAll(',', '.')));

        validations.push(!this.state.bloqueado);

        const validForm = validations.reduce((t, a) => t && a)


        const validationsEmail = [];
        validationsEmail.push(this.state.emails[0] || this.state.failures[0])
        validationsEmail.push(!this.state.emailBloqueado)

        //validations.push(this.state.porto && this.state.porto > 0)
        //o formulário só será válido se todas as validações forem verdadeiras, com este reduce implementado

        const validFormEmail = validationsEmail.reduce((t, a) => t && a)

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
                        <Redirect to={{ pathname: '/ordensservico/addevento/0', state: { ... this.props.location.state, evento: {} } }} />
                        {window.location.reload()}
                    </>
                }
                {this.state.redirectOS &&
                    <Redirect to={{ pathname: `/ordensservico/addos/${this.props.location?.state?.os?.Chave}`, state: { os: this.props?.location?.state?.os } }} />
                }
                {this.state.irParaFinanceiro && this.props.location.state && this.props.location.state.os &&
                    <Redirect to={{ pathname: `/ordensservico/addeventofinanceiro/${this.state.evento.chave}`, state: { evento: { ...this.state.evento }, os: { ...this.state.os } } }} />
                }
                {this.state.irParaFinanceiro && (!this.props.location.state || !this.props.location.state.os) &&
                    <Redirect to={{ pathname: `/ordensservico/addeventofinanceiro/${this.state.evento.chave}`, state: { evento: { ...this.state.evento } } }} />
                }

                {!this.state.loading &&
                    <>
                        <section>
                            {this.props.location.state && this.props.location.state.os && this.props.location.state.os.codigo &&
                                <Header voltarAddOS os={this.props.location.state.os} titulo="Eventos" />
                            }
                            {(!this.props.location.state || !this.props.location.state.os || !this.props.location.state.os.codigo) &&
                                <Header voltarEventos titulo="Eventos" chave={this.state.chave != 0 ? this.state.chave : ''} />
                            }
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
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstlabel">
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
                            open={this.state.anexosModal}
                            onClose={async () => await this.setState({ anexosModal: false })}
                        >
                            <div className='modalContainer'>
                                <div className='modalCriar'>
                                    <div className='containersairlistprodmodal'>
                                        <div className='botaoSairModal' onClick={async () => await this.setState({ anexosModal: false })}>
                                            <span>X</span>
                                        </div>
                                    </div>
                                    <div className='modalContent'>
                                        <div className='tituloModal'>
                                            <span>Anexos de Fornecedores:</span>
                                        </div>


                                        <div className='modalForm'>
                                            <table style={{ width: "100%" }}>
                                                <tr className='anexoListTitle'>
                                                    <th>Anexo</th>
                                                    <th style={{ width: 250, textAlign: "center" }}>Validado</th>
                                                </tr>
                                                {this.state.anexosForn.map((anexo) => (
                                                    <tr className='anexoList'>
                                                        <td><a className="nonLink" href={`${util.completarDocuments(`fornDocs/${anexo.anexo}`)}`} target="_blank">{anexo.anexo}</a></td>
                                                        <td style={{ width: 250, display: "flex", justifyContent: "center" }}><Select style={{ width: 250 }} isDisabled={!!anexo.validadoPor} options={!anexo.validadoPor && anexo.validado != 3 ? this.state.anexosValidadosOptions.filter((opt) => !opt.nonSelectable) : this.state.anexosValidadosOptions.filter((opt) => opt.nonSelectable)} value={this.state.anexosValidadosOptions.find((e) => e.value == anexo.validado)} onChange={(e) => !anexo.validadoPor ? this.setState({ anexosForn: this.state.anexosForn.map((an) => anexo.chave == an.chave ? ({ ...an, validado: e.value }) : ({ ...an })) }) : {}} /></td>
                                                    </tr>
                                                ))}
                                            </table>

                                            <div className='centerDiv'>
                                                <button
                                                    onClick={() => this.salvarAnexos()}
                                                    style={{ width: 250, border: "1px solid black", borderRadius: 50, padding: 10 }}
                                                >Salvar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div >

                            </div >
                        </Modal >

                        <Alert
                            alert={this.state.alert}
                            setAlert={(e) => this.setState({ alert: e })}
                            alertFunction={() => this.saveEmail()}
                        />

                        <Modal
                            aria-labelledby="transition-modal-title"
                            aria-describedby="transition-modal-description"
                            style={{ display: 'flex', justifyContent: 'center', paddingTop: '5%', paddingBottom: '5%', overflow: 'scroll' }}
                            open={this.state.emailModal}
                            onClose={async () => await this.setState({ emailModal: false })}
                        >
                            <div className='modalContainer'>
                                <div className='modalCriar'>
                                    <div className='containersairlistprodmodal'>
                                        <div className='botaoSairModal' onClick={async () => await this.setState({ email: false, emailModal: false })}>
                                            <span>X</span>
                                        </div>
                                    </div>
                                    <div className='modalContent'>
                                        <div className='tituloModal'>
                                            <span>Enviar email:</span>
                                        </div>


                                        <div className='modalForm'>
                                            <Formik
                                                initialValues={{
                                                    name: '',
                                                }}
                                                onSubmit={async values => {
                                                    await new Promise(r => setTimeout(r, 1000))
                                                    this.enviarEmail(validFormEmail)
                                                }}
                                            >
                                                <Form className="contact-form" >

                                                    <div className="row">

                                                        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 ">

                                                            <div className="row addservicos">
                                                                {this.state.successes[0] &&
                                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                        <label>Emails enviados:</label>
                                                                    </div>
                                                                }
                                                                {this.state.successes[0] &&
                                                                    <div className="col-1 errorMessage">
                                                                    </div>
                                                                }
                                                                {this.state.successes[0] &&
                                                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                        <label>
                                                                            {this.state.successes.map((e, i) => (
                                                                                <span className='listaEmail successEmail'>{e}{this.state.successes[i + 1] ? ", " : ""}</span>
                                                                            ))}
                                                                        </label>
                                                                    </div>
                                                                }
                                                                {this.state.successes[0] &&
                                                                    <div className="col-1"></div>
                                                                }
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstlabel">
                                                                    <label>Destinatário(s)</label>
                                                                </div>
                                                                <div className="col-1 errorMessage">

                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Field className="form-control" type="text" value={this.state.emails.join(';')} onChange={async e => { this.setState({ emails: e.currentTarget.value.split(';') }) }} onBlur={(e) => e.currentTarget.value != "" && !this.state.hasEmail ? this.setState({ alert: { type: "confirm", msg: "Deseja salvar esse email como padrão?" } }) : {}} />
                                                                </div>
                                                                <div className="col-1"></div>
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstlabel">
                                                                    <label>Assunto</label>
                                                                </div>
                                                                <div className="col-1 errorMessage">
                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Field className="form-control" type="text" rows="2" component="textarea" value={this.state.assunto} onChange={async e => { this.setState({ assunto: e.currentTarget.value }) }} />
                                                                </div>
                                                                <div className="col-1"></div>
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstlabel">
                                                                    <label>Corpo</label>
                                                                </div>
                                                                <div className="col-1 errorMessage">
                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Field className="form-control" type="text" rows="4" component="textarea" value={this.state.corpo} onChange={async e => { this.setState({ corpo: e.currentTarget.value }) }} />
                                                                </div>
                                                                <div className="col-1"></div>

                                                                <div className={this.state.chave == 0 ? "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel" : "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm"}>
                                                                    <label>Anexo</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'></div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                                    <Field className="form-control" type="file" value={""} onChange={async e => { this.addAnexo(e.currentTarget) }} />
                                                                    <div>
                                                                        {this.state.anexosNomes.map((e, i) => (
                                                                            <span className="emailLinks" onClick={() => this.removeAnexo(i)}>{e}; </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                {this.state.failures[0] &&
                                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                        <label>Emails inválidos:</label>
                                                                    </div>
                                                                }
                                                                {this.state.failures[0] &&
                                                                    <div className="col-1 errorMessage">
                                                                    </div>
                                                                }
                                                                {this.state.failures[0] &&
                                                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                        <label>
                                                                            {this.state.failures.map((e, i) => (
                                                                                <span className='listaEmail failureEmail' title='Email inválido' onClick={async () => await this.removeEmail(e)}>{e}{this.state.failures[i + 1] || this.state.emails[0] ? ", " : ""}</span>
                                                                            ))}
                                                                        </label>
                                                                    </div>
                                                                }
                                                                {this.state.failures[0] &&
                                                                    <div className="col-1"></div>
                                                                }
                                                            </div>
                                                        </div>
                                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                                    </div>

                                                    <div className="row">
                                                        <div className="col-2"></div>
                                                        <div className="col-8" style={{ display: 'flex', justifyContent: 'center' }}>
                                                            <button disabled={!validFormEmail} type="submit" style={validFormEmail ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} >Enviar</button>
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
                        open={this.state.templatesModal}
                        onClose={async () => await this.setState({ templatesModal: false })}
                    >
                        <div className='modalContainer'>
                            <div className='modalCriar'>
                                <div className='containersairlistprodmodal'>
                                    <div className='botaoSairModal' onClick={async () => await this.setState({ templatesModal: false })}>
                                        <span>X</span>
                                    </div>
                                </div>
                                <div className='modalContent'>

                                    <div className='modalForm' style={{ width: "95%" }}>
                                        <Formik
                                            initialValues={{
                                                name: '',
                                            }}
                                            onSubmit={async values => {
                                                await new Promise(r => setTimeout(r, 1000))
                                                await this.setState({ templatesModal: false })
                                            }}
                                        >
                                            <Form className="contact-form" >


                                                <div className="row">

                                                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 ">

                                                        <div className="row addservicos">
                                                            <div className="col-12">
                                                                <h4 className='text-center white'>Templates:</h4>
                                                            </div>
                                                            {this.state.templates[0] &&
                                                                <div className="agrupador_eventos_selecionados">
                                                                    <table className='agrupador_lista'>
                                                                        <tr>
                                                                            <th className='text-center'>
                                                                                <span>Chave</span>
                                                                            </th>
                                                                            {window.innerWidth >= 500 &&
                                                                                <th className='text-center'>
                                                                                    <span>Tipo</span>
                                                                                </th>
                                                                            }
                                                                            {window.innerWidth >= 500 &&
                                                                                <th className='text-center'>
                                                                                    <span>Descrição</span>
                                                                                </th>
                                                                            }
                                                                            <th className='text-center'>
                                                                                <span>Valor (R$)</span>
                                                                            </th>
                                                                            <th className='text-center'>
                                                                                <span>Valor (USD)</span>
                                                                            </th>
                                                                        </tr>
                                                                        {this.state.templates[0] != undefined && this.state.templates.filter((feed) => /*this.filterTemplate*/ { return true }).map((feed, index) => (
                                                                            <>
                                                                                {window.innerWidth < 500 &&
                                                                                    <tr onClick={() => {
                                                                                        this.setTemplates(feed);
                                                                                        this.setState({ templatesModal: false });
                                                                                    }}>
                                                                                        <td className="text-center">
                                                                                            <p>{feed.chave}</p>
                                                                                        </td>
                                                                                        <td className="text-center">
                                                                                            <p>USD {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(feed.Moeda == 6 ? feed.valor : feed.valor / (parseFloat(this.state.os.ROE) != 0 ? parseFloat(this.state.os.ROE) : 5))}</p>
                                                                                        </td>
                                                                                        <td className="text-center">
                                                                                            <p>R$ {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(feed.Moeda == 5 ? feed.valor : feed.valor * (parseFloat(this.state.os.ROE) != 0 ? parseFloat(this.state.os.ROE) : 5))}</p>
                                                                                        </td>
                                                                                    </tr>
                                                                                }
                                                                                {window.innerWidth >= 500 &&
                                                                                    <tr onClick={() => {
                                                                                        this.setTemplates(feed);
                                                                                        this.setState({ templatesModal: false });
                                                                                    }}>
                                                                                        <td className="text-center">
                                                                                            <p>{feed.chave}</p>
                                                                                        </td>
                                                                                        <td className="text-center">
                                                                                            <p>{this.state.tiposSubOptions.find((e) => e.value == feed.tipo_sub)?.label}</p>
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
                                                                                    </tr>
                                                                                }
                                                                            </>
                                                                        )
                                                                        )}
                                                                    </table>
                                                                </div>
                                                            }
                                                            {!this.state.templates[0] &&
                                                                <h4 className='text-center'>Nenhum</h4>
                                                            }

                                                        </div>
                                                    </div>
                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                                </div>
                                            </Form>
                                        </Formik>

                                    </div>
                                </div>





                            </div >

                        </div >
                    </Modal >

                        <ModalCopiarCampos
                            modalAberto={this.state.duplicarModal}
                            closeModal={() => { this.setState({ duplicarModal: false }) }}
                            campos={this.state.camposCopiar}
                            subgruposOptions={this.state.eventosIrmaos.map((e) => ({ value: e.chave, label: e.descricao }))}
                            nome={this.state.descricao}
                            onSubmit={async (eventos) => await this.copiarCampos(eventos)}
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
                            <div className="relatoriosSection">
                                <div className="relatorioButton">
                                    <button className="btn btn-danger" onClick={() => this.setState({templatesModal: true})}>Carregar template</button>
                                </div>
                            </div>
                                
                                <div className="col-lg-12">
                                    <Formik
                                        initialValues={{
                                            name: '',
                                        }}
                                        onSubmit={async values => {
                                            await new Promise(r => setTimeout(r, 1000))
                                            this.salvarEvento(validForm)
                                        }}
                                    >
                                        <Form className="contact-form">

                                            <div className="row">
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2"></div>

                                                <div className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12 ">

                                                    <div className="row addservicos">
                                                        {this.state.chave != 0 &&
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
                                                                {this.state.anexosForn[0] &&
                                                                    <div className='col-xl-2 col-lg-2 col-md-12 col-sm-12 col-12 labelForm'>
                                                                        <div className="centerDiv">
                                                                            <button
                                                                                disabled={!validForm}
                                                                                type="button"
                                                                                style={validForm ? { width: 150, height: 50, padding: 5, color: "white", border: "1px solid #efefef", marginBottom: 25 } : { backgroundColor: '#999', opacity: 0.3, width: 150, height: 50, padding: 5, color: "#ccc", border: "1px solid #ccc", marginBottom: 25 }}
                                                                                onClick={() => { this.setState({ anexosModal: true }) }}
                                                                            >Anexos
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                }
                                                            </>
                                                        }
                                                        <div className={this.state.chave == 0 ? "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel" : "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm"}>
                                                            <label>Ordem de Serviço</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.chave_os &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' isDisabled options={this.state.osOptions.filter(e => this.filterSearch(e, this.state.osOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ osOptionsTexto: e }) }} value={this.state.osOptions.filter(option => option.value == this.state.chave_os)[0]} search={true} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Navio</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field disabled className='form-control' value={this.state.navio_os} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Data</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.data &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className='form-control' type='date' value={this.state.data} onChange={(e) => { this.setState({ data: e.currentTarget.value }) }} />
                                                        </div>

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Ordem</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.ordem &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="text" disabled={this.state.ordemBloqueado} value={this.state.ordem?.replaceAll(',', '.')} onChange={async e => { this.setState({ ordem: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className='col-1 errorMessage'>
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
                                                                    <input className='form_control' checked={this.state.repasse} onChange={(e) => { this.setState({ repasse: e.target.checked, pessoa: '', tipo: '', contaDesconto: '', fornecedorCusteio: "", vlrc: e.target.checked ? this.state.valor : this.state.vlrc }) }} type="checkbox" />
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
                                                            <Select className='SearchSelect' options={this.state.taxasOptions.filter(e => this.filterSearch(e, this.state.taxasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ taxasOptionsTexto: e }) }} value={this.state.taxasOptions.filter(option => option.value == this.state.taxa)[0]} search={true} onChange={(e) => { this.changeTaxa(e.value); if (!this.state.valor || parseFloat(this.state.valor.replaceAll('.', "").replaceAll(",", ".")) == 0) { this.setState({ taxa: e.value, valor: e.money.replaceAll(",", "").replaceAll(".", ",") }) } else { this.setState({ taxa: e.value }) } }} />
                                                        </div>
                                                        <div className="col-xl-1 col-lg-2 col-md-2 col-sm-12 col-12">
                                                            {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'TAXAS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                                                <div className='insideFormButton' onClick={() => { this.setState({ modalAberto: true, modal: 'listarTaxas', modalPesquisa: this.state.taxa, modalLista: this.state.tipo == 0 ? this.state.taxas.filter((taxa) => taxa.Tipo == "P") : this.state.tipo == 1 ? this.state.taxas.filter((taxa) => taxa.Tipo == "R") : this.state.taxas }) }}>...</div>
                                                            }
                                                        </div>
                                                        {this.state.campos.map((campo, idx) => (
                                                            <>
                                                                <div style={{ height: 70 }} className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>{campo.nome}</label>
                                                                </div>
                                                                <div style={{ height: 70 }} className='col-1 errorMessage'>
                                                                    {campo.obrigatorio == 1 && !campo.valor &&
                                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                    }
                                                                </div>
                                                                <div style={{ height: 70 }} className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Field className="form-control" type="text" rows="2" component="textarea" value={campo.valor} onChange={async e => { this.setState({ campos: this.state.campos.map((c, i) => i === idx ? ({ ...c, valor: e.currentTarget.value }) : ({ ...c })) }) }} />
                                                                </div>
                                                                <div style={{ height: 70 }} className="col-xl-1 col-lg-2 col-md-2 col-sm-12 col-12">
                                                                </div>
                                                            </>
                                                        ))}
                                                        {this.state.campos[0] &&
                                                            <div style={{ marginBottom: 20 }} className="col-12 text-center">
                                                                <span onClick={async () => { await this.setCamposCopiar(); this.setState({ duplicarModal: true }) }} style={{ color: "#00CCFF", textDecoration: "underline", cursor: "pointer" }}>Duplicar valores</span>
                                                            </div>
                                                        }
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
                                                            <select className='form-control nextToInput fieldDividido_1' value={this.state.moeda} onChange={(e) => { this.setState({ moeda: e.target.value }) }}>
                                                                {this.state.moedas.map((e) => (
                                                                    <option value={e.Chave}>{e.Sigla}</option>
                                                                ))}
                                                            </select>
                                                            <Field className="form-control fieldDividido_2 text-right " type="text" onClick={(e) => e.target.select()} value={this.state.valor} onChange={async e => { this.setState({ valor: e.currentTarget.valur }); if (this.state.repasse) { this.setState({ vlrc: e.currentTarget.value }) } }} onBlur={async e => { this.setState({ valor: e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.') ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '0,00' }); if (this.state.repasse) { this.setState({ vlrc: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '0,00' }) } }} />
                                                        </div>

                                                        <div className='col-1'></div>

                                                        {!this.state.repasse &&
                                                            <>
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>VCP</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Field disabled={this.state.repasse} className="form-control text-right" type="text" step="0.1" value={this.state.vlrc} onClick={(e) => e.target.select()} onChange={async e => { this.setState({ vlrc: e.currentTarget.value }); if (this.state.repasse) { this.setState({ valor: e.currentTarget.value }) } }} onBlur={async e => { this.setState({ vlrc: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '0,00' }); if (this.state.repasse) { this.setState({ valor: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '0,00' }) } }} />
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                </div>
                                                            </>
                                                        }

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Remarks</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control textareaFix" as={"textarea"} value={this.state.remarks} onChange={async e => { this.setState({ remarks: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className='col-1'></div>
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
                                                    {validForm && this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'EVENTOS_FINANCEIRO') { return e } }).map((e) => e.permissaoInsere)[0] == 1 && this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'EVENTOS_FINANCEIRO') { return e } }).map((e) => e.permissaoEdita)[0] == 1 &&
                                                        <button title="Financeiro" style={{ borderRadius: 15, margin: 3 }} onClick={async () => { await this.setState({ financeiro: true }); await this.salvarEvento(validForm) }}>
                                                            <FontAwesomeIcon icon={faDollarSign} />
                                                        </button>
                                                    }
                                                    {(validForm || this.state.failures[0]) &&
                                                        <button title="Enviar Email" style={{ borderRadius: 15, margin: 3 }} onClick={() => { this.setState({ email: true }); this.salvarEvento(validForm) }}>
                                                            <FontAwesomeIcon icon={faEnvelope} />
                                                        </button>
                                                    }
                                                    {validForm && this.state.anexosForn[0] && this.state.anexosForn.find((anexo) => anexo.validado == 2) &&
                                                        <button title="Validar" style={{ borderRadius: 15, margin: 3 }} onClick={() => { this.salvarEvento(); this.validarAnexo() }}>
                                                            <FontAwesomeIcon icon={faPaperclip} />
                                                        </button>
                                                    }

                                                </div>
                                                <div className="col-2"></div>
                                            </div>

                                        </Form>
                                    </Formik>
                                </div>
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
                                                                                    {!this.state.documentos[0] &&
                                                                                        <div>
                                                                                            <FontAwesomeIcon icon={faPlus} onClick={() => this.setState({ documentoModal: true })} />
                                                                                        </div>
                                                                                    }
                                                                                </span>
                                                                            </th>
                                                                        </tr>
                                                                        {this.state.documentos[0] != undefined && this.state.documentos.map((feed, index) => (
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
                                                                                        <FontAwesomeIcon icon={faPen} onClick={() => this.setState({ documentoModal: true, documentoDescricao: feed.descricao, documentoTipo: feed.tipo_docto, documentoNome: '', documentoTrocar: false, documentoEditar: true, documentoChave: feed.chave, documentoCaminho: feed.caminho })} />
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

export default connect(mapStateToProps, null)(AddEvento)

