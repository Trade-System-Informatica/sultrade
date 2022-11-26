import React, { Component } from 'react'
import './styles.css'
import loader from '../../../classes/loader'
import { apiEmployee } from '../../../services/apiamrg'
import Header from '../../../components/header'
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
import moment from 'moment'


const estadoInicial = {
    name: '',
    planosContas: [],
    pesquisa: "",
    tipoPesquisa: 1,
    pessoas: '',
    loading: true,
    redirect: false,
    chaveFocus: '',

    deletePlanoContas: false,

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

class PlanosContas extends Component {

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
            if (e.acessoAcao == "PLANOS_CONTAS" && e.permissaoConsulta == 0) {
                this.setState({ redirect: true })
            }
        })
    }

    componentDidUpdate = async (prevProps, prevState) => {
        if (this.state.deletePlanoContas && this.state.modalItemAberto != prevState.modalItemAberto) {
            await this.setState({
                modalItemAberto: false,
                deletePlanoContas: false
            })
        }
    }

    loadAll = async () => {
        await this.setState({
            planosContas: await loader.getBase('getPlanosContas.php'),
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
        alert(res)
        await this.setState({ redirect: true })
    }

    deletePlanoConta = async (chave, nome) => {
        this.setState({deletePlanoContas: true})
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja remover este Plano de Conta? ({nome}) </p>
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
                                    await apiEmployee.post(`deletePlanoConta.php`, {
                                        token: true,
                                        chave: chave
                                    }).then(
                                        async response => {
                                            if (response.data == true) {
                                                await loader.salvaLogs('planocontas', this.state.usuarioLogado.codigo, null, "Exclusão", chave);

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
        const planosContas = this.state.planosContas.reverse();

        if (this.state.direcaoTabela == faChevronDown) {
            await this.setState({direcaoTabela: faChevronUp});
        } else {
            await this.setState({direcaoTabela: faChevronDown});
        } 

        await this.setState({planosContas, loading: false});
    }

    filtrarPesquisa = (planoConta) => {
        if (planoConta.Descricao && this.state.tipoPesquisa == 1) {
            return planoConta.Descricao.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (planoConta.Codigo_Red && this.state.tipoPesquisa == 2) {
            return planoConta.Codigo_Red.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (planoConta.Codigo && this.state.tipoPesquisa == 3) {
            return planoConta.Codigo.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (planoConta.Chave != '0') {
            return planoConta.Chave.toLowerCase().includes(this.state.pesquisa.toLowerCase())
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
                                <Header voltarTabelas titulo="Planos de Contas" />


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

                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-left">
                                <div className="row mobileajuster3">
                                    <div className="col-1 col-sm-1 col-md-1 col-lg-1 col-xl-1 sumir">
                                    </div>

                                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  text-right pesquisa mobileajuster1 ">
                                        <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  text-right pesquisa mobileajuster1 ">
                                            <select className="form-control tipoPesquisa col-4 col-sm-4 col-md-3 col-lg-3 col-xl-2" placeholder="Tipo de pesquisa..." value={this.state.tipoPesquisa} onChange={e => { this.setState({ tipoPesquisa: e.currentTarget.value }) }}>
                                                <option value={1}>Descrição</option>
                                                <option value={2}>Código Reduzido</option>
                                                <option value={3}>Código</option>
                                            </select>
                                            <input className="form-control campoPesquisa col-7 col-sm-6 col-md-6 col-lg-5 col-xl-5" placeholder="Pesquise aqui..." value={this.state.pesquisa} onChange={e => { this.setState({ pesquisa: e.currentTarget.value }) }} />
                                        </div>
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
                                        {window.innerWidth >= 500 &&
                                            <div className="row subtitulosTabela">
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                    <span className="subtituloships">Código</span>
                                                </div>
                                                <div className="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-4 text-left">
                                                    <span className="subtituloships">Descrição</span>
                                                </div>
                                                <div className="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-4 text-left">
                                                    <span className="subtituloships">Código Reduzido</span>
                                                </div>
                                                <div className="col-1 text-center">
                                                    <span className="subtituloships"><Link to={{ pathname: `/tabelas/addplanoconta/0` }}><FontAwesomeIcon icon={faPlus} /></Link></span>
                                                </div>
                                                <div className="col-1 text-center revertItem" onClick={() => this.reverterItens()}>
                                                    <span className="subtituloships"><FontAwesomeIcon icon={this.state.direcaoTabela} /></span>
                                                </div>
                                            </div>
                                        }
                                        {window.innerWidth < 500 &&
                                            <div className="row subtitulosTabela">
                                                <div className="col-4 text-left">
                                                    <span className="subtituloships">Código</span>
                                                </div>
                                                <div className="col-4 text-left">
                                                    <span className="subtituloships">Descrição</span>
                                                </div>
                                                <div className="col-2 text-center">
                                                    <span className="subtituloships"><Link to={{ pathname: `/tabelas/addplanoconta/0` }}><FontAwesomeIcon icon={faPlus} /></Link></span>
                                                </div>
                                                <div className="col-2 text-center revertItem" onClick={() => this.reverterItens()}>
                                                    <span className="subtituloships"><FontAwesomeIcon icon={this.state.direcaoTabela} /></span>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>
                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                            </div>

                            <div id="product-list">
                                {this.state.planosContas[0] != undefined && this.state.planosContas.filter(this.filtrarPesquisa).splice(0, this.state.load).map((feed, index) => (
                                    <div key={feed.Chave} className="row row-list">
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                        <div ref={feed.Codigo.trim() == this.state.chaveFocus.trim() ? "focusMe" : ""} tabindex={-1} key={feed.id} className={`col-lg-8 col-md-8 col-sm-12 mix all dresses bags ${index % 2 == 0 ? feed.Codigo.trim() == this.state.chaveFocus.trim() ? "par focusLight" : "par " : feed.Codigo.trim() == this.state.chaveFocus.trim() ? "impar focusDark" : "impar"}`}>
                                            {window.innerWidth >= 500 &&
                                                <div className="row deleteMargin alignCenter">
                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left" style={{ overflowWrap: 'anywhere' }}>
                                                        <p>{feed.Codigo}</p>
                                                    </div>
                                                    <div className="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-4 text-left">
                                                        <p>{feed.Descricao}</p>
                                                    </div>
                                                    <div className="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-4 text-left">
                                                        <p>{feed.Codigo_Red}</p>
                                                    </div>
                                                    <div className="col-lg-2 col-md-2 col-sm-2 col-2  text-left  mobileajuster4 icones">
                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/tabelas/addplanoconta/0`,
                                                                    state: { planoConta: {}, planoPai: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPlus} />
                                                            </Link>
                                                        </div>


                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/tabelas/addplanoconta/${feed.Chave}`,
                                                                    state: { planoConta: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPen} />
                                                            </Link>
                                                        </div>

                                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PLANOS_CONTAS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&
                                                            <div type='button' className='iconelixo' onClick={(a) => this.deletePlanoConta(feed.Chave, feed.Descricao)} >
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
                                                                { titulo: 'Codigo', valor: feed.Codigo },
                                                                { titulo: 'Codigo Reduzido', valor: feed.Codigo_Red },
                                                                { titulo: 'Nivel', valor: feed.Nivel },
                                                                { titulo: 'Descricao', valor: feed.Descricao },
                                                                { titulo: 'Indicador', valor: feed.Indicador == 'S' ? "Sintética" : 'Analítica' },
                                                                { titulo: 'Grupo', valor: ['Contas de Ativo', 'Passivo Circulante e Não Circulante', "Patrimônio Líquido", "Contas de Resultado", "Contas de Compensação", "Outras"][feed.grupo] }
                                                            ],
                                                            itemPermissao: 'PLANOS_CONTAS',
                                                            itemNome: feed.Descricao,
                                                            itemChave: feed.Chave,
                                                            itemAdd: {
                                                                pathname: `/tabelas/addplanoconta/0`,
                                                                state: { planoConta: {}, planoPai: { ...feed } }
                                                            },
                                                            itemEdit: {
                                                                pathname: `/tabelas/addplanoconta/${feed.Chave}`,
                                                                state: { planoConta: { ...feed } }
                                                            },
                                                            itemDelete: this.deletePlanoConta
                                                        })
                                                    }}
                                                    className="row deleteMargin alignCenter">
                                                    <div className="col-5 text-left" style={{ overflowWrap: 'anywhere' }}>
                                                        <p>{feed.Codigo}</p>
                                                    </div>
                                                    <div className="col-5 text-left">
                                                        <p>{feed.Descricao}</p>
                                                    </div>
                                                    <div className="col-2  text-left  mobileajuster4 icones">
                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/tabelas/addplanoconta/0`,
                                                                    state: { planoConta: {}, planoPai: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPlus} />
                                                            </Link>
                                                        </div>


                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/tabelas/addplanoconta/${feed.Chave}`,
                                                                    state: { planoConta: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPen} />
                                                            </Link>
                                                        </div>

                                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PLANOS_CONTAS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&
                                                            <div type='button' className='iconelixo' onClick={(a) => this.deletePlanoConta(feed.Chave, feed.Descricao)} >
                                                                <FontAwesomeIcon icon={faTrashAlt} />
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                    </div>
                                ))}
                                {this.state.planosContas.filter(this.filtrarPesquisa)[this.state.load] &&
                                    <div className='loadMoreDiv'>
                                        <div className='loadMore' onClick={() => { this.setState({ load: this.state.load + 100 }) }}>Carregar Mais...</div>
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

export default connect(mapStateToProps, null)(PlanosContas)