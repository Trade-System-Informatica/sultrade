import React, { Component } from 'react'
import './styles.css'
import { apiEmployee } from '../../../services/apiamrg'
import loader from '../../../classes/loader'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import ModalItem from '../../../components/modalItem'
import Skeleton from '../../../components/skeleton'
import AddButton from '../../../components/addButton';
import { Link, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { NOME_EMPRESA } from '../../../config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faPen, faPlus, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
import util from '../../../classes/util'


const estadoInicial = {
    name: '',
    historicos: [],
    pesquisa: '',
    tipoPesquisa: 1,
    loading: true,
    redirect: false,
    chaveFocus: '',

    deleteAnexo: false,

    modalItemAberto: false,
    itemPermissao: '',
    itemInfo: [],
    itemNome: '',
    itemChave: '',
    itemAdd: {},
    itemEdit: {},
    itemFinanceiro: {},
    itemDelete: '',

    pesquisaPorto: "",
    pesquisaServico: "",

    acessos: [],
    permissoes: [],
    direcaoTabela: faChevronDown,
    acessosPermissoes: []
}

class Anexos extends Component {

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
                await this.setState({ pesquisa: this.state.chaveFocus, tipoPesquisa: 4 })
            }
        }


        this.state.acessosPermissoes.map((e) => {
            if (e.acessoAcao == "ANEXOS" && e.permissaoConsulta == 0) {
                this.setState({ redirect: true })
            }
        })
    }

    componentDidUpdate = async (prevProps, prevState) => {
        if (this.state.deleteAnexo && this.state.modalItemAberto != prevState.modalItemAberto) {
            await this.setState({
                modalItemAberto: false,
                deleteAnexo: false
            })
        }
    }

    loadAll = async () => {
        await this.setState({
            anexos: await loader.getBase('getAnexos.php'),
            acessos: await loader.getBase('getTiposAcessos.php'),
            permissoes: await loader.getBase('getPermissoes.php')
        })

        if (this.props.location.state && this.props.location.state.chave) {
            await this.setState({ chaveFocus: this.props.location.state.chave, tipoPesquisa: 4 });
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

    deleteAnexo = async (id, nome) => {
        this.setState({ deleteAnexo: true })
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja remover o anexo de ({nome}) </p>
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
                                    await apiEmployee.post(`deleteAnexo.php`, {
                                        token: true,
                                        chave: id
                                    }).then(
                                        async response => {
                                            if (response.data == true) {
                                                await loader.salvaLogs('fornecedores_anexos', this.state.usuarioLogado.codigo, null, "Exclusão", id);

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
        const anexos = this.state.anexos.reverse();

        if (this.state.direcaoTabela == faChevronDown) {
            await this.setState({ direcaoTabela: faChevronUp });
        } else {
            await this.setState({ direcaoTabela: faChevronDown });
        }

        await this.setState({ anexos, loading: false });
    }

    filtrarPesquisa = (item) => {
        if (this.state.pesquisa == "" && this.state.pesquisaPorto == "" && this.state.pesquisaServico == "") {
            return true;
        }

        if (this.state.tipoPesquisa == 1) {
            if (!item.fornecedorNome || !item.fornecedorNome.toLowerCase().includes(this.state.pesquisa.toLowerCase())) {
                return false;
            }
        } else {
            if (!item.chave.toLowerCase().includes(this.state.pesquisa.toLowerCase())) {
                return false;
            }
        }

        if (this.state.pesquisaPorto) {
            if (!item.portoNome || !item.portoNome.toLowerCase().includes(this.state.pesquisaPorto.toLowerCase())) {
                return false;
            }
        }
        if (this.state.pesquisaServico) {
            if (!item.servico.toLowerCase().includes(this.state.pesquisaServico.toLowerCase())) {
                return false;
            }
        }

        return true;
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
                                <Header voltarMovimentacao titulo="Tarifas de Fornecedores" />
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

                            <AddButton addLink={{ pathname: `/ordensservico/addanexo/0` }} />

                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-left">
                                <div className="row mobileajuster3">
                                    <div className="col-1 col-sm-1 col-md-1 col-lg-1 col-xl-1 sumir">
                                    </div>

                                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  text-right pesquisa mobileajuster1 ">
                                        <div className='col-2'></div>
                                        <select className="form-control tipoPesquisa col-4 col-sm-4 col-md-3 col-lg-3 col-xl-2" placeholder="Tipo de pesquisa..." value={this.state.tipoPesquisa} onChange={e => { this.setState({ tipoPesquisa: e.currentTarget.value }) }}>
                                            <option value={1}>Fornecedor</option>
                                            <option value={4}>Chave</option>
                                        </select>
                                        <input className="form-control campoPesquisa col-7 col-sm-6 col-md-6 col-lg-5 col-xl-5" placeholder="Pesquise aqui..." value={this.state.pesquisa} onChange={e => { this.setState({ pesquisa: e.currentTarget.value }) }} />
                                        <div className="col-7 col-sm-3 col-md-2 col-lg-2 col-xl-2 text-left">
                                            <Link to={{ pathname: `/ordensservico/addanexo/0` }}><button className="btn btn-success">+</button></Link>
                                        </div>
                                    </div>
                                    <div className='col-2'></div>
                                    <div className='col-4'>
                                        <input className="form-control " placeholder="Pesquise por porto..." value={this.state.pesquisaPorto} onChange={e => { this.setState({ pesquisaPorto: e.currentTarget.value }) }} />
                                    </div>
                                    <div className='col-4'>
                                        <input className="form-control" placeholder="Pesquise por servico..." value={this.state.pesquisaServico} onChange={e => { this.setState({ pesquisaServico: e.currentTarget.value }) }} />
                                    </div>

                                </div>
                            </div>

                            <div className="row deleteMargin" id="product-list">
                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                <div className="col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags">
                                    <div className="single-product-item">
                                        {window.innerWidth >= 500 &&
                                            <div className="row subtitulosTabela">
                                                <div className="col-3 text-left">
                                                    <span className="subtituloships">Fornecedor</span>
                                                </div>
                                                <div className="col-3 text-left">
                                                    <span className="subtituloships">Porto</span>
                                                </div>
                                                <div className="col-2 text-left">
                                                    <span className="subtituloships">Servico</span>
                                                </div>
                                                <div className="col-3 text-left">
                                                    <span className="subtituloships" style={{ overflowWrap: "anywhere" }}>Preferencial</span>
                                                </div>
                                                <div className="col-1 text-right revertItem" onClick={() => this.reverterItens()}>
                                                    <span className="subtituloships"><FontAwesomeIcon icon={this.state.direcaoTabela} /></span>
                                                </div>
                                            </div>
                                        }
                                        {window.innerWidth < 500 &&
                                            <div className="row subtitulosTabela">
                                                <div className="col-4 text-left">
                                                    <span className="subtituloships">Fornecedor</span>
                                                </div>
                                                <div className="col-4 text-left">
                                                    <span className="subtituloships">Porto</span>
                                                </div>
                                                <div className="col-3 text-left">
                                                    <span className="subtituloships" style={{ overflowWrap: "anywhere" }}>Preferencial</span>
                                                </div>
                                                <div className="col-1 text-right revertItem" onClick={() => this.reverterItens()}>
                                                    <span className="subtituloships"><FontAwesomeIcon icon={this.state.direcaoTabela} /></span>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>
                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                            </div>

                            <div id="product-list">
                                {this.state.anexos[0] != undefined && this.state.anexos.filter(this.filtrarPesquisa).map((feed, index) => (
                                    <div key={feed.chave} className="row row-list">
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                        <div ref={feed.chave == this.state.chaveFocus ? "focusMe" : ""} tabindex={-1} key={feed.id} className={`col-lg-8 col-md-8 col-sm-12 mix all dresses bags ${index % 2 == 0 ? feed.chave == this.state.chaveFocus ? "par focusLight" : "par " : feed.chave == this.state.chaveFocus ? "impar focusDark" : "impar"}`}>

                                            {window.innerWidth >= 500 &&
                                                <div className="row deleteMargin alignCenter">
                                                    <div className="col-3 text-left">
                                                        <p className="mobileajuster5"><a target="_blank" href={`${util.completarDocuments(`pictures/${feed.anexo}`)}`} className="nonLink">{feed.fornecedorNome}</a></p>
                                                    </div>
                                                    <div className="col-3 text-left">
                                                        <h6 className="mobileajuster5"><a target="_blank" href={`${util.completarDocuments(`pictures/${feed.anexo}`)}`} className="nonLink">{feed.portoNome.split("@").join(", ")}</a></h6>
                                                    </div>
                                                    <div className="col-2 text-left">
                                                        <h6 className="mobileajuster5"><a target="_blank" href={`${util.completarDocuments(`pictures/${feed.anexo}`)}`} className="nonLink">{feed.servico}</a></h6>
                                                    </div>
                                                    {console.log(feed)}
                                                    <div className="col-3 text-center" style={{ justifyContent: "center" }}>
                                                        <h6 className="mobileajuster5"><a target="_blank" href={`${util.completarDocuments(`pictures/${feed.anexo}`)}`} className="nonLink">{feed.preferencial != "0" ? `Sim` : "Não"}</a></h6>
                                                    </div>
                                                    <div className="col-1 text-left icones mobileajuster4 ">
                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/ordensservico/addanexo/0`,
                                                                    state: { anexo: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPlus} />
                                                            </Link>
                                                        </div>

                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/ordensservico/addanexo/${feed.chave}`,
                                                                    state: { anexo: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPen} />
                                                            </Link>
                                                        </div>
                                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'ANEXOS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                                            <div type='button' className='iconelixo' onClick={(a) => this.deleteAnexo(feed.chave, feed.fornecedor)} >
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
                                                                { titulo: 'Fornecedor', valor: feed.fornecedor }
                                                            ],
                                                            itemPermissao: 'ANEXO',
                                                            itemNome: feed.fornecedorNome,
                                                            itemChave: feed.chave,
                                                            itemAdd: {
                                                                pathname: `/ordensservico/addanexo/0`,
                                                                state: { anexo: { ...feed } }
                                                            },
                                                            itemEdit: {
                                                                pathname: `/ordensservico/addanexo/${feed.chave}`,
                                                                state: { anexo: { ...feed } }
                                                            },
                                                            itemDelete: this.deleteAnexo
                                                        })
                                                    }}
                                                    className="row deleteMargin alignCenter">
                                                    <div className="col-4 text-left">
                                                        <h6 className="mobileajuster5"><a target="_blank" href={`${util.completarDocuments(`pictures/${feed.anexo}`)}`} className="nonLink">{feed.fornecedorNome}</a></h6>
                                                    </div>
                                                    <div className="col-4 text-left">
                                                        <h6 className="mobileajuster5"><a target="_blank" href={`${util.completarDocuments(`pictures/${feed.anexo}`)}`} className="nonLink">{feed.portoNome.split("@").join(", ")}</a></h6>
                                                    </div>
                                                    <div className="col-3 text-center" style={{ justifyContent: "center" }}>
                                                        <h6 className="mobileajuster5 text-center"><a target="_blank" href={`${util.completarDocuments(`pictures/${feed.anexo}`)}`} className="nonLink">{feed.preferencial != "0" ? "Sim" : "Não"}</a></h6>
                                                    </div>
                                                    <div className="col-1 text-left icones mobileajuster4 ">
                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/ordensservico/addanexo/0`,
                                                                    state: { anexo: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPlus} />
                                                            </Link>
                                                        </div>

                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/ordensservico/addanexo/${feed.chave}`,
                                                                    state: { anexo: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPen} />
                                                            </Link>
                                                        </div>
                                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'HISTORICOS_PADRAO') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                                            <div type='button' className='iconelixo' onClick={(a) => this.deleteAnexo(feed.chave, feed.fornecedor)} >
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

export default connect(mapStateToProps, null)(Anexos)