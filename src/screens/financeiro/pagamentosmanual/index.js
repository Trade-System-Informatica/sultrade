import React, { Component } from 'react'
import './styles.css'
import { apiEmployee } from '../../../services/apiamrg'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import Skeleton from '../../../components/skeleton'
import { Formik, Field, Form } from 'formik'
import { Link, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import 'react-confirm-alert/src/react-confirm-alert.css'
import moment from 'moment'
import Select from 'react-select';
import Modal from '@mui/material/Modal'
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
        { label: 'Pago', value: '3' }
    ],

    meiosPagamentos: [],

    pesquisa: "",

    mostraFiltros: true,
    modalAberto: false,

    historico: '',
    chave: 0,
    valor: '',
    dataPagamento: moment().format('YYYY-MM-DD'),
    desconto: '',

    loading: true,
    redirect: false,

    acessos: [],
    permissoes: [],
    acessosPermissoes: [],

    load: 100,

    errors: [],
}

class PagamentosManual extends Component {

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

            vencimentoInicial: moment('1900-01-01').format('YYYY-MM-DD'),
            vencimentoFinal: moment('2100-12-31').format('YYYY-MM-DD'),

            lancamentoInicial: moment('1900-01-01').format('YYYY-MM-DD'),
            lancamentoFinal: moment('2100-12-31').format('YYYY-MM-DD')

        });

        await this.setState({
            acessosPermissoes: await loader.testaAcesso(this.state.acessos, this.state.permissoes, this.state.usuarioLogado),
            loading: false
        })

        await this.getContasAbertas();
    }

    getTransacoesPagas = async () => {
        const transacoes = await loader.getBase(`getTransacoesPagas.php`, this.state.usuarioLogado.empresa);

        if (transacoes.find((e) => !e.meioPagamento)) {
            await this.setState({ transacoes: transacoes.filter((e) => !e.meioPagamento) });
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
                const contasFiltradas = res.data.filter((e) => e.meio_pagamento != "0" && e.meio_pagamento && !e.meioPagamento && e.Tipo == 1);
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

    erroApi = async (err) => {
        alert(err)
    }

    pagarConta = async (validForm) => {
        if (!validForm) {
            return;
        }

        this.setState({
            bloqueado: true,
            loading: true,
            lote: await loader.getLote()
        });

        await apiEmployee.post(`pagarManual.php`, {
            token: true,
            chave: this.state.chave,
            values: `'${moment().format('YYYY-MM-DD')}', '${this.state.lote}', '0', '${this.state.chave}', 'Pagamento efetuado', 3`,
            saldo: this.state.saldo,
            valor: parseFloat(this.state.valor.replaceAll('.', '').replaceAll(',', '.')) + parseFloat(this.state.desconto.replaceAll('.', '').replaceAll(',', '.')),
            data: moment().format('YYYY-MM-DD'),
            data_pagto: this.state.dataPagamento
        }).then(
            async res => {
                if (res.data[0]) {
                    await loader.salvaLogs(
                        'contas_aberto',
                        this.state.usuarioLogado.codigo,
                        null,
                        "Saldo (de)" + (this.state.saldo) + " (para)" + (parseFloat(this.state.saldo) - (parseFloat(this.state.valor.replaceAll('.', '').replaceAll(',', '.')) + parseFloat(this.state.desconto.replaceAll('.', '').replaceAll(',', '.')))) + "; Data_Pagto " + moment().format('YYYY-MM-DD') + "; Valor_Pago " + parseFloat(this.state.valor.replaceAll('.', '').replaceAll(',', '.')) + parseFloat(this.state.desconto.replaceAll('.', '').replaceAll(',', '.')) + ";",
                        this.state.chave);

                    await loader.salvaLogs(
                        'transacoes',
                        this.state.usuarioLogado.codigo,
                        null,
                        "Inclusão",
                        res.data[0].chave
                    );


                    await this.getContasAbertas();
                    await this.setState({ loading: false })
                } else {
                    console.log(res.data)
                }
            },
            async res => await console.log(`Erro: ${res.data}`)
        )
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
        const validations = [];
        validations.push(this.state.valor && this.state.valor.replaceAll('.', '').replaceAll(',', '.') == parseFloat(this.state.valor.replaceAll('.', '').replaceAll(',', '.')));
        validations.push(this.state.desconto || parseFloat(this.state.valor.replaceAll('.', '').replaceAll(',', '.')) > 0);
        validations.push(this.state.desconto || parseFloat(this.state.valor.replaceAll('.', '').replaceAll(',', '.')) <= this.state.saldo);
        validations.push(!this.state.desconto || this.state.desconto.replaceAll('.', '').replaceAll(',', '.') == parseFloat(this.state.desconto.replaceAll('.', '').replaceAll(',', '.')));
        validations.push(!this.state.desconto || parseFloat(this.state.desconto.replaceAll('.', '').replaceAll(',', '.')) + parseFloat(this.state.valor.replaceAll('.', '').replaceAll(',', '.')) <= this.state.saldo);
        validations.push(!this.state.desconto || parseFloat(this.state.desconto.replaceAll('.', '').replaceAll(',', '.')) + parseFloat(this.state.valor.replaceAll('.', '').replaceAll(',', '.')) > 0);
        validations.push(this.state.dataPagamento);
        validations.push(!this.state.bloqueado);

        const validForm = validations.reduce((t, a) => t && a)

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
                                <Header voltarFinanceiro titulo="Pagamentos Manual" />
                                <br />
                            </section>

                            <Modal
                                aria-labelledby="transition-modal-title"
                                aria-describedby="transition-modal-description"
                                style={{ display: 'flex', justifyContent: 'center', paddingTop: '5%', paddingBottom: '5%', overflow: 'scroll' }}
                                open={this.state.modalAberto}
                                onClose={async () => await this.setState({ modalAberto: false })}
                            >
                                <div className='modalContainer'>
                                    <div className='modalCriar'>
                                        <div className='containersairlistprodmodal'>
                                            <div className='botaoSairModal' onClick={async () => await this.setState({ modalAberto: false, documentoTrocar: true })}>
                                                <span>X</span>
                                            </div>
                                        </div>
                                        <div className='modalContent'>
                                            <div className='tituloModal'>
                                                <span>Pagar {this.state.historico}:</span>
                                            </div>
                                            <div className='tituloModal'>
                                                <span>Saldo: R${new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.state.saldo)}</span>
                                            </div>


                                            <div className='modalForm'>
                                                <Formik
                                                    initialValues={{
                                                        name: '',
                                                    }}
                                                    onSubmit={async values => {
                                                        await new Promise(r => setTimeout(r, 1000))
                                                        await this.pagarConta(validForm);

                                                    }}
                                                >
                                                    <Form className="contact-form" >

                                                        <div className="row">

                                                            <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 ">

                                                                <div className="row addservicos">
                                                                    <div className={"col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel"}>
                                                                        <label>Valor</label>
                                                                    </div>
                                                                    <div className="col-1 errorMessage">
                                                                        {(!this.state.desconto && parseFloat(this.state.valor.replaceAll('.', '').replaceAll(',', '.')) > this.state.saldo) &&
                                                                            <FontAwesomeIcon title='O valor é superior ao saldo' icon={faExclamationTriangle} />
                                                                        }
                                                                        {(!this.state.desconto && parseFloat(this.state.valor.replaceAll('.', '').replaceAll(',', '.')) <= 0) &&
                                                                            <FontAwesomeIcon title='O valor é inferior a zero' icon={faExclamationTriangle} />
                                                                        }
                                                                        {!this.state.valor &&
                                                                            <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                        }
                                                                    </div>
                                                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                        <Field className="form-control text-right" type="text" value={this.state.valor} onClick={(e) => e.target.select()} onChange={async e => { this.setState({ valor: e.currentTarget.value }) }} onBlur={async e => { this.setState({ valor: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR').format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
                                                                    </div>
                                                                    <div className="col-1"></div>
                                                                    <div className={"col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel"}>
                                                                        <label>Data de pagamento</label>
                                                                    </div>
                                                                    <div className="col-1 errorMessage">
                                                                        {!this.state.dataPagamento &&
                                                                            <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                        }
                                                                    </div>
                                                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                        <Field className="form-control" type="date" value={this.state.dataPagamento} onChange={async e => { this.setState({ dataPagamento: e.currentTarget.value }) }} />
                                                                    </div>
                                                                    <div className="col-1"></div>
                                                                    <div className={"col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel"}>
                                                                        <label>Juros/Desconto</label>
                                                                    </div>
                                                                    <div className="col-1 errorMessage">
                                                                        {(this.state.desconto && parseFloat(this.state.desconto.replaceAll('.', '').replaceAll(',', '.')) + parseFloat(this.state.valor.replaceAll('.', '').replaceAll(',', '.')) > this.state.saldo) &&
                                                                            <FontAwesomeIcon title='A soma com o valor é superior ao saldo' icon={faExclamationTriangle} />
                                                                        }
                                                                        {(this.state.desconto && parseFloat(this.state.desconto.replaceAll('.', '').replaceAll(',', '.')) + parseFloat(this.state.valor.replaceAll('.', '').replaceAll(',', '.')) <= 0) &&
                                                                            <FontAwesomeIcon title='A soma com o valor é inferior a zero' icon={faExclamationTriangle} />
                                                                        }

                                                                    </div>
                                                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                        <Field className="form-control text-right" type="text" value={this.state.desconto} onClick={(e) => e.target.select()} onChange={async e => { this.setState({ desconto: e.currentTarget.value }) }} onBlur={async e => { this.setState({ desconto: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR').format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
                                                                    </div>
                                                                    <div className="col-1"></div>
                                                                </div>
                                                            </div>
                                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                                        </div>

                                                        <div className="row">
                                                            <div className="col-2"></div>
                                                            <div className="col-8" style={{ display: 'flex', justifyContent: 'center' }}>
                                                                <button type="submit" disabled={!validForm} style={validForm ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }}  >Enviar</button>
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
                                                <Select className='SearchSelect' options={this.state.statuses} value={this.state.statuses.find(option => option.value == this.state.status)} search={true} onChange={async (e) => { await this.setState({ status: e.value }); if (e.value == 3) { await this.getTransacoesPagas() } }}/>
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
                                            <div className="col-4 text-left">
                                                <span className="subtituloships">Histórico</span>
                                            </div>
                                            <div className="col-3 text-left">
                                                <span className="subtituloships" style={{ overflowWrap: 'anywhere' }}>Vencimento</span>
                                            </div>
                                            <div className="col-3 text-left">
                                                <span className="subtituloships">Valor</span>
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
                                                    <div className={index % 2 == 0 ? "col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags par lightHover" : "col-lg-8 col-md-8 col-sm-12 col-12 mix all dresses bags itemLista impar darkHover"}>
                                                        <div className="row deleteMargin alignCenter" onClick={async () => this.setState({ modalAberto: true, chave: feed.Chave, historico: feed.Historico, saldo: feed.Saldo })}>
                                                            <div className="col-2 text-left" style={{ overflowWrap: 'anywhere' }}>
                                                                <p>{feed.Chave}</p>
                                                            </div>
                                                            <div className="col-4 text-left">
                                                                <Link to=
                                                                    {{
                                                                        pathname: `/financeiro/addconta/${feed.Chave}`,
                                                                        state: { conta: { ...feed }, to: 'pagamentoslote' }
                                                                    }}
                                                                >
                                                                    <p>{feed.Historico}</p>
                                                                </Link>
                                                            </div>
                                                            <div className="col-3 text-left">
                                                                <p>{moment(feed.Vencimento).format('DD/MM/YYYY')}</p>
                                                            </div>
                                                            <div style={{ overflowWrap: 'anywhere' }} className="col-3 text-left">
                                                                <p>R$ {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(feed.Valor)}</p>
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
                                                                        state: { conta: { ...feed }, to: 'pagamentoslote' }
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

export default connect(mapStateToProps, null)(PagamentosManual)