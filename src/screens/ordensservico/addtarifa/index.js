import React, { Component } from 'react'
import './styles.css'
import { Formik, Field, Form } from 'formik'
import Select from "react-select";
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import loader from '../../../classes/loader'
import { connect } from 'react-redux'
import ModalListas from '../../../components/modalListas'
import { Redirect } from 'react-router-dom'
import ModalLogs from '../../../components/modalLogs'
import { apiEmployee } from '../../../services/apiamrg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import util from '../../../classes/util';
import Modal from '@material-ui/core/Modal';
import { confirmAlert } from 'react-confirm-alert';
import { NOME_EMPRESA } from '../../../config';
import ModalInsertAnexo from '../../../components/modalInsertAnexo';

const estadoInicial = {
    descricao: '',
    data: '',
    porto: 0,
    thumb: [],
    imagem: '',
    terminal: [],
    id: null,
    seaports: [],
    redirect: false,
    spanerror1: '',
    spanerror2: '',
    spanerror3: '',
    spanerror4: '',
    maxTerminal: null,

    logs: [],
    modalLog: false,

    modal: '',
    modalAberto: false,
    modalLista: [],
    modalPesquisa: '',

    fornecedor: "",
    portos: [],
    portosDeletados: [],
    anexos:[],
    anexo: "",
    anexoNome: "",
    servico: "",
    vencimento: "",
    preferencial: false,
    modalInsertAnexo: false,
    observacao: "",

    email: {
        endereco: "",
        anexos: [],
        anexosNomes: [],
        formats: [],
        exts: [],
        aberto: false,
        assunto: "",
        corpo: "",
    },

    optionsTexto: "",

    fornecedoresOptions: [],
    portosOptions: [],

    dadosIniciais: '',
    dadosFinais: '',

    acessos: [],
    permissoes: [],
    acessosPermissoes: [],

    bloqueado: false,
    savedRedirect: false
}

class AddTarifa extends Component {

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        window.scrollTo(0, 0)
        var id = await this.props.match.params.id
        await this.setState({ chave: id })
        if (parseInt(id) !== 0) {
            await this.setState({
                fornecedor: this.props.location.state.tarifa.fornecedor,
                portos: this.props.location.state.tarifa.porto ? this.props.location.state.tarifa.porto.split("@") : [],
                servico: this.props.location.state.tarifa.servico,
                observacao: this.props.location.state.tarifa.observacao,
                anexo: this.props.location.state.tarifa.anexo,
                vencimento: this.props.location.state.tarifa.vencimento,
                preferencial: this.props.location.state.tarifa.preferencial != 0
            })

            const anexos = await apiEmployee.post(`getAnexosTarifas.php`, {
                token: true,
                chave: id,
            }).then(
                async res => {
                    return res.data;
                },
                err => { this.erroApi(err) }
            )

            this.setState({ anexos: anexos});

            const contatos = await apiEmployee.post(`getContatos.php`, {
                token: true,
                pessoa: this.state.fornecedor
            }).then(
                async res => {
                    return res.data;
                },
                err => { this.erroApi(err) }
            )

            this.setState({ email: { ...this.state.email, endereco: contatos.find((contato) => contato.Tipo == "EM")?.Campo1 } });
        }

        await this.loadAll();

        if (this.state.chave != 0) {
            this.setState({
                dadosIniciais: [
                    { titulo: 'Fornecedor', valor: util.formatForLogs(this.state.fornecedor, 'options', '', '', this.state.fornecedoresOptions) },
                    { titulo: 'Portos', valor: this.state.portos.map((p) => util.formatForLogs(p, 'options', '', '', this.state.portosOptions)).join(", ") },
                    { titulo: 'Servico', valor: util.formatForLogs(this.state.servico) },
                    { titulo: 'Anexo', valor: util.formatForLogs(this.state.anexo) },
                    { titulo: 'Vencimento', valor: util.formatForLogs(this.state.vencimento, 'date') },
                    { titulo: 'Observacao', valor: util.formatForLogs(this.state.observacao)}
                ]
            })
        }

        this.state.acessosPermissoes.map((e) => {
            if ((e.acessoAcao == "TARIFAS" && e.permissaoInsere == 0 && this.state.chave == 0) || (e.acessoAcao == "TARIFAS" && e.permissaoEdita == 0 && this.state.chave != 0)) {
                this.setState({ bloqueado: true })
            }
        })
    }

    loadAll = async () => {
        await this.setState({
            acessos: await loader.getBase('getTiposAcessos.php'),
            permissoes: await loader.getBase('getPermissoes.php'),
            fornecedores: await loader.getBase('getFornecedores.php'),
            fornecedoresOptions: await loader.getBaseOptions(`getFornecedores.php`, "Nome", "Chave"),
            portosOptions: await loader.getBaseOptions(`getPortos.php`, "Descricao", "Chave"),
        })

        await this.setState({
            acessosPermissoes: await loader.testaAcesso(this.state.acessos, this.state.permissoes, this.state.usuarioLogado),
            loading: false,
        })
        console.log(this.state.anexos)
    }

    salvaTarifaAnexo = async (anexo, nomeAnexo) => {

        let documento = '';
        let format = '';
        let ext = '';
        if (typeof anexo != "string" && anexo[0]) {
            documento = await util.getBase64(anexo[0]);
            format = anexo[0].type;
            ext = nomeAnexo.split('.')[nomeAnexo.split('.').length - 1];
        }
    
        const nome = `anexo_forn-${this.state.fornecedor}_port-${this.state.portos[0]}`;
    
        if (parseInt(this.state.chave) !== 0) {
            await apiEmployee.post(`insertAnexoTarifa.php`, {
                token: true,
                nome,
                documento,
                format,
                ext,
                chave_tarifa: this.state.chave
            }).then(
                async res => {
                    if (res.data[0].chave) {
                        await this.setState({ chave: res.data[0].chave })
                        await loader.salvaLogs('anexos_tarifas', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].chave);
    
                        //alert('Serviço Inserido!')
                        await this.setState({ loading: false, bloqueado: false, savedRedirect: true })
                        document.location.reload()
                    } else {
                        //alert(`Erro: ${res.data}`)
                    }
                },
                async res => await console.log(`Erro: ${res.data}`)
            )
        }}

    salvarTarifa = async (validForm) => {
        this.setState({ ...util.cleanStates(this.state) })
        this.setState({ bloqueado: true })

        await this.setState({
            dadosFinais: [
                { titulo: 'Fornecedor', valor: util.formatForLogs(this.state.fornecedor, 'options', '', '', this.state.fornecedoresOptions) },
                { titulo: 'Portos', valor: this.state.portos.map((p) => util.formatForLogs(p, 'options', '', '', this.state.portosOptions)).join(", ") },
                { titulo: 'Servico', valor: util.formatForLogs(this.state.servico) },
                { titulo: 'Anexo', valor: util.formatForLogs(this.state.anexo) },
                { titulo: 'Vencimento', valor: util.formatForLogs(this.state.vencimento, 'date') },
                { titulo: 'Observacao', valor: util.formatForLogs(this.state.observacao) }
            ],
            loading: true
        })

        let documento = '';
        let format = '';
        let ext = '';
        if (typeof this.state.anexo != "string" && this.state.anexo[0]) {
            documento = await util.getBase64(this.state.anexo[0]);
            format = this.state.anexo[0].type;
            ext = this.state.anexoNome.split('.')[this.state.anexoNome.split('.').length - 1];
        }
        const nome = `anexo_forn-${this.state.fornecedor}_port-${this.state.portos[0]}`;

        if (parseInt(this.state.chave) === 0 && validForm) {
            //$cols = 'data, titulo, texto, imagem, link, inativo';
            await apiEmployee.post(`insertTarifa.php`, { // ALTERAÇÃO
                token: true,
                values: `'${this.state.fornecedor}', '${this.state.servico}', '${this.state.vencimento}', '${this.state.preferencial ? 1 : 0}', '${this.state.observacao}'`,
                portos: this.state.portos,
                nome,
                documento,
                format,
                ext
            }).then(
                async res => {
                    if (res.data[0].chave) {
                        await this.setState({ chave: res.data[0].chave })
                        await loader.salvaLogs('tarifas', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].chave);

                        //alert('Serviço Inserido!')
                        await this.setState({ loading: false, bloqueado: false, savedRedirect: true })
                    } else {
                        //alert(`Erro: ${res.data}`)
                    }
                },
                async res => await console.log(`Erro: ${res.data}`)
            )
        } else if (validForm) {

            await apiEmployee.post(`updateTarifa.php`, {
                token: true,
                chave: this.state.chave,
                fornecedor: this.state.fornecedor,
                portos: this.state.portos,
                portosDeletados: this.state.portosDeletados,
                servico: this.state.servico,
                vencimento: this.state.vencimento,
                preferencial: this.state.preferencial ? 1 : 0,
                observacao: this.state.observacao,
            }).then(
                async res => {
                    console.log(res.data);
                    if (res.data) {
                        await loader.salvaLogs('tarifas', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.chave, `ANEXO: ${this.state.fornecedor}`);

                        await this.setState({ loading: false, bloqueado: false, savedRedirect: true })
                    } else {
                        // await alert(`Erro ${JSON.stringify(res)}`)
                    }
                },
                async res => await console.log(`Erro: ${res.data}`)
            )

        }

    }

    addAnexo = async (target) => {
        const anexos = this.state.email.anexos;
        const nomes = this.state.email.anexosNomes;
        const formats = this.state.email.formats;
        const exts = this.state.email.exts;

        const nome = target.files[0].name;
        const anexo = await util.getBase64(target.files[0]);

        anexos.push(anexo)
        formats.push(target.type);
        exts.push(nome.split('.')[nome.split('.').length - 1]);
        nomes.push(nome);

        this.setState({
            email: { ... this.state.email, anexos, anexosNomes: nomes, formats, exts }
        });
    }

    removeAnexo = async (index) => {
        const anexos = this.state.email.anexos.filter((e, i) => i != index);
        const nomes = this.state.email.anexosNomes.filter((e, i) => i != index);
        const formats = this.state.email.formats.filter((e, i) => i != index);
        const exts = this.state.email.exts.filter((e, i) => i != index);

        this.setState({
            email: { ... this.state.email, anexos, anexosNomes: nomes, formats, exts }
        });
    }

    alteraModal = async (valor) => {
        this.setState({ modal: valor });
    }

    alteraCliente = async (valor, categoria) => {
        if (categoria.split('')[1] == '1') {
            await this.setState({ fornecedor: valor });
        }
        await this.setState({ modalAberto: false, fornecedores: await loader.getBase("getFornecedores.php"), fornecedoresOptions: await loader.getBaseOptions(`getFornecedores.php`, "Nome", "Chave") });
    }

    enviaEmail = async (validForm) => {
        if (!validForm) {
            return;
        }

        this.salvarTarifa();

        this.setState({
            email: { ...this.state.email, corpo: this.state.email.corpo.replaceAll("\\n", "<br/>"), aberto: false },
            loading: true
        });

        await loader.getBody("tarifasCustomEmail.php", {
            token: true,
            email: this.state.email.endereco,
            assunto: this.state.email.assunto,
            corpo: this.state.email.corpo,
            anexos: this.state.email.anexos,
            operador: this.state.usuarioLogado.nome,
            anexosNomes: this.state.email.anexosNomes,
        });

        this.setState({
            loading: false
        })
    }

    erroApi = async (res) => {
        await this.setState({ redirect: true })
    }

    filterSearch = (e) => {
        if (e == "") {
            return true
        }

        const text = this.state.optionsTexto.toUpperCase();
        return (e.label.toUpperCase().includes(text))
    }

    openLogs = async () => {
        await this.setState({ logs: await loader.getLogs("tarifas", this.state.chave) })
        await this.setState({ modalLog: true })
    }

    deleteAnexo = async (chave, nome) => {
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja remover esse anexo? ({nome}) </p>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-success w-25"
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
                            className="btn btn-danger w-25"
                            onClick={
                                async () => {
                                    await apiEmployee.post(`deleteAnexoTarifa.php`, {
                                        token: true,
                                        chave: chave,
                                        anexo: nome
                                    }).then(
                                        async response => {
                                            if (response.data == true) {
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

    render() {

        const validations = []
        validations.push(this.state.fornecedor)
        validations.push(this.state.portos[0])
        validations.push(this.state.servico)
        validations.push(this.state.vencimento)
        validations.push(!this.state.bloqueado)
        //validations.push(this.state.porto && this.state.porto > 0)
        //o formulário só será válido se todas as validações forem verdadeiras, com este reduce implementado

        const validForm = validations.reduce((t, a) => t && a)

        const validationsEmail = [];
        validationsEmail.push(this.state.email.endereco);
        validationsEmail.push(this.state.email.assunto);
        validationsEmail.push(this.state.email.corpo);

        const validFormEmail = validationsEmail.reduce((a, b) => a && b);

        return (
            <div className='allContent'>

                {this.state.redirect &&
                    <Redirect to={'/'} />
                }

                {this.state.savedRedirect &&
                    <Redirect to={'/ordensservico/tarifas'} />
                }

                <section>
                    <Header voltarTarifas titulo="Tarifas de Fornecedores" chave={this.state.chave != 0 ? this.state.chave : ''} />
                    <br />
                    <br />
                    <br />
                    <br />
                </section>

                <ModalInsertAnexo
                        closeModal={() => { this.setState({ modalInsertAnexo: false }) }}
                        chave={this.state.chave}
                        modalAberto={this.state.modalInsertAnexo}
                        salvaAnexoTarifa={this.salvaTarifaAnexo}
                    />

                <ModalListas
                    pesquisa={this.state.modalPesquisa}
                    alteraModal={this.alteraModal}
                    alteraCliente={this.alteraCliente}
                    acessosPermissoes={this.state.acessosPermissoes}
                    modalAberto={this.state.modalAberto}
                    modal={this.state.modal}
                    modalLista={this.state.modalLista}
                    closeModal={() => { this.setState({ modalAberto: false }) }}
                />


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
                    open={this.state.email.aberto}
                    onClose={async () => await this.setState({ email: { ...this.state.email, aberto: false } })}
                >
                    <div className='modalContainer'>
                        <div className='modalCriar'>
                            <div className='containersairlistprodmodal'>
                                <div className='botaoSairModal' onClick={async () => await this.setState({ email: { ...this.state.email, aberto: false } })}>
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
                                            this.enviaEmail(validFormEmail)
                                        }}
                                    >
                                        <Form className="contact-form" >

                                            <div className="row">

                                                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 ">

                                                    <div className="row addservicos">
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstlabel">
                                                            <label>Destinatário</label>
                                                        </div>
                                                        <div className="col-1 errorMessage">
                                                            {!this.state.email.endereco &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="text" value={this.state.email.endereco} onChange={async e => { this.setState({ email: { ...this.state.email, endereco: e.currentTarget.value } }) }} />
                                                        </div>
                                                        <div className="col-1"></div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstlabel">
                                                            <label>Assunto</label>
                                                        </div>
                                                        <div className="col-1 errorMessage">
                                                            {!this.state.email.assunto &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="text" value={this.state.email.assunto} onChange={async e => { this.setState({ email: { ...this.state.email, assunto: e.currentTarget.value } }) }} />
                                                        </div>
                                                        <div className="col-1"></div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstlabel">
                                                            <label>Corpo</label>
                                                        </div>
                                                        <div className="col-1 errorMessage">
                                                            {!this.state.email.corpo &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="text" rows="4" component="textarea" value={this.state.email.corpo} onChange={async e => { this.setState({ email: { ...this.state.email, corpo: e.currentTarget.value } }) }} />
                                                        </div>
                                                        <div className="col-1"></div>

                                                        <div className={this.state.chave == 0 ? "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel" : "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm"}>
                                                            <label>Anexo</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                            <Field className="form-control" type="file" value={""} onChange={async e => { this.addAnexo(e.currentTarget) }} />
                                                            <div>
                                                                {this.state.email.anexosNomes.map((e, i) => (
                                                                    <span className="emailLinks" onClick={() => this.removeAnexo(i)}>{e}; </span>
                                                                ))}
                                                            </div>
                                                        </div>
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

                <div className="contact-section">

                    <div className="row">
                        <div className="col-lg-12">
                            <Formik
                                initialValues={{
                                    name: '',
                                }}
                                onSubmit={async values => {
                                    await new Promise(r => setTimeout(r, 1000))
                                    this.salvarTarifa(validForm)
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
                                                        <Field className="form-control" style={{ textAlign: 'center', backgroundColor: '#dddddd' }} type="text" disabled value={this.state.chave} />
                                                    </div>
                                                }
                                                {this.state.chave != 0 &&
                                                    <div className="col-xl-4 col-lg-4 col-md-3 col-sm-1 col-1 " s>
                                                    </div>
                                                }

                                                <div className={this.state.chave == 0 ? "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel" : "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm"}>
                                                    <label>Fornecedor</label>
                                                </div>
                                                <div className='col-1 errorMessage'>
                                                    {!this.state.fornecedor &&
                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                    }
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                    <Select className='SearchSelect' options={this.state.fornecedoresOptions.filter(e => this.filterSearch(e, this.state.fornecedoresOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ optionsTexto: e }) }} value={this.state.fornecedoresOptions.find(option => option.value == this.state.fornecedor)} search={true} onChange={async (e) => { await this.setState({ fornecedor: e.value }) }} />
                                                </div>
                                                <div className="col-xl-1 col-lg-2 col-md-2 col-sm-12 col-12">
                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                                        <div className='insideFormButton' onClick={() => { this.setState({ modalAberto: true, modal: 'listarCliente', modalPesquisa: this.state.fornecedor, modalLista: this.state.fornecedores }) }}>...</div>
                                                    }
                                                </div>
                                                <div className={this.state.chave == 0 ? "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel" : "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm"}>
                                                    <label>Portos</label>
                                                </div>
                                                <div className='col-1 errorMessage'>
                                                    {!this.state.portos[0] &&
                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                    }
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                    <Select className='SearchSelect' options={this.state.portosOptions.filter(e => this.filterSearch(e, this.state.optionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ optionsTexto: e }) }} value={this.state.portosOptions.find(option => option.value == this.state.porto)} search={true} onChange={async (e) => { if (!this.state.portos.find((port) => port == e.value)) { await this.setState({ portos: [...this.state.portos, e.value], portosDeletados: this.state.portosDeletados.filter((port) => port != e.value) }) } }} />
                                                    {this.state.portos.map((port, portIndex) => {
                                                        const virgula = portIndex < this.state.portos.length - 1 ? ", " : "";

                                                        return (
                                                            <span onClick={() => this.setState({ portos: this.state.portos.filter((porto) => porto != port), portosDeletados: [...this.state.portosDeletados, port] })} className="selectedList">{this.state.portosOptions.find((porto) => porto.value == port)?.label}{virgula}</span>
                                                        )
                                                    }
                                                    )}
                                                </div>
                                                <div className={this.state.chave == 0 ? "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel" : "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm"}>
                                                    <label>Serviço</label>
                                                </div>
                                                <div className='col-1 errorMessage'>
                                                    {!this.state.servico &&
                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                    }
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                    <Field className="form-control" type="text" value={this.state.servico} onChange={async e => { this.setState({ servico: e.currentTarget.value }) }} />
                                                </div>
                                                <div className={this.state.chave == 0 ? "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel" : "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm"}>
                                                    <label>Observação</label>
                                                </div>
                                                <div className='col-1 errorMessage'>
                                                    {!this.state.observacao &&
                                                        <div />
                                                    }
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                    <Field className="form-control" rows="4" component="textarea" type="text" value={this.state.observacao} onChange={async e => { this.setState({ observacao: e.currentTarget.value }) }} />
                                                </div>
                                                <div className={this.state.chave == 0 ? "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel" : "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm"}>
                                                    <label>Vencimento</label>
                                                </div>
                                                <div className='col-1 errorMessage'>
                                                    {!this.state.vencimento &&
                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                    }
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                    <Field className="form-control" type="date" value={this.state.vencimento} onChange={async e => { this.setState({ vencimento: e.currentTarget.value }) }} />
                                                </div>

                                                {this.state.chave == 0 ? <>
                                                <div className={this.state.chave == 0 ? "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel" : "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm"}>
                                                    <label>Anexo</label>
                                                </div>
                                                <div className='col-1 errorMessage'>

                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                    <Field className="form-control" type="file" value={this.state.anexoNome} onChange={async e => { this.setState({ anexo: e.currentTarget.files, anexoNome: e.currentTarget.value }) }} />
                                                </div> </> : null
                                                }
                                                
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <label>Preferencial</label>
                                                </div>
                                                <div className='col-1'></div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                    <input className='form_control' checked={this.state.preferencial} onChange={(e) => { this.setState({ preferencial: e.currentTarget.checked }) }} type="checkbox" />
                                                </div>
                                                <div className='col-1'></div>
                                            </div>


                                        </div>
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                    </div>

                                    <div className="row">
                                        <div className="col-2"></div>
                                        <div className="col-4" style={{ display: 'flex', justifyContent: 'center' }}>
                                            <button disabled={!validForm} type="submit" style={validForm ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} >Salvar</button>
                                        </div>
                                        <div className="col-4" style={{ display: 'flex', justifyContent: 'center' }}>
                                            <button disabled={!validForm || this.state.chave == 0} type='button' onClick={() => {this.setState({ email: { ...this.state.email, aberto: true } }) }} style={validForm && this.state.chave != 0 ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} >Enviar Email</button>
                                        </div>
                                        <div className="col-2"></div>
                                    </div>

                                </Form>
                            </Formik>
                        </div>
                        {this.state.chave != 0 && this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS_CONTATOS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                        <div>
                                            <div>
                                                <div>
                                                    <div className="page-breadcrumb2"><h3>Anexos</h3></div>
                                                </div>
                                                <div>
                                                    <div>
                                                        <div className="row" id="product-list">
                                                            <div className="col-xl-2 col-lg-2 col-md-0 col-sm-0 col-0"></div>
                                                            <div className="col-lg-12 col-md-12 col-sm-12 col-12 mix all dresses bags">
                                                                <div className="single-product-item">
                                                                    {window.innerWidth >= 500 &&
                                                                        <div className="row subtitulosTabela">
                                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-center">
                                                                                <span className="subtituloships">Chave</span>
                                                                            </div>
                                                                            <div className="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-4 text-center">
                                                                                <span className="subtituloships">Anexo</span>
                                                                            </div>
                                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-center">
                                                                                <span className="subtituloships">Chave Tarifa</span>
                                                                            </div>
                                                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-center" type='button' onClick={() => {this.setState({modalInsertAnexo: true})}}>
                                                                                <FontAwesomeIcon icon={faPlus} />
                                                                            </div>
                                                                        </div>
                                                                    }
                                                                    {window.innerWidth < 500 &&
                                                                        <div className="row subtitulosTabela">
                                                                            <div className="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-4 text-center">
                                                                                <span className="subtituloships">Chave</span>
                                                                            </div>
                                                                            <div className="col-xl-5 col-lg-5 col-md-5 col-sm-5 col-5 text-center">
                                                                                <span className="subtituloships">Anexo</span>
                                                                            </div>
                                                                        </div>
                                                                    }
                                                                </div>
                                                            </div>
                                                            <div className="col-xl-2 col-lg-2 col-md-0 col-sm-0 col-0"></div>
                                                        </div>

                                                        <div id="product-list">
                                                            {this.state.anexos[0] != undefined && this.state.anexos.map((feed, index) => (
                                                                <div key={feed.chave} className="row row-list">
                                                                    <div className="col-xl-2 col-lg-2 col-md-0 col-sm-0 col-0"></div>
                                                                    <div className={index % 2 == 0 ? "col-lg-12 col-md-12 col-sm-12 col-12 mix all dresses bags par" : "col-lg-12 col-md-12 col-sm-12 col-12 mix all dresses bags itemLista impar"}>
                                                                        {window.innerWidth >= 500 &&
                                                                            <div className="row deleteMargin alignCenter">
                                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-center alignCenter">
                                                                                    <p><a target="_blank" href={`${util.completarDocuments(`pictures/${feed?.anexo}`)}`} className='nonLink'>{feed?.chave}</a></p>
                                                                                </div>
                                                                                <div className="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-4 text-center alignCenter">
                                                                                    <p><a target="_blank" href={`${util.completarDocuments(`pictures/${feed?.anexo}`)}`} className='nonLink'>{feed?.anexo}</a></p>
                                                                                </div>
                                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-center alignCenter">
                                                                                    <p><a target="_blank" href={`${util.completarDocuments(`pictures/${feed?.anexo}`)}`} className='nonLink'>{feed?.chave_tarifa}</a></p>
                                                                                </div>
                                                                                <div className="col-lg-2 col-md-2 col-sm-2 col-2  text-left  mobileajuster4 icones">
                                                                                {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS_ENDERECOS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                                                                        <div type='button' className='iconelixo' onClick={(a) => this.deleteAnexo(feed.chave, feed.anexo)} >
                                                                                            <FontAwesomeIcon icon={faTrashAlt} />
                                                                                        </div>
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        }
                                                                    </div>
                                                                    <div className="col-xl-2 col-lg-2 col-md-0 col-sm-0 col-0"></div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    }
                    </div>

                </div>
                <Rodape />
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

export default connect(mapStateToProps, null)(AddTarifa)

