import React, { Component } from 'react'
import './styles.css'
import { apiEmployee } from '../../../services/apiamrg'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import ModalItem from '../../../components/modalItem'
import Skeleton from '../../../components/skeleton'
import SkeletonPesquisa from '../../../components/skeletonpesquisa'
import loader from '../../../classes/loader'
import AddButton from '../../../components/addButton';
import { Link, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faPen, faPlus, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { NOME_EMPRESA } from '../../../config'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'

const estadoInicial = {
    name: '',
    categorias: [],
    pesquisa: '',
    tipoPesquisa: 1,
    loading: true,
    loadingPesquisa: false,
    chaveFocus: '',

    deleteCategoria: false,

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
    acessosPermissoes: [],

    load: 100
}

class CategoriasDocumentos extends Component {

    constructor(props) {
        super(props);
        this.pdfExportComponent = React.createRef(null);
    }
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
                await this.setState({ pesquisa: this.state.chaveFocus, tipoPesquisa: 3 })
            }
        }


        this.state.acessosPermissoes.map((e) => {
            if (e.acessoAcao == "CATEGORIAS_TIPOS_DOCUMENTOS" && e.permissaoConsulta == 0) {
                this.setState({ redirect: true })
            }
        })
    }

    componentDidUpdate = async (prevProps, prevState) => {
        if (this.state.deleteCategoria && this.state.modalItemAberto != prevState.modalItemAberto) {
            await this.setState({
                modalItemAberto: false,
                deleteCategoria: false
            })
        }
    }

    loadAll = async () => {
        await this.setState({
            categorias: await loader.getBody('getCategoriasDocumentos.php', { empresa: this.state.usuarioLogado.empresa }),
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

    refreshData = async () => {
        await this.setState({ loading: true });
        
        // Re-fetch only the categorias data
        await this.setState({
            categorias: await loader.getBody('getCategoriasDocumentos.php', { empresa: this.state.usuarioLogado.empresa }),
            loading: false,
            deleteCategoria: false,
            modalItemAberto: false,
        });
    }

    deleteCategoria = async (id, nome) => {
        this.setState({ deleteCategoria: true })
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Voce quer remover essa categoria? ({nome}) </p>
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
                            onClick={async () => {
                                try {
                                    await apiEmployee.post(`deleteCategoriaDocumento.php`, {
                                        token: this.props.token,
                                        chave: id
                                    })
                                        .then(
                                            async response => {
                                                if (response.data == "true" || response.data == true) {
                                                    await loader.salvaLogs('tipos_docto_categorias', this.state.usuarioLogado.codigo, null, "Exclusão", id);

                                                    // Re-fetch data instead of reloading page
                                                    await this.refreshData();
                                                    onClose(); // Close modal after successful deletion
                                                } else {
                                                    //alert('Error')
                                                    onClose(); // Close modal even if there's an error
                                                }
                                            },
                                        )
                                } catch {
                                    console.log('Erro de conexão com o banco')
                                    onClose(); // Close modal on connection error
                                }
                            }}

                        >
                            Sim
                        </button>
                    </div>
                )
            }
        })
    }

    erroApi = async (res) => {
        await this.setState({ isLogado: false })
        console.log('Faça login antes!')
        this.setState({ redirect: true })
    }

    reverterItens = async () => {
        await this.setState({ loading: true })
        const categorias = this.state.categorias.reverse();

        if (this.state.direcaoTabela == faChevronDown) {
            await this.setState({ direcaoTabela: faChevronUp });
        } else {
            await this.setState({ direcaoTabela: faChevronDown });
        }

        await this.setState({ categorias, loading: false });
    }

    filtrarPesquisa = (categorias) => {
        if (this.state.tipoPesquisa == 1) {
            return categorias.descricao.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else {
            return categorias.chave.toLowerCase().includes(this.state.pesquisa.toLowerCase())
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
                                <Header voltarTabelas titulo="Categorias de Documentos" />
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

                            <AddButton addLink={{ pathname: `/tabelas/addcategoriadocumento/0` }} />

                            <div className="row">
                                <div className="col-0 col-sm-0 col-md-3 col-lg-3 col-xl-3"></div>
                                <div className="col-1 col-sm-2 col-md-0 col-lg-0 col-xl-0 sumir"></div>

                                <div className="col-2 col-sm-3 col-md-0 col-lg-0 col-xl-0 sumir"></div>
                                <div className='col-12 col-sm-12 col-md-0 col-lg-0 col-xl-0 sumir' style={{ height: 10 }}></div>

                                <div className="col-0 col-sm-0 col-md-3 col-lg-3 col-xl-3"></div>
                            </div>

                            <div>
                                <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-left">
                                    <div className="row mobileajuster3">
                                        <div className="col-1 col-sm-1 col-md-1 col-lg-1 col-xl-1 sumir">
                                        </div>

                                        <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  text-right pesquisa mobileajuster1 ">
                                            <div className='col-2'></div>
                                            <select className="form-control tipoPesquisa col-4 col-sm-4 col-md-3 col-lg-3 col-xl-2" placeholder="Tipo de pesquisa..." value={this.state.tipoPesquisa} onChange={e => { this.setState({ tipoPesquisa: e.currentTarget.value }) }}>
                                                <option value={1}>Nome</option>
                                                <option value={2}>Chave</option>
                                            </select>
                                            <input className="form-control campoPesquisa col-7 col-sm-6 col-md-6 col-lg-5 col-xl-5" placeholder="Pesquise aqui..." value={this.state.pesquisa} onChange={e => { this.setState({ pesquisa: e.currentTarget.value }) }} />
                                            <div className="col-7 col-sm-3 col-md-2 col-lg-2 col-xl-2 text-left">
                                                <Link to={{ pathname: `/tabelas/addcategoriadocumento/0` }}><button className="btn btn-success">+</button></Link>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                            </div>
                            {this.state.loadingPesquisa &&
                                <SkeletonPesquisa />
                            }

                            <div className="row deleteMargin" id="product-list">
                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                <div className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags">
                                    <div className="single-product-item aasd">
                                        {window.innerWidth >= 500 &&
                                            <div className="row subtitulosTabela">
                                                <div className="col-lg-2 col-md-2 col-sm-2  col-2 text-left">
                                                    <span className='subtituloships'>Chave</span>
                                                </div>
                                                <div className="col-lg-7 col-md-7 col-sm-7 col-7 text-left">
                                                    <span className='subtituloships'>Nome</span>
                                                </div>
                                                <div className="col-3 text-right revertItem" onClick={() => this.reverterItens()}>
                                                    <span className="subtituloships"><FontAwesomeIcon icon={this.state.direcaoTabela} /></span>
                                                </div>
                                            </div>
                                        }
                                        {window.innerWidth < 500 &&
                                            <div className="row subtitulosTabela">
                                                <div className="col-4 text-left">
                                                    <span className='subtituloships'>Chave</span>
                                                </div>
                                                <div className="col-5 text-left">
                                                    <span className='subtituloships'>Nome</span>
                                                </div>
                                                <div className="col-3 text-right revertItem" onClick={() => this.reverterItens()}>
                                                    <span className="subtituloships"><FontAwesomeIcon icon={this.state.direcaoTabela} /></span>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>
                                <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                            </div>

                            <div className="row" id="product-list">
                                <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                <div className="col-lg-8 col-md-8 col-sm-12 mobileajuste14 ">
                                    {this.state.categorias[0]?.descricao != undefined && this.state.categorias.filter(this.filtrarPesquisa).splice(0, this.state.load).map((feed, index) => (
                                        <div ref={feed.chave == this.state.chaveFocus ? "focusMe" : ""} tabindex={-1} key={feed.id} className={`col-lg-12 col-md-12 col-sm-12 mix all dresses bags ${index % 2 == 0 ? feed.chave == this.state.chaveFocus ? "par focusLight" : "par " : feed.chave == this.state.chaveFocus ? "impar focusDark" : "impar"}`}>

                                            {window.innerWidth >= 500 &&
                                                <div className="row ">
                                                    <div className="col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                        <p className="mobileajuster5">{feed.chave}</p>
                                                    </div>
                                                    <div className="col-lg-7 col-md-7 col-sm-7 col-7 text-left">
                                                        <h6 className="mobileajuster5">{feed.descricao}</h6>
                                                    </div>
                                                    <div className="col-lg-3 col-md-3 col-sm-3 col-3  text-left icones mobileajuster4 ">
                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/tabelas/addcategoriadocumento/0`,
                                                                    state: { categoria: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPlus} />
                                                            </Link>
                                                        </div>


                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/tabelas/addcategoriadocumento/${feed.chave}`,
                                                                    state: { categoria: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPen} />
                                                            </Link>
                                                        </div>

                                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'CATEGORIAS_TIPOS_DOCUMENTOS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                                            <div type='button' className='iconelixo' onClick={(a) => this.deleteCategoria(feed.chave, feed.descricao)} >
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
                                                                { titulo: 'Chave', valor: feed.chave },
                                                                { titulo: 'Descricao', valor: feed.descricao }
                                                            ],
                                                            itemPermissao: 'CATEGORIAS_TIPOS_DOCUMENTOS',
                                                            itemNome: feed.descricao,
                                                            itemChave: feed.chave,
                                                            itemAdd: {
                                                                pathname: `/tabelas/addcategoriadocumento/0`,
                                                                state: { categoria: { ...feed } }
                                                            },
                                                            itemEdit: {
                                                                pathname: `/tabelas/addcategoriadocumento/${feed.chave}`,
                                                                state: { categoria: { ...feed } }
                                                            },
                                                            itemDelete: this.deleteCategoria
                                                        })
                                                    }}
                                                    className="row ">
                                                    <div className="col-5 text-left">
                                                        <h6 className="mobileajuster5">{feed.descricao}</h6>
                                                    </div>
                                                    <div className="col-4 text-left">
                                                        <h6>{feed.chave}</h6>
                                                    </div>
                                                    <div className="col-3 text-left icones mobileajuster4 ">
                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/tabelas/addcategoriadocumento/0`,
                                                                    state: { categoria: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPlus} />
                                                            </Link>
                                                        </div>


                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/tabelas/addcategoriadocumento/${feed.chave}`,
                                                                    state: { categoria: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPen} />
                                                            </Link>
                                                        </div>

                                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'CATEGORIAS_TIPOS_DOCUMENTOS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                                            <div type='button' className='iconelixo' onClick={(a) => this.deleteCategoria(feed.chave, feed.descricao)} >
                                                                <FontAwesomeIcon icon={faTrashAlt} />
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    ))}
                                </div>
                                <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                {this.state.categorias.filter(this.filtrarPesquisa)[this.state.load] &&
                                    <div className='loadMoreDiv'>
                                        <div className='loadMore' onClick={() => { this.setState({ load: this.state.load + 100 }) }}>Carregar Mais...</div>
                                    </div>
                                }
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

export default connect(mapStateToProps, null)(CategoriasDocumentos)
