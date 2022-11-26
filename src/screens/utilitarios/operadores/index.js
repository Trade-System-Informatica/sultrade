import React, { Component } from 'react'
import './styles.css'
import { apiEmployee } from '../../../services/apiamrg'
import Header from '../../../components/header'
import loader from '../../../classes/loader'
import Rodape from '../../../components/rodape'
import Skeleton from '../../../components/skeleton'
import { Link, useHistory, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { PRECISA_LOGAR, NOME_EMPRESA } from '../../../config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faCoffee, faTrashAlt, faPen, faPlus, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
import moment from 'moment'


const estadoInicial = {
    name: '',
    operadores: [],
    pesquisa: "",
    tipoPesquisa: 1,
    chaveFocus: '',
    loading: true,
    redirect: false,

    deleteOperador: false,

    direcaoTabela: faChevronDown,
    acessos: [],
    permissoes: [],
    acessosPermissoes: [],
}

class Operadores extends Component {

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        await this.loadAll();

        if (this.state.chaveFocus) {
            if (this.refs.focusMe) {
                await this.refs.focusMe.focus();
            }
        }

        this.state.acessosPermissoes.map((e) => {
            if (e.acessoAcao == "OPERADORES" && e.permissaoConsulta == 0) {
                this.setState({ redirect: true })
            }
        })
    }

    componentDidUpdate = async (prevProps, prevState) => {
        if (this.state.deleteOperador && this.state.modalItemAberto != prevState.modalItemAberto) {
            await this.setState({
                modalItemAberto: false,
                deleteOperador: false
            })
        }
    }

    loadAll = async () => {
        await this.setState({
            operadores: await loader.getBase('getOperadores.php', this.state.usuarioLogado.empresa),
            acessos: await loader.getBase('getTiposAcessos.php'),
            permissoes: await loader.getBase('getPermissoes.php'),
        })

        if (this.props.location.state && this.props.location.state.chave) {
            await this.setState({ chaveFocus: this.props.location.state.chave });
        }

        await this.setState({
            acessosPermissoes: await loader.testaAcesso(this.state.acessos, this.state.permissoes, this.state.usuarioLogado),
            loading: false
        })
    }

    erroApi = async () => {
        console.log(PRECISA_LOGAR)
        await this.setState({ redirect: true })
    }

    deleteOperador = async (chave, nome) => {
        this.setState({ deleteOperador: true })
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja remover este Operador? ({nome}) </p>
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
                                    await apiEmployee.post(`deleteOperador.php`, {
                                        token: true,
                                        chave: chave
                                    }).then(
                                        async response => {
                                            if (response.data == true) {
                                                await loader.salvaLogs('operadores', this.state.usuarioLogado.codigo, null, "Exclusão", chave);

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

    reverterItens = async () => {
        await this.setState({ loading: true })
        const operadores = this.state.operadores.reverse();

        if (this.state.direcaoTabela == faChevronDown) {
            await this.setState({ direcaoTabela: faChevronUp });
        } else {
            await this.setState({ direcaoTabela: faChevronDown });
        }

        await this.setState({ operadores, loading: false });
    }

    filtrarPesquisa = (operadores) => {
        if (this.state.tipoPesquisa == 1) {
            return operadores.Nome.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else {
            return operadores.Codigo.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        }

    }



    render() {

        return (

            <div className='allContent'>

                <div>
                    {this.state.loading &&
                        <Skeleton />
                    }

                    {this.state.redirect &&
                        <Redirect to={'/'} />
                    }

                    {!this.state.loading &&
                        <div>
                            <section>
                                <Header voltarUtilitarios operadores titulo="Operadores" />

                                <br />

                            </section>

                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-left">
                                <div className="row mobileajuster3">
                                    <div className="col-1 col-sm-1 col-md-1 col-lg-1 col-xl-1 sumir">
                                    </div>

                                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  text-right pesquisa mobileajuster1 ">
                                        <select className="form-control tipoPesquisa col-4 col-sm-4 col-md-3 col-lg-3 col-xl-2" placeholder="Tipo de pesquisa..." value={this.state.tipoPesquisa} onChange={e => { this.setState({ tipoPesquisa: e.currentTarget.value }) }}>
                                            <option value={1}>Nome</option>
                                            <option value={2}>Codigo</option>
                                        </select>
                                        <input className="form-control campoPesquisa col-7 col-sm-6 col-md-6 col-lg-5 col-xl-5" placeholder="Pesquise aqui..." value={this.state.pesquisa} onChange={e => { this.setState({ pesquisa: e.currentTarget.value }) }} />
                                        {!this.state.operadores[0] &&
                                            <div className="col-7 col-sm-3 col-md-2 col-lg-2 col-xl-2 text-left">
                                                <Link to={{ pathname: `/utilitarios/addoperador/0` }}><button className="btn btn-success">Adicionar Operador</button></Link>
                                            </div>}
                                    </div>

                                    <div className="col-0 col-sm-0 col-md-3 col-lg-3 col-xl-3"></div>
                                    <div>
                                    </div>

                                </div>
                            </div>


                            <div className="row deleteMargin" id="product-list">
                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                <div className="col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags">
                                    <div className="single-product-item">
                                        <div className="row subtitulosTabela">
                                            {window.innerWidth >= 500 &&
                                                <div className="col-2 text-left">
                                                    <span className="subtituloships">Código</span>
                                                </div>
                                            }
                                            {window.innerWidth < 500 &&
                                                <div className="col-2 text-left">
                                                    <span className="subtituloships">Cód.</span>
                                                </div>
                                            }
                                            <div className="col-8 text-left">
                                                <span className="subtituloships">Nome</span>
                                            </div>
                                            <div className="col-2 text-right revertItem" onClick={() => this.reverterItens()}>
                                                <span className="subtituloships"><FontAwesomeIcon icon={this.state.direcaoTabela} /></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                            </div>

                            <div id="product-list">
                                {this.state.operadores[0] != undefined && this.state.operadores.filter(this.filtrarPesquisa).map((feed, index) => (
                                    <div key={feed.Codigo} className="row row-list">
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                        <div ref={feed.Codigo == this.state.chaveFocus ? "focusMe" : ""} tabindex={-1} key={feed.id} className={`col-lg-8 col-md-8 col-sm-12 mix all dresses bags ${index % 2 == 0 ? feed.Codigo == this.state.chaveFocus ? "par focusLight" : "par " : feed.Codigo == this.state.chaveFocus ? "impar focusDark" : "impar"}`}>
                                            <div className="row deleteMargin alignCenter">
                                                <div className="col-2 text-left">
                                                    <p>{feed.Codigo}</p>
                                                </div>
                                                <div className="col-8 text-left">
                                                    <p>{feed.Nome}</p>
                                                </div>
                                                <div className="col-2 text-left mobileajuster4 icones">
                                                    <div className='iconelixo giveMargin' type='button' >
                                                        <Link to=
                                                            {{
                                                                pathname: `/utilitarios/addoperador/0`,
                                                                state: { operador: { ...feed } }
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faPlus} />
                                                        </Link>
                                                    </div>
                                                    <div className='iconelixo giveMargin' type='button' >
                                                        <Link to=
                                                            {{
                                                                pathname: `/utilitarios/addoperador/${feed.Codigo}`,
                                                                state: { operador: { ...feed } }
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faPen} />
                                                        </Link>
                                                    </div>

                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'OPERADORES') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                                        <div type='button' className='iconelixo' onClick={(a) => this.deleteOperador(feed.Codigo, feed.Nome)} >
                                                            <FontAwesomeIcon icon={faTrashAlt} />
                                                        </div>
                                                    }
                                                </div>

                                            </div>
                                        </div>
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                    </div>
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

export default connect(mapStateToProps, null)(Operadores)