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
    os: [],
    osPesquisa: [],
    pesquisa: "",
    tipoPesquisa: 1,
    situacao: 2,

    pesquisaTimer: 0,
    pesquisaDelayed: 0,
    loading: true,
    redirect: false,
    chaveFocus: '',

    deleteOS: false,

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

    load: 200,
    offset: 0,
}

class OS extends Component {


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
                await this.setState({ pesquisa: this.state.chaveFocus, tipoPesquisa: 1, situacao: 1 })
                await this.pesquisa(this.state.chaveFocus)
            }
        }

        this.state.acessosPermissoes.map((e) => {
            if (e.acessoAcao == "OS" && e.permissaoConsulta == 0) {
                this.setState({ redirect: true })
            }
        })
    }

    componentDidUpdate = async (prevProps, prevState) => {
        if (this.state.deleteOS && this.state.modalItemAberto != prevState.modalItemAberto) {
            await this.setState({
                modalItemAberto: false,
                deleteOS: false
            })
        }
    }

    loadAll = async () => {
        await this.getOS();

        await this.setState({
            moedas: await loader.getBase('getMoedas.php'),
            portos: await loader.getBase('getPortos.php'),
            acessos: await loader.getBase('getTiposAcessos.php'),
            permissoes: await loader.getBase('getPermissoes.php'),

            vencimentoInicial: moment().format('YYYY-MM-DD'),
            vencimentoFinal: moment().add(1, 'day').format('YYYY-MM-DD')
        })

        if (this.props.location.state && this.props.location.state.chave) {
            await this.setState({ chaveFocus: this.props.location.state.chave });
        }


        await this.setState({
            acessosPermissoes: await loader.testaAcesso(this.state.acessos, this.state.permissoes, this.state.usuarioLogado),
            loading: false
        })
    }

    getOS = async () => {
        const os = [... this.state.os, ...await loader.getBase(`getOS.php`, this.state.usuarioLogado.empresa, 201, this.state.offset)]

        await this.setState({ os });
    }

    erroApi = async (res) => {
        alert(res)
        await this.setState({ redirect: true })
    }

    deleteOS = async (chave, nome) => {
        this.setState({ deleteOS: true })
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Cancelar esta OS? ({nome}) </p>
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
                                    await apiEmployee.post(`deleteOS.php`, {
                                        token: true,
                                        chave: chave,
                                        canceladoPor: this.state.usuarioLogado.codigo
                                    }).then(
                                        async response => {
                                            if (response.data == true) {
                                                await loader.salvaLogs('os', this.state.usuarioLogado.codigo, null, "Cancelamento", chave);

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


    pesquisa = async (value) => {
        clearTimeout(this.state.pesquisaTimer)

        const newTimer = setTimeout(async () => {
            await this.setState({ osPesquisa: await loader.getOSPesquisa(this.state.pesquisa, this.state.tipoPesquisa, this.state.usuarioLogado.empresa) });
        }, 500)

        await this.setState({ pesquisaTimer: newTimer, pesquisa: value })

    }

    filtrarPesquisa = (os) => {
        let osFiltrada = os;

        if (this.state.situacao == 2) {
            osFiltrada = ((!os.Data_Encerramento || moment(os.Data_Encerramento).format() == "Invalid date") && os.cancelada == '0') ? os : '';
        } else if (this.state.situacao == 3) {
            osFiltrada = (os.cancelada != '0') ? os : '';
        } else if (this.state.situacao == 4) {
            osFiltrada = (os.Data_Encerramento && moment(os.Data_Encerramento).format() != "Invalid date" && os.cancelada == '0') && (!os.Data_Faturamento || moment(os.Data_Faturamento).format() == "Invalid date") ? os : '';
        } else if (this.state.situacao == 5) {
            osFiltrada = (os.Data_Faturamento && moment(os.Data_Faturamento).format() != "Invalid date" && os.cancelada == '0') ? os : '';
        } else if (this.state.situacao == 6) {
            osFiltrada = ((!os.Data_Faturamento || moment(os.Data_Faturamento).format() == "Invalid date") && os.cancelada == '0') ? os : '';
        }

        //console.log(osFiltrada)
        if (osFiltrada) {
            return osFiltrada;
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
                                <Header voltarMovimentacao titulo="OS" />


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
                                            <div className='col-2'></div>
                                            <select className="form-control tipoPesquisa col-4 col-sm-4 col-md-3 col-lg-3 col-xl-2" placeholder="Tipo de pesquisa..." value={this.state.tipoPesquisa} onChange={async (e) => { this.setState({ tipoPesquisa: e.currentTarget.value }) }}>
                                                <option value={1}>Codigo</option>
                                                <option value={2}>Navio</option>
                                                <option value={3}>Serviço</option>
                                                <option value={4}>Porto</option>
                                            </select>
                                            <input className="form-control campoPesquisa col-7 col-sm-6 col-md-6 col-lg-5 col-xl-5" placeholder="Pesquise aqui..." value={this.state.pesquisa} onChange={async e => { await this.pesquisa(e.currentTarget.value) }} />
                                            <div>
                                                <Link to={{ pathname: `/ordensservico/relatorio` }}><button className="btn btn-success">Relatorio</button></Link>
                                            </div>
                                            <div style={{ marginLeft: 15 }}>
                                                <Link to={{pathname: "/ordensservico/addos/0"}}><button className="btn btn-success">+</button></Link>
                                            </div>
                                        </div>
                                        <div className="col-7 col-sm-3 col-md-2 col-lg-2 col-xl-2 text-left">
                                        </div>
                                    </div>
                                    <div className='col-1 col-sm-2 col-md-2 col-lg-4 col-xl-4'>
                                    </div>
                                    <div className='col-3 col-sm-3 col-md-2 col-lg-2 col-xl-2'>
                                        <label style={{ fontSize: '1.1em', marginTop: 3, fontWeight: 'bold' }}>Situação: </label>
                                    </div>
                                    <div className='col-5 col-sm-5 col-md-4 col-lg-2 col-xl-2'>
                                        <select className='form-control' value={this.state.situacao} onChange={(e) => { this.setState({ situacao: e.currentTarget.value }) }}>
                                            <option value={1}>Todas</option>
                                            <option value={2}>Em aberto</option>
                                            <option value={3}>Canceladas</option>
                                            <option value={4}>Encerradas</option>
                                            <option value={5}>Faturadas</option>
                                            <option value={6}>Não Faturadas</option>
                                        </select>
                                    </div>
                                    <div className="col-0 col-sm-0 col-md-3 col-lg-3 col-xl-3">
                                    </div>
                                    <div>
                                    </div>

                                </div>
                            </div>

                            <AddButton addlink={{pathname: "/ordensservico/addos/0"}}/>
                                        
                            <div className="row deleteMargin" id="product-list">
                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                <div className="col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags">
                                    <div className="single-product-item" >
                                        {window.innerWidth >= 690 &&
                                            <div className="row subtitulosTabela">
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                    <span className="subtituloships">Código</span>
                                                </div>
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                    <span className="subtituloships">Navio</span>
                                                </div>
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                    <span className="subtituloships">Porto</span>
                                                </div>
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                    <span className="subtituloships">Data Abertura</span>
                                                </div>
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                    <span className="subtituloships">Serviço</span>
                                                </div>
                                                <div style={{display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center"}} className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-right">
                                                    <span className="subtituloships"><Link to={{ pathname: `/ordensservico/addos/0` }}><FontAwesomeIcon icon={faPlus} /></Link></span>
                                                </div>
                                            </div>
                                        }
                                        {window.innerWidth < 690 && window.innerWidth >= 500 &&
                                            <div className="row subtitulosTabela">
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                    <span className="subtituloships">Código</span>
                                                </div>
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                    <span className="subtituloships">Navio</span>
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                    <span className="subtituloships">Data Abertura</span>
                                                </div>
                                                <div className="col-3 text-left">
                                                    <span className="subtituloships">Serviço</span>
                                                </div>
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-right">
                                                    <span className="subtituloships"></span>
                                                </div>
                                            </div>
                                        }
                                        {window.innerWidth < 500 &&
                                            <div className="row subtitulosTabela">

                                                <div className="col-3 text-left">
                                                    <span className="subtituloships">Código</span>
                                                </div>
                                                <div className="col-4 text-left">
                                                    <span className="subtituloships">Remarks</span>
                                                </div>
                                                <div className="col-3 text-left">
                                                    <span className="subtituloships">Data de Abertura</span>
                                                </div>
                                                <div className="col-2 text-right">
                                                    <span className="subtituloships"></span>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>
                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>

                            </div>

                            <div id="product-list">
                                {this.state.pesquisa == '' &&
                                    <>
                                        {this.state.os[0] != undefined && this.state.os.filter(this.filtrarPesquisa).splice(0, this.state.load).map((feed, index) => (
                                            <div key={feed.Chave} className="row row-list">
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                                <div ref={feed.codigo == this.state.chaveFocus ? "focusMe" : ""} tabindex={-1} key={feed.id} className={`col-lg-8 col-md-8 col-sm-12 mix all dresses bags ${index % 2 == 0 ? feed.codigo == this.state.chaveFocus ? "par focusLight" : "par " : feed.codigo == this.state.chaveFocus ? "impar focusDark" : "impar"}`}>
                                                    {window.innerWidth >= 690 &&
                                                        <div className="row deleteMargin alignCenter">
                                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                                <p>{feed.codigo}</p>
                                                            </div>
                                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                                <p>{feed.navioNome}</p>
                                                            </div>
                                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                                <p>{feed.portoNome}</p>
                                                            </div>
                                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                                <p>{moment(feed.Data_Abertura).format('DD/MM/YYYY')}</p>
                                                            </div>
                                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left" style={{ overflowWrap: 'anywhere ' }}>
                                                                <p>{feed.tipoServicoNome}</p>
                                                            </div>
                                                            <div className="col-lg-2 col-md-2 col-sm-2 col-2  text-left  mobileajuster4 icones">
                                                                <div className='iconelixo giveMargin' type='button' >
                                                                    <Link to=
                                                                        {{
                                                                            pathname: `/ordensservico/addos/0`,
                                                                            state: { os: { ...feed } }
                                                                        }}
                                                                    >
                                                                        <FontAwesomeIcon icon={faPlus} />
                                                                    </Link>
                                                                </div>

                                                                {feed.cancelada != 1 &&
                                                                    <div className='iconelixo giveMargin' type='button' >
                                                                        <Link to=
                                                                            {{
                                                                                pathname: `/ordensservico/addos/${feed.Chave}`,
                                                                                state: { os: { ...feed } }
                                                                            }}
                                                                        >
                                                                            <FontAwesomeIcon styles={{ color: "red !important" }} icon={faPen} />
                                                                        </Link>
                                                                    </div>
                                                                }

                                                                {feed.cancelada != 1 && this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'OS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&
                                                                    <div type='button' className='iconelixo' onClick={(a) => this.deleteOS(feed.Chave, feed.Descricao)} >
                                                                        <FontAwesomeIcon icon={faTimes} />
                                                                    </div>
                                                                }

                                                            </div>

                                                        </div>
                                                    }
                                                    {window.innerWidth < 690 && window.innerWidth >= 500 &&
                                                        <div className="row deleteMargin alignCenter">
                                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                                <p>{feed.codigo}</p>
                                                            </div>
                                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                                <p>{feed.navioNome}</p>
                                                            </div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                                <p>{moment(feed.Data_Abertura).format('DD/MM/YYYY')}</p>
                                                            </div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left" style={{ overflowWrap: 'anywhere ' }}>
                                                                <p>{feed.tipoServicoNome}</p>
                                                            </div>
                                                            <div className="col-lg-2 col-md-2 col-sm-2 col-2  text-left  mobileajuster4 icones">
                                                                <div className='iconelixo giveMargin' type='button' >
                                                                    <Link to=
                                                                        {{
                                                                            pathname: `/ordensservico/addos/0`,
                                                                            state: { os: { ...feed } }
                                                                        }}
                                                                    >
                                                                        <FontAwesomeIcon icon={faPlus} />
                                                                    </Link>
                                                                </div>

                                                                {feed.cancelada != 1 &&
                                                                    <div className='iconelixo giveMargin' type='button' >
                                                                        <Link to=
                                                                            {{
                                                                                pathname: `/ordensservico/addos/${feed.Chave}`,
                                                                                state: { os: { ...feed } }
                                                                            }}
                                                                        >
                                                                            <FontAwesomeIcon styles={{ color: "red !important" }} icon={faPen} />
                                                                        </Link>
                                                                    </div>
                                                                }
                                                                {feed.cancelada != 1 && this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'OS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&
                                                                    <div type='button' className='iconelixo' onClick={(a) => this.deleteOS(feed.Chave, feed.Descricao)} >
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
                                                                        { titulo: 'Codigo', valor: feed.codigo },
                                                                        { titulo: 'Cliente', valor: feed.clienteNome },
                                                                        { titulo: 'Navio', valor: feed.navioNome },
                                                                        { titulo: 'Porto', valor: feed.portoNome },
                                                                        { titulo: 'Centro de Custo', valor: feed.centroCustoNome },
                                                                        { titulo: 'Tipo de Serviço', valor: feed.tipoServicoNome },
                                                                        { titulo: 'Data de Abertura', valor: moment(feed.Data_Abertura).format('DD/MM/YYYY') }
                                                                    ],
                                                                    itemPermissao: 'OS',
                                                                    itemNome: feed.Descricao,
                                                                    itemChave: feed.Chave,
                                                                    itemAdd: {
                                                                        pathname: `/ordensservico/addos/0`,
                                                                        state: { os: { ...feed } }
                                                                    },
                                                                    itemEdit: feed.cancelada != 1 ? {
                                                                        pathname: `/ordensservico/addos/${feed.Chave}`,
                                                                        state: { os: { ...feed } }
                                                                    } : '',
                                                                    itemDelete: feed.cancelada != 1 ? this.deleteOS : ''
                                                                })
                                                            }}
                                                            className="row deleteMargin alignCenter">
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-center">
                                                                <p>{feed.codigo}</p>
                                                            </div>
                                                            <div className="col-4 text-center" style={{ overflowWrap: 'anywhere ' }}>
                                                                <p>{feed.Descricao}</p>
                                                            </div>
                                                            <div className="col-3 text-center" style={{ overflowWrap: 'anywhere' }}>
                                                                <p>{moment(feed.Data_Abertura).format('DD/MM/YYYY')}</p>
                                                            </div>
                                                            <div className="col-2  text-left  mobileajuster4 icones">
                                                                <div className='iconelixo giveMargin' type='button' >
                                                                    <Link to=
                                                                        {{
                                                                            pathname: `/ordensservico/addos/0`,
                                                                            state: { os: { ...feed } }
                                                                        }}
                                                                    >
                                                                        <FontAwesomeIcon icon={faPlus} />
                                                                    </Link>
                                                                </div>

                                                                {feed.cancelada != 1 &&
                                                                    <div className='iconelixo giveMargin' type='button' >
                                                                        <Link to=
                                                                            {{
                                                                                pathname: `/ordensservico/addos/${feed.Chave}`,
                                                                                state: { os: { ...feed } }
                                                                            }}
                                                                        >
                                                                            <FontAwesomeIcon styles={{ color: "red !important" }} icon={faPen} />
                                                                        </Link>
                                                                    </div>
                                                                }

                                                                {feed.cancelada != 1 && this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'OS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&
                                                                    <div type='button' className='iconelixo' onClick={(a) => this.deleteOS(feed.Chave, feed.Descricao)} >
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
                                    </>
                                }
                                {this.state.pesquisa != '' &&
                                    <>
                                        {this.state.osPesquisa[0] != undefined && this.state.osPesquisa.filter(this.filtrarPesquisa).splice(0, this.state.load).map((feed, index) => (
                                            <div key={feed.Chave} className="row row-list">
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                                <div className={feed.cancelada == 1 ? "col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags cancelada" : index % 2 == 0 ? "col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags par" : "col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags itemLista impar"}>
                                                    {window.innerWidth >= 690 &&
                                                        <div className="row deleteMargin alignCenter">
                                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                                <p>{feed.codigo}</p>
                                                            </div>
                                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                                <p>{feed.navioNome}</p>
                                                            </div>
                                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                                <p>{feed.portoNome}</p>
                                                            </div>
                                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                                <p>{moment(feed.Data_Abertura).format('DD/MM/YYYY')}</p>
                                                            </div>
                                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left" style={{ overflowWrap: 'anywhere ' }}>
                                                                <p>{feed.tipoServicoNome}</p>
                                                            </div>
                                                            <div className="col-lg-2 col-md-2 col-sm-2 col-2  text-left  mobileajuster4 icones">
                                                                <div className='iconelixo giveMargin' type='button' >
                                                                    <Link to=
                                                                        {{
                                                                            pathname: `/ordensservico/addos/0`,
                                                                            state: { os: { ...feed } }
                                                                        }}
                                                                    >
                                                                        <FontAwesomeIcon icon={faPlus} />
                                                                    </Link>
                                                                </div>

                                                                {feed.cancelada != 1 &&
                                                                    <div className='iconelixo giveMargin' type='button' >
                                                                        <Link to=
                                                                            {{
                                                                                pathname: `/ordensservico/addos/${feed.Chave}`,
                                                                                state: { os: { ...feed } }
                                                                            }}
                                                                        >
                                                                            <FontAwesomeIcon styles={{ color: "red !important" }} icon={faPen} />
                                                                        </Link>
                                                                    </div>
                                                                }

                                                                {feed.cancelada != 1 && this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'OS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&
                                                                    <div type='button' className='iconelixo' onClick={(a) => this.deleteOS(feed.Chave, feed.Descricao)} >
                                                                        <FontAwesomeIcon icon={faTimes} />
                                                                    </div>
                                                                }

                                                            </div>

                                                        </div>
                                                    }
                                                    {window.innerWidth < 690 && window.innerWidth >= 500 &&
                                                        <div className="row deleteMargin alignCenter">
                                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                                <p>{feed.codigo}</p>
                                                            </div>
                                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                                <p>{feed.navioNome}</p>
                                                            </div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                                <p>{moment(feed.Data_Abertura).format('DD/MM/YYYY')}</p>
                                                            </div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left" style={{ overflowWrap: 'anywhere ' }}>
                                                                <p>{feed.tipoServicoNome}</p>
                                                            </div>
                                                            <div className="col-lg-2 col-md-2 col-sm-2 col-2  text-left  mobileajuster4 icones">
                                                                <div className='iconelixo giveMargin' type='button' >
                                                                    <Link to=
                                                                        {{
                                                                            pathname: `/ordensservico/addos/0`,
                                                                            state: { os: { ...feed } }
                                                                        }}
                                                                    >
                                                                        <FontAwesomeIcon icon={faPlus} />
                                                                    </Link>
                                                                </div>

                                                                {feed.cancelada != 1 &&
                                                                    <div className='iconelixo giveMargin' type='button' >
                                                                        <Link to=
                                                                            {{
                                                                                pathname: `/ordensservico/addos/${feed.Chave}`,
                                                                                state: { os: { ...feed } }
                                                                            }}
                                                                        >
                                                                            <FontAwesomeIcon styles={{ color: "red !important" }} icon={faPen} />
                                                                        </Link>
                                                                    </div>
                                                                }
                                                                {feed.cancelada != 1 && this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'OS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&
                                                                    <div type='button' className='iconelixo' onClick={(a) => this.deleteOS(feed.Chave, feed.Descricao)} >
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
                                                                        { titulo: 'Codigo', valor: feed.codigo },
                                                                        { titulo: 'Cliente', valor: feed.clienteNome },
                                                                        { titulo: 'Navio', valor: feed.navioNome },
                                                                        { titulo: 'Porto', valor: feed.portoNome },
                                                                        { titulo: 'Centro de Custo', valor: feed.centroCustoNome },
                                                                        { titulo: 'Tipo de Serviço', valor: feed.tipoServicoNome },
                                                                        { titulo: 'Data de Abertura', valor: moment(feed.Data_Abertura).format('DD/MM/YYYY') }
                                                                    ],
                                                                    itemPermissao: 'OS',
                                                                    itemNome: feed.Descricao,
                                                                    itemChave: feed.Chave,
                                                                    itemAdd: {
                                                                        pathname: `/ordensservico/addos/0`,
                                                                        state: { os: { ...feed } }
                                                                    },
                                                                    itemEdit: feed.cancelada != 1 ? {
                                                                        pathname: `/ordensservico/addos/${feed.Chave}`,
                                                                        state: { os: { ...feed } }
                                                                    } : '',
                                                                    itemDelete: feed.cancelada != 1 ? this.deleteOS : ''
                                                                })
                                                            }}
                                                            className="row deleteMargin alignCenter">
                                                            <div className="col-2  text-left  mobileajuster4 icones">
                                                                <div className='iconelixo giveMargin' type='button' >
                                                                    <Link to=
                                                                        {{
                                                                            pathname: `/ordensservico/addos/0`,
                                                                            state: { os: { ...feed } }
                                                                        }}
                                                                    >
                                                                        <FontAwesomeIcon icon={faPlus} />
                                                                    </Link>
                                                                </div>

                                                                {feed.cancelada != 1 &&
                                                                    <div className='iconelixo giveMargin' type='button' >
                                                                        <Link to=
                                                                            {{
                                                                                pathname: `/ordensservico/addos/${feed.Chave}`,
                                                                                state: { os: { ...feed } }
                                                                            }}
                                                                        >
                                                                            <FontAwesomeIcon styles={{ color: "red !important" }} icon={faPen} />
                                                                        </Link>
                                                                    </div>
                                                                }

                                                                {feed.cancelada != 1 && this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'OS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&
                                                                    <div type='button' className='iconelixo' onClick={(a) => this.deleteOS(feed.Chave, feed.Descricao)} >
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
                                    </>
                                }
                                {this.state.pesquisa == '' && this.state.os.filter(this.filtrarPesquisa)[this.state.load] &&
                                    <div className='loadMoreDiv'>
                                        <div className='loadMore' onClick={async () => { await this.setState({ offset: this.state.load, load: this.state.load + 50 }); await this.getOS() }}>Carregar Mais...</div>
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

export default connect(mapStateToProps, null)(OS)