import React, { Component } from 'react'
import './styles.css'
import { Formik, Field, Form } from 'formik'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import util from '../../../classes/util'
import loader from '../../../classes/loader'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { apiEmployee } from '../../../services/apiamrg'
import ModalLogs from '../../../components/modalLogs'
import Skeleton from '../../../components/skeleton'
const estadoInicial = {
    porto: 0,
    thumb: [],
    imagem: '',
    taxa: [],
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

    dadosIniciais: [],
    dadosFinais: [],

    nomeRepetido: false,
    bloqueado: false,


    acessos: [],
    permissoes: [],
    acessosPermissoes: [],

    nome: '',
    trocarSenha: true,
    senha: '',
    senhaRepetida: '',

    bloqueado: false,
    notAllowed: false,
}

class AddPessoa extends Component {

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        window.scrollTo(0, 0)
        var id = await this.props.match.params.id
        await this.setState({ codigo: id })

        if (this.state.usuarioLogado.empresa != 0) {
            await this.setState({ empresa: this.state.usuarioLogado.empresa });
        }
        if (parseInt(id) != 0) {
            if (this.props?.location?.state?.operador) {
                await this.setState({ operador: this.props.location.state.operador })
            } else {
                const operador = await loader.getBody(`getOperador.php`, { codigo: this.state.codigo });
                await this.setState({ operador: operador[0] });
            }
            //console.log('Servicos: ' + JSON.stringify(this.state.tiposervico))
            //await this.loadData(this.state.tiposervico)
            await this.setState({
                nome: this.state.operador.Nome,
                codigo: this.state.operador.Codigo,
                trocarSenha: false,
            })

        }
        //this.carregaLugares();
        await this.carregaTiposAcessos()
        await this.carregaPermissoes()
        await this.testaAcesso()

        if (this.state.chave != 0) {
            await this.setState({
                dadosIniciais: [
                    { titulo: 'Nome', valor: util.formatForLogs(this.state.nome) },
                ]
            })
        }

        this.state.acessosPermissoes.map((e) => {
            if (((e.acessoAcao == "OPERADORES" && e.permissaoInsere == 0 && this.state.chave == 0) || (e.acessoAcao == "OPERADORES" && e.permissaoEdita == 0 && this.state.codigo != 0))) {
                if (this.state.codigo != this.state.usuarioLogado.codigo) {
                    this.setState({ bloqueado: true })
                } else {
                    this.setState({ notAllowed: true });
                }

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

    testaNome = async () => {
        await apiEmployee.post('testaNome.php', {
            token: true,
            Nome: this.state.nome
        }).then(
            async res => {
                console.log(res.data);
                if (res.data[0] && this.state.codigo != res.data[0].Codigo) {
                    await this.setState({ bloqueado: true, nomeRepetido: true })
                }
            }
        )
    }

    salvarOperador = async (validForm) => {
        this.setState({...util.cleanStates(this.state)})
        this.setState({ loading: true });
        const senha = util.encrypt(this.state.senha)

        await this.setState({
            dadosFinais: [
                { titulo: 'Nome', valor: util.formatForLogs(this.state.nome) },
            ],
            loading: true
        })

        await this.testaNome();
        if (this.state.bloqueado || !validForm) {
            this.setState({ loading: false });
            return;
        }

        if (parseInt(this.state.codigo) == 0) {
            //$cols = 'data, titulo, texto, imagem, link, inativo';
            await apiEmployee.post(`insertOperador.php`, {
                token: true,
                values: `'${this.state.nome}', '${senha}', ${this.state.empresa}`
            }).then(
                async res => {
                    console.log(res.data);
                    if (res.data[0].Codigo) {
                        await this.setState({ codigo: res.data[0].Codigo })
                        await loader.salvaLogs('operadores', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].Codigo);
                        //alert('Operador Inserido!')
                        await this.setState({ loading: false, bloqueado: false })
                    } else {
                        //alert(`Erro: ${res}`)
                    }
                },
                async res => await console.log(`Erro: ${res}`)
            )
        } else {
            await apiEmployee.post(`updateOperador.php`, {
                token: true,
                Codigo: this.state.codigo,
                Nome: this.state.nome,
                Senha: senha
            }).then(
                async res => {
                    if (res.data === true) {
                        await loader.salvaLogs('operadores', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.codigo);
                        await this.setState({ loading: false, bloqueado: false })
                    } else {
                        //await alert(`Erro ${JSON.stringify(res)}`)
                    }
                },
                async res => await console.log(`Erro: ${res}`)
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
        await this.setState({ logs: await loader.getLogs("operadores", this.state.codigo) })
        await this.setState({ modalLog: true })
    }



    render() {
        const validations = []
        validations.push(this.state.nome)
        validations.push(!this.state.trocarSenha || this.state.senha && this.state.senha.trim().length >= 3 && this.state.senha == this.state.senhaRepetida)
        validations.push(!this.state.bloqueado)
        //validations.push(this.state.porto && this.state.porto > 0)
        //o formulário só será válido se todas as validações forem verdadeiras, com este reduce implementado

        const validForm = validations.reduce((t, a) => t && a)

        return (
            <div className='allContent'>

                {this.state.redirect &&
                    <Redirect to={'/'} />
                }

                <section>
                    <Header voltarOperadores={!this.state.notAllowed} voltarUtilitarios={this.state.notAllowed} titulo="Operadores" chave={this.state.codigo != 0 ? this.state.codigo : ''} />
                </section>

                <br />
                <br />
                <br />

                {this.state.codigo != 0 && this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'LOGS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                    <div className="logButton">
                        <button onClick={() => this.openLogs()}>Logs</button>
                    </div>
                }

                <ModalLogs
                    closeModal={() => { this.setState({ modalLog: false }) }}
                    logs={this.state.logs}
                    nome={this.state.nome}
                    chave={this.state.codigo}
                    modalAberto={this.state.modalLog}
                />

                {this.state.loading &&
                    <Skeleton />
                }
                {!this.state.loading &&
                    <div className="contact-section">

                        <div className="row">
                            <div className="col-lg-12">
                                <Formik
                                    initialValues={{
                                        name: '',
                                    }}
                                    onSubmit={async values => {
                                        await new Promise(r => setTimeout(r, 1000))
                                        this.salvarOperador(validForm)
                                    }}
                                >
                                    <Form className="contact-form">

                                        <div className="row">
                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2"></div>

                                            <div className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12 ">

                                                <div className="row addservicos">
                                                    {this.state.codigo != 0 &&
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel">
                                                            <label>Codigo</label>
                                                        </div>
                                                    }
                                                    {this.state.codigo != 0 &&
                                                        <div className='col-1'></div>
                                                    }
                                                    {this.state.codigo != 0 &&
                                                        <div className="col-xl-2 col-lg-2 col-md-3 col-sm-10 col-10">
                                                            <Field className="form-control" style={{ textAlign: 'center', backgroundColor: '#dddddd' }} type="text" disabled value={this.state.codigo} />
                                                        </div>
                                                    }
                                                    {this.state.codigo != 0 &&
                                                        <div className="col-4">
                                                        </div>
                                                    }

                                                    <div className={this.state.codigo == 0 ? "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel" : "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm"}>
                                                        <label>Nome</label>
                                                    </div>
                                                    <div className='col-1 errorMessage'>
                                                        {!this.state.nome &&
                                                            <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                        }
                                                    </div>
                                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                        <Field className="form-control" type="text" value={this.state.nome} onChange={async e => { this.setState({ nome: e.currentTarget.value }) }} />
                                                    </div>

                                                    {this.state.codigo != 0 &&
                                                        <div className="col-4"></div>
                                                    }
                                                    {this.state.codigo != 0 &&
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Trocar Senha?</label>
                                                        </div>
                                                    }
                                                    {this.state.codigo != 0 &&
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <Field type="checkbox" checked={this.state.trocarSenha} onChange={async e => { this.setState({ trocarSenha: e.target.checked }) }} />
                                                        </div>
                                                    }
                                                    {this.state.codigo != 0 &&
                                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                                    }
                                                    {this.state.trocarSenha &&
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Senha</label>
                                                        </div>
                                                    }
                                                    {this.state.trocarSenha &&
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.senha &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                    }
                                                    {this.state.trocarSenha &&
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="password" value={this.state.senha} onChange={async e => { this.setState({ senha: e.currentTarget.value }) }} />
                                                        </div>
                                                    }
                                                    {this.state.trocarSenha &&
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Confirmar Senha</label>
                                                        </div>
                                                    }
                                                    {this.state.trocarSenha &&
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.senhaRepetida &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                            {this.state.senhaRepetida && this.state.senhaRepetida != this.state.senha &&
                                                                <FontAwesomeIcon title='Senhas não coincidem' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                    }
                                                    {this.state.trocarSenha &&
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="password" value={this.state.senhaRepetida} onChange={async e => { this.setState({ senhaRepetida: e.currentTarget.value }) }} />
                                                        </div>
                                                    }
                                                </div>


                                            </div>
                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                        </div>

                                        <div className="row">
                                            <div className="col-1"></div>
                                            <div className='col-1 errorMessage'>
                                                {this.state.nomeRepetido &&
                                                    <FontAwesomeIcon title='Nome em uso!' icon={faExclamationTriangle} />
                                                }
                                            </div>
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
                }
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

export default connect(mapStateToProps, null)(AddPessoa)

