import React, { Component } from 'react'
import './styles.css'
import { apiEmployee } from '../../../services/apiamrg'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import Skeleton from '../../../components/skeleton'
import loader from '../../../classes/loader'
import { Formik, Field, Form } from 'formik'
import { Link, useHistory, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { PRECISA_LOGAR, NOME_EMPRESA } from '../../../config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import { faChevronCircleDown, faPlus, faTrashAlt, faPen, faEye, faPrint, faHome } from '@fortawesome/free-solid-svg-icons'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
import moment from 'moment'
import { GiReturnArrow } from 'react-icons/gi'


const estadoInicial = {
    name: '',
    operadores: [],
    permissoes: [],
    pesquisa: "",

    usersPermissoes: [/*{
        user: [],
        permissao: []
    }*/],

    acesso: [/*{
        chave: ``,
        liberacao: ``,
        acesso: ``,
    }*/],

    dadosIniciais: [],
    dadosFinais: [],

    tiposPermissoes: ['Inclusão', 'Alteração', 'Exclusão', 'Consulta', 'Impressão'],
    tipoAcessos: [],
    tipoPesquisa: 1,
    //Tipos de pesquisa: 1 (descricao), 2 (prazo)
    /*seaports: [],*/
    loading: true,
    redirect: false,
    finalizaOperacao: false,

    acessos: [],
    permissoesUser: [],
    acessosPermissoes: [],
    bloqueado: false
}

class Permissoes extends Component {

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        await this.getOperadores()
        await this.getTiposAcessos()
        await this.getPermissoes()
        
        await this.carregaTiposAcessos()
        await this.carregaPermissoes()
        await this.testaAcesso()

        this.state.acessosPermissoes.map((e) => {
            if (e.acessoAcao == "PERMISSOES" && e.permissaoConsulta == 0) {
                this.setState({ redirect: true })
            }
        })

        this.state.acessosPermissoes.map((e) => {
            if (e.acessoAcao == "PERMISSOES" && (e.permissaoEdita == 0)) {
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
                await this.setState({ permissoesUser: res.data })
            },
            async err => { this.erroApi(err) }
        )
    }

    testaAcesso = async () => {
        let permissao = '';

        const acessosPermissoes = this.state.acessos.map((e, i) => {
            permissao = this.state.permissoesUser.filter((permissao) => {
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


    getOperadores = async () => {
        await apiEmployee.post(`getOperadores.php`, {
            token: true,
            empresa: this.state.usuarioLogado.empresa
        }).then(
            async response => {
                const operadores = response.data.map((e) => ({
                    ...e,
                    botao: false,
                    check: [false, false, false, false, false]
                }))

                await this.setState({ operadores: operadores })

            },
            response => { this.erroApi(response) }

        )
    }

    getTiposAcessos = async () => {
        await apiEmployee.post(`getTiposAcessos.php`, {
            token: true
        }).then(
            async response => {
                await this.setState({ tipoAcessos: response.data })
            },
            response => { this.erroApi(response) }

        )
    }

    getPermissoes = async () => {
        await apiEmployee.post(`getPermissoes.php`, {
            token: true
        }).then(
            async response => {
                let permissoes = response.data;
                let acessos = '';

                permissoes.map((e) => {
                    acessos = e.Liberacao.split('');
                    e.LiberacaoString = acessos.map((elemento) => {
                        if (elemento == 1) {
                            return true;
                        } else {
                            return false;
                        }
                    })
                })

                await this.setState({ permissoes: permissoes })

                const todos = [];
                let permissoesFiltradas = [];

                this.state.operadores.map((usuario) => {
                    this.state.tipoAcessos.map((acesso) => {
                        permissoesFiltradas = this.state.permissoes.filter((permissoes) => {
                            if (permissoes.Usuario == usuario.Codigo && permissoes.Acessos == acesso.Chave) {
                                return permissoes.LiberacaoString;
                            }
                        })
                        todos.push({
                            usuario: usuario,
                            acesso: acesso,
                            permissoes: permissoesFiltradas[0]
                        })
                    })
                })

                await this.setState({ userPermissoes: todos })
                await this.setState({ loading: false })
            },
            response => { this.erroApi(response) }
        )
    }


    erroApi = async (res) => {
        console.log(res)
        await this.setState({ redirect: true })
    }

    filtrarPesquisa = (operadores) => {
        if (this.state.tipoPesquisa == 1) {
            return operadores.Nome.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        }

    }

    salvaAlteracoes = async (user, validForm) => {
        await this.setState({loading: true});
        if (!validForm) {
            return;
        }
        const userPermissoes = this.state.userPermissoes.filter((e) => {
            if (e.usuario.Codigo == user && e.permissoes) {
                return e;
            }
        })

        let usuario = '';
        let acesso = '';
        let liberacao = '';

        userPermissoes.map(async (permissoes) => {
            usuario = permissoes.usuario.Codigo;
            acesso = permissoes.acesso.Chave;

            liberacao = permissoes.permissoes.LiberacaoString.map((e) => {
                if (e) {
                    return 1
                } else {
                    return 0
                }
            })

            if (!permissoes.permissoes.Liberacao) {
                await apiEmployee.post(`insertPermissao.php`, {
                    token: true,
                    values: `'${usuario}', '${this.state.usuarioLogado.empresa}', ${acesso}, '${liberacao.join('')}'`
                }).then(
                    async res => {

                        await this.setState({
                            dadosIniciais: [
                                { titulo: 'Liberacao', valor: permissoes.permissoes.Liberacao }
                            ],

                            dadosFinais: [
                                { titulo: 'Liberacao', valor: liberacao.join('') }
                            ]
                        })

                        if (JSON.stringify(res.data) == 'true') {
                            loader.salvaLogs("permissoes", this.state.usuarioLogado.codigo, null, "Inclusão", `${permissoes.usuario.Codigo}${this.state.usuarioLogado.empresa}${permissoes.acesso.Chave}`)
                            await this.setState({loading:false})
                            document.location.reload()

                        } else {
                            await this.setState({loading:false})
                            await console.log(`Erro: ${(res)}`)
                        }
                    },
                    async res => {
                        await alert(`Erro: ${JSON.stringify(res)}`)
                    }
                )
            } else {
                await apiEmployee.post(`updatePermissao.php`, {
                    token: true,
                    Usuario: usuario,
                    Empresa: this.state.usuarioLogado.empresa,
                    Acessos: acesso,
                    Liberacao: liberacao.join('')
                }).then(
                    async res => {
                        if (res.data === true) {
                            await this.setState({
                                dadosIniciais: [
                                    { titulo: 'Liberacao', valor: permissoes.permissoes.Liberacao }
                                ],
                
                                dadosFinais: [
                                    { titulo: 'Liberacao', valor: liberacao.join('') }
                                ]
                            })

                            loader.salvaLogs("permissoes", this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, `${permissoes.usuario.Codigo}${this.state.usuarioLogado.empresa}${permissoes.acesso.Chave}`)
                            await this.setState({loading:false})
                            document.location.reload()

                        } else {
                        }
                    },
                    async res => {
                        await alert(`Erro: ${res}`)
                        await this.setState({loading:false})
                    }

                )

            }

            //document.location.reload()

        })

    }


    marcaTodos = async (value, usuario, elementoIndex, index) => {
        let operadores = this.state.operadores;
        operadores[index].check[elementoIndex] = value;

        this.setState({ operadores: operadores })

        const acessos = this.state.userPermissoes.map(async (e, acessoIndex) => {
            if (e.usuario.Codigo == usuario) {
                await this.alteraPermissoes(value, acessoIndex, elementoIndex, index);
            }
        })
    }

    alteraPermissoes = async (value, acessoIndex, elementoIndex, codigo) => {
        let userPermissoes = this.state.userPermissoes;

        if (userPermissoes[acessoIndex].permissoes) {
            userPermissoes[acessoIndex].permissoes.LiberacaoString[elementoIndex] = value;
        } else {
            userPermissoes[acessoIndex].permissoes = { LiberacaoString: [false, false, false, false, false] };
            userPermissoes[acessoIndex].permissoes.LiberacaoString[elementoIndex] = value;
        }

        let usuarios = this.state.operadores.map((usuario) => {
            if (usuario.Codigo == codigo) {
                return({...usuario, botao: true});
            } else {
                return({...usuario});
            }
        });


        this.setState({ userPermissoes: userPermissoes, operadores: usuarios });
    }


    render() {
        const validations = []
        validations.push(!this.state.bloqueado)
        //validations.push(this.state.porto && this.state.porto > 0)
        //o formulário só será válido se todas as validações forem verdadeiras, com este reduce implementado

        const validForm = validations.reduce((t, a) => t && a)


        return (

            <div className='allContent'>

                <div>
                    {this.state.loading &&
                        <Skeleton />
                    }

                    {this.state.redirect &&
                        <Redirect to={'/'} />
                    }

                    {this.state.finalizaOperacao &&
                        <Redirect to={'/utilitarios/permissoes'} />
                    }

                    {!this.state.loading &&
                        <div>
                            <section>
                                <Header voltarUtilitarios permissoes titulo="Permissões" />

                                <br />

                            </section>

                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-center">
                                <div className="row mobileajuster3">
                                    <div className="col-1 col-sm-1 col-md-1 col-lg-1 col-xl-1 sumir">
                                    </div>

                                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  text-right pesquisa mobileajuster1 ">
                                        <input className="form-control campoPesquisa col-4 col-sm-4 col-md-3 col-lg-3 col-xl-3" placeholder="Pesquise aqui..." value={this.state.pesquisa} onChange={e => { this.setState({ pesquisa: e.currentTarget.value }) }} />
                                    </div>

                                    <div className="col-0 col-sm-0 col-md-3 col-lg-3 col-xl-3"></div>
                                    <div>
                                    </div>

                                </div>
                            </div>

                            <div id="product-list">
                                {this.state.operadores[0] != undefined && this.state.operadores.filter(this.filtrarPesquisa).map((feed, index) => (
                                    <Formik
                                        initialValues={{
                                            name: '',
                                        }}
                                        onSubmit={async values => {
                                            await new Promise(r => setTimeout(r, 1000))
                                            this.salvaAlteracoes(feed.Codigo, validForm)
                                        }}
                                    >
                                        <Form className="contact-form" onBlur={() => {/*this.verificadorspans()*/ }} >
                                            <div key={feed.Codigo} className="row row-list">
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                                <Accordion className={index % 2 == 0 ? "col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags par" : "col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags itemLista impar"}>
                                                    <AccordionSummary
                                                        expandIcon={<FontAwesomeIcon icon={faChevronCircleDown} />}
                                                        aria-controls="panel1a-content"
                                                    >
                                                        <Typography>

                                                            <div >
                                                                <div className="row deleteMargin alignCenter">
                                                                    <div className="col-xl-1 col-lg-1 col-md-1 col-sm-1 col-1 text-center">
                                                                        <p>{feed.Codigo}</p>
                                                                    </div>
                                                                    <div className="col-xl-8 col-lg-8 col-md-8 col-sm-8 col-8 text-center">
                                                                        <p>{feed.Nome}</p>
                                                                    </div>
                                                                    <div className='col-1'></div>

                                                                </div>
                                                            </div>
                                                        </Typography>
                                                    </AccordionSummary>
                                                    <AccordionDetails>
                                                        <Typography>
                                                            <div className="row row-list">
                                                                <div className="row row-list">
                                                                    <div className="col-lg-12 col-md-12 col-sm-12 col-12">
                                                                        <div className="row deleteMargin alignCenter">
                                                                            <div className="col-xl-5 col-lg-5 col-md-5 col-sm-5 col-5 text-center" style={index % 2 == 0 ? { borderBottom: '1px solid white' } : { borderBottom: '1px solid black' }}>
                                                                                <p>Acesso</p>
                                                                            </div>
                                                                            <div className="col-xl-1 col-lg-1 col-md-1 col-sm-1 col-1 text-center">
                                                                                <FontAwesomeIcon title='Inserir' icon={faPlus} />
                                                                            </div>
                                                                            <div className="col-xl-1 col-lg-1 col-md-1 col-sm-1 col-1 text-center">
                                                                                <FontAwesomeIcon title='Editar' icon={faPen} />
                                                                            </div>
                                                                            <div className="col-xl-1 col-lg-1 col-md-1 col-sm-1 col-1 text-center">
                                                                                <FontAwesomeIcon title='Consultar' icon={faEye} />
                                                                            </div>
                                                                            <div className="col-xl-1 col-lg-1 col-md-1 col-sm-1 col-1 text-center">
                                                                                <FontAwesomeIcon title='Deletar' icon={faTrashAlt} />
                                                                            </div>
                                                                            <div className="col-xl-1 col-lg-1 col-md-1 col-sm-1 col-1 text-center">
                                                                                <FontAwesomeIcon title='Imprimir' icon={faPrint} />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-lg-12 col-md-12 col-sm-12 col-12">
                                                                    <div className="row deleteMargin alignCenter">
                                                                        <div className="col-xl-5 col-lg-5 col-md-5 col-sm-5 col-5 text-left">
                                                                            <p>*) Todos</p>
                                                                        </div>
                                                                        {[...Array(5)].map((elemento, elementoIndex) => {
                                                                            return (

                                                                                <div className="col-xl-1 col-lg-1 col-md-1 col-sm-1 col-1 text-left">
                                                                                    <Field type="checkbox" className="checkPermissao" disabled={this.state.bloqueado} checked={feed.check[elementoIndex]} onChange={(e) => { this.marcaTodos(e.target.checked, feed.Codigo, elementoIndex, index) }} />
                                                                                </div>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {this.state.userPermissoes.map((acesso, acessoIndex) => {
                                                                if (acesso.usuario.Codigo == feed.Codigo) {
                                                                    if (acesso.permissoes) {
                                                                        return (
                                                                            <div key={acesso.acesso.Chave} className="row row-list">
                                                                                <div className="col-lg-12 col-md-12 col-sm-12 col-12">
                                                                                    <div className="row deleteMargin alignCenter">
                                                                                        <div className="col-xl-5 col-lg-5 col-md-5 col-sm-5 col-5 text-left">
                                                                                            <p>{acesso.acesso.Descricao}</p>
                                                                                        </div>
                                                                                        {acesso.permissoes.LiberacaoString.map((elemento, elementoIndex) => {
                                                                                            return (
                                                                                                <div className="col-xl-1 col-lg-1 col-md-1 col-sm-1 col-1 text-left">
                                                                                                    <Field type="checkbox" className="checkPermissao" disabled={this.state.bloqueado} checked={elemento} onChange={(e) => { this.alteraPermissoes(e.target.checked, acessoIndex, elementoIndex, feed.Codigo) }} />
                                                                                                </div>

                                                                                            )
                                                                                        })}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    } else {
                                                                        return (
                                                                            <div key={acesso.acesso.Chave} className="row row-list">
                                                                                <div className="col-lg-12 col-md-12 col-sm-12 col-12">
                                                                                    <div className="row deleteMargin alignCenter">
                                                                                        <div className="col-xl-5 col-lg-5 col-md-5 col-sm-5 col-5 text-left">
                                                                                            <p>{acesso.acesso.Descricao}</p>
                                                                                        </div>
                                                                                        {[...Array(5)].map((elemento, elementoIndex) => {
                                                                                            return (

                                                                                                <div className="col-xl-1 col-lg-1 col-md-1 col-sm-1 col-1 text-left">
                                                                                                    <Field type="checkbox" disabled={this.state.bloqueado} checked={false} onChange={(e) => { this.alteraPermissoes(e.target.checked, acessoIndex, elementoIndex, feed.Codigo) }} />
                                                                                                </div>
                                                                                            )
                                                                                        })}
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                        )
                                                                    }
                                                                }
                                                            })}
                                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                                            {feed.botao &&
                                                                <div className="col-12 " style={{ display: 'flex', justifyContent: 'center' }}>
                                                                    <button disabled={!validForm} type="submit" style={validForm ? { backgroundColor: '#fff', width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} >Salvar</button>
                                                                </div>
                                                            }
                                                        </Typography>
                                                    </AccordionDetails>
                                                </Accordion>
                                            </div>
                                        </Form>
                                    </Formik>
                                ))}
                            </div>
                        </div>
                    }
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

export default connect(mapStateToProps, null)(Permissoes)