import React, { Component } from 'react'
import './styles.css'
import { apiEmployee } from '../../../services/apiamrg'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import Skeleton from '../../../components/skeleton'
import { Link, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronUp, faChevronDown, faFileInvoiceDollar } from '@fortawesome/free-solid-svg-icons'
import 'react-confirm-alert/src/react-confirm-alert.css'
import moment from 'moment'
import Select from 'react-select';
import loader from '../../../classes/loader'
import Util from '../../../classes/util'
import { PDFExport } from "@progress/kendo-react-pdf";
import Alert from '../../../components/alert';

const estadoInicial = {
    name: '',
    contas: [],
    bancos: [],
    transacoes: [],
    dadosPagamento: [],
    tokenBB: '',


    dataInicial: '',
    dataFinal: '',

    error: { msg: "", type: "" },
    mostraFiltros: true,

    loading: true,
    requisicoesCarregando: [],
    redirect: false,

    acessos: [],
    permissoes: [],
    acessosPermissoes: [],

    load: 100,

    requisicoesBloqueado: false,
    liberacoesBloqueado: false,

    errors: [],
    pdfGerado: ""
}

class ExportarLancamentos extends Component {
    constructor(props) {
        super(props);
        this.pdfExportComponent = React.createRef(null);
    }

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        this.setState({ requisicoesCarregando: [] })
        await this.loadAll();

        this.state.acessosPermissoes.map((e) => {
            if (e.acessoAcao == "LANCAMENTOS" && e.permissaoInsere == 0) {
                this.setState({ requisicoesBloqueado: true })
            }
            if (e.acessoAcao == "LANCAMENTOS" && e.permissaoInsere == 0) {
                this.setState({ liberacoesBloqueado: true })
            }
        })
    }

    loadAll = async () => {
        await this.setState({
            lancamentos: await loader.getBase('getLancamentos.php'),
            pessoas: await loader.getBase('getPessoas.php'),
            acessos: await loader.getBase('getTiposAcessos.php'),
            permissoes: await loader.getBase('getPermissoes.php'),
        });

        await this.setState({
            lancamentos: this.state.lancamentos.map((e) => ({ ...e, check: false })),
            acessosPermissoes: await loader.testaAcesso(this.state.acessos, this.state.permissoes, this.state.usuarioLogado),
            loading: false
        })
    }

    checkLancto = async (index) => {
        let lancto = this.state.lancamentos;

        if (index == 'all') {
            let lanctoFiltrado;
            lanctoFiltrado = lancto.filter(this.filtrarPesquisa).splice(0, this.state.load);
            lancto = lancto.map((e) => {
                if (lanctoFiltrado.find((el) => e.Chave == el.Chave)) {
                    return ({ ...e, check: true });
                } else {
                    return ({ ...e, check: false });
                }
            })
            return this.setState({ lancamentos: lancto });
        }

        lancto = lancto.map((e) => {
            if (e.Chave == index) {
                return ({ ...e, check: !e.check })
            } else {
                return ({ ...e, check: e.check })
            }
        })

        this.setState({ lancamentos: lancto });
    }

    exportarLancto = async () => {
        this.setState({loading: true})
        const response = await loader.getBody("exportarLancamentos.php", {
            empresa: this.state.usuarioLogado.empresa,
            lancamentos: this.state.lancamentos.filter((item) => item.check)
        });
        
        const blob = new Blob([response], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `export.txt`;
        link.href = url;
        link.click();
        this.setState({loading: false})
    }

    erroApi = async (err) => {
        alert(err)
    }

    filtrarPesquisa = (item) => {
        if (!this.state.dataInicial || !this.state.dataFinal || item.atualizado != 0) {
            return false;
        }

        if (!moment(item.Data).isSameOrAfter(this.state.dataInicial)) {
            return false;
        }
        
        if (!moment(item.Data).isSameOrBefore(this.state.dataFinal)) {
            return false;
        }

        return true;

    }

    filterSearch = (e, state) => {
        if (e == "") {
            return true
        }

        const text = state.toUpperCase();
        return (e.label.toUpperCase().includes(text))
    }

    render() {
        return (

            <div className='allContent' >
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
                                <Header voltarLancamentos titulo="Exportar Lançamentos" />
                                <br />
                            </section>
                            <Alert alert={this.state.error} setAlert={(value) => this.setState({ error: value })} />

                            {this.state.errorFooter &&
                                <div className="erroFooter">
                                    <span>
                                        {this.state.error}
                                    </span>
                                </div>
                            }
                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-left">
                                <div className="row mobileajuster3">
                                    <div className="col-1 col-sm-1 col-md-1 col-lg-1 col-xl-1 sumir">
                                    </div>
                                    {!this.state.mostraFiltros &&
                                        <div className='row addservicos' style={{ cursor: 'pointer' }} onClick={() => this.setState({ mostraFiltros: true })}>
                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 ">
                                                <label><h3>Filtros</h3></label>
                                            </div>
                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-6 ">
                                            </div>
                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-right">
                                                <label><h3><FontAwesomeIcon icon={faChevronDown} /></h3></label>
                                            </div>
                                        </div>
                                    }
                                    {this.state.mostraFiltros &&
                                        <div className="row addservicos">
                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3" style={{ cursor: 'pointer' }} onClick={() => this.setState({ mostraFiltros: false })}>
                                                <label><h3>Filtros</h3></label>
                                            </div>
                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-6" style={{ cursor: 'pointer' }} onClick={() => this.setState({ mostraFiltros: false })}>
                                            </div>
                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-right" style={{ cursor: 'pointer' }} onClick={() => this.setState({ mostraFiltros: false })}>
                                                <label><h3><FontAwesomeIcon icon={faChevronUp} /></h3></label>
                                            </div>
                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12">
                                                <label>Data Inicial:</label>
                                            </div>
                                            <div className='col-1 errorMessage'>
                                            </div>
                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                <input className='form-control' type='date' value={this.state.dataInicial} onChange={e => { this.setState({ dataInicial: e.currentTarget.value }) }} />
                                            </div>
                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12">
                                                <label>Data Final:</label>
                                            </div>
                                            <div className='col-1 errorMessage'>
                                            </div>
                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                <input className='form-control' type='date' value={this.state.dataFinal} onChange={e => { this.setState({ dataFinal: e.currentTarget.value }) }} />
                                            </div>
                                        </div>
                                    }
                                    <div className="col-2 col-sm-2 col-md-3 col-lg-3 col-xl-3  text-right pesquisa mobileajuster1 ">
                                    </div>
                                    <div className="col-5 col-sm-5 col-md-6 col-lg-6 col-xl-6  text-right pesquisa mobileajuster1 ">
                                        <div>
                                            <button className="btn btn-success" disabled={this.state.exportacaoBloqueada} style={{ padding: '10px', fontSize: '1.2em', borderRadius: '20px' }} onClick={() => { if (!this.state.exportacaoBloqueada) { this.exportarLancto() } }}>Exportar</button>
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
                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                <span className="subtituloships">Histórico</span>
                                            </div>
                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                <span className="subtituloships" style={{ overflowWrap: 'anywhere' }}>Data</span>
                                            </div>
                                            <div className="col-3 text-left">
                                                <span className="subtituloships">Valor</span>
                                            </div>
                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-center">
                                                {this.state.lancamentos[0] &&
                                                    <input type="checkbox" checked={false} onChange={() => this.checkLancto('all')} />
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                            </div>

                            <div id="product-list">
                                {this.state.lancamentos[0] != undefined && this.state.lancamentos.filter(this.filtrarPesquisa).splice(0, this.state.load).map((feed, index) => (
                                    <>
                                        <div key={feed.Chave} className="row row-list">
                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                            <div className={index % 2 == 0 ? "col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags par" : "col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags itemLista impar"}>
                                                <div className="row deleteMargin alignCenter">
                                                    <div className="col-2 text-left" style={{ overflowWrap: 'anywhere' }}>
                                                        <p>{feed.Chave}</p>
                                                    </div>
                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                        <Link to=
                                                            {{
                                                                pathname: `/financeiro/addlancamento/${feed.Chave}`,
                                                                state: { lancamento: { ...feed }, tipo: "lote" }
                                                            }}
                                                        >
                                                            <p>{feed.Historico}</p>
                                                        </Link>
                                                    </div>
                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                        <p>{moment(feed.Data).format('DD/MM/YYYY')}</p>
                                                    </div>
                                                    <div style={{ overflowWrap: 'anywhere' }} className="col-3 text-left">
                                                        <p>R$ {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(feed.Valor)}</p>
                                                    </div>
                                                    <div className="col-lg-2 col-md-2 col-sm-2 col-2  text-left  mobileajuster4 icones">
                                                        <input className='pagamentosCheckbox' type="checkbox" checked={feed.check} onChange={() => { this.checkLancto(feed.Chave) }} />
                                                    </div>

                                                </div>
                                            </div>
                                            <div className="col-lg-2 col-md-2 col-sm-0 col-0"></div>
                                        </div>
                                        <div className={feed.statusId == '0' ? 'errorMessageTable' : 'successMessageTable'}>
                                            <span>{feed.status}</span>
                                        </div>
                                    </>
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

export default connect(mapStateToProps, null)(ExportarLancamentos)
