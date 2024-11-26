import React, { Component } from 'react'
import './styles.css'
import { apiEmployee } from '../../../services/apiamrg'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import Skeleton from '../../../components/skeleton'
import { Link, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { NOME_EMPRESA } from '../../../config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faPen, faPlus } from '@fortawesome/free-solid-svg-icons'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
import moment from 'moment'
import loader from '../../../classes/loader'
import ModalItem from '../../../components/modalItem'
import AddButton from '../../../components/addButton'

const estadoInicial = {
    name: '',
    eventos: [],
    pesquisa: "",
    pesquisaCliente: "",
    pesquisaNavio: "",
    tipoPesquisa: 3,
    chaveFocus: '',

    deleteEvento: false,

    loading: true,
    redirect: false,

    tipos: ['Pagar', 'Receber', 'Adiantamento', 'Desconto'],

    modalItemAberto: false,
    itemPermissao: '',
    itemInfo: [],
    itemNome: '',
    itemChave: '',
    itemAdd: {},
    itemEdit: {},
    itemFinanceiro: {},
    itemDelete: '',

    acessos: [],
    permissoes: [],
    acessosPermissoes: [],

    load: 100,
    offset: 0,
}


class EventosTemplates extends Component {

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
            if (e.acessoAcao == "SERVICOS_ITENS" && e.permissaoConsulta == 0) {
                this.setState({ redirect: true })
            }
        })
    }

    componentDidUpdate = async (prevProps, prevState) => {
        if (this.state.deleteEvento && this.state.modalItemAberto != prevState.modalItemAberto) {
            await this.setState({
                modalItemAberto: false,
                deleteEvento: false
            })
        }
    }

    loadAll = async () => {
        await this.getEventosTemplates();

        await this.setState({
            pessoas: await loader.getBase('getPessoas.php'),
            os: await loader.getBase('getPessoas.php'),
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

    getEventosTemplates = async () => {
        await apiEmployee.post(`getEventosTemplates.php`, {
            token: true,
            offset: this.state.offset,
            empresa: this.state.usuarioLogado.empresa
        }).then(
            async response => {
                const eventos = [...response.data]
                await this.setState({ eventos })
            },
            response => { this.erroApi(response) }

        )
    }

    erroApi = async (res) => {
        alert(res)
        await this.setState({ redirect: true })
    }

    deleteEventoTemplate = async (chave, nome) => {
        this.setState({ deleteEvento: true })
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja cancelar esta solicitação? ({nome}) </p>
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
                                    await apiEmployee.post(`deleteEventoTemplate.php`, {
                                        token: true,
                                        chave: chave,
                                    }).then(
                                        async response => {
                                            if (response.data == true) {
                                                await loader.salvaLogs('os_servicos_itens', this.state.usuarioLogado.codigo, null, "Exclusão de template", chave);

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

    filtrarPesquisa = (eventos) => {
        let eventosfiltrados = eventos
        if (!this.state.pesquisa) {
            return true;
        }
        
        if (eventosfiltrados.descricao && this.state.tipoPesquisa == 1) {
            return eventosfiltrados.descricao.toLowerCase().includes(this.state.pesquisa.toLowerCase())
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
                                <Header voltarUtilitarios titulo="Templates de Eventos" />


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
                                evento
                                itemFinanceiro={this.state.itemFinanceiro}
                            />

                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-left">
                                <div className="row mobileajuster3">
                                    <div className="col-1 col-sm-1 col-md-1 col-lg-1 col-xl-1 sumir">
                                    </div>

                                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  text-right pesquisa mobileajuster1 ">
                                        <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  text-right pesquisa mobileajuster1 ">
                                            <select className="form-control tipoPesquisa col-4 col-sm-4 col-md-3 col-lg-3 col-xl-2" placeholder="Tipo de pesquisa..." value={this.state.tipoPesquisa} onChange={e => { this.setState({ tipoPesquisa: e.currentTarget.value }) }}>
                                                <option value={1}>Descrição</option>
                                            </select>
                                            <input className="form-control campoPesquisa col-7 col-sm-6 col-md-6 col-lg-5 col-xl-5" placeholder="Pesquise aqui..." value={this.state.pesquisa} onChange={e => { this.setState({ pesquisa: e.currentTarget.value }) }} />
                                            <div>
                                                <Link to={{ pathname: `/utilitarios/addeventotemplate/0` }}><button className="btn btn-success">Adicionar Template</button></Link>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='col-4'></div>

                                    <div className="col-0 col-sm-0 col-md-3 col-lg-3 col-xl-3"></div>
                                    <div>
                                    </div>

                                </div>
                            </div>

                            <AddButton addLink={{ pathname: `/utilitarios/addeventotemplate/0`, state: { evento: {} } }} />


                            <div className="row deleteMargin" id="product-list">
                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                <div className="col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags">
                                    <div className="single-product-item" >
                                        <div className="row subtitulosTabela">
                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                <span className="subtituloships">Chave</span>
                                            </div>
                                            <div className="col-xl-8 col-lg-8 col-md-8 col-sm-8 col-8 text-left">
                                                <span className="subtituloships">Descrição</span>
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
                                {this.state.eventos[0] != undefined && this.state.eventos.filter(this.filtrarPesquisa).splice(0, this.state.load).map((feed, index) => (
                                    <div key={feed.Chave} className="row row-list">
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                        <div ref={feed.chave == this.state.chaveFocus ? "focusMe" : ""} tabindex={-1} key={feed.id} className={`col-lg-8 col-md-8 col-sm-12 mix all dresses bags ${index % 2 == 0 ? feed.chave == this.state.chaveFocus ? "par focusLight" : "par " : feed.chave == this.state.chaveFocus ? "impar focusDark" : "impar"}`}>
                                                <div className="row deleteMargin alignCenter">
                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left" style={{ overflowWrap: 'anywhere' }}>
                                                        <p>{feed.chave}</p>
                                                    </div>
                                                    <div className="col-xl-8 col-lg-8 col-md-8 col-sm-8 col-8 text-left">
                                                        <p>{feed.descricao}</p>
                                                    </div>
                                                    <div className="col-lg-2 col-md-2 col-sm-2 col-2 text-left  mobileajuster4 icones">
                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/utilitarios/addeventotemplate/0`,
                                                                    state: { evento: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPlus} />
                                                            </Link>
                                                        </div>


                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/utilitarios/addeventotemplate/${feed.chave}`,
                                                                    state: { evento: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPen} />
                                                            </Link>
                                                        </div>

                                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'SERVICOS_ITENS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&
                                                            <div type='button' className='iconelixo' onClick={(a) => this.deleteEventoTemplate(feed.chave, feed.descricao)} >
                                                                <FontAwesomeIcon icon={faTimes} />
                                                            </div>
                                                        }
                                                    </div>

                                                </div>
                                        </div>
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                    </div>
                                ))}
                                {this.state.eventos.filter(this.filtrarPesquisa)[this.state.load] &&
                                    <div className='loadMoreDiv'>
                                        <div className='loadMore' onClick={() => { this.setState({ offset: this.state.load, load: this.state.load + 100 }); this.getEventosTemplates() }}>Carregar Mais...</div>
                                    </div>
                                }
                                <br />
                            </div>
                        </div>
                    }
                </div>
                <Rodape />
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

export default connect(mapStateToProps, null)(EventosTemplates)