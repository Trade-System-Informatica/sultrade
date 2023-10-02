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
    grupo: {},

    chave: '',
    nome: '',

    logs: [],
    modalLog: false,

    dadosIniciais: '',
    dadosFinais: '',

    recarregaPagina: "",

    templatesOptions: [],
    optionsTexto: '',

    templatesIniciais: [],
    templatesEscolhidas: [],

    acessos: [],
    permissoes: [],
    acessosPermissoes: [],

    bloqueado: false,
    loading: true,
    alert: { type: "", msg: "" },
}

class AddGrupoTemplate extends Component {

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        window.scrollTo(0, 0)
        const id = await this.props.match.params.id

        await this.setState({ chave: id })


        if (parseInt(id) != 0) {
            const grupo = await loader.getBody(`getGrupoTemplate.php`, { chave: this.state.chave });
            await this.setState({ grupo: grupo[0] });

            await this.setState({
                nome: this.state.grupo.nome,
                templatesIniciais: this.state.grupo.templatesChaves?.split('@.@'),
                templatesEscolhidas: this.state.grupo.templatesChaves?.split('@.@')
            })
        }
        await this.carregaTiposAcessos()
        await this.carregaPermissoes()
        await this.testaAcesso()
        await this.getEventosTemplates();

        if (this.state.chave != 0) {
            await this.setState({
                dadosIniciais: [
                    { titulo: 'Nome', valor: util.formatForLogs(this.state.nome) }
                ]
            })
        }

        this.state.acessosPermissoes.map((e) => {
            if ((e.acessoAcao == "GRUPOS_TEMPLATES" && e.permissaoInsere == 0 && this.state.chave == 0) || (e.acessoAcao == "GRUPOS_TEMPLATES" && e.permissaoEdita == 0 && this.state.chave != 0)) {
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

    getEventosTemplates = async () => {
        this.setState({
            templatesOptions: await loader.getBaseOptions(`getEventosTemplates.php`, 'descricao', 'chave')
        });
    }

    alteraModal = async (valor) => {
        this.setState({ modal: valor });
    }

    salvarGrupoTemplate = async (validForm) => {
        this.setState({ ...util.cleanStates(this.state) })

        this.setState({ bloqueado: true });


        await this.setState({
            dadosFinais: [
                { titulo: 'Nome', valor: util.formatForLogs(this.state.nome) },
            ],
            loading: true
        })

        if (parseInt(this.state.chave) === 0 && validForm) {
            await apiEmployee.post(`insertGrupoTemplate.php`, {
                token: true,
                values: `'${this.state.nome}'`,
                templates: this.state.templatesEscolhidas
            }).then(
                async res => {
                    await this.setState({
                        grupo: res.data[0],
                        chave: this.state.grupo.chave,
                        loading: false,
                    });
                    await loader.salvaLogs('templates_grupos', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].chave);

                    this.setState({
                        redirectVoltar: true,
                    })
                },
                async res => await console.log(`Erro: ${res.data}`)
            )
        } else if (validForm) {
            const templatesNovas = this.state.templatesEscolhidas.find((e) => !this.state.templatesIniciais.find((g) => e == g));
            const templatesDeletadas = this.state.templatesIniciais.find((e) => !this.state.templatesEscolhidas.find((g) => e == g));
            
            await apiEmployee.post(`updateGrupoTemplate.php`, {
                token: true,
                chave: this.state.chave,
                nome: this.state.nome,
                templatesNovas,
                templatesDeletadas
            }).then(
                async res => {
                    if (res.data[0]) {
                        await loader.salvaLogs('templates_grupos', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.chave, `GRUPOS DE TEMPLATES: ${this.state.nome}`);
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
        await this.setState({ logs: await loader.getLogs("templates_grupos", this.state.chave) })
        await this.setState({ modalLog: true })
    }

    render() {
        const validations = []
        validations.push(this.state.nome);

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
                {this.state.redirectVoltar &&
                    <Redirect to={{ pathname: `/utilitarios/grupostemplates/` }} />
                }

                {!this.state.loading &&
                    <>
                        <section>
                            <Header voltarGruposTemplates titulo="Grupos de Templates" chave={this.state.chave != 0 ? this.state.chave : ''} />
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
                        <div className="contact-section">

                            <div className="row">
                                <div className="col-lg-12">
                                    <Formik
                                        initialValues={{
                                            name: '',
                                        }}
                                        onSubmit={async values => {
                                            await new Promise(r => setTimeout(r, 1000))
                                            this.salvarGrupoTemplate(validForm)
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
                                                            </>
                                                        }
                                                        <div className={this.state.chave == 0 ? "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel" : "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm"}>
                                                            <label>Nome</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className='form-control' value={this.state.nome} onChange={(e) => { this.setState({ nome: e.currentTarget.value }) }} />
                                                        </div>

                                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'SERVICOS_ITENS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                                            <>
                                                                <div><hr /></div>

                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Templates</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Select className='SearchSelect' options={this.state.templatesOptions.filter(e => this.filterSearch(e, this.state.optionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ optionsTexto: e }) }} search={true} onChange={(e) => { if (!this.state.templatesEscolhidas.find((g) => g == e.value)) this.setState({ templatesEscolhidas: [...this.state.templatesEscolhidas, e.value] }) }} />
                                                                    <div style={{ marginBottom: 20, color: 'white', fontSize: 13 }}>
                                                                        {this.state.templatesEscolhidas.map((e, i) => (
                                                                            <span class="click_to_erase" onClick={() => this.setState({ templatesEscolhidas: this.state.templatesEscolhidas.filter((c) => c != e) })}>{`${this.state.templatesOptions.find((g) => g.value == e)?.label}${i != this.state.templatesEscolhidas.length - 1 ? ', ' : ' '}`}</span>
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

export default connect(mapStateToProps, null)(AddGrupoTemplate)

