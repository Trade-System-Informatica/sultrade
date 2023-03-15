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


const estadoInicial = {
    name: '',
    descricoes: [],
    pesquisa: '',
    tipoPesquisa: 1,
    loading: true,
    redirect: false,
    chaveFocus: '',

    deleteDescricao: false,

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
    direcaoTabela: faChevronDown,
    acessosPermissoes: []
}

class DescricoesPadrao extends Component {

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
            if (e.acessoAcao == "DESCRICOES_PADRAO" && (e.permissaoConsulta == 0 || !e.permissaoConsulta)) {
                this.setState({ redirect: true })
            } else {
                console.log(e)
            }
        })
    }

    componentDidUpdate = async (prevProps, prevState) => {
        if (this.state.deleteDescricao && this.state.modalItemAberto != prevState.modalItemAberto) {
            await this.setState({
                modalItemAberto: false,
                deleteDescricao: false
            })
        }
    }

    loadAll = async () => {
        await this.setState({
            descricoes: await loader.getBase('getDescricoesPadrao.php'),
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

    deleteDescricao = async (id, nome) => {
        this.setState({deleteDescricao: true})
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja remover esta Descrição padrão? ({nome}) </p>
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
                                    await apiEmployee.post(`deleteDescricaoPadrao.php`, {
                                        token: true,
                                        chave: id
                                    }).then(
                                        async response => {
                                            if (response.data == true) {
                                                await loader.salvaLogs('os_descricao_padrao', this.state.usuarioLogado.codigo, null, "Exclusão", id);

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
        const descricoes = this.state.descricoes.reverse();

        if (this.state.direcaoTabela == faChevronDown) {
            await this.setState({direcaoTabela: faChevronUp});
        } else {
            await this.setState({direcaoTabela: faChevronDown});
        } 

        await this.setState({descricoes, loading: false});
    }

    filtrarPesquisa = (descricao) => {
        if (this.state.tipoPesquisa == 1) {
            return descricao.descricao.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else {
            return descricao.chave.toLowerCase().includes(this.state.pesquisa.toLowerCase())
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
                                <Header voltarTabelas titulo="Descrições Padrão"/>
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

                            <AddButton addLink={{ pathname: `/tabelas/adddescricao/0` }}/>

                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-left">
                                <div className="row mobileajuster3">
                                    <div className="col-1 col-sm-1 col-md-1 col-lg-1 col-xl-1 sumir">
                                    </div>

                                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  text-right pesquisa mobileajuster1 ">
                                            <div className='col-2'></div>
                                        <select className="form-control tipoPesquisa col-4 col-sm-4 col-md-3 col-lg-3 col-xl-2" placeholder="Tipo de pesquisa..." value={this.state.tipoPesquisa} onChange={e => { this.setState({ tipoPesquisa: e.currentTarget.value }) }}>
                                            <option value={1}>Descrição</option>
                                            <option value={2}>Chave</option>
                                        </select>
                                        <input className="form-control campoPesquisa col-7 col-sm-6 col-md-6 col-lg-5 col-xl-5" placeholder="Pesquise aqui..." value={this.state.pesquisa} onChange={e => { this.setState({ pesquisa: e.currentTarget.value }) }} />
                                            <div className="col-7 col-sm-3 col-md-2 col-lg-2 col-xl-2 text-left">
                                                <Link to={{ pathname: `/tabelas/adddescricao/0` }}><button className="btn btn-success">+</button></Link>
                                            </div>
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
                                                <div className="col-7 text-left">
                                                    <span className="subtituloships">Descrição</span>
                                                </div>
                                                <div className="col-3 text-right revertItem" onClick={() => this.reverterItens()}>
                                                    <span className="subtituloships"><FontAwesomeIcon icon={this.state.direcaoTabela} /></span>
                                                </div>
                                            </div>
                                        }
                                        {window.innerWidth < 500 &&
                                            <div className="row subtitulosTabela">
                                                <div className="col-9 text-left">
                                                    <span className="subtituloships">Descrição</span>
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
                                {this.state.descricoes[0] != undefined && this.state.descricoes.filter(this.filtrarPesquisa).map((feed, index) => (
                                    <div key={feed.chave} className="row row-list">
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                        <div ref={feed.chave ==  this.state.chaveFocus ? "focusMe" : ""} tabindex={-1} key={feed.id} className={`col-lg-8 col-md-8 col-sm-12 mix all dresses bags ${index % 2 == 0 ? feed.chave == this.state.chaveFocus ? "par focusLight" : "par ": feed.chave == this.state.chaveFocus ? "impar focusDark" : "impar"}`}>

                                            {window.innerWidth >= 500 &&
                                                <div className="row deleteMargin alignCenter">
                                                    <div className="col-2 text-left">
                                                        <p className="mobileajuster5">{feed.chave}</p>
                                                    </div>
                                                    <div className="col-7 text-left">
                                                        <h6 className="mobileajuster5">{feed.descricao}</h6>
                                                    </div>
                                                    <div className="col-3 text-left icones mobileajuster4 ">
                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/tabelas/adddescricao/0`,
                                                                    state: { descricao: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPlus} />
                                                            </Link>
                                                        </div>

                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/tabelas/adddescricao/${feed.chave}`,
                                                                    state: { descricao: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPen} />
                                                            </Link>
                                                        </div>
                                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'DESCRICOES_PADRAO') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                                            <div type='button' className='iconelixo' onClick={(a) => this.deleteDescricao(feed.chave, feed.descricao)} >
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
                                                                { titulo: 'Descrição', valor: feed.descricao }
                                                            ],
                                                            itemPermissao: 'DESCRICOES_PADRAO',
                                                            itemNome: feed.descricao,
                                                            itemChave: feed.Chave,
                                                            itemAdd: {
                                                                pathname: `/tabelas/adddescricao/0`,
                                                                state: { descricao: { ...feed } }
                                                            },
                                                            itemEdit: {
                                                                pathname: `/tabelas/adddescricao/${feed.chave}`,
                                                                state: { descricao: { ...feed } }
                                                            },
                                                            itemDelete: this.deleteDescricao
                                                        })
                                                    }}
                                                    className="row deleteMargin alignCenter">
                                                    <div className="col-9 text-left">
                                                        <h6 className="mobileajuster5">{feed.descricao}</h6>
                                                    </div>
                                                    <div className="col-3 text-left icones mobileajuster4 ">
                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/tabelas/adddescricao/0`,
                                                                    state: { descricao: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPlus} />
                                                            </Link>
                                                        </div>

                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/tabelas/adddescricao/${feed.chave}`,
                                                                    state: { descricao: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPen} />
                                                            </Link>
                                                        </div>
                                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'DESCRICOES_PADRAO') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                                            <div type='button' className='iconelixo' onClick={(a) => this.deleteDescricao(feed.chave, feed.descricao)} >
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

export default connect(mapStateToProps, null)(DescricoesPadrao)