import React, { Component } from 'react'
import './styles.css'
import ReactDOMServer from 'react-dom/server';
import { Formik, Field, Form } from 'formik'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import util from '../../../classes/util'
import { PRECISA_LOGAR } from '../../../config'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import Image from 'react-bootstrap/Image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { PDFExport, savePDF } from "@progress/kendo-react-pdf";
import { apiEmployee } from '../../../services/apiamrg'
import loader from '../../../classes/loader'
import moment from 'moment'
import Select from 'react-select';
import { Skeleton } from '@mui/material';
import Modal from '@material-ui/core/Modal';


const estadoInicial = {
    por: '',
    conta: '',
    centroCusto: '',
    pessoa: '',
    periodoInicial: moment().startOf('month').format('YYYY-MM-DD'),
    periodoFinal: moment().endOf('month').format('YYYY-MM-DD'),
    lancamentoInicial: moment('1900-1-1').format('YYYY-MM-DD'),
    lancamentoFinal: moment('2100-12-31').format('YYYY-MM-DD'),
    excluirTipos: false,
    tiposDocumentos: [],
    moeda: 6,

    moedasOptions: [],
    moedasOptionsTexto: "",

    categoria: '',

    porOptions: [],
    planosContas: [],
    planosContasOptions: [],
    planosContasOptionsTexto: '',
    centrosCustos: [],
    centrosCustosOptions: [],
    centrosCustosOptionsTexto: '',
    pessoas: [],
    pessoasOptions: [],
    pessoasOptionsTexto: '',
    tiposDocumentoOptions: [],

    bloqueado: false,

    relatorio: [],
    pdfgerado: [],
    pdfContent: [],

    pdfEmail: "",
    emails: [],
    failures: [],
    successes: [],
    emailModal: "",

}

class Relatorio extends Component {

    constructor(props) {
        super(props);
        this.pdfExportComponent = React.createRef(null);
    }

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        if (this.state.usuarioLogado.empresa != 0) {
            await this.setState({ empresa: this.state.usuarioLogado.empresa })
        }
        let porOptions = [];
        if (this.props.location.state.backTo) {
            if (this.props.location.state.backTo == 'contasPagas' || this.props.location.state.backTo == 'contasPagar') {
                porOptions.push({ label: "Por Fornecedor", value: 'porCliente' })
                this.setState({ categoria: '_1%' })
            } else {
                porOptions.push({ label: "Por Cliente", value: 'porCliente' })
                this.setState({ categoria: '1%' })
            }

            if (this.props.location.state.backTo == 'contasPagar' || this.props.location.state.backTo == 'contasReceber') {
                porOptions.push({ label: "Por Vencimento", value: 'porVencimento' });
                this.setState({ tipo: 'aberto' });
            } else {
                porOptions.push({ label: 'Por Data de Recebimento', value: 'porData' })
                this.setState({ tipo: 'liquidado' });
            }

            await this.setState({ porOptions })
        } else {
            this.setState({ redirect: true })
        }

        await this.getPlanosContas();
        await this.getCentrosCustos();
        await this.getPessoasCategorias();
        await this.getTiposDocumento();
        await this.loadAll();
    }

    loadAll = async () => {
        await this.setState({
            acessos: await loader.getBase('getTiposAcessos.php'),
            permissoes: await loader.getBase('getPermissoes.php'),
            moedasOptions: await loader.getBaseOptions("getMoedas.php", "Descricao", "Chave")
        })

        await this.setState({
            acessosPermissoes: await loader.testaAcesso(this.state.acessos, this.state.permissoes, this.state.usuarioLogado),
            loading: false,
        })
    }

    getPlanosContas = async () => {
        await apiEmployee.post(`getPlanosContasAnaliticas.php`, {
            token: true,
        }).then(
            async res => {
                await this.setState({ planosContas: res.data })

                const options = this.state.planosContas.map((e) =>
                    ({ label: e.Descricao, value: e.Chave })
                );

                await this.setState({ planosContasOptions: options })
            },
            async err => { this.erroApi(err) }
        )
    }

    getCentrosCustos = async () => {
        await apiEmployee.post(`getCentrosCustos.php`, {
            token: true,
        }).then(
            async res => {
                await this.setState({ centrosCustos: res.data })

                const options = this.state.centrosCustos.map((e) =>
                    ({ label: e.Descricao, value: e.Chave })
                );

                await this.setState({ centrosCustosOptions: options })
            },
            async err => { this.erroApi(err) }
        )
    }

    getPessoasCategorias = async () => {
        await apiEmployee.post(`getPessoasCategoria.php`, {
            token: true,
            categoria: this.state.categoria
        }).then(
            async res => {
                await this.setState({ pessoas: res.data })

                const options = this.state.pessoas.map((e) =>
                    ({ label: e.Nome, value: e.Chave })
                );

                await this.setState({ pessoasOptions: options })
            },
            async err => { this.erroApi(err) }
        )
    }

    getTiposDocumento = async () => {
        await apiEmployee.post(`getTiposLancamento.php`, {
            token: true,
        }).then(
            async res => {
                const tiposDocumentos = res.data.map((e) => (
                    { ...e, checked: false }
                ))

                await this.setState({ tiposDocumentoOptions: tiposDocumentos })
            },
            async err => { this.erroApi(err) }
        )
    }

    setTipoDocumento = async (chave, index) => {
        let filtro = '';
        let check = this.state.tiposDocumentoOptions;
        check[index].checked = !check[index].checked;


        await this.setState({ tiposDocumentoOptions: check })
        if (this.state.tiposDocumentos.includes(chave)) {
            filtro = this.state.tiposDocumentos.filter((e) => e != chave);
            await this.setState({ tiposDocumentos: filtro });
        } else {
            this.state.tiposDocumentos.push(chave);
        }
    }

    gerarRelatorio = async (validForm) => {
        this.setState({ loading: true });
        if (!validForm) {
            return;
        }
        const empresa = `contas_aberto.Empresa = ${this.state.empresa}`;
        const abertas = this.state.tipo == 'aberto' ? `contas_aberto.Saldo > 0` : `contas_aberto.Saldo = 0`;
        const conta = this.state.conta ? `contas_aberto.Conta_Contabil = '${this.state.conta}'` : '';
        const centroCusto = this.state.centroCusto ? `contas_aberto.Centro_Custo = '${this.state.centroCusto}'` : '';
        const pessoa = this.state.pessoa ? `contas_aberto.pessoa = '${this.state.pessoa}'` : '';
        const periodoInicial = this.state.periodoInicial ? this.state.tipo == 'aberto' ? `contas_aberto.vencimento >= '${moment(this.state.periodoInicial).format('YYYYMMDD')}'` : `contas_aberto.data_pagto >= '${moment(this.state.periodoInicial).format('YYYYMMDD')}'` : '';
        const periodoFinal = this.state.periodoFinal ? this.state.tipo == 'aberto' ? `contas_aberto.vencimento <= '${moment(this.state.periodoFinal).format('YYYYMMDD')}'` : `contas_aberto.data_pagto <= '${moment(this.state.periodoFinal).format('YYYYMMDD')}'` : '';
        const lancamentoInicial = this.state.lancamentoInicial ? `contas_aberto.lancto >= '${moment(this.state.lancamentoInicial).format('YYYYMMDD')}'` : '';
        const lancamentoFinal = this.state.lancamentoFinal ? `contas_aberto.lancto <= '${moment(this.state.lancamentoFinal).format('YYYYMMDD')}'` : '';
        const exclusao = (this.state.excluirTipos || this.state.tiposDocumentos[0]) ? 'NOT' : '';
        const tiposDocumento = this.state.tiposDocumentos[0] ? `contas_aberto.tipodocto ${exclusao} IN (${this.state.tiposDocumentos.join(',')})` : ``;

        let tipo_sub = 0;
        if (this.props.location.state.backTo) {
            if (this.props.location.state.backTo == 'contasPagas' || this.props.location.state.backTo == 'contasPagar') {
                tipo_sub = 0;
            } else {
                tipo_sub = 1;
            }
        }

        if (this.state.pessoa) {
            await apiEmployee.post(`getContatos.php`, {
                token: true,
                pessoa: this.state.pessoa
            }).then(
                async res => {
                    if (res.data[0]) {
                        const email = res.data.find((e) => e.Tipo == "EM").Campo1;

                        await this.setState({ emails: [email] });
                    }
                }
            )
        }

        let por = this.state.por;
        if (por == 'porCliente') {
            por = 'GROUP BY contas_aberto.pessoa';
        } else if (por == 'porVencimento') {
            por = 'GROUP BY contas_aberto.vencimento';
        } else if (por == 'porData') {
            por = 'GROUP BY contas_aberto.data_pagto';
        }

        let where = [empresa, abertas, conta, centroCusto, pessoa, periodoInicial, periodoFinal, lancamentoInicial, lancamentoFinal, tiposDocumento];
        where = where.filter((e) => e.trim() != "");

        await apiEmployee.post(`gerarRelatorioContas.php`, {
            token: true,
            where: where.join(' AND '),
            groupBy: por,
            tipo_sub
        }).then(
            async res => {
                await this.setState({ relatorio: res.data })
                this.relatorio();
            },
            async err => { this.erroApi(JSON.stringify(err)) }
        )
        this.setState({ loading: false });
    }

    enviarEmail = async (validFormEmail) => {
        await this.setState({ successes: [] });
        if (!validFormEmail) {
            return;
        }
        await this.setState({ emailBloqueado: true, loading: true });
        await apiEmployee.post(`enviaRelatorioEmail.php`, {
            token: true,
            emails: this.state.emails,
            mensagem: this.state.pdfEmail
        }).then(
            async res => {
                console.log(res);
                const { failures, successes } = res.data;

                await this.setState({ successes, failures, emails: [] });


                if (!failures[0]) {
                    await this.setState({ email: false });
                }

            },
            async res => await console.log(`Erro: ${JSON.stringify(res)}`)
        )
        await this.setState({ emailBloqueado: false, loading: false });
    }


    erroApi = async (res) => {
        alert(res);
    }

    filterSearch = (e, state) => {
        if (e == "") {
            return true
        }

        const text = state.toUpperCase();
        return (e.label.toUpperCase().includes(text))
    }

    relatorio = async () => {
        this.setState({ loading: true });
        const relatorio = this.state.relatorio;
        let map = [];
        let titulo = 'contas ';

        titulo += this.props.location.state.backTo == 'contasPagar' ? 'a pagar'
            : this.props.location.state.backTo == 'contasReceber' ? 'a receber'
                : this.props.location.state.backTo == 'contasPagas' ? 'pagas'
                    : 'recebidas';

        titulo += this.state.por == "porCliente" && (this.props.location.state.backTo == 'contasPagar' || this.props.location.backTo == 'contasPagas') ? ' por fornecedor'
            : this.state.por == "porCliente" ? ' por cliente'
                : this.state.por == "porVencimento" ? ' por vencimento'
                    : ' por Data de Pagamento;'

        titulo += this.state.periodoInicial ? ` - No período de ${moment(this.state.periodoInicial).format('DD/MM/YYYY')}`
            : this.state.periodoFinal ? ` - De um período até ${moment(this.state.periodoFinal).format('DD/MM/YYYY')}`
                : '';

        titulo += this.state.periodoFinal && this.state.periodoInicial ? ` a ${moment(this.state.periodoFinal).format('DD/MM/YYYY')}` : "";

        let totalFDA = 0;
        let totalDiscount = 0;
        let totalReceived = 0;
        let totalBalance = 0;

        let totalValor = 0;
        let totalSaldo = 0;

        let totalFDAPorGrupo = 0;
        let totalDiscountPorGrupo = 0;
        let totalReceivedPorGrupo = 0;
        let totalBalancePorGrupo = 0;

        let totalValorPorGrupo = 0;
        let totalSaldoPorGrupo = 0;

        let pdf =
            <div style={{ zoom: 1 }} key={546546554654}>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <img className="img-fluid" src="https://i.ibb.co/vmKJkx4/logo.png" alt="logo-Strade" border="0" style={{ width: '30%', height: '260px', maxWidth: "100%" }} />
                    {this.props.location.state.backTo == 'contasPagas' || this.props.location.state.backTo == 'contasPagar' &&
                        <h4>{titulo}</h4>
                    }
                    {this.props.location.state.backTo != 'contasPagas' && this.props.location.state.backTo != 'contasPagar' &&
                        <h3>
                            "SOA - Statement of Account"
                        </h3>
                    }
                </div>
                <hr />
                {this.props.location.state.backTo != 'contasPagas' && this.props.location.state.backTo != 'contasPagar' &&
                    <div className='pdfContent'>
                        {relatorio.map((e) => {
                            totalFDAPorGrupo = 0;
                            totalDiscountPorGrupo = 0;
                            totalReceivedPorGrupo = 0;
                            totalBalancePorGrupo = 0;

                            if (this.state.por == 'porCliente' && !e.pessoa) {
                                e.pessoa = '';
                            }
                            if (this.state.por == 'porVencimento' && !e.vencimento) {
                                e.vencimento = '';
                            }
                            if (this.state.por == 'porData' && !e.dataPagamento) {
                                e.dataPagamento = '';
                            }
                            map = this.state.por == "porCliente" ? e.pessoa.split('@.@') : this.state.por == "porVencimento" ? e.vencimento.split('@.@') : e.dataPagamento.split('@.@');
                            return (
                                <div>

                                    <table className='pdfTable'>
                                        <tr>
                                            <th>SHIP'S NAME</th>
                                            <th>PO</th>
                                            <th>PORT OF CALL</th>
                                            <th>SAILED</th>
                                            <th>FDA</th>
                                            <th>ROE</th>
                                            <th>DISCOUNT</th>
                                            <th>RECEIVED</th>
                                            <th>BALANCE</th>
                                        </tr>
                                        <tr style={{ backgroundColor: "#999999", border: "1px solid black" }}>
                                            <th colSpan={9}>
                                                <span style={{ fontSize: "1.2em" }}>{this.state.por == "porCliente" && e.pessoa ? e.pessoa.split('@.@')[0]
                                                    : this.state.por == "porVencimento" && e.vencimento ? moment(e.vencimento.split('@.@')[0]).format('DD/MM/YYYY')
                                                        : e.dataPagamento ? moment(e.dataPagamento.split('@.@')[0]).format('DD/MM/YYYY') : ''}</span>
                                            </th>
                                        </tr>
                                        {map.map((el, index) => {
                                            let FDA = 0;
                                            let discount = 0;
                                            let received = 0;

                                            if (e.os_moeda && this.state.moeda == e.os_moeda.split("@.@")[index]) {
                                                FDA = e.FDA ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(e.FDA.split("@.@")[index]) : '0,00';
                                                discount = e.discount ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(e.discount.split("@.@")[index]) : "0,00";
                                                received = e.received ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(e.received.split("@.@")[index]) : "0,00";
                                            } else if (this.state.moeda == 5) {
                                                FDA = e.FDA ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(e.ROE.split("@.@")[index]) * parseFloat(e.FDA.split("@.@")[index])) : "0,00";
                                                discount = e.discount ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(e.ROE.split("@.@")[index]) * parseFloat(e.discount.split("@.@")[index])) : "0,00";
                                                received = e.received ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(e.ROE.split("@.@")[index]) * parseFloat(e.received.split("@.@")[index])) : "0,00";
                                            } else {
                                                FDA = e.FDA ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(e.FDA.split("@.@")[index]) / parseFloat(e.ROE.split("@.@")[index])) : "0,00";
                                                discount = e.discount ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(e.discount.split("@.@")[index]) / parseFloat(e.ROE.split("@.@")[index])) : "0,00";
                                                received = e.received ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(e.received.split("@.@")[index]) / parseFloat(e.ROE.split("@.@")[index])) : "0,00";
                                            }

                                            let balance = new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(FDA.replaceAll('.', '').replaceAll(",", ".")) - parseFloat(discount.replaceAll('.', '').replaceAll(",", ".")) - parseFloat(received.replaceAll('.', '').replaceAll(",", ".")));

                                            if (!e.os_moeda || (!(e.ROE.split("@.@")[index]) || e.ROE.split("@.@")[index] == 0) && this.state.moeda != e.os_moeda.split("@.@")[index]) {
                                                return;
                                            }


                                            totalFDA += parseFloat(FDA.replaceAll('.', '').replaceAll(',', '.'));
                                            totalDiscount += parseFloat(discount.replaceAll('.', '').replaceAll(',', '.'));
                                            totalReceived += parseFloat(received.replaceAll('.', '').replaceAll(',', '.'));
                                            totalBalance += parseFloat(balance.replaceAll('.', '').replaceAll(',', '.'));

                                            totalFDAPorGrupo += parseFloat(FDA.replaceAll('.', '').replaceAll(',', '.'));
                                            totalDiscountPorGrupo += parseFloat(discount.replaceAll('.', '').replaceAll(',', '.'));
                                            totalReceivedPorGrupo += parseFloat(received.replaceAll('.', '').replaceAll(',', '.'));
                                            totalBalancePorGrupo += parseFloat(balance.replaceAll('.', '').replaceAll(',', '.'));

                                            if (parseFloat(balance.replaceAll('.', '').replaceAll(",", ".")) > 0) {
                                                return (
                                                    <tr style={{ backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#999999" }}>
                                                        <td style={{ backgroundColor: "inherit" }}>{e.navio ? util.removeAcentos(e.navio.split('@.@')[index]) : ''}</td>
                                                        <td style={{ backgroundColor: "inherit" }}>{e.os ? util.removeAcentos(e.os.split('@.@')[index]) : ''}</td>
                                                        <td style={{ backgroundColor: "inherit" }}>{e.porto ? util.removeAcentos(e.porto.split('@.@')[index]) : ''}</td>
                                                        <td style={{ backgroundColor: "inherit" }}>{e.sailed ? moment(e.sailed.split('@.@')[index]).format("DD/MM/YYYY") == "Invalid date" ? "" : moment(e.sailed.split('@.@')[index]).format("DD/MM/YYYY") : ''}</td>
                                                        <td style={{ backgroundColor: "inherit" }}>{this.state.moeda == 5 ? "R$" : "USD"} {FDA}</td>
                                                        <td style={{ backgroundColor: "inherit" }}>{e.ROE ? e.ROE.split("@.@")[index] : ""}</td>
                                                        <td style={{ backgroundColor: "inherit" }}>{this.state.moeda == 5 ? "R$" : "USD"} {discount}</td>
                                                        <td style={{ backgroundColor: "inherit" }}>{this.state.moeda == 5 ? "R$" : "USD"} {received}</td>
                                                        <td style={{ backgroundColor: "inherit" }}>{this.state.moeda == 5 ? "R$" : "USD"} {balance}</td>
                                                    </tr>
                                                )
                                            }
                                        })}
                                        <tr>
                                            <th colSpan='4'>{"Total ->"}</th>
                                            <td colSpan="2" style={{ paddingRight: '15px', borderTop: "1px solid black" }}>{this.state.moeda == 5 ? "R$" : "USD"} {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalFDAPorGrupo)}</td>
                                            <td style={{ paddingRight: '15px', borderTop: "1px solid black" }}>{this.state.moeda == 5 ? "R$" : "USD"} {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalDiscountPorGrupo)}</td>
                                            <td style={{ paddingRight: '15px', borderTop: "1px solid black" }}>{this.state.moeda == 5 ? "R$" : "USD"} {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalReceivedPorGrupo)}</td>
                                            <td style={{ paddingRight: '15px', borderTop: "1px solid black" }}>{this.state.moeda == 5 ? "R$" : "USD"} {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalBalancePorGrupo)}</td>
                                        </tr>
                                    </table>
                                    <hr />
                                </div>
                            )
                        })}
                        <table className='totalTablePDF'>
                            <tr>
                                <th></th>
                                <th style={{ borderBottom: "1px solid black" }}>FDA</th>
                                <th style={{ borderBottom: "1px solid black" }}>DISCOUNT</th>
                                <th style={{ borderBottom: "1px solid black" }}>RECEIVED</th>
                                <th style={{ borderBottom: "1px solid black" }}>BALANCE</th>
                            </tr>
                            <tr>
                                <th>{"Total ->"}</th>
                                <td style={{ paddingRight: '15px' }}>{this.state.moeda == 5 ? "R$" : "USD"} {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalFDA)}</td>
                                <td style={{ paddingRight: '15px' }}>{this.state.moeda == 5 ? "R$" : "USD"} {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalDiscount)}</td>
                                <td style={{ paddingRight: '15px' }}>{this.state.moeda == 5 ? "R$" : "USD"} {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalReceived)}</td>
                                <td style={{ paddingRight: '15px' }}>{this.state.moeda == 5 ? "R$" : "USD"} {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalBalance)}</td>
                            </tr>
                        </table>
                    </div>
                }
                {this.props.location.state.backTo == 'contasPagas' && this.props.location.state.backTo == 'contasPagar' &&
                    <div className='pdfContent'>
                        {relatorio.map((e) => {
                            totalValorPorGrupo = 0;
                            totalSaldoPorGrupo = 0;
                            
                            if (this.state.por == 'porCliente' && !e.pessoa) {
                                e.pessoa = '';
                            }
                            if (this.state.por == 'porVencimento' && !e.vencimento) {
                                e.vencimento = '';
                            }
                            if (this.state.por == 'porData' && !e.dataPagamento) {
                                e.dataPagamento = '';
                            }
                            map = this.state.por == "porCliente" ? e.pessoa.split('@.@') : this.state.por == "porVencimento" ? e.vencimento.split('@.@') : e.dataPagamento.split('@.@');
                            return (
                                <div>

                                    <table className='pdfTable'>
                                        <tr>
                                            <th>Nº DOCTO</th>
                                            <th>PO</th>
                                            <th>PESSOA</th>
                                            <th>HISTORICO</th>
                                            <th>SALDO</th>
                                            <th>VALOR</th>
                                        </tr>
                                        <tr style={{ backgroundColor: "#999999", border: "1px solid black" }}>
                                            <th colSpan={9}>
                                                <span style={{ fontSize: "1.2em" }}>{this.state.por == "porCliente" && e.pessoa ? e.pessoa.split('@.@')[0]
                                                    : this.state.por == "porVencimento" && e.vencimento ? moment(e.vencimento.split('@.@')[0]).format('DD/MM/YYYY')
                                                        : e.dataPagamento ? moment(e.dataPagamento.split('@.@')[0]).format('DD/MM/YYYY') : ''}</span>
                                            </th>
                                        </tr>
                                        {map.map((el, index) => {
                                            let valor = 0;
                                            let saldo = 0;

                                            if (e.os_moeda && this.state.moeda == e.os_moeda.split("@.@")[index]) {
                                                valor = e.valor ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(e.valor.split("@.@")[index]) : '0,00';
                                                saldo = e.saldo ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(e.saldo.split("@.@")[index]) : "0,00";
                                            } else if (this.state.moeda == 5) {
                                                valor = e.valor ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(e.ROE.split("@.@")[index]) * parseFloat(e.valor.split("@.@")[index])) : "0,00";
                                                saldo = e.saldo ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(e.ROE.split("@.@")[index]) * parseFloat(e.saldo.split("@.@")[index])) : "0,00";
                                            } else {
                                                valor = e.valor ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(e.valor.split("@.@")[index]) / parseFloat(e.ROE.split("@.@")[index])) : "0,00";
                                                saldo = e.discount ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(e.saldo.split("@.@")[index]) / parseFloat(e.ROE.split("@.@")[index])) : "0,00";
                                            }


                                            totalValor += parseFloat(valor.replaceAll('.', '').replaceAll(',', '.'));
                                            totalSaldo += parseFloat(saldo.replaceAll('.', '').replaceAll(',', '.'));
                                            
                                            totalValorPorGrupo += parseFloat(valor.replaceAll('.', '').replaceAll(',', '.'));
                                            totalSaldoPorGrupo += parseFloat(saldo.replaceAll('.', '').replaceAll(',', '.'));
                                           
                                            if (parseFloat(valor.replaceAll('.', '').replaceAll(",", ".")) > 0) {
                                                return (
                                                    <tr style={{ backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#999999" }}>
                                                        <td style={{ backgroundColor: "inherit" }}>{e.documento ? util.removeAcentos(e.documento.split('@.@')[index]) : ''}</td>
                                                        <td style={{ backgroundColor: "inherit" }}>{e.os ? util.removeAcentos(e.os.split('@.@')[index]) : ''}</td>
                                                        <td style={{ backgroundColor: "inherit" }}>{e.pessoa ? util.removeAcentos(e.pessoa.split('@.@')[index]) : ''}</td>
                                                        <td style={{ backgroundColor: "inherit" }}>{e.historico ? util.removeAcentos(e.historico.split('@.@')[index]) : ''}</td>
                                                        <td style={{ backgroundColor: "inherit" }}>{this.state.moeda == 5 ? "R$" : "USD"} {valor}</td>
                                                        <td style={{ backgroundColor: "inherit" }}>{this.state.moeda == 5 ? "R$" : "USD"} {saldo}</td>
                                                    </tr>
                                                )
                                            }
                                        })}
                                        <tr>
                                            <th colSpan='4'>{"Total ->"}</th>
                                            <td colSpan="2" style={{ paddingRight: '15px', borderTop: "1px solid black" }}>{this.state.moeda == 5 ? "R$" : "USD"} {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalValorPorGrupo)}</td>
                                            <td style={{ paddingRight: '15px', borderTop: "1px solid black" }}>{this.state.moeda == 5 ? "R$" : "USD"} {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalSaldoPorGrupo)}</td>
                                        </tr>
                                    </table>
                                    <hr />
                                </div>
                            )
                        })}
                        <table className='totalTablePDF'>
                            <tr>
                                <th></th>
                                <th style={{ borderBottom: "1px solid black" }}>VALOR</th>
                                <th style={{ borderBottom: "1px solid black" }}>SALDO</th>
                            </tr>
                            <tr>
                                <th>{"Total ->"}</th>
                                <td style={{ paddingRight: '15px' }}>{this.state.moeda == 5 ? "R$" : "USD"} {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalValor)}</td>
                                <td style={{ paddingRight: '15px' }}>{this.state.moeda == 5 ? "R$" : "USD"} {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalSaldo)}</td>
                            </tr>
                        </table>
                    </div>
                }
            </div >

        await this.setState({ pdfgerado: pdf, pdfView: true, loading: false, pdfEmail: ReactDOMServer.renderToString(pdf) })
        this.handleExportWithComponent()
    }

    handleExportWithComponent = event => {
        this.setState({ loading: false })
    };

    getPessoaContatos = async (pessoa) => {
        await apiEmployee.post(`getContatos.php`, {
            token: true,
            pessoa: pessoa
        }).then(
            async response => {
                await this.setState({ contatos: response.data, fornecedorEmail: response.data.find((e) => e.Tipo == "EM") ? response.data.find((e) => e.Tipo == "EM").Campo1 : "" })
                await this.setState({ emails: this.state.fornecedorEmail.split("; ") })
                await this.setState({ loading: false })
            },
            response => { this.erroApi(response) }

        )
    }

    render() {

        const validations = []
        validations.push(this.state.por)
        validations.push(!this.state.bloqueado)

        const validForm = validations.reduce((t, a) => t && a)


        const validationsEmail = [];
        validationsEmail.push(this.state.emails[0] || this.state.failures[0])
        validationsEmail.push(!this.state.emailBloqueado)

        const validFormEmail = validationsEmail.reduce((t, a) => t && a)


        return (
            <div className='allContent'>
                {this.state.loading &&
                    <Skeleton />
                }
                {!this.state.loading &&
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            display: this.state.pdfView ? "flex" : "none",
                            width: "100%",
                            minWidth: 830,
                            minHeight: "100vh",
                            flexDirection: "column",
                            alignItems: "center",
                            backgroundColor: "white",
                            zIndex: 20
                        }}>
                        <div
                            style={{
                                width: 830
                            }}


                        >
                            <PDFExport
                                scale={0.6}
                                landscape={true}

                                paperSize="A4"
                                margin="0.5cm"
                                ref={this.pdfExportComponent}>
                                {this.state.pdfgerado}
                            </PDFExport>

                            <div style={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "center" }}>
                                <button className="btn btn-danger" style={{ margin: 20 }} onClick={() => this.pdfExportComponent.current.save()}>Exportar PDF</button>
                                {this.state.pessoa &&
                                    <button className="btn btn-info" style={{ margin: 20 }} onClick={() => this.setState({ emailModal: true })}>Enviar para clientes</button>
                                }
                            </div>
                            <button
                                style={{
                                    position: "absolute",
                                    top: 10,
                                    left: 10,
                                    zIndex: 30,
                                    backgroundColor: "inherit",
                                    border: "none"
                                }}
                                onClick={() => this.setState({ pdfView: false })}>
                                <FontAwesomeIcon cursor="pointer" className='seta' icon={faArrowLeft} color="#17386b" size="2x" />
                            </button>
                        </div>
                    </div>
                }
                {!this.state.pdfView && !this.state.loading &&
                    <>

                        {this.state.redirect &&
                            <Redirect to={'/'} />
                        }

                        <section>
                            {this.props.location.state.backTo == 'contasPagar' &&
                                <Header voltarContasPagar relatorio titulo="Contas a Pagar" />
                            }
                            {this.props.location.state.backTo == 'contasPagas' &&
                                <Header voltarContasPagas relatorio titulo="Contas Pagas" />
                            }
                            {this.props.location.state.backTo == 'contasReceber' &&
                                <Header voltarContasReceber relatorio titulo="Contas a Receber" />
                            }
                            {this.props.location.state.backTo == 'contasRecebidas' &&
                                <Header voltarContasRecebidas relatorio titulo="Contas Recebidas" />
                            }

                        </section>
                        <div style={{ width: '100%', textAlign: 'center', marginTop: '-20px', marginBottom: '2%' }}>
                            <h6 style={{ color: 'red' }}>{this.state.erro}</h6>
                        </div>

                        <div className="contact-section">

                            <div className="row">
                                <div className="col-lg-12">
                                    <Formik
                                        initialValues={{
                                            name: '',
                                        }}
                                        onSubmit={async values => {
                                            await new Promise(r => setTimeout(r, 1000))
                                            this.gerarRelatorio(validForm)
                                        }}
                                    >
                                        <Form className="contact-form">

                                            <div className="row">
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2"></div>

                                                <div className="col-xl-8 col-lg-8 col-md-8 col-sm-8 col-12 ">

                                                    <div className="row addservicos">
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel">
                                                            <label>Ordenar:</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.por &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.porOptions} value={this.state.porOptions.filter(option => option.value == this.state.por)[0]} search={true} onChange={(e) => { this.setState({ por: e.value, }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Conta</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ planosContasOptionsTexto: e }) }} value={this.state.planosContasOptions.filter(option => option.value == this.state.conta)[0]} search={true} onChange={(e) => { this.setState({ conta: e.value, }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Centro de Custo</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.centrosCustosOptions.filter(e => this.filterSearch(e, this.state.centrosCustosOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ centrosCustosOptionsTexto: e }) }} value={this.state.centrosCustosOptions.filter(option => option.value == this.state.centroCusto)[0]} search={true} onChange={(e) => { this.setState({ centroCusto: e.value, }) }} />
                                                        </div>

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Pessoa</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.pessoasOptions.filter(e => this.filterSearch(e, this.state.pessoasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ pessoasOptionsTexto: e }) }} value={this.state.pessoasOptions.filter(option => option.value == this.state.pessoa)[0]} search={true} onChange={(e) => { this.setState({ pessoa: e.value, }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Moeda</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.moedasOptions.filter(e => this.filterSearch(e, this.state.moedasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ moedasOptionsTexto: e }) }} value={this.state.moedasOptions.filter(option => option.value == this.state.moeda)[0]} search={true} onChange={(e) => { this.setState({ moeda: e.value, }) }} />
                                                        </div>
                                                        <div className="col-12">
                                                            <label className="center relatorioLabelTitulo">Período</label>
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Data Inicial</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="date" value={this.state.periodoInicial} onChange={async e => { this.setState({ periodoInicial: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Data Final</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="date" value={this.state.periodoFinal} onChange={async e => { this.setState({ periodoFinal: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className="col-12">
                                                            <label className="center relatorioLabelTitulo">Período Lançamento</label>
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Data Inicial</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="date" value={this.state.lancamentoInicial} onChange={async e => { this.setState({ lancamentoInicial: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Data Final</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="date" value={this.state.lancamentoFinal} onChange={async e => { this.setState({ lancamentoFinal: e.currentTarget.value }) }} />
                                                        </div>


                                                        <div className="col-12 relatorioLabelTitulo">
                                                            <label className="center">Tipos de Documento</label>
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm relatorioCheckLabel">
                                                            <label><i>Excluir</i></label>
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm relatorioCheck">
                                                            <Field type="checkbox" className="reduceCheckSize" name='cliente' checked={this.state.excluirTipos} onChange={async e => { this.setState({ excluirTipos: e.target.checked }) }} />
                                                        </div>

                                                        <div className='scrollDiv col-xl-6 col-lg-6 col-md-6 col-sm-12 col-12 row'>
                                                            {this.state.tiposDocumentoOptions.map((e, i) => (
                                                                <div className='row deleteMargin'>
                                                                    <div className={i == 0 ? "col-xl-6 col-lg-6 col-md-6 col-sm-12 col-12 labelForm relatorioCheckLabel firstScrollLabel" : "col-xl-6 col-lg-6 col-md-6 col-sm-12 col-12 labelForm relatorioCheckLabel"}>
                                                                        <label>{e.Descricao}</label>
                                                                    </div>

                                                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-12 labelForm relatorioCheck">
                                                                        <Field type="checkbox" className="reduceCheckSize" name={e.descricao} checked={this.state.tiposDocumentoOptions[i].checked} onChange={async () => { this.setTipoDocumento(e.chave, i) }} />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>


                                                </div>
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                            </div>

                                            <div className="row">
                                                <div className="col-2"></div>
                                                <div className="col-8" style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <button disabled={!validForm} type="submit" style={validForm ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} >Gerar</button>
                                                </div>
                                                <div className="col-2"></div>
                                            </div>

                                        </Form>
                                    </Formik>
                                </div>
                            </div>

                        </div>
                        <Rodape />
                    </>}
                <Modal
                    aria-labelledby="transition-modal-title"
                    aria-describedby="transition-modal-description"
                    style={{ display: 'flex', justifyContent: 'center', paddingTop: '5%', paddingBottom: '5%', overflow: 'scroll' }}
                    open={this.state.emailModal}
                    onClose={async () => await this.setState({ emailModal: false })}
                >
                    <div className='modalContainer'>
                        <div className='modalCriar'>
                            <div className='containersairlistprodmodal'>
                                <div className='botaoSairModal' onClick={async () => await this.setState({ email: false, emailModal: false })}>
                                    <span>X</span>
                                </div>
                            </div>
                            <div className='modalContent'>
                                <div className='tituloModal'>
                                    <span>Enviar email:</span>
                                </div>


                                <div className='modalForm'>
                                    <Formik
                                        initialValues={{
                                            name: '',
                                        }}
                                        onSubmit={async values => {
                                            await new Promise(r => setTimeout(r, 1000))
                                            this.enviarEmail(validFormEmail)
                                        }}
                                    >
                                        <Form className="contact-form" >

                                            <div className="row">

                                                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 ">

                                                    <div className="row addservicos">
                                                        {this.state.successes[0] &&
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Emails enviados:</label>
                                                            </div>
                                                        }
                                                        {this.state.successes[0] &&
                                                            <div className="col-1 errorMessage">
                                                            </div>
                                                        }
                                                        {this.state.successes[0] &&
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                <label>
                                                                    {this.state.successes.map((e, i) => (
                                                                        <span className='listaEmail successEmail'>{e}{this.state.successes[i + 1] ? ", " : ""}</span>
                                                                    ))}
                                                                </label>
                                                            </div>
                                                        }
                                                        {this.state.successes[0] &&
                                                            <div className="col-1"></div>
                                                        }
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstlabel">
                                                            <label>Destinatário(s)</label>
                                                        </div>
                                                        <div className="col-1 errorMessage">

                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="text" value={this.state.emails.join('; ')} onChange={async e => { this.setState({ emails: e.currentTarget.value.split('; ') }) }} />
                                                        </div>
                                                        <div className="col-1"></div>
                                                        {this.state.failures[0] &&
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Emails inválidos:</label>
                                                            </div>
                                                        }
                                                        {this.state.failures[0] &&
                                                            <div className="col-1 errorMessage">
                                                            </div>
                                                        }
                                                        {this.state.failures[0] &&
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                <label>
                                                                    {this.state.failures.map((e, i) => (
                                                                        <span className='listaEmail failureEmail' title='Email inválido' onClick={async () => await this.removeEmail(e)}>{e}{this.state.failures[i + 1] || this.state.emails[0] ? ", " : ""}</span>
                                                                    ))}
                                                                </label>
                                                            </div>
                                                        }
                                                        {this.state.failures[0] &&
                                                            <div className="col-1"></div>
                                                        }
                                                    </div>
                                                </div>
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                            </div>

                                            <div className="row">
                                                <div className="col-2"></div>
                                                <div className="col-8" style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <button disabled={!validFormEmail} type="submit" style={validFormEmail ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} >Enviar</button>
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

export default connect(mapStateToProps, null)(Relatorio)
