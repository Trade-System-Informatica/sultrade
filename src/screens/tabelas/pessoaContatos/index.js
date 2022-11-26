import React, { Component } from 'react'
import './styles.css'
import { apiEmployee } from '../../../services/apiamrg'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import Skeleton from '../../../components/skeleton'
import loader from '../../../classes/loader'
import { Link, useHistory, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { PRECISA_LOGAR, NOME_EMPRESA } from '../../../config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faCoffee, faTrashAlt, faPen, faPlus, faPhoneAlt, faHome, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
import moment from 'moment'
import ModalItem from '../../../components/modalItem'


const estadoInicial = {
    name: '',
    pessoas: [],
    pesquisa: "",
    tipoPesquisa: 1,

    loading: true,
    redirect: false,

    deleteContato: false,

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

    tipos: [],
}

class PessoaContatos extends Component {

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
            if (e.acessoAcao == "PESSOAS_CONTATOS" && e.permissaoConsulta == 0) {
                this.setState({ redirect: true })
            }
        })
    }

    componentDidUpdate = async (prevProps, prevState) => {
        if (this.state.deleteContato && this.state.modalItemAberto != prevState.modalItemAberto) {
            await this.setState({
                modalItemAberto: false,
                deleteContato: false
            })
        }
    }

    loadAll = async () => {
        await this.getPessoaContatos();

        await this.setState({
            tipos: await loader.getBase('getTiposComplementares.php'),
            acessos: await loader.getBase('getTiposAcessos.php'),
            permissoes: await loader.getBase('getPermissoes.php')
        })

        await this.adicionaInformacao();

        if (this.props.location.state && this.props.location.state.chave) {
            await this.setState({ chaveFocus: this.props.location.state.chave });
        }

        await this.setState({
            acessosPermissoes: await loader.testaAcesso(this.state.acessos, this.state.permissoes, this.state.usuarioLogado),
            loading: false,
        })
    }

    getPessoaContatos = async () => {
        await apiEmployee.post(`getContatos.php`, {
            token: true,
            pessoa: this.props.location.state.pessoa.Chave
        }).then(
            async response => {
                await this.setState({ contatos: response.data })
                await this.setState({ loading: false })
            },
            response => { this.erroApi(response) }

        )
    }

    adicionaInformacao = async () => {
        let tiposContatos = this.state.contatos.map((contato) => {
            return { ...contato, tipoNome: this.state.tipos.filter((tipo) => tipo.Codigo == contato.Tipo)[0].Descricao }
        })

        await this.setState({ contatos: tiposContatos })

    }

    erroApi = async () => {
        console.log(PRECISA_LOGAR)
        await this.setState({ redirect: true })
    }

    deleteContato = async (chave, nome) => {
        this.setState({deleteContato: true})
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja remover esse contato? ({nome}) </p>
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
                                    await apiEmployee.post(`deleteContato.php`, {
                                        token: true,
                                        chave: chave
                                    }).then(
                                        async response => {
                                            if (response.data == true) {
                                                await loader.salvaLogs('pessoas_contatos', this.state.usuarioLogado.codigo, null, "Exclusão", chave);

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
        const contatos = this.state.contatos.reverse();

        if (this.state.direcaoTabela == faChevronDown) {
            await this.setState({direcaoTabela: faChevronUp});
        } else {
            await this.setState({direcaoTabela: faChevronDown});
        } 

        await this.setState({contatos, loading: false});
    }

    filtrarPesquisa = (contato) => {
        if (this.state.tipoPesquisa == 1) {
            return contato.Campo1.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (this.state.tipoPesquisa == 2) {
            return contato.Campo2.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (this.state.tipoPesquisa == 3) {
            return contato.tipoNome.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else {
            return contato.Chave.toLowerCase().includes(this.state.pesquisa.toLowerCase())
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
                        <Redirect to={'/tabelas/pessoas'} />
                    }

                    {!this.state.loading &&
                        <div>
                            <section>
                                <Header voltarPessoas titulo="Contatos" chave={this.props.location.state.pessoa.Chave}/>

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
                                                <option value={1}>Campo1</option>
                                                <option value={2}>Campo2</option>
                                                <option value={3}>Tipo</option>
                                                <option value={4}>Chave</option>
                                            </select>
                                            <input className="form-control campoPesquisa col-7 col-sm-6 col-md-6 col-lg-5 col-xl-5" placeholder="Pesquise aqui..." value={this.state.pesquisa} onChange={e => { this.setState({ pesquisa: e.currentTarget.value }) }} />
                                        </div>
                                        {!this.state.contatos[0] &&
                                            <div className="col-7 col-sm-3 col-md-2 col-lg-2 col-xl-2 text-left">
                                                <Link to={{ pathname: `/tabelas/addpessoacontato/${this.props.location.state.pessoa.Chave}/0`, state: { pessoa: { ...this.props.location.state.pessoa }, backTo: 'contatos' } }}><button className="btn btn-success">Adicionar Contato</button></Link>
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
                                        {window.innerWidth >= 500 &&
                                            <div className="row subtitulosTabela">
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                    <span className="subtituloships">Chave</span>
                                                </div>
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                    <span className="subtituloships">Tipo</span>
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                    <span className="subtituloships">Campo 1</span>
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                    <span className="subtituloships">Campo 2</span>
                                                </div>
                                                <div className="col-2 text-right revertItem" onClick={() => this.reverterItens()}>
                                                    <span className="subtituloships"><FontAwesomeIcon icon={this.state.direcaoTabela} /></span>
                                                </div>
                                            </div>
                                        }
                                        {window.innerWidth < 500 &&
                                            <div className="row subtitulosTabela">
                                                <div className="col-2 text-left">
                                                    <span className="subtituloships">Tipo</span>
                                                </div>
                                                <div className="col-4 text-left">
                                                    <span className="subtituloships">Campo 1</span>
                                                </div>
                                                <div className="col-4 text-left">
                                                    <span className="subtituloships">Campo 2</span>
                                                </div>
                                                <div className="col-2 text-right revertItem" onClick={() => this.reverterItens()}>
                                                    <span className="subtituloships"><FontAwesomeIcon icon={this.state.direcaoTabela} /></span>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>
                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                            </div>

                            <div id="product-list">
                                {this.state.contatos[0] != undefined && this.state.contatos.filter(this.filtrarPesquisa).map((feed, index) => (
                                    <div key={feed.Chave} className="row row-list">
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                        <div ref={feed.Chave ==  this.state.chaveFocus ? "focusMe" : ""} tabindex={-1} key={feed.id} className={`col-lg-8 col-md-8 col-sm-12 mix all dresses bags ${index % 2 == 0 ? feed.Chave == this.state.chaveFocus ? "par focusLight" : "par ": feed.Chave == this.state.chaveFocus ? "impar focusDark" : "impar"}`}>
                                            {window.innerWidth >= 500 &&
                                                <div className="row deleteMargin alignCenter">
                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                        <p>{feed.Chave}</p>
                                                    </div>
                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                        <p>{feed.tipoNome}</p>
                                                    </div>
                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left" style={{ overflowWrap: 'anywhere' }}>
                                                        <p>{feed.Campo1}</p>
                                                    </div>
                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left" style={{ overflowWrap: 'anywhere' }}>
                                                        <p>{feed.Campo2}</p>
                                                    </div>
                                                    <div className="col-lg-2 col-md-2 col-sm-2 col-2  text-left icones mobileajuster4 ">
                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/tabelas/addpessoacontato/${feed.Chave_Pessoa}/0`,
                                                                    state: { contato: { ...feed }, pessoa: { ...this.props.location.state.pessoa }, backTo: 'contatos' }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPlus} />
                                                            </Link>
                                                        </div>


                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/tabelas/addpessoacontato/${feed.Chave_Pessoa}/${feed.Chave}`,
                                                                    state: { contato: { ...feed }, pessoa: { ...this.props.location.state.pessoa }, backTo: 'contatos' }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPen} />
                                                            </Link>
                                                        </div>

                                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS_CONTATOS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&
                                                            <div type='button' className='iconelixo' onClick={(a) => this.deleteContato(feed.Chave, feed.tipoNome)} >
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
                                                                { titulo: 'Tipo', valor: feed.tipoNome },
                                                                { titulo: 'Campo1', valor: feed.Campo1 },
                                                                { titulo: 'Campo2', valor: feed.Campo2 }
                                                            ],
                                                            itemPermissao: 'PESSOAS_CONTATOS',
                                                            itemNome: feed.tipoNome,
                                                            itemChave: feed.Chave,
                                                            itemAdd: {
                                                                pathname: `/tabelas/addpessoacontato/${feed.Chave_Pessoa}/0`,
                                                                state: { contato: { ...feed }, pessoa: { ...this.props.location.state.pessoa }, backTo: 'contatos' }
                                                            },
                                                            itemEdit: {
                                                                pathname: `/tabelas/addpessoacontato/${feed.Chave_Pessoa}/${feed.Chave}`,
                                                                state: { contato: { ...feed }, pessoa: { ...this.props.location.state.pessoa }, backTo: 'contatos' }
                                                            },
                                                            itemDelete: this.deleteContato
                                                        })
                                                    }}
                                                    className="row deleteMargin alignCenter">
                                                    <div className="col-2 text-left">
                                                        <p>{feed.tipoNome}</p>
                                                    </div>
                                                    <div className="col-4 text-left" style={{ overflowWrap: 'anywhere' }}>
                                                        <p>{feed.Campo1}</p>
                                                    </div>
                                                    <div className="col-4 text-left" style={{ overflowWrap: 'anywhere' }}>
                                                        <p>{feed.Campo2}</p>
                                                    </div>
                                                    <div className="col-2  text-left icones mobileajuster4 ">
                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/tabelas/addpessoacontato/${feed.Chave_Pessoa}/0`,
                                                                    state: { contato: { ...feed }, pessoa: { ...this.props.location.state.pessoa }, backTo: 'contatos' }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPlus} />
                                                            </Link>
                                                        </div>


                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/tabelas/addpessoacontato/${feed.Chave_Pessoa}/${feed.Chave}`,
                                                                    state: { contato: { ...feed }, pessoa: { ...this.props.location.state.pessoa }, backTo: 'contatos' }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPen} />
                                                            </Link>
                                                        </div>

                                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS_CONTATOS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&
                                                            <div type='button' className='iconelixo' onClick={(a) => this.deleteContato(feed.Chave, feed.tipoNome)} >
                                                                <FontAwesomeIcon icon={faTrashAlt} />
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                            }
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

export default connect(mapStateToProps, null)(PessoaContatos)