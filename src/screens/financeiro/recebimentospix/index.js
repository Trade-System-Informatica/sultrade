import React, { Component } from 'react'
import './styles.css'
import { apiEmployee } from '../../../services/apiamrg'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import Skeleton from '../../../components/skeleton'
import { Link, useHistory, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import axios from 'axios';
import {
    API_BANCO,
    API_BANCO_BOL_GET,
    API_BANCO_PIX
} from '../../../config'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faCoffee, faTrashAlt, faPen, faPlus, faChevronUp, faChevronDown, faDollarSign } from '@fortawesome/free-solid-svg-icons'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
import moment from 'moment'
import Select from 'react-select';
import loader from '../../../classes/loader'

const estadoInicial = {
    name: '',
    contas: [],
    bancos: [],
    transacoes: [],
    dadosPagamento: [],
    tokenBB: '',


    vencimentoInicial: '',
    vencimentoFinal: '',
    lancamentoInicial: '',
    lancamentoFinal: '',
    total: '',
    pessoa: '',
    banco: '',
    status: '-',
    codigoTransacao: '',

    lote: '',
    transacao: '',
    transacaoInicial: '',

    bancosOptions: [],
    bancosOptionsTexto: '',
    statuses: [
        { label: '-----', value: '-' },
        { label: 'Aguardando Envio', value: '1' },
        { label: 'Aguardando Retorno', value: '2' },
        { label: 'Pago', value: '3' }
    ],

    meiosPagamentos: [],

    pesquisa: "",

    mostraFiltros: true,

    loading: true,
    redirect: false,

    acessos: [],
    permissoes: [],
    acessosPermissoes: [],

    load: 100,

    errors: [],
}

class RecebimentosPix extends Component {

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        await this.loadAll();
    }

    loadAll = async () => {
        await this.setState({
            transacao: await loader.getUltimaTransacao(),
            transacaoInicial: await loader.getUltimaTransacao(),
            lote: await loader.getLote(),
            pessoas: await loader.getBase('getPessoas.php'),
            pessoasOptions: await loader.getBaseOptions('getPessoas.php', 'Nome', 'Chave'),
            meiosPagamentos: await loader.getBase('getMeiosPagamentos.php'),
            bancos: await loader.getBase('getBancos.php'),
            bancosOptions: await loader.getBaseOptions('getBancos.php', 'Titular', 'Chave'),
            acessos: await loader.getBase('getTiposAcessos.php'),
            permissoes: await loader.getBase('getPermissoes.php'),
            bbCodigos: await loader.getBase('getCodigosBB.php'),

            vencimentoInicial: moment('1900-01-01').format('YYYY-MM-DD'),
            vencimentoFinal: moment('2100-12-31').format('YYYY-MM-DD'),

            lancamentoInicial: moment('1900-01-01').format('YYYY-MM-DD'),
            lancamentoFinal: moment('2100-12-31').format('YYYY-MM-DD')

        });

        await this.getTransacoesRecebidas()

        await this.setState({
            acessosPermissoes: await loader.testaAcesso(this.state.acessos, this.state.permissoes, this.state.usuarioLogado),
            bbGet: this.state.bbCodigos.filter((e) => e.tipo == 'get'),
            bbErr: this.state.bbCodigos.filter((e) => e.tipo == 'erro'),
            bbTrc: this.state.bbCodigos.filter((e) => e.tipo == 'trc'),
            loading: false
        })

        await this.getContasAbertas();
    }

    getTransacoesRecebidas = async () => {
        const transacoes = await loader.getBase(`getTransacoesRecebidas.php`, this.state.usuarioLogado.empresa);

        if (transacoes.find((e) => e.meioPagamento == "PIX")) {
            await this.setState({ transacoes: transacoes.filter((e) => e.meioPagamento == "PIX") });
        } else {
            await this.setState({ transacoes: [] });
        }
    }

    getContasAbertas = async () => {
        await apiEmployee.post(`getContasAbertas.php`, {
            token: true,
            empresa: this.state.usuarioLogado.empresa
        }).then(
            async res => {
                const contasFiltradas = res.data.filter((e) => e.meio_pagamento != "0" && e.meio_pagamento && e.meioPagamento == "PIX" && e.Tipo == 0);
                const contas = [];

                for (let i = 0; i < contasFiltradas.length; i++) {
                    let e = contasFiltradas[i]

                    contas.push({
                        ...e,
                        check: false,
                        pos: i,
                        error: this.state.errors.filter((el) => el.conta == e.Chave).map((el) => (el.mensagem)),
                        status: e.status,
                        statusId: e.statusId,
                        transacao: e.transacao,
                        existe: e.transacao ? true : false
                    })
                }
                await this.setState({ contas });
            },
            err => { this.erroApi(err) }

        )
    }

    checkConta = async (index) => {
        let conta = this.state.contas;

        if (index == 'all') {
            let contaFiltrada = conta.filter(this.filtrarPesquisa).splice(0, this.state.load);

            conta = conta.map((e) => {
                if (contaFiltrada.find((el) => e.Chave == el.Chave)) {
                    return ({ ...e, check: true });
                } else {
                    return ({ ...e, check: false });
                }
            })
            return this.setState({ contas: conta });
        }

        conta = conta.map((e) => {
            if (e.Chave == index) {
                return ({ ...e, check: !e.check })
            } else {
                return ({ ...e, check: e.check })
            }
        })

        this.setState({ contas: conta });
    }

    enviarLote = async (conta) => {
        await this.setState({ loading: true });
        const dados = [];

        conta.transacao = this.state.transacao;
        await this.setState({ transacao: parseInt(this.state.transacao) + 1 })

        if (conta.meioPagamento) {
            await apiEmployee.post(`receberPix.php`, {
                token: true,
                pessoa: conta.Pessoa,
                url: `${API_BANCO}${API_BANCO_PIX}`,
                conta,
                empresa: this.state.usuarioLogado.empresa,
                lote: this.state.lote,
            }).then(
                async res => {
                    console.log(res.data);
                    return;
                },
                err => { this.erroApi(err) }
            )
        }
        await this.setState({ dadosPagamento: dados })
        await this.setState({ loading: false, lote: parseInt(this.state.lote) + 1 });
    }

    consultarLote = async () => {
        await this.setState({ loading: true });
        const contas = this.state.contas.filter((e) => this.filtrarPesquisa && e.check).splice(0, this.state.load);
        const dados = [];

        for (let i = 0; i < contas.length; i++) {
            let e = contas[i];

            if (e.meioPagamento == 'PIX') {
                await apiEmployee.post(`getContatos.php`, {
                    token: true,
                    pessoa: e.Pessoa
                }).then(
                    async res => {
                        dados.push({
                            dadosBase: {
                                chave: e.Chave,
                                data: e.data_hora_envio,
                                transacao_chave: e.transacao_chave,
                                valor: e.Valor,
                                saldo: e.Saldo,
                                cpf: e.pessoaCPF,
                                transacao: e.transacao,
                                existe: e.existe,
                                status: e.status,
                                meio: e.meioPagamento,
                            },

                            id: e.transacao,
                        })
                    },
                    err => { this.erroApi(err) }
                )
            }

            await this.setState({ dadosPagamento: dados })

            this.consultaApi(this.state.dadosPagamento);
        }
    }

    consultaApi = async (dados) => {
        const status = [];

        for (let i = 0; i < dados.length; i++) {
            let e = dados[i];

            if (!e.dadosBase.error) {
                if (e.dadosBase.meio == 'PIX') {
                    await axios.get(`${API_BANCO}${API_BANCO_BOL_GET}${e.id}/solicitacao${this.state.informacoesBancarias.chave_api}`, {
                        headers: {
                            'Authorization': `Bearer ${this.state.tokenBB}`
                        }
                    }).then(
                        async res => {
                            status.push({
                                conta: e.dadosBase.chave,
                                transacao_chave: e.dadosBase.transacao_chave,
                                transacao: e.dadosBase.transacao,
                                existe: e.dadosBase.existe,
                                valor: e.dadosBase.valor,
                                saldo: e.dadosBase.saldo,
                                status: this.state.bbGet.find((e) => e.codigo == res.data.estadoRequisicao).mensagem,
                                statusId: this.state.bbGet.find((e) => e.codigo == res.data.estadoRequisicao).status,
                                errors: res.data.lancamentos[0].erros[0] ? res.data.lancamentos[0].erros.map((e) => this.state.bbErr.find((el) => e == el.codigo) ? this.state.bbErr.find((el) => e == el.codigo).mensagem : `[Erro desconhecido ${e}]`) : ''
                            })
                        },
                        err => {
                            status.push({
                                conta: e.dadosBase.chave,
                                transacao_chave: e.dadosBase.transacao_chave,
                                transacao: e.dadosBase.transacao,
                                existe: e.dadosBase.existe,
                                valor: e.dadosBase.valor,
                                saldo: e.dadosBase.saldo,
                                status: false,
                                error: err.message.includes('40') ? "Erro no sistema" : err.message.includes('50') ? "Erro no servidor" : 'Erro desconhecido'

                            })
                        }
                    )
                } else {
                    status.push({
                        conta: e.dadosBase.chave,
                        valor: e.dadosBase.valor,
                        saldo: e.dadosBase.saldo,
                        transacao: e.transacao,
                        status: false,
                        error: e.dadosBase.error
                    })
                }
            }

            const errors = [];

            status.map(async (e) => {
                if (!e.status) {
                    errors.push({ conta: e.conta, mensagem: e.error ? e.error : "Erro desconhecido, tente novamente" });
                }
                await apiEmployee.post(`pagarConta.php`, {
                    token: true,
                    chave: e.conta,
                    status: e.status === false ? e.error : `${e.status} ${e.errors[0] ? e.errors.join(' ') : ''}`,
                    transacao: e.transacao,
                    valor: e.statusId != 3 ? 0 : e.valor,
                    data_pagto: moment().format('YYYY-MM-DD'),
                    saldo: e.saldo,
                    id_status: e.statusId
                }).then(
                    async res => {
                        if (res.data[0]) {
                            if (e.statusId == 3) {
                                await loader.salvaLogs(
                                    'contas_aberto',
                                    this.state.usuarioLogado.codigo,
                                    null,
                                    "Saldo (de)" + (e.valor) + " (para)" + (parseFloat(e.saldo) - parseFloat(e.valor)) + "; Data_Pagto " + moment().format('YYYY-MM-DD') + "; Valor_Pago " + e.valor + ";",
                                    e.conta);
                            }

                            await loader.salvaLogs(
                                'transacoes',
                                this.state.usuarioLogado.codigo,
                                null,
                                "status " + (e.status === false ? e.error : `${e.status} ${e.errors[0] ? e.errors.join(' ') : ''}`) + "; id_status " + (e.statusId ? e.statusId : 0),
                                res.data[0].chave
                            );

                        } else {
                            console.log(JSON.stringify(res))
                        }
                    },
                    async err => {
                        alert(JSON.stringify(err))
                    }
                )
                await this.setState({ errors })
                await this.getContasAbertas();
            })

            await this.setState({ loading: false });
        }
    }



    erroApi = async (err) => {
        alert(err)
    }

    filtrarPesquisa = (conta) => {
        if (this.state.banco && conta.contaCorrente != this.state.banco) {
            return false;
        }

        if (this.state.vencimentoInicial && !moment(conta.Vencimento).isAfter(this.state.vencimentoInicial)) {
            return false;
        }

        if (this.state.vencimentoFinal && !moment(conta.Vencimento).isBefore(this.state.vencimentoFinal)) {
            return false;
        }

        if (this.state.lancamentoInicial && !moment(conta.Vencimento).isAfter(this.state.lancamentoInicial)) {
            return false;
        }

        if (this.state.lancamentoFinal && !moment(conta.Vencimento).isBefore(this.state.lancamentoFinal)) {
            return false;
        }

        if (this.state.status && conta.statusId != this.state.status) {
            if (this.state.status != '-' && ((conta.statusId == 0 && this.state.status != 3) || (!conta.statusId && this.state.status == 1))) {

            } else {
                return false;
            }
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
                                <Header voltarFinanceiro titulo="Recebimentos por Pix" />


                                <br />
                            </section>

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
                                                <label>Banco:</label>
                                            </div>
                                            <div className='col-1 errorMessage'>
                                            </div>
                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                <Select className='SearchSelect' options={this.state.bancosOptions.filter(e => this.filterSearch(e, this.state.bancosOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ bancosOptionsTexto: e }) }} value={this.state.bancosOptions.filter(option => option.value == this.state.banco)[0]} search={true} onChange={(e) => { this.setState({ banco: e.value, }) }} />
                                            </div>
                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12">
                                                <label>Situação:</label>
                                            </div>
                                            <div className='col-1 errorMessage'>
                                            </div>
                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                <Select className='SearchSelect' options={this.state.statuses} value={this.state.statuses.find(option => option.value == this.state.status)} search={true} onChange={async (e) => { await this.setState({ status: e.value }); if (e.value == 3) { await this.getTransacoesRecebidas() } }} />
                                            </div>
                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12">
                                                <label>Vencimento Inicial:</label>
                                            </div>
                                            <div className='col-1 errorMessage'>
                                            </div>
                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                <input className='form-control' type='date' value={this.state.vencimentoInicial} onChange={e => { this.setState({ vencimentoInicial: e.currentTarget.value }) }} />
                                            </div>
                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12">
                                                <label>Vencimento Final:</label>
                                            </div>
                                            <div className='col-1 errorMessage'>
                                            </div>
                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                <input className='form-control' type='date' value={this.state.vencimentoFinal} onChange={e => { this.setState({ vencimentoFinal: e.currentTarget.value }) }} />
                                            </div>
                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12">
                                                <label>Lancamento Inicial:</label>
                                            </div>
                                            <div className='col-1 errorMessage'>
                                            </div>
                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                <input className='form-control' type='date' value={this.state.lancamentoInicial} onChange={e => { this.setState({ lancamentoInicial: e.currentTarget.value }) }} />
                                            </div>
                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12">
                                                <label>Lancamento Final:</label>
                                            </div>
                                            <div className='col-1 errorMessage'>
                                            </div>
                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                <input className='form-control' type='date' value={this.state.lancamentoFinal} onChange={e => { this.setState({ lancamentoFinal: e.currentTarget.value }) }} />
                                            </div>
                                        </div>
                                    }
                                    <div className="col-2 col-sm-2 col-md-3 col-lg-3 col-xl-3  text-right pesquisa mobileajuster1 ">
                                    </div>
                                    <div className="col-5 col-sm-5 col-md-6 col-lg-6 col-xl-6  text-right pesquisa mobileajuster1 ">
                                        {this.state.status == "2" &&
                                            <div>
                                                <button className="btn btn-success" style={{ padding: '10px', fontSize: '1.2em', borderRadius: '20px' }} onClick={() => this.consultarLote()}>Consultar</button>
                                            </div>
                                        }
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
                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                <span className="subtituloships">Chave</span>
                                            </div>
                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                <span className="subtituloships">Histórico</span>
                                            </div>
                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                <span className="subtituloships" style={{ overflowWrap: 'anywhere' }}>Vencimento</span>
                                            </div>
                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                <span className="subtituloships">Valor</span>
                                            </div>
                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-center">
                                                {this.state.contas[0] &&
                                                    <input type="checkbox" checked={false} onChange={() => this.checkConta('all')} />
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                            </div>

                            <div id="product-list">
                                {this.state.status != 3 &&
                                    <>
                                        {this.state.contas[0] != undefined && this.state.contas.filter(this.filtrarPesquisa).splice(0, this.state.load).map((feed, index) => (
                                            <>
                                                <div key={feed.Chave} className="row row-list">
                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                                    <div className={index % 2 == 0 ? "col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags par" : "col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags itemLista impar"}>
                                                        <div className="row deleteMargin alignCenter">
                                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left" style={{ overflowWrap: 'anywhere' }}>
                                                                <p>{feed.Chave}</p>
                                                            </div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                                <Link to=
                                                                    {{
                                                                        pathname: `/financeiro/addconta/${feed.Chave}`,
                                                                        state: { conta: { ...feed }, to: 'recebimentospix' }
                                                                    }}
                                                                >
                                                                    <p>{feed.Historico}</p>
                                                                </Link>
                                                            </div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                                <p>{moment(feed.Vencimento).format('DD/MM/YYYY')}</p>
                                                            </div>
                                                            <div style={{ overflowWrap: 'anywhere' }} className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                                <p>R$ {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(feed.Valor)}</p>
                                                            </div>
                                                            <div className="col-lg-2 col-md-2 col-sm-2 col-2  text-left  mobileajuster4 icones">
                                                                <FontAwesomeIcon style={{cursor: "pointer"}} title="Receber" icon={faDollarSign} onClick={() => { this.enviarLote(feed) }} />
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
                                    </>
                                }
                                {this.state.status == 3 &&
                                    <>
                                        {this.state.transacoes[0] != undefined && this.state.transacoes.filter(this.filtrarPesquisa).splice(0, this.state.load).map((feed, index) => (
                                            <>
                                                <div key={feed.Chave} className="row row-list">
                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                                    <div className={index % 2 == 0 ? "col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags par" : "col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags itemLista impar"}>
                                                        <div className="row deleteMargin alignCenter">
                                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left" style={{ overflowWrap: 'anywhere' }}>
                                                                <p>{feed.Chave}</p>
                                                            </div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                                <Link to=
                                                                    {{
                                                                        pathname: `/financeiro/addconta/${feed.Chave}`,
                                                                        state: { conta: { ...feed }, to: 'recebimentospix' }
                                                                    }}
                                                                >
                                                                    <p>{feed.Historico}</p>
                                                                </Link>
                                                            </div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-left">
                                                                <p>{moment(feed.Vencimento).format('DD/MM/YYYY')}</p>
                                                            </div>
                                                            <div style={{ overflowWrap: 'anywhere' }} className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-left">
                                                                <p>R$ {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(feed.Valor)}</p>
                                                            </div>
                                                            <div className="col-lg-2 col-md-2 col-sm-2 col-2  text-left  mobileajuster4 icones">
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
                                    </>
                                }
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

export default connect(mapStateToProps, null)(RecebimentosPix)
