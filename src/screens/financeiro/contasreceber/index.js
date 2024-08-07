import React, { Component } from 'react'
import './styles.css'
import { apiEmployee } from '../../../services/apiamrg'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import loader from '../../../classes/loader'
import Skeleton from '../../../components/skeleton'
import { Link, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { NOME_EMPRESA } from '../../../config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faPen, faPlus, faChevronDown, faChevronUp, faCheck } from '@fortawesome/free-solid-svg-icons'
import { confirmAlert } from 'react-confirm-alert'
import AddButton from '../../../components/addButton';
import 'react-confirm-alert/src/react-confirm-alert.css'
import moment from 'moment'
import ModalEdit from '../../../components/modalEdit'


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

    editValor: '0',
    editChave: '0',
    editSaldo: '0',
    itemNome: '',
    modalItemAberto: false,
    itemPermissao: 'CONTAS_ABERTAS',
    itemEdit: {
    },

    load: 100
}

class ContasReceber extends Component {

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
            contas: await loader.getBase('getContasReceber.php', this.state.usuarioLogado.empresa),
            acessos: await loader.getBase('getTiposAcessos.php'),
            permissoes: await loader.getBase('getPermissoes.php'),
        })

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
                const contas = this?.state?.contas?.map((e) => {
                    pessoa = this?.state?.pessoas?.find((el) => el?.Chave == e?.Pessoa);
                    if (pessoa) {
                        return (
                            { ...e, pessoaNome: pessoa?.Nome }
                        )
                    } else {
                        return (
                            { ...e, pessoaNome: '' }
                        )
                    }
                })

                await this.setState({ contas: contas })

            },
            response => { this.erroApi(response) }
        )
    }

    salvarRecebimento = async () => {
        const saldo = this.state.editSaldo - parseFloat(this.state.editValor.replaceAll('.', '').replaceAll(',', '.'))
        
        this.setState({
            loading: true,
            modalItemAberto: false,
        })
        await apiEmployee.post(`fazerBaixaConta.php`, {
            token: true,
            chave: this.state.editChave,
            saldo: saldo >= 0 ? saldo : 0,
            recebimento: this.state.editValor.replaceAll('.', '').replaceAll(',', '.'), 
        }).then(
            res => {
                this.setState({loading: false});
                this.loadAll();
            },
            error => { this.erroApi(error) }
        )
    }

    setEditModal = async (conta) => {
        const recebimento = parseFloat(conta.received_manual ? conta.received_manual : '0');
        const saldo = parseFloat(conta.Saldo)
        
        await this.setState({
            editChave: conta.Chave,
            editValor: recebimento,
            editSaldo: saldo,
        });

        await this.setState({
            itemNome: `${conta.os_manual} - saldo atual: R$ ${new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(saldo) }`,
            itemEdit: {
                onSubmit: async () => await this.salvarRecebimento(),
                valores: [
                    {
                        titulo: 'Valor Recebido',
                        valor: new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(recebimento),
                        tipo: 'money',
                        onChange: async (valor) => { await this.setState({ editValor: valor }); },
                        onBlur: async (valor) => { await this.setState({ editValor: Number(valor.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor.replaceAll('.', '').replaceAll(',', '.')) : '' }); },
                    }
                ]
            },
            modalItemAberto: true
        })
    }

    fazerBaixa = async (chave, nome) => {
        this.setState({ deleteConta: true })
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja fazer baixa da conta de {nome}? </p>
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
                                    await apiEmployee.post(`fazerBaixaConta.php`, {
                                        token: true,
                                        chave
                                    }).then(
                                        res => {
                                            this.loadAll();
                                        },
                                        error => { this.erroApi(error) }
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

        if (conta.pessoaNome && this.state.tipoPesquisa == 1) {
            return conta.pessoaNome.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (conta.Valor && this.state.tipoPesquisa == 2) {
            return conta.Valor.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (conta.Chave && this.state.tipoPesquisa == 3) {
            return conta.Chave.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (this.state.tipoPesquisa == 4) {
            if (conta.osCodigo) {
                return conta.osCodigo.toLowerCase().includes(this.state.pesquisa.toLowerCase())
            } else if (conta.os_manual) {
                return conta.os_manual.toLowerCase().includes(this.state.pesquisa.toLowerCase())
            }
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
                                <Header voltarContasAbertas titulo="Contas a Receber" />


                                <br />
                            </section>

                            <ModalEdit
                                closeModal={() => { this.setState({ modalItemAberto: false }) }}
                                nome={this.state.itemNome}
                                modalAberto={this.state.modalItemAberto}
                                itemPermissao={this.state.itemPermissao}
                                acessosPermissoes={this.state.acessosPermissoes}
                                itemEdit={this.state.itemEdit}
                                onSubmit={this.salvarRecebimento}
                                valid={true}
                            />

                            <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 text-left">
                                <div className="row mobileajuster3">
                                    <div className="col-1 col-sm-1 col-md-1 col-lg-1 col-xl-1 sumir">
                                    </div>

                                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  text-right pesquisa mobileajuster1 ">
                                        <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12  text-right pesquisa mobileajuster1 ">
                                            <select className="form-control tipoPesquisa col-4 col-sm-4 col-md-3 col-lg-3 col-xl-2" placeholder="Tipo de pesquisa..." value={this.state.tipoPesquisa} onChange={e => { this.setState({ tipoPesquisa: e.currentTarget.value }) }}>
                                                <option value={1}>Pessoa</option>
                                                <option value={2}>Valor</option>
                                                <option value={4}>OS</option>
                                                <option value={3}>Chave</option>
                                            </select>
                                            <input className="form-control campoPesquisa col-7 col-sm-6 col-md-6 col-lg-5 col-xl-5" placeholder="Pesquise aqui..." value={this.state.pesquisa} onChange={e => { this.setState({ pesquisa: e.currentTarget.value }) }} />
                                            <div>
                                                <Link to={{ pathname: `/financeiro/relatorio/`, state: { backTo: 'contasReceber' } }}><button className="btn btn-success">Relatorio</button></Link>
                                            </div>
                                            <div style={{ marginLeft: 15 }}>
                                                <Link to={{
                                                    pathname: `/financeiro/addconta/0`,
                                                    state: { conta: {}, tipo: 0, to: 'contasreceber' }
                                                }}><button className="btn btn-success">+</button></Link>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-0 col-sm-0 col-md-3 col-lg-3 col-xl-3"></div>
                                    <div>
                                    </div>

                                </div>
                            </div>

                            <AddButton addLink={{
                                pathname: `/financeiro/addconta/0`,
                                state: { conta: {}, tipo: 0, to: 'contasreceber' }
                            }} />

                            <div className="row deleteMargin" id="product-list">
                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                <div className="col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags">
                                    <div className="single-product-item" >
                                        <div className="row subtitulosTabela">
                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                <span className="subtituloships">Chave</span>
                                            </div>
                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                <span className="subtituloships">Pessoa</span>
                                            </div>
                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                <span className="subtituloships">OS</span>
                                            </div>
                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                <span className="subtituloships">Valor</span>
                                            </div>
                                            <div className="col-2 text-center revertItem" onClick={() => { if (this.state.contas[0]) { this.reverterItens() } }}>
                                                {!this.state.contas[0] && this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'CONTAS_ABERTAS') { return e } }).map((e) => e.permissaoInsere)[0] == 1 &&
                                                    <span className="subtituloships"><Link to={{ pathname: `/financeiro/addconta/0`, state: { tipo: 0, to: 'contasreceber' } }}><FontAwesomeIcon icon={faPlus} /></Link></span>
                                                }
                                                {this.state.contas[0] &&
                                                    <span className="subtituloships"><FontAwesomeIcon icon={this.state.direcaoTabela} /></span>

                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                            </div>

                            <div id="product-list">
                                {this.state.contas[0] != undefined && this.state.contas.filter(this.filtrarPesquisa).splice(0, this.state.load).map((feed, index) => (
                                    <div key={feed.Chave} className="row row-list">
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                        <div ref={feed.Chave == this.state.chaveFocus ? "focusMe" : ""} tabindex={-1} className={`col-lg-8 col-md-8 col-sm-12 mix all dresses bags ${index % 2 == 0 ? feed.Chave == this.state.chaveFocus ? "par focusLight" : "par " : feed.Chave == this.state.chaveFocus ? "impar focusDark" : "impar"}`}>
                                            <div className="row deleteMargin alignCenter">
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left" style={{ overflowWrap: 'anywhere' }}>
                                                    <p>{feed.Chave}</p>
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                    <p>{feed.pessoaNome}</p>
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                    <p>{feed.osCodigo ? feed.osCodigo : feed.os_manual}</p>
                                                </div>
                                                <div style={{ overflowWrap: 'anywhere' }} className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                    <p>R$ {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(feed.Valor)}</p>
                                                </div>
                                                <div className="col-lg-2 col-md-2 col-sm-2 col-2  text-left  mobileajuster4 icones">
                                                    {feed.os_manual &&
                                                        <div className='iconelixo giveMargin' type='button' >
                                                            <FontAwesomeIcon icon={faCheck} title={"Fazer baixa"} onClick={async () => await this.setEditModal(feed)} />
                                                        </div>
                                                    }

                                                    <div className='iconelixo giveMargin' type='button' >
                                                        <Link to=
                                                            {{
                                                                pathname: `/financeiro/addconta/0`,
                                                                state: { conta: {}, tipo: 0, to: 'contasreceber' }
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faPlus} />
                                                        </Link>
                                                    </div>


                                                    <div className='iconelixo giveMargin' type='button' >
                                                        <Link to=
                                                            {{
                                                                pathname: `/financeiro/addconta/${feed.Chave}`,
                                                                state: { conta: { ...feed }, to: 'contasreceber' }
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faPen} />
                                                        </Link>
                                                    </div>

                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'CONTAS_ABERTAS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&
                                                        <div type='button' className='iconelixo' onClick={(a) => this.deleteConta(feed.Chave, feed.pessoaNome)} >
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

export default connect(mapStateToProps, null)(ContasReceber)