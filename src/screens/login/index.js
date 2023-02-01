import React, { Component } from 'react'
import './styles.css'
import { Formik, Field, Form } from 'formik'
import { Redirect } from 'react-router-dom'
import util from '../../classes/util'
import { connect } from 'react-redux'
import { login } from '../../store/actions/user'
import { setserver } from '../../store/actions/server'
import { apiEmployee } from '../../services/apiamrg'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
import Select from 'react-select';
import Rodape from '../../components/rodape'
import Header from '../../components/header'
import { NOME_EMPRESA } from '../../config'

const estadoInicial = {
    login: '',
    senha: '',
    nome: '',
    codigo: '',
    token: '',
    redirect: false,
    online: false,
    operadores: [],
    loginOptions: [],

    empresas: [],
    empresasOptions: [],
    empresa: 0,
    empresaVerdadeira: 0
}

class Login extends Component {

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user,
    }

    componentDidMount = async () => {
        await this.getEmpresas();
    }

    getEmpresas = async () => {
        await apiEmployee.post(`getControle.php`, {
            token: true
        }).then(
            async res => {
                await this.setState({ empresas: res.data })
            }
        )

        const options = this.state.empresas.map((e) => {
            return { label: e.Nome, value: e.Chave }
        })

        await this.setState({ empresasOptions: options })
    }

    setLoginOptions = async () => {
        await apiEmployee.post(`getOperadores.php`, {
            token: true
        }).then(
            async res => {
                await this.setState({ operadores: res.data })
            }
        )

        const options = this.state.operadores.filter((e) => (e.empresa == this.state.empresa || e.empresa == 0)).map((e) => {
            return { label: e.Nome, value: e.Codigo }
        })

        await this.setState({ loginOptions: options })
    }


    signin = async () => {
        const senha = util.encrypt(this.state.senha);
        await apiEmployee.post(`login.php`, {
            Codigo: this.state.login,
            Senha: senha,
        }).then(
            async res => {
                await this.setState({ codigo: res.data })
            }
        )

        if (this.state.codigo == 'false') {
            confirmAlert({
                customUI: ({ onClose }) => {
                    return (
                        <div className='custom-ui text-center'>
                            <h1>{NOME_EMPRESA}</h1>
                            <p>Falha no acesso, usuário ou senha incorretos!</p>
                            <button
                                style={{ marginRight: 5 }}
                                className="btn btn-danger w-50"
                                onClick={
                                    async () => {
                                        onClose()
                                    }
                                }
                            >
                                Ok
                            </button>
                        </div>
                    )
                }
            })
        } else {
            this.setState({ codigo: this.state.codigo[0].Codigo })
            await this.props.onLogin({ ...this.state })
            this.setState({ redirect: true })
        }

    }

    render() {
        const validations = []
        validations.push(this.state.login)
        validations.push(this.state.senha && this.state.senha.trim().length >= 4)

        const validForm = validations.reduce((t, a) => t && a)
        return (
            <div className='allContent'>

                <section>
                    {this.state.redirect &&
                        <Redirect to={'/inicio'} />
                    }

                    <Header login titulo="Login"/>
                </section>



                <div>

                    <Formik
                        initialValues={{
                            login: '',
                            senha: ''
                        }}
                        onSubmit={async values => {
                            await new Promise(r => setTimeout(r, 500))
                            this.signin()
                        }}
                    >
                        <div className="row">
                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-0 col-0"></div>
                            <div className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12">
                                <Form className="contact-form">

                                    <div className="row">
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2"></div>

                                        <div className="col-xl-8 col-lg-8 col-md-8 col-sm-8 col-12 ">

                                            <div className="row addservicos">
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel">
                                                    <label>Empresa</label>
                                                </div>
                                                <div className='col-1 errorMessage'>
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                    <Select className='SearchSelect' options={this.state.empresasOptions} onChange={(e) => { this.setState({ empresa: e.value }); this.setLoginOptions(); }} autoComplete={'off'} placeholder="Empresa" />
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <label>Login</label>
                                                </div>
                                                <div className='col-1 errorMessage'>
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10" >
                                                    <Select className='SearchSelect' options={this.state.loginOptions} onChange={(e) => { this.setState({ login: e.value, nome: e.label }) }} autoComplete={'off'} placeholder="Login" />
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <label>Senha</label>
                                                </div>
                                                <div className='col-1 errorMessage'>
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                    <Field value={this.state.senha} onChange={e => { this.setState({ senha: e.currentTarget.value }) }} autoComplete={'off'} type="password" placeholder="Senha" />
                                                </div>

                                                <div className="row"></div>
                                                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 btnloginadm">
                                                    <button disabled={!validForm} type="submit" style={validForm ? { backgroundColor: '#eee', opacity: 0.9, marginTop: 20 } : { backgroundColor: '#eee', opacity: 0.3, marginTop: 20 }} >Entrar</button>
                                                </div>
                                            </div>


                                        </div>
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                    </div>
                                </Form>
                            </div>
                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-0 col-0"></div>
                        </div>

                    </Formik>
                </div >
                <Rodape />
            </div >
        )
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onLogin: (user) => dispatch(login(user)),
        onSetServidor: servidor => dispatch(setserver(servidor))
    }
}

const mapStateToProps = ({ user, servidor }) => {
    return {
        user: user,
        online: servidor.online
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)