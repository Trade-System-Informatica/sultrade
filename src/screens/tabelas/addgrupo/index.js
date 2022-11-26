import React, { Component } from 'react'
import './styles.css'
import { Formik, Field, Form } from 'formik'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import loader from '../../../classes/loader'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { apiEmployee } from '../../../services/apiamrg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import ModalLogs from '../../../components/modalLogs'

const estadoInicial = {
    data: '',
    porto: 0,
    thumb: [],
    imagem: '',
    terminal: [],
    id: null,
    seaports: [],
    redirect: false,
    finalizaOperacao: false,
    spanerror1: '',
    spanerror2: '',
    spanerror3: '',
    spanerror4: '',
    maxTerminal: null,

    logs: [],
    modalLog: false,

    dadosIniciais: '',
    dadosFinais: '',

    descricao: '',
    grupo: '',
    grupos: [],
    gruposOptions: [],

    acessos: [],
    permissoes: [],
    acessosPermissoes: [],

    bloqueado: false,
}

class AddGrupo extends Component {

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        window.scrollTo(0, 0)
        var id = await this.props.match.params.id
        console.log(id);
        await this.setState({ chave: id })
        if (parseInt(id) !== 0) {
            await this.setState({ grupo: this.props.location.state.grupo })
            //console.log('Servicos: ' + JSON.stringify(this.state.tiposervico))
            //await this.loadData(this.state.tiposervico)
            await this.setState({
                descricao: this.state.grupo.descricao
            })

            await this.setState({
                dadosIniciais: [
                    { titulo: 'descricao', valor: this.state.descricao }
                ]
            })
        }
        await this.carregaTiposAcessos()
        await this.carregaPermissoes()
        await this.testaAcesso()

        this.state.acessosPermissoes.map((e) => {
            if ((e.acessoAcao == "GRUPOS_TAXAS" && e.permissaoInsere == 0 && this.state.chave == 0) || (e.acessoAcao == "GRUPOS_TAXAS" && e.permissaoEdita == 0 && this.state.chave != 0)) {
                this.setState({ bloqueado: true })
            }
        })
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

    salvarGrupo = async (validForm) => {
        this.setState({ bloqueado: true })


        await this.setState({
            dadosFinais: [
                { titulo: 'descricao', valor: this.state.descricao }
            ]
        })

        if (parseInt(this.state.chave) === 0 && validForm) {
            await apiEmployee.post(`insertGrupo.php`, {
                token: true,
                values: `'${this.state.descricao}'`
            }).then(
                async res => {
                    if (res.data[0].chave) {
                        await this.setState({ chave: res.data[0].chave })
                        await loader.salvaLogs('os_grupos_taxas', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].chave);

                        await this.setState({ finalizaOperacao: true })
                    } else {
                    }
                },
                async res => await console.log(`Erro: ${res.data}`)
            )
        } else if (validForm) {
            await apiEmployee.post(`updateGrupo.php`, {
                token: true,
                chave: this.state.chave,
                descricao: this.state.descricao
            }).then(
                async res => {
                    if (res.data === true) {
                        await loader.salvaLogs('os_grupos_taxas', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.chave, `GRUPOS DE TAXAS: ${this.state.descricao}`);

                        await this.setState({ finalizaOperacao: true })
                    } else {
                    }
                },
                async res => await console.log(`Erro: ${res.data}`)
            )

        }

    }

    erroApi = async (res) => {
        console.log(res)
        await this.setState({ redirect: true })
    }

    filterSearch = (e) => {
        if (e == "") {
            return true
        }

        const text = this.state.pessoasOptionsTexto.toUpperCase();
        return (e.label.toUpperCase().includes(text))
    }


    openLogs = async () => {
        await this.setState({ logs: await loader.getLogs("os_grupos_taxas", this.state.chave) })
        await this.setState({ modalLog: true })
    }


    render() {

        const validations = []
        validations.push(this.state.descricao)
        validations.push(!this.state.bloqueado)

        const validForm = validations.reduce((t, a) => t && a)

        return (
            <div className='allContent'>

                {this.state.redirect &&
                    <Redirect to={'/'} />
                }

                {this.state.finalizaOperacao &&
                    <Redirect to={{ pathname: '/tabelas/grupos', state: { chave: this.state.chave } }} />
                }

                <section>
                    <Header voltarGrupos titulo="Grupos de Taxa" chave={this.state.chave != 0 ? this.state.chave : ''} />
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

                <div className="contact-section">

                    <div className="row">
                        <div className="col-lg-12">
                            <Formik
                                initialValues={{
                                    name: '',
                                }}
                                onSubmit={async values => {
                                    await new Promise(r => setTimeout(r, 1000))
                                    this.salvarGrupo(validForm)
                                }}
                            >
                                <Form className="contact-form">

                                    <div className="row">
                                        <div className="col-xl-4 col-lg-2 col-md-2 col-sm-2 col-2"></div>

                                        <div className="col-xl-4 col-lg-8 col-md-8 col-sm-8 col-12 ">

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
                                                    <label>Descrição</label>
                                                </div>
                                                <div className='col-1 errorMessage'>
                                                    {!this.state.descricao &&
                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                    }
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                    <Field className="form-control" type="text" value={this.state.descricao} onChange={async e => { this.setState({ descricao: e.currentTarget.value }) }} />
                                                </div>
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

export default connect(mapStateToProps, null)(AddGrupo)

