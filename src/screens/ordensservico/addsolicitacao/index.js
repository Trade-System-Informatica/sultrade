import React, { Component } from 'react'
import './styles.css'
import { Formik, Field, Form } from 'formik'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import util from '../../../classes/util'
import loader from '../../../classes/loader'
import { NOME_EMPRESA, CAMINHO_DOCUMENTOS } from '../../../config'
import { connect } from 'react-redux'
import { Link, Redirect } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faTrashAlt, faPen, faPlus, faDollarSign, faEnvelope } from '@fortawesome/free-solid-svg-icons'
import Image from 'react-bootstrap/Image'
import { apiEmployee } from '../../../services/apiamrg'
import Skeleton from '../../../components/skeleton'
import moment from 'moment'
import InputMask from 'react-input-mask';
import CEP from 'cep-promise'
import { confirmAlert } from 'react-confirm-alert'
import ModalListas from '../../../components/modalListas'
import Select from 'react-select';
import Modal from '@material-ui/core/Modal';
import { GiTreasureMap } from 'react-icons/gi';
import ModalLogs from '../../../components/modalLogs'
import { api } from '../../../services/api'

const estadoInicial = {
    solicitacao: '',
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
    descricao: '',
    tipo: 0,
    ordem: '',
    remarks: '',
    contatos: [],

    logs: [],
    modalLog: false,

    dadosIniciais: '',
    dadosFinais: '',

    fornecedorEmail: '',
    emails: [],

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
    emailsFinais: []

}

class AddSolicitacao extends Component {

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        window.scrollTo(0, 0)
        var id = await this.props.match.params.id
        await this.setState({ chave: id })
        if (this.props.location.state.os) {
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
            await this.getOSUma();
            await this.getOrdem();
            await this.setState({ solicitacao: this.props.location.state.solicitacao })
            await this.setState({
                data: this.state.solicitacao.data,
                fornecedor: this.state.solicitacao.fornecedor,
                fornecedorInicial: this.state.solicitacao.fornecedor,
                taxa: this.state.solicitacao.taxa,
                descricao: this.state.solicitacao.descricao,
                tipo: this.state.solicitacao.tipo_sub,
                ordem: this.state.solicitacao.ordem,
                remarks: this.state.solicitacao.remarks,
                fornecedorCusteio: this.state.solicitacao.Fornecedor_Custeio,
                ordemBloqueado: false,
                emailEnviado: this.state.solicitacao.email_enviado ? this.state.solicitacao.email_enviado.split('; ') : [],
                dataEmail: this.state.solicitacao.data_email
            })

            await this.setState({
                dadosIniciais: [
                    { titulo: 'data', valor: this.state.data },
                    { titulo: 'fornecedor', valor: this.state.fornecedor },
                    { titulo: 'taxa', valor: this.state.taxa },
                    { titulo: 'descricao', valor: this.state.descricao },
                    { titulo: 'tipo_sub', valor: this.state.tipo },
                    { titulo: 'ordem', valor: this.state.ordem },
                    { titulo: 'remarks', valor: this.state.remarks },
                    { titulo: 'Fornecedor_Custeio', valor: this.state.fornecedorCusteio }
                ]
            })
        }
        await this.carregaTiposAcessos()
        await this.carregaPermissoes()
        await this.testaAcesso()
        await this.getOS();
        await this.getTaxas();
        await this.getPessoas();
        await this.getDescricaoPadrao();
        await this.getDocumentos();
        await this.getTiposDocumento();

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

    getOSUma = async () => {
        await apiEmployee.post(`getOSUma.php`, {
            token: true,
            chave_os: this.props.location.state.solicitacao.chave_os
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
            token: true,
        }).then(
            async res => {
                await this.setState({ todasOs: res.data })

                const options = this.state.todasOs.map((e) => {
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

                const options = this.state.taxas.map((e) => {
                    return { label: e.descricao, value: e.chave }
                })

                await this.setState({ taxasOptions: options })
            },
            async err => { this.erroApi(err) }
        )
    }

    getPessoas = async () => {
        await apiEmployee.post(`getFornecedores.php`, {
            token: true,
        }).then(
            async res => {
                await this.setState({ pessoas: res.data })

                const options = this.state.pessoas.map((e) => {
                    return { label: e.Nome_Fantasia ? e.Nome_Fantasia : e.Nome, value: e.Chave }
                })

                options.unshift({label: 'Nenhum', value: ''})

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

    getTiposDocumento = async () => {
        await apiEmployee.post('getTiposDocumento.php', {
            token: true
        }).then(
            async res => {
                await this.setState({ tiposDocumento: res.data })

                const options = this.state.tiposDocumento.map((e) => {
                    return { label: e.descricao, value: e.chave }
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
            navio: this.state.osOptions.find((e) => e.value == this.state.chave_os).navioNome,
            porto: this.state.osOptions.find((e) => e.value == this.state.chave_os).portoNome,
            solicitacao: this.state.chave
        }).then(
            async res => {
                const { failures, successes } = res.data;

                await this.setState({ solicitacao: await loader.getOne(`getSolicitacao.php`, this.state.chave) });
                await this.setState({
                    data: this.state.solicitacao.data,
                    fornecedor: this.state.solicitacao.fornecedor,
                    taxa: this.state.solicitacao.taxa,
                    descricao: this.state.solicitacao.descricao,
                    tipo: this.state.solicitacao.tipo_sub,
                    ordem: this.state.solicitacao.ordem,
                    remarks: this.state.solicitacao.remarks,
                    fornecedorCusteio: this.state.solicitacao.Fornecedor_Custeio,
                    ordemBloqueado: false,
                    emailEnviado: this.state.solicitacao.email_enviado ? this.state.solicitacao.email_enviado.split('; ') : [],
                    dataEmail: this.state.solicitacao.data_email
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
                await this.setState({ emails: this.state.fornecedorEmail.split("; ") })
                await this.setState({ loading: false })
            },
            response => { this.erroApi(response) }

        )
    }

    registraEmails = async (emails) => {
        await this.setState({
            emailsIniciais: [
                { titulo: "email_enviado", valor: this.state.emailEnviado },
                { titulo: "data_email", valor: this.state.dataEmail }
            ]
        })
        const email_enviado = emails.join('; ');

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

    salvarServicoItem = async (validForm) => {
        this.setState({ bloqueado: true });


        await this.setState({
            dadosFinais: [
                { titulo: 'data', valor: this.state.data },
                { titulo: 'fornecedor', valor: this.state.fornecedor },
                { titulo: 'taxa', valor: this.state.taxa },
                { titulo: 'descricao', valor: this.state.descricao },
                { titulo: 'tipo_sub', valor: this.state.tipo },
                { titulo: 'ordem', valor: this.state.ordem },
                { titulo: 'remarks', valor: this.state.remarks },
                { titulo: 'Fornecedor_Custeio', valor: this.state.fornecedorCusteio }
            ]
        })

        if (parseInt(this.state.chave) === 0 && validForm) {
            await apiEmployee.post(`insertServicoItemBasico.php`, {
                token: true,
                values: `'${this.state.chave_os}', '${this.state.data}', '${this.state.fornecedor}', '${this.state.taxa}', '${this.state.descricao}', '${this.state.ordem.replaceAll(',', '.')}', '${this.state.tipo}', '${this.state.fornecedorCusteio}', '${this.state.remarks}'`
            }).then(
                async res => {
                    await this.setState({
                        solicitacao: res.data[0],

                    });
                    await this.setState({
                        chave: this.state.solicitacao.chave,
                    })
                    await loader.salvaLogs('os_servicos_itens', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].chave);

                    if (!this.state.email) {
                        if (this.state.financeiro) {
                            await this.setState({ irParaFinanceiro: true })
                        } else {
                            await this.setState({ finalizaOperacao: true })
                        }
                    } else {
                        await this.getPessoaContatos(this.state.fornecedor)
                        await this.setState({ bloqueado: false, emailModal: true })
                    }
                },
                async res => await console.log(`Erro: ${res.data}`)
            )
        } else if (validForm) {
            await apiEmployee.post(`updateServicoItem.php`, {
                token: true,
                chave: this.state.chave,
                chave_os: this.state.chave_os,
                data: this.state.data,
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
                                await this.setState({ finalizaOperacao: true })
                            }
                        } else {
                            await this.getPessoaContatos(this.state.fornecedor)

                            await this.setState({ bloqueado: false, emailModal: true })
                        }
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



    render() {
        const validations = []
        validations.push(this.state.chave_os)
        validations.push(this.state.data)
        validations.push(this.state.taxa)
        validations.push(this.state.fornecedor || this.state.tipo == 1)
        validations.push(this.state.fornecedorCusteio || this.state.tipo != 1)
        validations.push(this.state.descricao)
        validations.push(this.state.ordem && this.state.ordem.replaceAll(',', '.') == parseFloat(this.state.ordem.replaceAll(',', '.')))

        validations.push(!this.state.bloqueado)

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
                {this.state.finalizaOperacao && this.props.location.state && this.props.location.state.os &&
                    <Redirect to={{ pathname: `/ordensservico/addos/${this.props.location.state.os.Chave}`, state: { os: this.props.location.state.os } }} />
                }
                {this.state.finalizaOperacao && (!this.props.location.state || !this.props.location.state.os || !this.props.location.state.os.addOS) &&
                    <Redirect to={{ pathname: '/ordensservico/solicitacoesservicos/', state: { chave: this.state.chave } }} />
                }
                {this.state.irParaFinanceiro && this.props.location.state && this.props.location.state.os &&
                    <Redirect to={{ pathname: `/ordensservico/addsolicitacaofinanceiro/${this.state.solicitacao.chave}`, state: { solicitacao: { ...this.state.solicitacao }, os: { ...this.state.os } } }} />
                }
                {this.state.irParaFinanceiro && (!this.props.location.state || !this.props.location.state.os) &&
                    <Redirect to={{ pathname: `/ordensservico/addsolicitacaofinanceiro/${this.state.solicitacao.chave}`, state: { solicitacao: { ...this.state.solicitacao } } }} />
                }

                {!this.state.loading &&
                    <>
                        <section>
                            {this.props.location.state && this.props.location.state.os && this.props.location.state.os.codigo &&
                                <Header voltarAddOS os={this.props.location.state.os} titulo="Solicitações de Serviço" />
                            }
                            {(!this.props.location.state || !this.props.location.state.os || !this.props.location.state.os.codigo) &&
                                <Header voltarSolicitacoes titulo="Solicitações de Serviço" chave={this.state.chave != 0 ? this.state.chave : ''} />
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
                                                                    <Field className="form-control" type="text" value={this.state.emails.join('; ')} onChange={async e => { this.setState({ emails: e.currentTarget.value.split('; ') }) }} />
                                                                </div>
                                                                <div className="col-1"></div>
                                                                {this.state.failures[0] &&
                                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                        <label>Emails inválidos:</label>
                                                                    </div>
                                                                }
                                                                {this.state.failures[0] &&
                                                                    <div className="co    l-1 errorMessage">
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
                        <ModalListas pesquisa={this.state.modalPesquisa} alteraModal={this.alteraModal} alteraCliente={this.alteraCliente} acessosPermissoes={this.state.acessosPermissoes} modalAberto={this.state.modalAberto} modal={this.state.modal} modalLista={this.state.modalLista} closeModal={() => { this.setState({ modalAberto: false }) }} />
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
                                        <Form className="contact-form">

                                            <div className="row">
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2"></div>

                                                <div className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12 ">

                                                    <div className="row addservicos">
                                                        {this.state.chave != 0 &&
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstlabel">
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
                                                        <div className={this.state.chave == 0 ? "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel" : "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm"}>
                                                            <label>Ordem de Serviço</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.chave_os &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        {(!this.props.location.state || !this.props.location.state.os) &&
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                <Select className='SearchSelect' options={this.state.osOptions.filter(e => this.filterSearch(e, this.state.osOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ osOptionsTexto: e }) }} value={this.state.osOptions.filter(option => option.value == this.state.chave_os)[0]} search={true} onChange={async (e) => { await this.changeOS(e); await this.getOrdem(); }} />
                                                            </div>
                                                        }
                                                        {this.props.location.state.os &&
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                <Select className='SearchSelect' isDisabled options={this.state.osOptions.filter(e => this.filterSearch(e, this.state.osOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ osOptionsTexto: e }) }} value={this.state.osOptions.filter(option => option.value == this.state.chave_os)[0]} search={true} />
                                                            </div>
                                                        }

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Navio</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field disabled className='form-control' value={this.state.navio_os} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Viagem</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field disabled className='form-control' value={this.state.viagem_os} />
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
                                                            <label>Taxa</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.taxa &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.taxasOptions.filter(e => this.filterSearch(e, this.state.taxasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ taxasOptionsTexto: e }) }} value={this.state.taxasOptions.filter(option => option.value == this.state.taxa)[0]} search={true} onChange={(e) => { this.setState({ taxa: e.value, }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Fornecedor</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.fornecedor && this.state.tipo != 1 &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                                            <Select className='SearchSelect' isDisabled={this.state.tipo == 1} options={this.state.pessoasOptions.filter(e => this.filterSearch(e, this.state.pessoasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ pessoasOptionsTexto: e }) }} value={this.state.pessoasOptions.filter(option => option.value == this.state.fornecedor)[0]} search={true} onChange={(e) => { if (this.state.tipo != 1) { this.setState({ fornecedor: e.value }) } }} />
                                                        </div>
                                                        <div className="col-xl-1 col-lg-2 col-md-2 col-sm-12 col-12">
                                                            {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 && this.state.tipo != 1 &&
                                                                <div className='insideFormButton' onClick={() => { this.setState({ modalAberto: true, modal: 'listarCliente', modalPesquisa: this.state.fornecedor, modalLista: this.state.pessoas, fornecedorCusteioAtivo: false }) }}>...</div>
                                                            }
                                                        </div>
                                                        <div className='col-1'>
                                                        </div>
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
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Descrição Padrão</label>
                                                        </div>
                                                        <div className="col-1 errorMessage">
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.descricoesPadraoOptions.filter(e => this.filterSearch(e, this.state.descricoesPadraoOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ descricoesPadraoOptionsTexto: e }) }} value={this.state.descricoesPadraoOptions.filter(option => option.label == this.state.descricao)[0]} search={true} onChange={(e) => { this.setState({ descricao: e.label, }) }} />
                                                        </div>
                                                        <div className="col-1">
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
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Tipo</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <select className='form-control' value={this.state.tipo} onChange={async e => { await this.setState({ tipo: e.currentTarget.value }); if (this.state.tipo == 1) {await this.setState({fornecedor: ''})} else if (this.state.fornecedor == '' && this.state.chave != 0) { await this.setState({fornecedor: this.state.fornecedorInicial})} }}>
                                                                <option value={0}>Pagar</option>
                                                                <option value={1}>Receber</option>
                                                                <option value={2}>Recebimento de Remessa</option>
                                                                <option value={3}>Desconto</option>
                                                            </select>
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
                                                            <Field className="form-control" type="text" disabled={this.state.ordemBloqueado} value={this.state.ordem.replaceAll(',', '.')} onChange={async e => { this.setState({ ordem: e.currentTarget.value }) }} />
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
                                                    {validForm &&
                                                        <button style={{ borderRadius: 15 }} onClick={async () => { await this.setState({ financeiro: true }); await this.salvarServicoItem(validForm) }}>
                                                            <FontAwesomeIcon icon={faDollarSign} />
                                                        </button>
                                                    }
                                                    {(validForm || this.state.failures[0]) &&
                                                        <button style={{ borderRadius: 15 }} onClick={() => { this.setState({ email: true }); this.salvarServicoItem(validForm) }}>
                                                            <FontAwesomeIcon icon={faEnvelope} />
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

export default connect(mapStateToProps, null)(AddSolicitacao)
