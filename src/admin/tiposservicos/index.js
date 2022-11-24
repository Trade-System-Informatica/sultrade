import React, { Component } from 'react'
import './styles.css'
import { apiEmployee } from '../../services/apiamrg'
import Header from '../../components/header'
import Rodape from '../../components/rodape'
import loader from '../../classes/loader'
import Skeleton from '../../components/skeleton'
import { Link, useHistory, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { PRECISA_LOGAR, NOME_EMPRESA } from '../../config'
import ModalItem from '../../components/modalItem'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faCoffee, faTrashAlt, faPen, faPlus } from '@fortawesome/free-solid-svg-icons'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'


const estadoInicial = {
    name: '',
    servicos: [],
    pesquisa: "",
    tipoPesquisa: 1,
    chaveFocus: '',
    //Tipos de pesquisa: 1 (descricao), 2 (prazo)
    /*seaports: [],*/
    loading: true,
    redirect: false,

    deleteTipoServico: false,

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
    acessosPermissoes: []
}

/*function filtroPortos(chave){
    return function filter(valor){
        return valor.id === chave
    }
}*/

class TiposServicos extends Component {

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
            if (e.acessoAcao == "TIPOS_SERVICOS" && e.permissaoConsulta == 0) {
                this.setState({ redirect: true })
            }
        })
    }

    componentDidUpdate = async (prevProps, prevState) => {
        if (this.state.deleteTipoServico && this.state.modalItemAberto != prevState.modalItemAberto) {
            await this.setState({
                modalItemAberto: false,
                deleteTipoServico: false
            })
        }
    }

    loadAll = async () => {
        await this.setState({
            servicos: await loader.getBase('getTiposServicos.php'),
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

    erroApi = async () => {
        console.log(PRECISA_LOGAR)
        await this.setState({ redirect: true })
    }

    deleteTipoServico = async (chave, nome) => {
        this.setState({deleteTipoServico: true})
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja remover este Tipo de Serviço? ({nome}) </p>
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
                                    await apiEmployee.post(`deleteTiposServico.php`, {
                                        token: true,
                                        chave: chave
                                    }).then(
                                        async response => {
                                            if (response.data == true) {
                                                await loader.salvaLogs('os_tipos_servicos', this.state.usuarioLogado.codigo, null, "Exclusão", chave);

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

    filtrarPesquisa = (servicos) => {
        if (this.state.tipoPesquisa == 1) {
            return servicos.descricao.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (this.state.tipoPesquisa == 2) {
            return servicos.prazo.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else {
            return servicos.chave.toLowerCase().includes(this.state.pesquisa.toLowerCase())
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
                        <Redirect to={'/admin'} />
                    }

                    {!this.state.loading &&
                        <div>
                            <section>
                                <Header voltarTabelas tiposServicos titulo="Tipos de Serviços"/>

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
                                        <select className="form-control tipoPesquisa col-4 col-sm-4 col-md-3 col-lg-3 col-xl-2" placeholder="Tipo de pesquisa..." value={this.state.tipoPesquisa} onChange={e => { this.setState({ tipoPesquisa: e.currentTarget.value }) }}>
                                            <option value={1}>Descrição</option>
                                            <option value={2}>Prazo</option>
                                            <option value={3}>Chave</option>
                                        </select>
                                        <input className="form-control campoPesquisa col-7 col-sm-6 col-md-6 col-lg-5 col-xl-5" placeholder="Pesquise aqui..." value={this.state.pesquisa} onChange={e => { this.setState({ pesquisa: e.currentTarget.value }) }} />
                                        {!this.state.servicos[0] &&
                                            <div className="col-7 col-sm-3 col-md-2 col-lg-2 col-xl-2 text-left">
                                                <Link to={{ pathname: `/admin/addtiposervico/0` }}><button className="btn btn-success">Adicionar Tipo de Serviço</button></Link>
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
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                    <span className="subtituloships">Chave</span>
                                                </div>
                                                <div className="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-4 text-left">
                                                    <span className="subtituloships">Tipo de Serviço</span>
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                    <span className="subtituloships">Prazo</span>
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-right">
                                                    <span className="subtituloships"></span>
                                                </div>
                                            </div>
                                        }
                                        {window.innerWidth < 500 &&
                                            <div className="row subtitulosTabela">
                                                <div className="col-5 text-left">
                                                    <span className="subtituloships">Tipo de Serviço</span>
                                                </div>
                                                <div className="col-4 text-left">
                                                    <span className="subtituloships">Prazo</span>
                                                </div>
                                                <div className="col-3 text-right">
                                                    <span className="subtituloships"></span>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>
                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                            </div>

                            <div id="product-list">
                                {this.state.servicos[0] != undefined && this.state.servicos.filter(this.filtrarPesquisa).map((feed, index) => (
                                    <div key={feed.id} className="row row-list">
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                        <div ref={feed.chave ==  this.state.chaveFocus ? "focusMe" : ""} tabindex={-1} key={feed.id} className={`col-lg-8 col-md-8 col-sm-12 mix all dresses bags ${index % 2 == 0 ? feed.chave == this.state.chaveFocus ? "par focusLight" : "par ": feed.chave == this.state.chaveFocus ? "impar focusDark" : "impar"}`}>
                                            {window.innerWidth >= 500 &&
                                                <div className="row deleteMargin alignCenter">
                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                        <p>{feed.chave}</p>
                                                    </div>
                                                    <div className="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-4 text-left">
                                                        <p>{feed.descricao}</p>
                                                    </div>
                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                        <p>{feed.prazo} dias</p>
                                                    </div>
                                                    <div className='col-1'></div>
                                                    <div className="col-lg-1 col-md-1 col-sm-1 col-1  text-left  mobileajuster4 iconesCrud">
                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/admin/addtiposervico/0`,
                                                                    state: { tiposervico: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPlus} />
                                                            </Link>
                                                        </div>

                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/admin/addtiposervico/${feed.chave}`,
                                                                    state: { tiposervico: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPen} />
                                                            </Link>
                                                        </div>

                                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'TIPOS_SERVICOS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                                            <div type='button' className='iconelixo' onClick={(a) => this.deleteTipoServico(feed.chave, feed.descricao)} >
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
                                                                { titulo: 'Descrição', valor: feed.descricao },
                                                                { titulo: 'Prazo', valor: `${feed.prazo} dias` }
                                                            ],
                                                            itemPermissao: 'TIPOS_SERVICOS',
                                                            itemNome: feed.descricao,
                                                            itemChave: feed.chave,
                                                            itemAdd: {
                                                                pathname: `/admin/addtiposervico/0`,
                                                                state: { tiposervico: { ...feed } }
                                                            },
                                                            itemEdit: {
                                                                pathname: `/admin/addtiposervico/${feed.chave}`,
                                                                state: { tiposervico: { ...feed } }
                                                            },
                                                            itemDelete: this.deleteTipoServico
                                                        })
                                                    }}
                                                    className="row deleteMargin alignCenter">
                                                    <div className="col-5 text-left">
                                                        <p>{feed.descricao}</p>
                                                    </div>
                                                    <div className="col-4 text-left">
                                                        <p>{feed.prazo} dias</p>
                                                    </div>
                                                    
                                                    <div className="col-2 text-left  mobileajuster4 iconesCrud">
                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/admin/addtiposervico/0`,
                                                                    state: { tiposervico: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPlus} />
                                                            </Link>
                                                        </div>

                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <Link to=
                                                                {{
                                                                    pathname: `/admin/addtiposervico/${feed.chave}`,
                                                                    state: { tiposervico: { ...feed } }
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPen} />
                                                            </Link>
                                                        </div>

                                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'TIPOS_SERVICOS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                                            <div type='button' className='iconelixo' onClick={(a) => this.deleteTipoServico(feed.chave, feed.descricao)} >
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

export default connect(mapStateToProps, null)(TiposServicos)