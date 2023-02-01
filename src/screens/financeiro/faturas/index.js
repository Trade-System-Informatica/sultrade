import React, { Component } from 'react'
import './styles.css'
import { Formik, Field, Form } from 'formik'
import { apiEmployee } from '../../../services/apiamrg'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import Skeleton from '../../../components/skeleton'
import loader from '../../../classes/loader'
import { Link, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { NOME_EMPRESA } from '../../../config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faPen, faPlus, faChevronDown, faChevronUp, faCopy } from '@fortawesome/free-solid-svg-icons'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
import moment from 'moment'
import Xml from '../../../classes/xml'
import Modal from '@material-ui/core/Modal';


const estadoInicial = {
    faturas: [],
    pesquisa: "",
    tipoPesquisa: 1,

    loading: true,
    redirect: false,

    deleteFatura: false,

    chaveCancela: 0,
    cancelaModal: false,
    motivo: "",

    acessos: [],
    permissoes: [],
    acessosPermissoes: [],
    direcaoTabela: faChevronDown,

    load: 100
}

class Faturas extends Component {

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
            if (e.acessoAcao == "FATURAS" && e.permissaoConsulta == 0) {
                this.setState({ redirect: true })
            }
        })
    }

    componentDidUpdate = async (prevProps, prevState) => {
        if (this.state.deleteFatura && this.state.modalItemAberto != prevState.modalItemAberto) {
            await this.setState({
                modalItemAberto: false,
                deleteFatura: false
            })
        }
    }

    loadAll = async () => {
        await this.setState({
            faturas: await loader.getBase('getFaturas.php', this.state.usuarioLogado.empresa),
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

    erroApi = async (res) => {
        alert(res)
        await this.setState({ redirect: true })
    }

    copyFatura = async (body) => {
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja copiar essa Nota fiscal ({body.discriminacaoservico})? </p>
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
                                    const formularios = await loader.getBase('getFormularios.php');

                                    
                                    const nfe = formularios.find((form) => form.Codigo === "NFE");

                                    if (nfe) {
                                        this.setState({loading:true})
                                        await apiEmployee.post(`insertFatura.php`, {
                                            token: true,
                                            values: `'${moment(body.Emissao).format('YYYY-MM-DD')}', '${moment(body.Vencto).format('YYYY-MM-DD')}', '${body.Praca_Pagto}', '${body.Cliente}', '${body.Valor}', '${body.Obs}', '${nfe.chave}', '${body.Cobranca}', '${body.discriminacaoservico}', '${body.empresa}', '${body.atividade}'`,
                                            formulario: nfe.chave
                                        }).then(
                                            async response => {
                                                if (response.data[0]) {
                                                    await loader.salvaLogs('faturas', this.state.usuarioLogado.codigo, null, "Inserir", response.data[0].chave);
                                                    
                                                    document.location.reload()
                                                }
                                            },
                                            async response => {
                                                this.erroApi(response)
                                            }
                                            )
                                            this.setState({loading:false});
                                        }
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

    deleteFatura = async (chave, nome, fatura) => {
        this.setState({ deleteFatura: true })
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja {fatura == 0 ? "apagar" : "cancelar"} a Nota fiscal {nome}? </p>
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
                                    if (fatura != 0) {
                                        this.setState({cancelaModal: true, chaveCancela: chave});
                                    
                                    } else {
                                        await apiEmployee.post(`eraseFatura.php`, {
                                            token: true,
                                            chave
                                        }).then(
                                            async response => {
                                                if (response.data == true) {
                                                    await loader.salvaLogs('faturas', this.state.usuarioLogado.codigo, null, "Deleção", this.state.chaveCancela);
    
                                                    document.location.reload()
                                                }
                                            },
                                            async response => {
                                                this.erroApi(response)
                                            }
                                        )
                                    }
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
        const faturas = this.state.faturas.reverse();

        if (this.state.direcaoTabela == faChevronDown) {
            await this.setState({ direcaoTabela: faChevronUp });
        } else {
            await this.setState({ direcaoTabela: faChevronDown });
        }

        await this.setState({ faturas, loading: false });
    }

    filtrarPesquisa = (fatura) => {
        if (fatura.Fatura && this.state.tipoPesquisa == 1) {
            return fatura.Fatura.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (fatura.clienteNome && this.state.tipoPesquisa == 2) {
            return fatura.clienteNome.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (fatura.Emissao && this.state.tipoPesquisa == 3) {
            return fatura.Emissao.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (this.state.tipoPesquisa == 4) {
            return fatura.Chave.includes(this.state.pesquisa.toLowerCase())
        } else if (this.state.tipoPesquisa == 5) {
            return fatura.discriminacaoservico.toLowerCase().includes(this.state.pesquisa.toLowerCase())
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
                                <Header voltarFinanceiroTabelas titulo="Notas Fiscais de Serviço" />


                                <br />
                            </section>
                            <Modal
                            aria-labelledby="transition-modal-title"
                            aria-describedby="transition-modal-description"
                            style={{ display: 'flex', justifyContent: 'center', paddingTop: '5%', paddingBottom: '5%', overflow: 'scroll' }}
                            open={this.state.cancelaModal}
                            onClose={async () => { await this.setState({ cancelaModal: false }); }}
                        >
                            <div className='modalContainer'>
                                <div className='modalCriar'>
                                    <div className='containersairlistprodmodal'>
                                        <div className='botaoSairModal' onClick={async () => await this.setState({ cabecalhoModal: false })}>
                                            <span>X</span>
                                        </div>
                                    </div>
                                    <div className='modalContent'>
                                        <div className='tituloModal'>
                                            <span>Cancelar nota:</span>
                                        </div>


                                        <div className='modalForm'>
                                            <Formik
                                                initialValues={{
                                                    name: '',
                                                }}
                                                onSubmit={async values => {
                                                    await new Promise(r => setTimeout(r, 1000))
                                                    await Xml.cancelaXml(this.state.chaveCancela, this.state.motivo);
                                                    await apiEmployee.post(`deleteFatura.php`, {
                                                        token: true,
                                                        chave: this.state.chaveCancela,
                                                        data: moment().format('YYYY-MM-DD')
                                                    }).then(
                                                        async response => {
                                                            if (response.data == true) {
                                                                await loader.salvaLogs('faturas', this.state.usuarioLogado.codigo, null, "Cancelamento", this.state.chaveCancela);
                
                                                                document.location.reload()
                                                            }
                                                        },
                                                        async response => {
                                                            this.erroApi(response)
                                                        }
                                                    )
                                                }}
                                            >
                                                <Form className="contact-form" >


                                                    <div className="row">

                                                        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 ">

                                                            <div className="row addservicos">
                                                                <div style={{marginTop: 0}} className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>Motivo:</label>
                                                                </div>
                                                                <div className="col-1 errorMessage">

                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Field className="form-control" type="text" value={this.state.motivo} onChange={async e => { this.setState({ motivo: e.currentTarget.value }) }} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                                    </div>

                                                    <div className="row">
                                                        <div className="col-2"></div>
                                                        <div className="col-8" style={{ display: 'flex', justifyContent: 'center' }}>
                                                            <button type="submit" style={{ width: 300 }} >Cancelar</button>
                                                        </div>
                                                        <div className="col-2"></div>
                                                    </div>

                                                </Form>
                                            </Formik>

                                        </div>
                                    </div>





                                </div >

                            </div >
                        </Modal >

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
                                                <option value={5}>Discriminação</option>
                                                <option value={1}>Fatura</option>
                                                <option value={2}>Cliente</option>
                                                <option value={3}>Emissão</option>
                                                <option value={4}>Chave</option>
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
                                        <div className="row subtitulosTabela">
                                            <div className="col-2 text-left">
                                                <span className="subtituloships">Fatura</span>
                                            </div>
                                            <div className="col-4 text-left">
                                                <span className="subtituloships">Discriminação</span>
                                            </div>
                                            <div className="col-3 text-left">
                                                <span className="subtituloships">Cliente</span>
                                            </div>
                                            <div className="col-2 text-left">
                                                <span className="subtituloships">Emissão</span>
                                            </div>
                                            <div className="col-1 text-center revertItem" onClick={() => { if (this.state.contas[0]) { this.reverterItens() } }}>
                                                {!this.state.faturas[0] && this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'FATURAS') { return e } }).map((e) => e.permissaoInsere)[0] == 1 &&
                                                    <span className="subtituloships"><Link to={{ pathname: `/financeiro/addfatura/0` }}><FontAwesomeIcon icon={faPlus} /></Link></span>
                                                }
                                                {this.state.faturas[0] &&
                                                    <span className="subtituloships"><FontAwesomeIcon icon={this.state.direcaoTabela} /></span>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                            </div>

                            <div id="product-list">
                                {this.state.faturas[0] != undefined && this.state.faturas.filter(this.filtrarPesquisa).filter((e) => e.Cancelada != 1).splice(0, this.state.load).map((feed, index) => (
                                    <div key={feed.Chave} className="row row-list">
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                        <div ref={feed.Chave == this.state.chaveFocus ? "focusMe" : ""} tabindex={-1} className={`col-lg-8 col-md-8 col-sm-12 mix all dresses bags ${index % 2 == 0 ? feed.Chave == this.state.chaveFocus ? "par focusLight" : "par " : feed.Chave == this.state.chaveFocus ? "impar focusDark" : "impar"}`}>
                                            <div className="row deleteMargin alignCenter">
                                                <div className=" col-2 text-left" style={{ overflowWrap: 'anywhere' }}>
                                                    <p>{feed.Fatura}</p>
                                                </div>
                                                <div className="col-4 text-left">
                                                    <p>{feed.discriminacaoservico}</p>
                                                </div>
                                                <div className="col-3 text-left">
                                                    <p>{feed.clienteNome}</p>
                                                </div>
                                                <div style={{ overflowWrap: 'anywhere' }} className="col-2 text-left">
                                                    <p>{moment(feed.Emissao).format('DD/MM/YYYY')}</p>
                                                </div>
                                                <div className="col-1  text-left  mobileajuster4 icones">
                                                    <div className='iconelixo giveMargin' type='button' >
                                                        <Link to=
                                                            {{
                                                                pathname: `/financeiro/addfatura/0`
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faPlus} />
                                                        </Link>
                                                    </div>

                                                    <div className='iconelixo giveMargin' type='button' >
                                                        <div type='button' className='iconelixo' onClick={(a) => this.copyFatura(feed)}>
                                                            <FontAwesomeIcon icon={faCopy} />
                                                        </div>
                                                    </div>


                                                    <div className='iconelixo giveMargin' type='button' >
                                                        <Link to=
                                                            {{
                                                                pathname: `/financeiro/addfatura/${feed.Chave}`,
                                                                state: { fatura: { ...feed } }
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faPen} />
                                                        </Link>
                                                    </div>

                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'FATURAS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&
                                                        <div type='button' className='iconelixo' onClick={(a) => this.deleteFatura(feed.Chave, feed.discriminacaoservico, feed.Fatura)} >
                                                            <FontAwesomeIcon icon={faTimes} />
                                                        </div>
                                                    }
                                                </div>

                                            </div>
                                        </div>
                                        <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                    </div>
                                ))}
                                {this.state.faturas.filter(this.filtrarPesquisa)[this.state.load] &&
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

export default connect(mapStateToProps, null)(Faturas)