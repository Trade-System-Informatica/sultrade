import React, { Component } from 'react'
import './styles.css'
import { apiEmployee } from '../../../services/apiamrg'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import Skeleton from '../../../components/skeleton'
import loader from '../../../classes/loader'
import AddButton from '../../../components/addButton'
import { Link, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { NOME_EMPRESA } from '../../../config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faPen, faPlus, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
import moment from 'moment'
import TableList from '../../../components/tableList'


const estadoInicial = {
    name: '',
    lancamentos: [],
    pesquisa: "",
    tipoPesquisa: 1,
    pessoas: '',
    deleteLancamento: false,
    tipo: 0,

    loading: true,
    redirect: false,

    acessos: [],
    permissoes: [],
    acessosPermissoes: [],
    direcaoTabela: faChevronDown,

    load: 100
}

class Lancamentos extends Component {

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
            if (e.acessoAcao == "LANCAMENTOS" && e.permissaoConsulta == 0) {
                this.setState({ redirect: true })
            }
        })
    }

    componentDidUpdate = async (prevProps, prevState) => {
        if (this.state.deleteConta && this.state.modalItemAberto != prevState.modalItemAberto) {
            await this.setState({
                modalItemAberto: false,
                deleteLancamentos: false
            })
        }
    }

    loadAll = async () => {
        await this.setState({
            lancamentos: await loader.getBase('getLancamentos.php'),
            acessos: await loader.getBase('getTiposAcessos.php'),
            permissoes: await loader.getBase('getPermissoes.php'),
            lotes: await loader.getBase('getLancamentosLotes.php')
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
                const lancamentos = this.state.lancamentos.map((e) => {
                    pessoa = this.state.pessoas.find((el) => el.Chave == e.Pessoa);
                    if (pessoa) {
                        return (
                            { ...e, pessoaNome: pessoa.Nome }
                        )
                    } else {
                        return (
                            { ...e, pessoaNome: '' }
                        )
                    }
                })

                await this.setState({ lancamentos })

            },
            response => { this.erroApi(response) }
        )
    }

    erroApi = async (res) => {
        alert(res)
        await this.setState({ redirect: true })
    }

    deleteLancamento = async (chave, nome) => {
        this.setState({ deleteLancamento: true })
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja remover a lancamento? </p>
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
                                    await apiEmployee.post(`deleteLancamento.php`, {
                                        token: true,
                                        chave: chave
                                    }).then(
                                        async response => {
                                            if (response.data == true) {
                                                await loader.salvaLogs('lancamentos', this.state.usuarioLogado.codigo, null, "Exclusão", chave);

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

    deleteLote = async (lote) => {
        this.setState({ deleteLancamento: true })
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja remover esse lote inteiro? </p>
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
                                    await apiEmployee.post(`deleteLancamentoLote.php`, {
                                        token: true,
                                        lote
                                    }).then(
                                        async response => {
                                            if (response.data == true) {
                                                await loader.salvaLogs('lancamentos', this.state.usuarioLogado.codigo, null, "Exclusão por lote", lote);

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
        const lancamentos = this.state.lancamentos.reverse();
        const lotes = this.state.lotes.reverse();

        if (this.state.direcaoTabela == faChevronDown) {
            await this.setState({ direcaoTabela: faChevronUp });
        } else {
            await this.setState({ direcaoTabela: faChevronDown });
        }

        await this.setState({ lancamentos, lotes, loading: false });
    }

    filtrarPesquisa = (item) => {
        if (this.state.pesquisa === "") {
            return true;
        }

        if (item.Historico && this.state.tipoPesquisa == 1) {
            return item.Historico.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (item.Valor && this.state.tipoPesquisa == 2) {
            return item.Valor.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (item.Chave && this.state.tipoPesquisa == 3) {
            return item.Chave.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (item.Lote && this.state.tipoPesquisa == 5) {
            return item.Lote.toLowerCase().includes(this.state.pesquisa.toLowerCase())
        } else if (this.state.tipoPesquisa == 4) {
            return moment(item.Vencimento).format('DD/MM/YYYY').includes(this.state.pesquisa.toLowerCase())
        }

    }

    returnEditLink = (index, tipo) => {

        if (tipo == "chave") {
            const item = this.state.lancamentos.filter(this.filtrarPesquisa).splice(0, this.state.load)[index];
            return {
                pathname: `/financeiro/addlancamento/${item.Lote}`,
                state: { lancamento: { ...item }, tipo: "lote" }
            }
        } else if (tipo == "lote") {
            const item = this.state.lotes.filter(this.filtrarPesquisa).splice(0, this.state.load)[index];
            return {
                pathname: `/financeiro/addlancamento/${item.Lote}`,
                state: { lancamento: { ...item }, tipo: "lote" }
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
                                <Header voltarFinanceiroTabelas titulo="Lancamentos" />


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
                                                <option value={1}>Histórico</option>
                                                <option value={2}>Valor</option>
                                                <option value={3}>Chave</option>
                                                <option value={4}>Data</option>
                                                <option value={5}>Lote</option>
                                            </select>
                                            <input className="form-control campoPesquisa col-7 col-sm-6 col-md-6 col-lg-5 col-xl-5" placeholder="Pesquise aqui..." value={this.state.pesquisa} onChange={e => { this.setState({ pesquisa: e.currentTarget.value }) }} />
                                            <Link to={{ pathname: `/financeiro/exportarlancamentos` }}><button className="btn btn-success">Exportar</button></Link>
                                            <div style={{ marginLeft: 15 }}>
                                                <Link to={{
                                                    pathname: `/financeiro/addlancamento/0`,
                                                    state: { lancamento: {} }
                                                }}><button className="btn btn-success">+</button></Link>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='col-1 col-sm-2 col-md-2 col-lg-4 col-xl-4'>

                                    </div>
                                    <div className='col-5 col-sm-2 col-md-2 col-lg-2 col-xl-2'>
                                        <label style={{ fontSize: '1.1em', marginTop: 3, fontWeight: 'bold' }}>Procurar: </label>
                                    </div>
                                    <div className='col-5 col-sm-3 col-md-2 col-lg-2 col-xl-2'>
                                        <select className='form-control' value={this.state.tipo} onChange={(e) => { this.setState({ tipo: e.currentTarget.value }) }}>
                                            <option value={0}>Por Chave</option>
                                            <option value={1}>Por Lote</option>
                                        </select>
                                    </div>
                                    <div className="col-0 col-sm-0 col-md-3 col-lg-3 col-xl-3"></div>
                                    <div>
                                    </div>

                                </div>
                            </div>

                            <AddButton addLink={{
                                pathname: `/financeiro/addlancamento/0`,
                                state: { lancamento: {} }
                            }} />


                            {this.state.tipo == 0 &&
                                <TableList
                                    list={this.state.lancamentos.filter(this.filtrarPesquisa).splice(0, this.state.load)}
                                    items={[
                                        { title: "Chave", size: 2, field: "Chave", type: "key" },
                                        { title: "Lote", size: 2, field: "Lote", type: "text" },
                                        { title: "Histórico", size: 3, field: "Historico", type: "title" },
                                        { title: "Conta Débito", size: 4, field: "conta_Debito", type: "text" },
                                        { title: "Conta Crédito", size: 4, field: "conta_Credito", type: "text" },
                                        { title: "Data", size: 3, field: "Vencimento", type: "date" },
                                        { title: "Valor", size: 2, field: "Valor", type: "money", moneySymbol: "R$" },
                                    ]}
                                    addLink={() => {
                                        return {
                                            pathname: `/financeiro/addlancamento/0`,
                                            state: { lancamento: {} }
                                        }
                                    }}
                                    editLink={(index) => this.returnEditLink(index, "chave")}
                                    deleteFunction={(chave, nome) => this.deleteLancamento(chave, nome)}
                                    revertFunction={() => this.reverterItens()}
                                    permissions={{
                                        delete: this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'LANCAMENTOS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1,
                                        add: this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'LANCAMENTOS') { return e } }).map((e) => e.permissaoInsere)[0] == 1,
                                        edit: this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'LANCAMENTOS') { return e } }).map((e) => e.permissaoAltera)[0] == 1
                                    }}
                                    direction={this.state.direcaoTabela}
                                    focus={this.state.chaveFocus}
                                />
                            }
                            {this.state.tipo == 1 &&
                                <TableList
                                    list={this.state.lotes.filter(this.filtrarPesquisa).splice(0, this.state.load)}
                                    items={[
                                        { title: "Lote", size: 2, field: "Lote", type: "key" },
                                        { title: "Histórico", size: 3, field: "Historico", type: "title" },
                                        { title: "Data", size: 3, field: "Vencimento", type: "date" },
                                        { title: "Conta Débito", size: 4, field: "conta_Debito", type: "text" },
                                        { title: "Conta Crédito", size: 4, field: "conta_Credito", type: "text" },
                                        { title: "Valor", size: 2, field: "Valor", type: "money", moneySymbol: "R$" },
                                    ]}
                                    addLink={() => {
                                        return {
                                            pathname: `/financeiro/addlancamento/0`,
                                            state: { lancamento: {}, tipo: "lote" }
                                        }
                                    }}
                                    editLink={(index) => this.returnEditLink(index, "lote")}
                                    deleteFunction={(lote, nome) => this.deleteLote(lote, nome)}
                                    revertFunction={() => this.reverterItens()}
                                    permissions={{
                                        delete: this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'LANCAMENTOS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1,
                                        add: this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'LANCAMENTOS') { return e } }).map((e) => e.permissaoInsere)[0] == 1,
                                        edit: this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'LANCAMENTOS') { return e } }).map((e) => e.permissaoAltera)[0] == 1
                                    }}
                                    direction={this.state.direcaoTabela}
                                    focus={this.state.chaveFocus}
                                />
                            }

                            <div id="product-list">
                                {this.state.lancamentos.filter(this.filtrarPesquisa)[this.state.load] &&
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

export default connect(mapStateToProps, null)(Lancamentos)