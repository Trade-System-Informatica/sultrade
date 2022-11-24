import React, { Component } from 'react'
import './styles.css'
import { apiEmployee } from '../../services/apiamrg'
import { Formik, Field, Form } from 'formik'
import Header from '../../components/header'
import loader from '../../classes/loader'
import Rodape from '../../components/rodape'
import Skeleton from '../../components/skeleton'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { PRECISA_LOGAR, NOME_EMPRESA } from '../../config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
import moment from 'moment'
import ModalItem from '../../components/modalItem'
import { Modal } from '@material-ui/core'


const estadoInicial = {
    name: '',
    logs: [],
    pesquisa: "",
    tipoPesquisa: 1,

    loading: true,
    redirect: false,

    deleteLog: false,

    modalItemAberto: false,
    itemPermissao: '',
    itemInfo: [],
    itemNome: '',
    itemChave: '',

    deleteModal: false,
    dataInicio: '',
    dataFim: '',

    acessos: [],
    permissoes: [],
    acessosPermissoes: [],
}


class Logs extends Component {

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        await this.loadAll()

        this.state.acessosPermissoes.map((e) => {
            if (e.acessoAcao == "LOGS" && e.permissaoConsulta == 0) {
                this.setState({ redirect: true })
            }
        })
    }

    componentDidUpdate = async (prevProps, prevState) => {
        if (this.state.deleteLog && this.state.modalItemAberto != prevState.modalItemAberto) {
            await this.setState({
                modalItemAberto: false,
                deleteLog: false
            })
        }
    }

    loadAll = async () => {
        await this.setState({
            acessos: await loader.getBase('getTiposAcessos.php'),
            permissoes: await loader.getBase('getPermissoes.php')
        })

        await this.setState({
            acessosPermissoes: await loader.testaAcesso(this.state.acessos, this.state.permissoes, this.state.usuarioLogado),
            loading: false,
        })
    }

    getLogs = async (e) => {
        await this.setState({
            tabela: e,
            logs: await loader.getAllLogs(e, this.state.usuarioLogado.empresa)
        })

        await this.getOperadores();
    }

    getOperadores = async () => {
        await apiEmployee.post(`getOperadores.php`, {
            token: true,
            empresa: this.state.usuarioLogado.empresa
        }).then(
            async response => {
                const logs = this.state.logs.map((e) => ({
                    ...e,
                    operadorNome: response.data.find((el) => el.Codigo == e.Operador).Nome
                }));

                await this.setState({ logs });
            },
            response => { this.erroApi(response) }

        )
    }

    erroApi = async () => {
        console.log(PRECISA_LOGAR)
        await this.setState({ redirect: true })
    }

    deleteLogs = async (dataInicio, dataFim) => {
        await this.setState({ deleteLog: true, deleteModal: false })
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Remover logs de {dataInicio} até {dataFim} desta tabela?</p>
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
                                    await apiEmployee.post(`deleteLogs.php`, {
                                        token: true,
                                        dataInicio: moment(dataInicio).format('YYYY-MM-DD 00:00'),
                                        dataFim: moment(dataFim).format('YYYY-MM-DD 23:59'),
                                        tabela: this.state.tabela
                                    }).then(
                                        async response => {
                                            if (response.data == true) {
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

    deleteLog = async (chave) => {
        this.setState({deleteLog: true})
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja remover este Log? ({chave}) </p>
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
                                    await apiEmployee.post(`deleteLog.php`, {
                                        token: true,
                                        chave: chave
                                    }).then(
                                        async response => {
                                            if (response.data == true) {
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

    filtrarPesquisa = (item) => {
        if (this.state.tipoPesquisa == 1) {
            return item.Campos.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (this.state.tipoPesquisa == 2) {
            return moment(item.Data).format('DD/MM/YYYY HH:mm:ss').includes(this.state.pesquisa.toLowerCase());
        } else if (this.state.tipoPesquisa == 3 && item.operadorNome) {
            return item.operadorNome.toLowerCase().includes(this.state.pesquisa.toLowerCase());
        } else if (this.state.tipoPesquisa == 4) {
            return item.ChaveAux.includes(this.state.pesquisa.toLowerCase());
        }
    }



    render() {

        const validations = []
        validations.push(this.state.dataInicio)
        validations.push(this.state.dataFim)

        const validForm = validations.reduce((t, a) => t && a)

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
                                <Header voltarUtilitarios operadores titulo="Logs" />

                                <br />

                            </section>

                            <ModalItem
                                closeModal={() => { this.setState({ modalItemAberto: false }) }}
                                itens={this.state.itemInfo}
                                nome={this.state.itemNome}
                                chave={this.state.itemChave}
                                modalAberto={this.state.modalItemAberto}
                                itemPermissao={this.state.itemPermissao}
                                itemDelete={this.state.itemDelete}
                                acessosPermissoes={this.state.acessosPermissoes}
                            />

                            <Modal
                                aria-labelledby="transition-modal-title"
                                aria-describedby="transition-modal-description"
                                style={{ display: 'flex', justifyContent: 'center', paddingTop: '5%', paddingBottom: '5%', overflow: 'scroll' }}
                                open={this.state.deleteModal}
                                onClose={async () => await this.setState({ deleteModal: false })}
                            >
                                <div className='modalContainer'>
                                    <div className='modalCriar'>
                                        <div className='containersairlistprodmodal'>
                                            <div className='botaoSairModal' onClick={async () => await this.setState({ deleteModal: false })}>
                                                <span>X</span>
                                            </div>
                                        </div>
                                        <div className='modalContent'>
                                            <div className='tituloModal'>
                                                <span>Apagar Logs:</span>
                                            </div>


                                            <div className='modalForm'>
                                                <Formik
                                                    initialValues={{
                                                        name: '',
                                                    }}
                                                    onSubmit={async values => {
                                                        await new Promise(r => setTimeout(r, 1000))
                                                        await this.deleteLogs(this.state.dataInicio, this.state.dataFim);
                                                    }}
                                                >
                                                    <Form className="contact-form" >


                                                        <div className="row">

                                                            <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 ">

                                                                <div className="row addservicos">
                                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                        <label>De:</label>
                                                                    </div>
                                                                    <div className="col-1 errorMessage">

                                                                    </div>
                                                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                        <Field className="form-control" type="date" value={this.state.dataInicio} onChange={async e => { this.setState({ dataInicio: e.currentTarget.value }) }} />
                                                                    </div>
                                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                        <label>Até:</label>
                                                                    </div>
                                                                    <div className="col-1 errorMessage">

                                                                    </div>
                                                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                        <Field className="form-control" type="date" value={this.state.dataFim} onChange={async e => { this.setState({ dataFim: e.currentTarget.value }) }} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                                        </div>

                                                        <div className="row">
                                                            <div className="col-2"></div>
                                                            <div className="col-8" style={{ display: 'flex', justifyContent: 'center' }}>
                                                                <button disabled={!validForm} type="submit" style={validForm ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} >Apagar</button>
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

                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-left">
                                <div className="row mobileajuster3">
                                    <div className="col-1 col-sm-1 col-md-1 col-lg-1 col-xl-1 sumir">
                                    </div>

                                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  text-right pesquisa mobileajuster1 ">
                                        <select className="form-control tipoPesquisa col-4 col-sm-4 col-md-3 col-lg-3 col-xl-2" placeholder="Tipo de pesquisa..." value={this.state.tipoPesquisa} onChange={e => { this.setState({ tipoPesquisa: e.currentTarget.value }) }}>
                                            <option value={1}>Identificador</option>
                                            <option value={2}>Data</option>
                                            <option value={3}>Operador</option>
                                            <option value={4}>Chave Auxiliar</option>
                                        </select>
                                        <input className="form-control campoPesquisa col-7 col-sm-6 col-md-6 col-lg-5 col-xl-5" placeholder="Pesquise aqui..." value={this.state.pesquisa} onChange={e => { this.setState({ pesquisa: e.currentTarget.value }) }} />
                                        {this.state.tabela && this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'LOGS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&
                                            <div>
                                                <button onClick={async () => { await this.setState({ deleteModal: true }) }} className="btn btn-danger">Apagar por período</button>
                                            </div>
                                        }
                                    </div>
                                    <div className="col-1 col-sm-1 col-md-1 col-lg-1 col-xl-1 sumir">
                                    </div>
                                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  text-right pesquisa mobileajuster1 ">
                                        <select className="form-control col-7 col-sm-6 col-md-6 col-lg-5 col-xl-5" placeholder="Tipo de pesquisa..." value={this.state.tabela} onChange={async e => { await this.getLogs(e.currentTarget.value) }}>
                                            <option value={''}></option>
                                            <option value={'os_navios'}>Navios</option>
                                            <option value={'os_tipos_servicos'}>Tipos de Serviços</option>
                                            <option value={'os_subgrupos_taxas'}>Subgrupos de Taxas</option>
                                            <option value={'moedas'}>Moedas</option>
                                            <option value={'pessoas'}>Pessoas</option>
                                            <option value={'pessoas_contatos'}>Contatos</option>
                                            <option value={'pessoas_enderecos'}>Endereços</option>
                                            <option value={'os_portos'}>Portos</option>
                                            <option value={'os_taxas'}>Taxas</option>
                                            <option value={'centros_custos'}>Centros de Custos</option>
                                            <option value={'planocontas'}>Planos de Contas</option>
                                            <option value={'historicos'}>Históricos Padrão</option>
                                            <option value={'tipos_docto'}>Tipos de Documentos</option>
                                            <option value={'os'}>OS</option>
                                            <option value={'os_servicos_itens'}>Solicitações de Serviço</option>
                                            <option value={'contas_aberto'}>Contas em Aberto</option>
                                            <option value={'transacoes'}>Transações</option>
                                            <option value={'operadores'}>Operadores</option>
                                            <option value={'permissoes'}>Permissões</option>
                                        </select>
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
                                                <div className="col-2 text-left">
                                                    <span className="subtituloships">Data</span>
                                                </div>
                                                <div className="col-2 text-left">
                                                    <span className="subtituloships">Operador</span>
                                                </div>
                                                <div className="col-4 text-left">
                                                    <span className="subtituloships">Campos</span>
                                                </div>
                                                <div className="col-2 text-left">
                                                    <span className="subtituloships">Chave Auxiliar</span>
                                                </div>
                                                <div className="col-2 text-left">
                                                    <span className="subtituloships"></span>
                                                </div>
                                            </div>
                                        }
                                        {window.innerWidth < 500 &&
                                            <div className="row subtitulosTabela">
                                                <div className="col-3 text-left">
                                                    <span className="subtituloships">Data</span>
                                                </div>
                                                <div className="col-4 text-left">
                                                    <span className="subtituloships">Campos</span>
                                                </div>
                                                <div className="col-3 text-left">
                                                    <span className="subtituloships">Chave Auxiliar</span>
                                                </div>
                                                <div className="col-2 text-left">
                                                    <span className="subtituloships"></span>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>
                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                            </div>

                            <div id="product-list">
                                {this.state.logs[0] != undefined && this.state.logs.filter(this.filtrarPesquisa).map((feed, index) => (
                                    <div key={feed.Codigo} className="row row-list">
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                        <div className={index % 2 == 0 ? "col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags par" : "col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags itemLista impar"}>
                                            {window.innerWidth >= 500 &&
                                                <div className="row deleteMargin alignCenter">
                                                    <div className="col-2 text-left" style={{overflowWrap: 'anywhere'}}>
                                                        <p>{moment(feed.Data).format('DD/MM/YYYY HH:mm:ss')}</p>
                                                    </div>
                                                    <div className="col-2 text-left">
                                                        <p>{feed.operadorNome}</p>
                                                    </div>
                                                    <div className="col-4 text-left">
                                                        <p>{feed.Campos}</p>
                                                    </div>
                                                    <div className="col-2 text-left">
                                                        <p>{feed.ChaveAux}</p>
                                                    </div>
                                                    <div className="col-2 text-left icones mobileajuster4 ">
                                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'LOGS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&
                                                            <div type='button' className='iconelixo' onClick={(a) => this.deleteLog(feed.Chave)} >
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
                                                                { titulo: 'Data', valor: moment(feed.Data).format('DD/MM/YYYY HH:mm:ss') },
                                                                { titulo: 'Chave', valor: feed.chave },
                                                                { titulo: 'Operador', valor: feed.operadorNome },
                                                                { titulo: 'Campos', valor: feed.Campos },
                                                                { titulo: 'Chave Auxiliar', valor: feed.ChaveAux }
                                                            ],
                                                            itemPermissao: 'LOGS',
                                                            itemNome: feed.Data,
                                                            itemChave: feed.Chave,
                                                            itemDelete: this.deleteLog
                                                        })
                                                    }}
                                                    className="row deleteMargin alignCenter" style={{overflowWrap: 'anywhere'}}>
                                                    <div className="col-3 text-left">
                                                        <p>{moment(feed.Data).format('DD/MM/YYYY HH:mm:ss')}</p>
                                                    </div>
                                                    <div className="col-4 text-left">
                                                        <p>{feed.Campos}</p>
                                                    </div>
                                                    <div className="col-3 text-left">
                                                        <p>{feed.ChaveAux}</p>
                                                    </div>
                                                    <div className="col-2 text-left icones mobileajuster4 ">
                                                        {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'LOGS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&
                                                            <div type='button' className='iconelixo' onClick={(a) => this.deleteLog(feed.Chave)} >
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

export default connect(mapStateToProps, null)(Logs)