import React, { Component } from 'react'
import './styles.css'
import { apiEmployee } from '../../../services/apiamrg'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import Skeleton from '../../../components/skeleton'
import { Link, useHistory, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { PRECISA_LOGAR, NOME_EMPRESA } from '../../../config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faTimes, faTrashAlt, faPen, faPlus, faEnvelope, faHome } from '@fortawesome/free-solid-svg-icons'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
import moment from 'moment'
import { faGalacticRepublic } from '@fortawesome/free-brands-svg-icons'
import loader from '../../../classes/loader'
import ModalItem from '../../../components/modalItem'

const estadoInicial = {
    name: '',
    solicitacoes: [],
    pesquisa: "",
    pesquisaCliente: "",
    pesquisaNavio: "",
    tipoPesquisa: 3,
    chaveFocus: '',

    deleteSolicitacao: false,

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


class SolicitacoesServicos extends Component {

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
        if (this.state.deleteSolicitacao && this.state.modalItemAberto != prevState.modalItemAberto) {
            await this.setState({
                modalItemAberto: false,
                deleteSolicitacao: false
            })
        }
    }

    loadAll = async () => {
        await this.getServicosItens();

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

    getServicosItens = async () => {
        await apiEmployee.post(`getServicosItens.php`, {
            token: true,
            offset: this.state.offset,
            empresa: this.state.usuarioLogado.empresa
        }).then(
            async response => {
                const solicitacoes = [... this.state.solicitacoes, ...response.data.filter((e) => e.cancelada != 1)]
                await this.setState({ solicitacoes: solicitacoes })
            },
            response => { this.erroApi(response) }

        )
    }

    erroApi = async (res) => {
        alert(res)
        await this.setState({ redirect: true })
    }

    deleteServicoItem = async (chave, nome) => {
        this.setState({deleteSolicitacao: true})
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
                                    await apiEmployee.post(`deleteServicoItem.php`, {
                                        token: true,
                                        chave: chave,
                                        canceladaPor: this.state.usuarioLogado.codigo
                                    }).then(
                                        async response => {
                                            if (response.data == true) {
                                                await loader.salvaLogs('os_servicos_itens', this.state.usuarioLogado.codigo, null, "Cancelamento", chave);

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

    filtrarPesquisa = (solicitacoes) => {
        let solicitacoesfiltradas = solicitacoes
        if (this.state.pesquisaCliente !== '') {
            if (solicitacoes.clienteNome && solicitacoes.clienteNome.toLowerCase().includes(this.state.pesquisaCliente.toLowerCase())) {
                solicitacoesfiltradas = solicitacoes
            } else {
                solicitacoesfiltradas = "";
            }
        }

        if (this.state.pesquisaNavio !== '') {
            if (solicitacoesfiltradas.navioNome && solicitacoesfiltradas.navioNome.toLowerCase().includes(this.state.pesquisaNavio.toLowerCase())) {
                solicitacoesfiltradas = solicitacoesfiltradas
            } else {
                solicitacoesfiltradas = "";
            }
        }


        if (solicitacoesfiltradas.descricao && this.state.tipoPesquisa == 1) {
            return solicitacoesfiltradas.descricao.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (solicitacoesfiltradas.fornecedorNome && this.state.tipoPesquisa == 2) {
            return solicitacoesfiltradas.fornecedorNome.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (solicitacoesfiltradas.osCodigo && this.state.tipoPesquisa == 3) {
            return solicitacoesfiltradas.osCodigo.toLowerCase().includes(this.state.pesquisa.toLowerCase())
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
                                <Header voltarMovimentacao titulo="Solicitações de Serviços" />


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
                                solicitacao
                                itemFinanceiro={this.state.itemFinanceiro}
                            />

                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-left">
                                <div className="row mobileajuster3">
                                    <div className="col-1 col-sm-1 col-md-1 col-lg-1 col-xl-1 sumir">
                                    </div>

                                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  text-right pesquisa mobileajuster1 ">
                                        <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  text-right pesquisa mobileajuster1 ">
                                            <select className="form-control tipoPesquisa col-4 col-sm-4 col-md-3 col-lg-3 col-xl-2" placeholder="Tipo de pesquisa..." value={this.state.tipoPesquisa} onChange={e => { this.setState({ tipoPesquisa: e.currentTarget.value }) }}>
                                                <option value={3}>OS</option>
                                                <option value={1}>Descrição</option>
                                                <option value={2}>Fornecedor</option>
                                            </select>
                                            <input className="form-control campoPesquisa col-7 col-sm-6 col-md-6 col-lg-5 col-xl-5" placeholder="Pesquise aqui..." value={this.state.pesquisa} onChange={e => { this.setState({ pesquisa: e.currentTarget.value }) }} />
                                            <div>
                                                <Link to={{ pathname: `/ordensservico/addos/0` }}><button className="btn btn-success">Adicionar OS</button></Link>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='col-2'></div>
                                    <div className='col-4'>
                                        <input className="form-control " placeholder="Pesquise por cliente..." value={this.state.pesquisaCliente} onChange={e => { this.setState({ pesquisaCliente: e.currentTarget.value }) }} />
                                    </div>
                                    <div className='col-4'>
                                        <input className="form-control" placeholder="Pesquise por navio..." value={this.state.pesquisaNavio} onChange={e => { this.setState({ pesquisaNavio: e.currentTarget.value }) }} />
                                    </div>

                                    <div className="col-0 col-sm-0 col-md-3 col-lg-3 col-xl-3"></div>
                                    <div>
                                    </div>

                                </div>
                            </div>


                            <div className="row deleteMargin" id="product-list">
                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                <div className="col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags">
                                    <div className="single-product-item" >
                                        {window.innerWidth >= 960 &&
                                            <div className="row subtitulosTabela">
                                                <div className="col-xl-1 col-lg-1 col-md-1 col-sm-1 col-1 text-left">
                                                    <span className="subtituloships">OS</span>
                                                </div>
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                    <span className="subtituloships">Navio</span>
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                    <span className="subtituloships">Fornecedor</span>
                                                </div>
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                    <span className="subtituloships">Porto</span>
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                    <span className="subtituloships">Data de Abertura</span>
                                                </div>
                                                <div className="col-xl-1 col-lg-1 col-md-1 col-sm-1 col-1 text-center">
                                                    <span className="subtituloships">
                                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'SERVICOS_ITENS') { return e } }).map((e) => e.permissaoInsere)[0] == 1 &&
                                                            <span className="subtituloships"><Link to={{ pathname: `/ordensservico/addsolicitacao/0`, state: { solicitacao: {} } }}><FontAwesomeIcon icon={faPlus} /></Link></span>
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        }
                                        {window.innerWidth < 960 && window.innerWidth >= 500 &&
                                            <div className="row subtitulosTabela">

                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                    <span className="subtituloships">OS</span>
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                    <span className="subtituloships">Navio</span>
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                    <span className="subtituloships">Fornecedor</span>
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                    <span className="subtituloships">Data de Abertura</span>
                                                </div>
                                                <div className="col-xl-1 col-lg-1 col-md-1 col-sm-1 col-1 text-center">
                                                    <span className="subtituloships">
                                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'SERVICOS_ITENS') { return e } }).map((e) => e.permissaoInsere)[0] == 1 &&
                                                            <span className="subtituloships"><Link to={{ pathname: `/ordensservico/addsolicitacao/0`, state: { solicitacao: {} } }}><FontAwesomeIcon icon={faPlus} /></Link></span>
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        }
                                        {window.innerWidth < 500 &&
                                            <div className="row subtitulosTabela">

                                                <div className="col-3 text-left">
                                                    <span className="subtituloships">OS</span>
                                                </div>
                                                <div className="col-4 text-left">
                                                    <span className="subtituloships">Descrição</span>
                                                </div>
                                                <div className="col-4 text-left">
                                                    <span className="subtituloships">Data de Abertura</span>
                                                </div>
                                                <div className="col-1 text-center removePadding">
                                                    <span className="subtituloships">
                                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'SERVICOS_ITENS') { return e } }).map((e) => e.permissaoInsere)[0] == 1 &&
                                                            <span className="subtituloships"><Link to={{ pathname: `/ordensservico/addsolicitacao/0`, state: { solicitacao: {} } }}><FontAwesomeIcon icon={faPlus} /></Link></span>
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>
                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                            </div>

                            <div id="product-list">
                                {this.state.solicitacoes[0] != undefined && this.state.solicitacoes.filter(this.filtrarPesquisa).splice(0, this.state.load).map((feed, index) => (
                                    <div key={feed.Chave} className="row row-list">
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                        <div ref={feed.chave == this.state.chaveFocus ? "focusMe" : ""} tabindex={-1} key={feed.id} className={`col-lg-8 col-md-8 col-sm-12 mix all dresses bags ${index % 2 == 0 ? feed.chave == this.state.chaveFocus ? "par focusLight" : "par " : feed.chave == this.state.chaveFocus ? "impar focusDark" : "impar"}`}>
                                            {window.innerWidth >= 960 &&
                                                <div className="row deleteMargin alignCenter">
                                                    <div className="col-xl-1 col-lg-1 col-md-1 col-sm-1 col-1 text-left" style={{ overflowWrap: 'anywhere' }}>
                                                        <p>{feed.osCodigo}</p>
                                                    </div>
                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                        <p>{feed.navioNome}</p>
                                                    </div>
                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                        <p>{feed.fornecedorNome}</p>
                                                    </div>
                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                        <p>{feed.portoNome}</p>
                                                    </div>
                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left" style={{ overflowWrap: 'anywhere ' }}>
                                                        <p>{moment(feed.Data_Abertura).format('DD/MM/YYYY')}</p>
                                                    </div>
                                                    <div className="col-lg-1 col-md-1 col-sm-1 col-1  text-left  mobileajuster4 icones">
                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/ordensservico/addsolicitacao/0`,
                                                                    state: { solicitacao: { ...feed }, os: { Chave: feed.chave_os, chave_navio: feed.chave_navio, viagem: feed.viagem } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPlus} />
                                                            </Link>
                                                        </div>


                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/ordensservico/addsolicitacao/${feed.chave}`,
                                                                    state: { solicitacao: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPen} />
                                                            </Link>
                                                        </div>

                                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'SERVICOS_ITENS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&
                                                            <div type='button' className='iconelixo' onClick={(a) => this.deleteServicoItem(feed.chave, feed.descricao)} >
                                                                <FontAwesomeIcon icon={faTimes} />
                                                            </div>
                                                        }
                                                    </div>

                                                </div>
                                            }
                                            {window.innerWidth < 960 && window.innerWidth >= 500 &&
                                                <div className="row deleteMargin alignCenter">
                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left" style={{ overflowWrap: 'anywhere' }}>
                                                        <p>{feed.osCodigo}</p>
                                                    </div>
                                                    <div className="col-xl-2 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                        <p>{feed.navioNome}</p>
                                                    </div>
                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                        <p>{feed.fornecedorNome}</p>
                                                    </div>
                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left" style={{ overflowWrap: 'anywhere ' }}>
                                                        <p>{moment(feed.Data_Abertura).format('DD/MM/YYYY')}</p>
                                                    </div>
                                                    <div className="col-lg-1 col-md-1 col-sm-1 col-1  text-left  mobileajuster4 icones">
                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/ordensservico/addsolicitacao/0`,
                                                                    state: { solicitacao: { ...feed }, os: { Chave: feed.chave_os, chave_navio: feed.chave_navio, viagem: feed.viagem } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPlus} />
                                                            </Link>
                                                        </div>


                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/ordensservico/addsolicitacao/${feed.chave}`,
                                                                    state: { solicitacao: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPen} />
                                                            </Link>
                                                        </div>

                                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'SERVICOS_ITENS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&
                                                            <div type='button' className='iconelixo' onClick={(a) => this.deleteServicoItem(feed.chave, feed.descricao)} >
                                                                <FontAwesomeIcon icon={faTimes} />
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
                                                                { titulo: 'OS', valor: feed.osCodigo },
                                                                { titulo: 'Navio', valor: feed.navioNome },
                                                                { titulo: 'Porto', valor: feed.portoNome },
                                                                { titulo: 'Tipo', valor: this.state.tipos[feed.tipo_sub] },
                                                                { titulo: 'Ordem', valor: feed.ordem.replaceAll(',', '.') },
                                                                { titulo: 'Fornecedor', valor: feed.fornecedorNome },
                                                                { titulo: 'Data de Abertura', valor: moment(feed.Data_Abertura).format('DD/MM/YYYY') }
                                                            ],
                                                            itemPermissao: 'SERVICOS_ITENS',
                                                            itemNome: feed.descricao,
                                                            itemChave: feed.chave,
                                                            itemAdd: {
                                                                pathname: `/ordensservico/addsolicitacao/0`,
                                                                state: { solicitacao: { ...feed }, os: { ...this.state.os } }
                                                            },
                                                            itemEdit: {
                                                                pathname: `/ordensservico/addsolicitacao/${feed.chave}`,
                                                                state: { solicitacao: { ...feed }, os: { ... this.state.os } }
                                                            },
                                                            itemFinanceiro: {
                                                                pathname: `/ordensservico/addsolicitacaofinanceiro/${feed.chave}`,
                                                                state: { solicitacao: { ...feed }, os: { ...this.state.os } }
                                                            },
                                                            itemDelete: this.deleteServicoItem
                                                        })
                                                    }}
                                                    className="row deleteMargin alignCenter">
                                                    <div className="col-3 text-center">
                                                        <p>{feed.osCodigo}</p>
                                                    </div>
                                                    <div className="col-4 text-center">
                                                        <p>{feed.descricao}</p>
                                                    </div>
                                                    <div className="col-4 text-center" style={{ overflowWrap: 'anywhere' }}>
                                                        <p>{moment(feed.Data_Abertura).format('DD/MM/YYYY')}</p>
                                                    </div>
                                                    <div className="col-1  text-left  mobileajuster4 icones">
                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/ordensservico/addsolicitacao/0`,
                                                                    state: { solicitacao: { ...feed }, os: { Chave: feed.chave_os, chave_navio: feed.chave_navio, viagem: feed.viagem } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPlus} />
                                                            </Link>
                                                        </div>


                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/ordensservico/addsolicitacao/${feed.chave}`,
                                                                    state: { solicitacao: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPen} />
                                                            </Link>
                                                        </div>

                                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'SERVICOS_ITENS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&
                                                            <div type='button' className='iconelixo' onClick={(a) => this.deleteServicoItem(feed.chave, feed.descricao)} >
                                                                <FontAwesomeIcon icon={faTimes} />
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                    </div>
                                ))}
                                {this.state.solicitacoes.filter(this.filtrarPesquisa)[this.state.load] &&
                                    <div className='loadMoreDiv'>
                                        <div className='loadMore' onClick={() => { this.setState({ offset: this.state.load, load: this.state.load + 100 }); this.getServicosItens() }}>Carregar Mais...</div>
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

export default connect(mapStateToProps, null)(SolicitacoesServicos)