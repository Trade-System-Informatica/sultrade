import React, { Component } from 'react'
import './styles.css'
import { apiEmployee } from '../../../services/apiamrg'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import Skeleton from '../../../components/skeleton'
import loader from '../../../classes/loader'
import AddButton from '../../../components/addButton';
import { Link, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { NOME_EMPRESA } from '../../../config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faPen, faPlus, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
import moment from 'moment'


const estadoInicial = {
    name: '',
    contas: [],
    pesquisa: "",
    tipoPesquisa: 1,
    pessoas: '',
    deleteConta: false,

    loading: true,
    redirect: false,

    acessos: [],
    permissoes: [],
    acessosPermissoes: [],
    direcaoTabela: faChevronDown,

    load: 100
}

class ContasPagar extends Component {

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
            if (e.acessoAcao == "CONTAS_ABERTAS" && e.permissaoConsulta == 0) {
                this.setState({ redirect: true })
            }
        })
    }

    componentDidUpdate = async (prevProps, prevState) => {
        if (this.state.deleteConta && this.state.modalItemAberto != prevState.modalItemAberto) {
            await this.setState({
                modalItemAberto: false,
                deleteConta: false
            })
        }
    }

    loadAll = async () => {
        await this.setState({
            contas: await loader.getBase('getContasPagar.php', this.state.usuarioLogado.empresa),
            acessos: await loader.getBase('getTiposAcessos.php'),
            permissoes: await loader.getBase('getPermissoes.php'),
        })
        
        this.setState({contas: this.state.contas.map((conta) => ({...conta, Valor: conta.Valor - conta.valorDescontos}))});

        await this.getPessoas();

        if (this.props.location.state && this.props.location.state.chave) {
            await this.setState({ chaveFocus: this.props.location.state.chave });
        }

        await this.setState({
            acessosPermissoes: await loader.testaAcesso(this.state.acessos, this.state.permissoes, this.state.usuarioLogado),
            loading: false
        })
    }

    getPessoas = async () => {
        await apiEmployee.post(`getPessoas.php`, {
            token: true,
        }).then(
            async response => {
                await this.setState({ pessoas: response.data })

                let pessoa = "";
                const contas = this.state.contas.map((e) => {
                    pessoa = this.state.pessoas.find((el) => el.Chave == e.Pessoa);
                    if (pessoa) {
                        return (
                            { ...e, fornecedorNome: pessoa.Nome }
                        )
                    } else {
                        return (
                            { ...e, fornecedorNome: '' }
                        )
                    }
                })

                await this.setState({ contas: contas })

            },
            response => { this.erroApi(response) }
        )
    }

    erroApi = async (res) => {
        alert(res)
        await this.setState({ redirect: true })
    }

    deleteConta = async (chave, nome) => {
        this.setState({ deleteConta: true })
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja remover a conta de {nome}? </p>
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
                                    await apiEmployee.post(`deleteConta.php`, {
                                        token: true,
                                        chave: chave
                                    }).then(
                                        async response => {
                                            if (response.data == true) {
                                                await loader.salvaLogs('contas_aberto', this.state.usuarioLogado.codigo, null, "Exclusão", chave);

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
        const contas = this.state.contas.reverse();

        if (this.state.direcaoTabela == faChevronDown) {
            await this.setState({ direcaoTabela: faChevronUp });
        } else {
            await this.setState({ direcaoTabela: faChevronDown });
        }

        await this.setState({ contas, loading: false });
    }

    filtrarPesquisa = (conta) => {

        if (conta.fornecedorNome && this.state.tipoPesquisa == 1) {
            return conta.fornecedorNome.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (conta.Valor && this.state.tipoPesquisa == 2) {
            return conta.Valor.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (conta.Chave && this.state.tipoPesquisa == 3) {
            return conta.Chave.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (this.state.tipoPesquisa == 4) {
            return moment(conta.Vencimento).format('DD/MM/YYYY').includes(this.state.pesquisa.toLowerCase())
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
                                <Header voltarContasAbertas titulo="Contas a Pagar" />


                                <br />
                            </section>

                            <div className="row">
                                <div className="col-2"></div>
                                <div className="col-2"></div>
                            </div>

                            <div className="col-12 text-left">
                                <div className="row mobileajuster3">
                                    <div className="col-1 sumir">
                                    </div>

                                    <div className="col-12 text-right pesquisa mobileajuster1 ">
                                        <div className="col-12  text-right pesquisa mobileajuster1 ">
                                            <select className="form-control tipoPesquisa col-4 col-sm-4 col-md-3 col-lg-3 col-xl-2" placeholder="Tipo de pesquisa..." value={this.state.tipoPesquisa} onChange={e => { this.setState({ tipoPesquisa: e.currentTarget.value }) }}>
                                                <option value={1}>Pessoa</option>
                                                <option value={2}>Valor</option>
                                                <option value={4}>Vencimento</option>
                                                <option value={3}>Chave</option>
                                            </select>
                                            <input className="form-control campoPesquisa col-7 col-sm-6 col-md-6 col-lg-5 col-xl-5" placeholder="Pesquise aqui..." value={this.state.pesquisa} onChange={e => { this.setState({ pesquisa: e.currentTarget.value }) }} />
                                            <div>
                                                <Link to={{ pathname: `/financeiro/relatorio`, state: { backTo: 'contasPagar' } }}><button className="btn btn-success">Relatorio</button></Link>
                                            </div>
                                            <div style={{marginLeft: 15}}>
                                                <Link to={{
                                                    pathname: `/financeiro/addconta/0`,
                                                    state: { conta: {}, tipo: 1, to: 'contaspagar' }
                                                }}><button className="btn btn-success">+</button></Link>
                                            </div>

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
                                        <div className="row subtitulosTabela">
                                            <div className="col-2 text-left">
                                                <span className="subtituloships">Chave</span>
                                            </div>
                                            <div className="col-3 text-left">
                                                <span className="subtituloships">Pessoa</span>
                                            </div>
                                            <div className="col-3 text-left">
                                                <span className="subtituloships">Vencimento</span>
                                            </div>
                                            <div className="col-2 text-left">
                                                <span className="subtituloships">Valor</span>
                                            </div>
                                            <div className="col-2 text-center revertItem" onClick={() => { if (this.state.contas[0]) { this.reverterItens() } }}>
                                                {this.state.contas[0] &&
                                                    <span className="subtituloships"><FontAwesomeIcon icon={this.state.direcaoTabela} /></span>

                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                            </div>

                            <AddButton addLink={{
                                pathname: `/financeiro/addconta/0`,
                                state: { conta: {}, tipo: 1, to: 'contaspagar' }
                            }} />

                            <div id="product-list">
                                {this.state.contas[0] != undefined && this.state.contas.filter(this.filtrarPesquisa).splice(0, this.state.load).map((feed, index) => (
                                    <div key={feed.Chave} className="row row-list">
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                        <div ref={feed.Chave == this.state.chaveFocus ? "focusMe" : ""} tabindex={-1} className={`col-lg-8 col-md-8 col-sm-12 mix all dresses bags ${index % 2 == 0 ? feed.Chave == this.state.chaveFocus ? "par focusLight" : "par " : feed.Chave == this.state.chaveFocus ? "impar focusDark" : "impar"}`}>
                                            <div className="row deleteMargin alignCenter">
                                                <div className=" col-2 text-left" style={{ overflowWrap: 'anywhere' }}>
                                                    <p>{feed.Chave}</p>
                                                </div>
                                                <div className="col-3 text-left">
                                                    <p>{feed.fornecedorNome}</p>
                                                </div>
                                                <div className="col-3 text-left">
                                                    <p>{moment(feed.Vencimento).format('DD/MM/YYYY')}</p>
                                                </div>
                                                <div style={{ overflowWrap: 'anywhere' }} className="col-2 text-left">
                                                    <p>R$ {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(feed.Valor)}</p>
                                                </div>
                                                <div className="col-2  text-left  mobileajuster4 icones">
                                                    <div className='iconelixo giveMargin' type='button' >
                                                        <Link to=
                                                            {{
                                                                pathname: `/financeiro/addconta/0`,
                                                                state: { conta: {}, tipo: 1, to: 'contaspagar' }
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faPlus} />
                                                        </Link>
                                                    </div>


                                                    <div className='iconelixo giveMargin' type='button' >
                                                        <Link to=
                                                            {{
                                                                pathname: `/financeiro/addconta/${feed.Chave}`,
                                                                state: { conta: { ...feed }, to: 'contaspagar' }
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faPen} />
                                                        </Link>
                                                    </div>

                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'CONTAS_ABERTAS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&
                                                        <div type='button' className='iconelixo' onClick={(a) => this.deleteConta(feed.Chave, feed.fornecedorNome)} >
                                                            <FontAwesomeIcon icon={faTrashAlt} />
                                                        </div>
                                                    }
                                                </div>

                                            </div>
                                        </div>
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                    </div>
                                ))}
                                {this.state.contas.filter(this.filtrarPesquisa)[this.state.load] &&
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

export default connect(mapStateToProps, null)(ContasPagar)