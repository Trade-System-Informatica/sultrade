import React, { Component } from 'react'
import './styles.css'
import { apiEmployee } from '../../../services/apiamrg'
import Header from '../../../components/header'
import loader from '../../../classes/loader'
import Rodape from '../../../components/rodape'
import Skeleton from '../../../components/skeleton'
import ModalItem from '../../../components/modalItem'
import { Link, useHistory, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { PRECISA_LOGAR, NOME_EMPRESA } from '../../../config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faCoffee, faTrashAlt, faPen, faPlus, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'


const estadoInicial = {
    name: '',
    moedas: [],
    pesquisa: '',
    tipoPesquisa: 1,
    loading: true,
    redirect: false,

    deleteMoeda: true,

    modalItemAberto: false,
    itemPermissao: '',
    itemInfo: [],
    itemNome: '',
    itemChave: '',
    itemAdd: {},
    itemEdit: {},
    itemFinanceiro: {},
    itemDelete: '',

    direcaoTabela: faChevronDown,
    acessos: [],
    permissoes: [],
    acessosPermissoes: []
}

class Moedas extends Component {

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        await this.loadAll();

        if (this.state.chaveFocus) {
            if (this.refs.focusMe) {
                await this.refs.focusMe.focus();
            } else {
                await this.setState({ pesquisa: this.state.chaveFocus, tipoPesquisa: 2 })
            }
        }

        this.state.acessosPermissoes.map((e) => {
            if (e.acessoAcao == "MOEDAS" && e.permissaoConsulta == 0) {
                this.setState({ redirect: true })
            }
        })
    }

    componentDidUpdate = async (prevProps, prevState) => {
        if (this.state.deleteMoeda && this.state.modalItemAberto != prevState.modalItemAberto) {
            await this.setState({
                modalItemAberto: false,
                deleteMoeda: false
            })
        }
    }

    loadAll = async () => {
        await this.setState({
            moedas: await loader.getBase('getMoedas.php'),
            acessos: await loader.getBase('getTiposAcessos.php'),
            permissoes: await loader.getBase('getPermissoes.php')
        })

        if (this.props.location.state && this.props.location.state.chave) {
            await this.setState({ chaveFocus: this.props.location.state.chave });
        }

        await this.setState({
            acessosPermissoes: await loader.testaAcesso(this.state.acessos, this.state.permissoes, this.state.usuarioLogado),
            loading: false,
        })
    }

    erroApi = async (res) => {
        console.log(res)
        await this.setState({ redirect: true })
    }

    deleteMoeda = async (id, nome) => {
        this.setState({deleteMoeda: true})
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja remover este Moeda? ({nome}) </p>
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
                                    await apiEmployee.post(`deleteMoeda.php`, {
                                        token: true,
                                        chave: id
                                    }).then(
                                        async response => {
                                            if (response.data == true) {
                                                await loader.salvaLogs('moedas', this.state.usuarioLogado.codigo, null, "Exclusão", id);

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
        await this.setState({loading: true})
        const moedas = this.state.moedas.reverse();

        if (this.state.direcaoTabela == faChevronDown) {
            await this.setState({direcaoTabela: faChevronUp});
        } else {
            await this.setState({direcaoTabela: faChevronDown});
        } 

        await this.setState({moedas, loading: false});
    }

    filtrarPesquisa = (moedas) => {
        if (this.state.tipoPesquisa == 1) {
            return moedas.Descricao.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else {
            return moedas.Chave.toLowerCase().includes(this.state.pesquisa.toLowerCase())
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
                                <Header voltarTabelas moedas titulo="Moedas" />
                                <br />


                            </section>

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
                            />

                            <div className="row">
                                <div className="col-2"></div>
                                <div className="col-2"></div>
                            </div>

                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-left">
                                <div className="row mobileajuster3">
                                    <div className="col-1 col-sm-1 col-md-1 col-lg-1 col-xl-1 sumir">
                                    </div>

                                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  text-right pesquisa mobileajuster1 ">
                                        <select className="form-control tipoPesquisa col-4 col-sm-4 col-md-3 col-lg-3 col-xl-2" placeholder="Tipo de pesquisa..." value={this.state.tipoPesquisa} onChange={e => { this.setState({ tipoPesquisa: e.currentTarget.value }) }}>
                                            <option value={1}>Descrição</option>
                                            <option value={2}>Chave</option>
                                        </select>
                                        <input className="form-control campoPesquisa col-7 col-sm-6 col-md-6 col-lg-5 col-xl-5" placeholder="Pesquise aqui..." value={this.state.pesquisa} onChange={e => { this.setState({ pesquisa: e.currentTarget.value }) }} />
                                        {!this.state.moedas[0] &&
                                            <div className="col-7 col-sm-3 col-md-2 col-lg-2 col-xl-2 text-left">
                                                <Link to={{ pathname: `/tabelas/addmoeda/0` }}><button className="btn btn-success">Adicionar Moeda</button></Link>
                                            </div>}
                                    </div>

                                </div>
                            </div>

                            <div className="row deleteMargin" id="product-list">
                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                <div className="col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags">
                                    <div className="single-product-item">
                                        {window.innerWidth >= 500 &&
                                            <div className="row subtitulosTabela">
                                                <div className="col-2 text-left">
                                                    <span className="subtituloships">Chave</span>
                                                </div>
                                                <div className="col-4 text-left">
                                                    <span className="subtituloships">Nome</span>
                                                </div>
                                                <div className="col-3 text-left">
                                                    <span className="subtituloships">Cotação</span>
                                                </div>
                                                <div className="col-3 text-right revertItem" onClick={() => this.reverterItens()}>
                                                    <span className="subtituloships"><FontAwesomeIcon icon={this.state.direcaoTabela} /></span>
                                                </div>
                                            </div>
                                        }
                                        {window.innerWidth < 500 &&
                                            <div className="row subtitulosTabela">
                                                <div className="col-5 text-left">
                                                    <span className="subtituloships">Nome</span>
                                                </div>
                                                <div className="col-4 text-left">
                                                    <span className="subtituloships">Cotação</span>
                                                </div>
                                                <div className="col-3 text-right revertItem" onClick={() => this.reverterItens()}>
                                                    <span className="subtituloships"><FontAwesomeIcon icon={this.state.direcaoTabela} /></span>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>
                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                            </div>

                            <div id="product-list">
                                {this.state.moedas[0].Descricao != undefined && this.state.moedas.filter(this.filtrarPesquisa).map((feed, index) => (
                                    <div key={feed.Chave} className="row row-list">
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                        <div ref={feed.Chave ==  this.state.chaveFocus ? "focusMe" : ""} tabindex={-1} key={feed.id} className={`col-lg-8 col-md-8 col-sm-12 mix all dresses bags ${index % 2 == 0 ? feed.Chave == this.state.chaveFocus ? "par focusLight" : "par ": feed.Chave == this.state.chaveFocus ? "impar focusDark" : "impar"}`}>

                                            {window.innerWidth >= 500 &&
                                                <div className="row deleteMargin alignCenter">
                                                    <div className="col-2 text-left">
                                                        <p className="mobileajuster5">{feed.Chave}</p>
                                                    </div>
                                                    <div className="col-4 text-left">
                                                        <h6 className="mobileajuster5">{feed.Descricao}</h6>
                                                    </div>
                                                    <div className="col-3 text-left">
                                                        <p>R${new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(feed.Ultima_Cotacao)}</p>
                                                    </div>
                                                    <div className="col-3 text-left icones mobileajuster4 ">
                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/tabelas/addmoeda/0`,
                                                                    state: { moeda: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPlus} />
                                                            </Link>
                                                        </div>

                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/tabelas/addmoeda/${feed.Chave}`,
                                                                    state: { moeda: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPen} />
                                                            </Link>
                                                        </div>
                                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'MOEDAS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                                            <div type='button' className='iconelixo' onClick={(a) => this.deleteMoeda(feed.Chave, feed.Descricao)} >
                                                                <FontAwesomeIcon icon={faTrashAlt} />
                                                            </div>
                                                        }
                                                    </div>

                                                </div>
                                            }
                                            {window.innerWidth < 500 &&
                                                <div
                                                    onClick={() => {
                                                        this.setState({

                                                            modalItemAberto: true,
                                                            itemInfo: [
                                                                { titulo: 'Chave', valor: feed.Chave },
                                                                { titulo: 'Descrição', valor: feed.Descricao },
                                                                { titulo: 'Sigla', valor: feed.Sigla },
                                                                { titulo: 'Cotação', valor: feed.Ultima_Cotacao }
                                                            ],
                                                            itemPermissao: 'MOEDAS',
                                                            itemNome: feed.Descricao,
                                                            itemChave: feed.Chave,
                                                            itemAdd: {
                                                                pathname: `/tabelas/addmoeda/0`,
                                                                state: { moeda: { ...feed } }
                                                            },
                                                            itemEdit: {
                                                                pathname: `/tabelas/addmoeda/${feed.Chave}`,
                                                                state: { moeda: { ...feed } }
                                                            },
                                                            itemDelete: this.deleteMoeda
                                                        })
                                                    }}
                                                    className="row deleteMargin alignCenter">
                                                    <div className="col-5 text-left">
                                                        <h6 className="mobileajuster5">{feed.Descricao}</h6>
                                                    </div>
                                                    <div className="col-4 text-left">
                                                        <p>R$ {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(feed.Ultima_Cotacao)}</p>
                                                    </div>
                                                    <div className="col-3 text-left icones mobileajuster4 ">
                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/tabelas/addmoeda/0`,
                                                                    state: { moeda: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPlus} />
                                                            </Link>
                                                        </div>

                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/tabelas/addmoeda/${feed.Chave}`,
                                                                    state: { moeda: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPen} />
                                                            </Link>
                                                        </div>
                                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'MOEDAS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                                            <div type='button' className='iconelixo' onClick={(a) => this.deleteMoeda(feed.Chave, feed.Descricao)} >
                                                                <FontAwesomeIcon icon={faTrashAlt} />
                                                            </div>
                                                        }
                                                    </div>
                                                    
                                                </div>
                                            }
                                        </div>
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

const mapStateToProps = ({ user }) => {
    return {
        user: user,
        //online: servidor.online
    }
}

export default connect(mapStateToProps, null)(Moedas)