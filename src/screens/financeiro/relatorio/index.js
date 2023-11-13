import React, { Component } from 'react'
import './styles.css'
import ReactDOMServer from 'react-dom/server';
import { Formik, Field, Form } from 'formik'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import util from '../../../classes/util'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { PDFExport } from "@progress/kendo-react-pdf";
import { drawDOM, exportPDF } from "@progress/kendo-drawing";
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
    clientes: [],
    periodoInicial: moment().startOf('month').format('YYYY-MM-DD'),
    periodoFinal: moment().endOf('month').format('YYYY-MM-DD'),
    lancamentoInicial: moment('1900-1-1').format('YYYY-MM-DD'),
    lancamentoFinal: moment('2100-12-31').format('YYYY-MM-DD'),
    excluirTipos: false,
    tiposDocumentos: [],
    moeda: 5,
    totalBalance: 0,

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
    pdfNome: "",

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

            if (this.props.location.state.backTo == 'contasPagar') {
                porOptions.push({ label: "Por Vencimento", value: 'porVencimento' });
                this.setState({ tipo: 'aberto' });
            } else if (this.props.location.state.backTo == 'contasReceber') {
                porOptions.push({ label: "Por Lançamento", value: 'porLancamento' });
                this.setState({ tipo: 'aberto' });
            } else {
                porOptions.push({ label: 'Por Data de Recebimento', value: 'porData' })
                this.setState({ tipo: 'liquidado' });
            }
            await this.setState({ porOptions });
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

                const options = this.state.pessoas.map((e) => {
                    return { label: `${e.Nome_Fantasia ? e.Nome_Fantasia : e.Nome}${e.Cnpj_Cpf ? ` - ${util.formataCPF(e.Cnpj_Cpf)}` : ""}`, value: e.Chave }
                })


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
        const abertas = this.state.tipo == 'aberto' ? `contas_aberto.Saldo >= 1` : `contas_aberto.Saldo = 0`;
        const conta = this.state.conta ? `contas_aberto.Conta_Contabil = '${this.state.conta}'` : '';
        const centroCusto = this.state.centroCusto ? `contas_aberto.Centro_Custo = '${this.state.centroCusto}'` : '';
        const pessoa = this.state.clientes[0] ? `contas_aberto.pessoa IN ('${this.state.clientes.join("','")}')` : '';
        let periodoInicial = "1=1"//this.state.periodoInicial ? this.state.tipo == 'aberto' ? `contas_aberto.vencimento >= '${moment(this.state.periodoInicial).format('YYYY-MM-DD')}'` : `contas_aberto.data_pagto >= '${moment(this.state.periodoInicial).format('YYYY-MM-DD')}'` : '';
        let periodoFinal = "1=1"//this.state.periodoFinal ? this.state.tipo == 'aberto' ? `contas_aberto.vencimento <= '${moment(this.state.periodoFinal).format('YYYY-MM-DD')}'` : `contas_aberto.data_pagto <= '${moment(this.state.periodoFinal).format('YYYY-MM-DD')}'` : '';
        const lancamentoInicial = "1=1"//this.state.lancamentoInicial ? `contas_aberto.lancto >= '${moment(this.state.lancamentoInicial).format('YYYY-MM-DD')}'` : '';
        const lancamentoFinal = "1=1"//this.state.lancamentoFinal ? `contas_aberto.lancto <= '${moment(this.state.lancamentoFinal).format('YYYY-MM-DD')}'` : '';
        const exclusao = "1=1"//(this.state.excluirTipos || this.state.tiposDocumentos[0]) ? 'NOT' : '';
        const tiposDocumento = "1=1"//this.state.tiposDocumentos[0] ? `contas_aberto.tipodocto ${exclusao} IN (${this.state.tiposDocumentos.join(',')})` : ``;

        let tipo_sub = 0;
        if (this.props.location.state.backTo) {
            if (this.props.location.state.backTo == 'contasPagas' || this.props.location.state.backTo == 'contasPagar') {
                tipo_sub = 0;
            } else {
                tipo_sub = 1;
                periodoInicial = "1 = 1";
                periodoFinal = "1 = 1";
            }
        }

        if (this.state.clientes[0] && !this.state.clientes[1]) {
            await apiEmployee.post(`getContatos.php`, {
                token: true,
                pessoa: this.state.clientes[0]
            }).then(
                async res => {
                    if (res.data[0]) {
                        const email = res.data.find((e) => e.Tipo == "EM")?.Campo1;

                        if (email) {
                            await this.setState({ emails: email.split("; ") });
                        }
                    }
                }
            )
        }

        let por = this.state.por;
        if (por == 'porCliente') {
            por = 'GROUP BY contas_aberto.pessoa ORDER BY pessoas.nome';
        } else if (por == 'porVencimento') {
            por = 'GROUP BY contas_aberto.vencimento ORDER BY contas_aberto.vencimento';
        } else if (por == 'porLancamento') {
            por = 'GROUP BY contas_aberto.Lancto ORDER BY contas_aberto.Lancto';
        } else if (por == 'porData') {
            por = 'GROUP BY contas_aberto.data_pagto ORDER BY contas_aberto.data_pagto';
        }

        let where = [empresa, abertas, conta, centroCusto, pessoa, periodoInicial, periodoFinal, lancamentoInicial, lancamentoFinal, tiposDocumento];
        where = where.filter((e) => e.trim() != "");
        console.log(where.join(' AND '));

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
        let gridElement = document.getElementById("pdfDiv");

        const base64 = await drawDOM(gridElement, {
            paperSize: "A4",
            margin: '0.5cm',
            scale: 0.6,
            portrait: true,
        })
            .then((group) => {
                return exportPDF(group);
            }).then((dataUri) => {
                return dataUri;
            });

        await this.setState({ emailBloqueado: true, loading: true });
        await apiEmployee.post(`enviaRelatorioEmail.php`, {
            token: true,
            emails: this.state.emails.map((e) => e?.trim()),
            mensagem: base64,
            nomeCliente: this.state.pessoas.find((p) => p.Chave == this.state.clientes[0])?.Nome.replaceAll(".", ""),
            balance: `${this.state.moeda == 5 ? "R$" : "USD"} ${new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.state.totalBalance)}`,
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
        console.log(relatorio);
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
        this.setState({ totalBalance: 0 });

        let checkBalance = 0;

        let totalValor = 0;
        let totalSaldo = 0;

        let totalFDAPorGrupo = 0;
        let totalDiscountPorGrupo = 0;
        let totalReceivedPorGrupo = 0;
        let totalBalancePorGrupo = 0;

        let totalValorPorGrupo = 0;
        let totalSaldoPorGrupo = 0;

        if (this.props.location.state.backTo != 'contasPagas' && this.props.location.state.backTo != 'contasPagar') {
            this.setState({ pdfNome: `SOA (${moment().format("DD-MM-YYYY")})${this.state.clientes[0] && !this.state.clientes[1] ? ` - ${this.state.pessoas.find((e) => e.Chave == this.state.clientes[0])?.Nome?.replaceAll('.', '')}` : ""}` })
        } else {
            if (this.props.location.state.backTo == 'contasPagas') {
                this.setState({ pdfNome: `Relatório de contas pagas (${moment().format("DD-MM-YYYY")})` });
            } else if (this.props.location.state.backTo == 'contasPagar') {
                this.setState({ pdfNome: `Relatório de contas à pagar (${moment().format("DD-MM-YYYY")})` });
            }
        }

        let pdf =
            <div style={{ zoom: 1 }} id='pdfDiv' key={546546554654}>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <img className="img-fluid" src="https://i.ibb.co/vmKJkx4/logo.png" alt="logo-Strade" border="0" style={{ width: '30%', height: '150px', maxWidth: "100%" }} />
                    {this.props.location.state.backTo == 'contasPagas' || this.props.location.state.backTo == 'contasPagar' &&
                        <h4>{titulo}</h4>
                    }
                    {this.props.location.state.backTo != 'contasPagas' && this.props.location.state.backTo != 'contasPagar' &&
                        <h4>
                            SOA - Statement of Accounts
                        </h4>
                    }
                </div>
                <hr />
                {this.props.location.state.backTo != 'contasPagas' && this.props.location.state.backTo != 'contasPagar' &&
                    <div className='pdfContent'>
                        {relatorio.map((e) => {


                            const formated = {
                                "pessoa2": e?.pessoa2,
                                "conta_chave2": e?.conta_chave2,
                                "conta_chave": e?.conta_chave?.split('@.@') ? e?.conta_chave?.split('@.@') : [],
                                "pessoa": e?.pessoa?.split('@.@') ? e?.pessoa?.split('@.@') : [],
                                "documento": e?.documento?.split('@.@') ? e?.documento?.split('@.@') : [],
                                "vencimento": e?.vencimento?.split('@.@') ? e?.vencimento?.split('@.@') : [],
                                "dataPagamento": e?.dataPagamento || null,
                                "historico": e?.historico?.split('@.@') ? e?.historico?.split('@.@') : [],
                                "tipoDocumento": null,
                                "lancamento": e?.lancamento?.split('@.@') ? e?.lancamento?.split('@.@') : [],
                                "envio": e?.envio?.split('@.@') ? e?.envio?.split('@.@') : [],
                                "CC": e?.CC?.split('@.@') ? e?.CC?.split('@.@') : [],
                                "saldo": e?.saldo?.split('@.@') ? e?.saldo?.split('@.@') : [],
                                "valor": e?.valor?.split('@.@') ? e?.valor?.split('@.@') : [],
                                "desconto": e?.desconto?.split('@.@') ? e?.desconto?.split('@.@') : [],
                                "os": e?.os?.split('@.@') ? e?.os?.split('@.@') : [],
                                "governmentTaxes": e?.governmentTaxes?.split('@.@') ? e?.governmentTaxes?.split('@.@') : [],
                                "bankCharges": e?.bankCharges?.split('@.@') ? e?.bankCharges?.split('@.@') : [],
                                "sailed": e?.sailed?.split('@.@') ? e?.sailed?.split('@.@') : [],
                                "ROE": e?.ROE?.split('@.@') ? e?.ROE?.split('@.@') : [],
                                "evento_moeda": e?.evento_moeda?.split('@.@') ? e?.evento_moeda?.split('@.@') : [],
                                "evento_valor": e?.evento_valor?.split('@.@') ? e?.evento_valor?.split('@.@') : [],
                                "evento_os": e?.evento_os?.split('@.@') ? e?.evento_os?.split('@.@') : [],
                                "evento_valor_st": e?.evento_valor_st?.split('@.@') ? e?.evento_valor_st?.split('@.@') : [],
                                "evento_moeda_received": e?.evento_moeda_received?.split('@.@') ? e?.evento_moeda_received?.split('@.@') : [],
                                "evento_valor_received": e?.evento_valor_received?.split('@.@') ? e?.evento_valor_received?.split('@.@') : [],
                                "evento_os_received": e?.evento_os_received?.split('@.@') ? e?.evento_os_received?.split('@.@') : [],
                                "evento_moeda_discount": e?.evento_moeda_discount?.split('@.@') ? e?.evento_moeda_discount?.split('@.@') : [],
                                "evento_valor_discount": e?.evento_valor_discount?.split('@.@') ? e?.evento_valor_discount?.split('@.@') : [],
                                "evento_os_discount": e?.evento_os_discount?.split('@.@') ? e?.evento_os_discount?.split('@.@') : [],
                                "FDA": e?.FDA?.split('@.@') ? e?.FDA?.split('@.@') : [],
                                "discount": e?.discount?.split('@.@') ? e?.discount?.split('@.@') : [],
                                "received": e?.received?.split('@.@') ? e?.received?.split('@.@') : [],
                                "os_moeda": e?.os_moeda?.split('@.@') ? e?.os_moeda?.split('@.@') : [],
                                "navio": e?.navio?.split('@.@') ? e?.navio?.split('@.@') : [],
                                "porto": e?.porto?.split('@.@') ? e?.porto?.split('@.@') : [],
                                "valor_manual": e?.valor_manual?.split('@.@') ? e?.valor_manual?.split('@.@') : [],
                                "navio_manual": e?.navio_manual?.split('@.@') ? e?.navio_manual?.split('@.@') : [],
                                "porto_manual": e?.porto_manual?.split('@.@') ? e?.porto_manual?.split('@.@') : [],
                                "os_manual": e?.os_manual?.split('@.@') ? e?.os_manual?.split('@.@') : [],
                                "roe_manual": e?.roe_manual?.split('@.@') ? e?.roe_manual?.split('@.@') : [],
                                "envio_manual": e?.envio_manual?.split('@.@') ? e?.envio_manual?.split('@.@') : [],
                                "sailed_manual": e?.sailed_manual?.split('@.@') ? e?.sailed_manual?.split('@.@') : [],
                                "discount_manual": e?.discount_manual?.split('@.@') ? e?.discount_manual?.split('@.@') : [],
                                "received_manual": e?.received_manual?.split('@.@') ? e?.received_manual?.split('@.@') : [],
                            }
                            console.log(formated);


                            checkBalance = 0;
                            const rows = [];

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

                            map.map((el, index) => {
                                if (!e?.os_manual?.split("@.@")[index]) {
                                    return;
                                }

                                let FDA = 0;
                                let discount = 0;
                                let received = 0;

                                if (this.state.moeda == 5) {
                                    FDA += e?.valor_manual?.split("@.@")[index];
                                    discount = e.discount_manual ? util.toFixed(parseFloat(e.discount_manual?.split("@.@")[index]), 2) : "0,00";
                                    received = e.received_manual ? util.toFixed(parseFloat(e.received_manual?.split("@.@")[index]), 2) : "0,00";
                                } else if (this.state.moeda == 6) {
                                    FDA += e?.valor_manual?.split("@.@")[index] ? util.toFixed(parseFloat(e.valor_manual.split("@.@")[index]) / parseFloat(e.roe_manual && !!e.roe_manual?.split("@.@")[index] && e.roe_manual?.split("@.@")[index] != 0 ? e.roe_manual?.split("@.@")[index] : 5), 2) : 0;
                                    discount += e.discount_manual?.split("@.@")[index] ? util.toFixed(parseFloat(e.discount_manual?.split("@.@")[index]) / parseFloat(e.roe_manual && !!e.roe_manual?.split("@.@")[index] && e.roe_manual?.split("@.@")[index] != 0 ? e.roe_manual?.split("@.@")[index] : 5), 2) : 0;
                                    received += e.received_manual?.split("@.@")[index] ? util.toFixed(parseFloat(e.received_manual?.split("@.@")[index]) / parseFloat(e.roe_manual && !!e.roe_manual?.split("@.@")[index] && e.roe_manual?.split("@.@")[index] != 0 ? e.roe_manual?.split("@.@")[index] : 5), 2) : 0;
                                }

                                const balance = parseFloat(FDA) - parseFloat(discount) - parseFloat(received);
                                if (parseFloat(balance.toFixed(2)) > 0) {
                                    rows.push({
                                        ship: e.navio_manual ? util.removeAcentos(e.navio_manual.split('@.@')[index]) : '',
                                        os: e.os_manual ? util.removeAcentos(e.os_manual.split('@.@')[index]) : '',
                                        port: e.porto_manual ? util.removeAcentos(e.porto_manual.split('@.@')[index]) : '',
                                        sailed: e.sailed_manual ? e.sailed_manual.split('@.@')[index] : '',
                                        billing: e.envio_manual ? moment(e.envio_manual.split('@.@')[index]).isValid() ? moment(e.envio_manual.split('@.@')[index]).format("DD/MM/YY") : '' : '',
                                        roe: e.roe_manual ? e.roe_manual.split("@.@")[index] : "",
                                        fda: FDA,
                                        discount,
                                        received,
                                        balance
                                    })
                                }
                                checkBalance += parseFloat(balance.toFixed(2));
                            })

                            map.map((el, index) => {
                                if (!e?.os?.split("@.@")[index]) {
                                    return;
                                }
                                const eventMap = e.evento_valor?.split('@.@');
                                const eventMapReceived = e.evento_valor_received?.split('@.@');
                                const eventMapDiscount = e.evento_valor_discount?.split('@.@');

                                let FDA = 0;
                                let discount = 0;
                                let received = 0;

                                if (eventMap) {
                                    eventMap.map((elem, eventIndex) => {
                                        if (e.evento_os.split("@.@")[eventIndex] == e.os.split("@.@")[index]) {
                                            if (this.state.moeda == e.evento_moeda.split("@.@")[eventIndex]) {
                                                FDA += e.evento_valor.split("@.@")[eventIndex] ? util.toFixed(parseFloat(e.evento_valor.split("@.@")[eventIndex]), 2) : 0;
                                            } else if (this.state.moeda == 5) {
                                                FDA += e.evento_valor.split("@.@")[eventIndex] ? util.toFixed(parseFloat(e.evento_valor.split("@.@")[eventIndex]) * parseFloat(e.ROE && !!e.ROE.split("@.@")[index] && e.ROE.split("@.@")[index] != 0 ? e.ROE.split("@.@")[index] : 5), 2) : 0;
                                            } else if (this.state.moeda == 6) {
                                                FDA += e.evento_valor.split("@.@")[eventIndex] ? util.toFixed(parseFloat(e.evento_valor.split("@.@")[eventIndex]) / parseFloat(e.ROE && !!e.ROE.split("@.@")[index] && e.ROE.split("@.@")[index] != 0 ? e.ROE.split("@.@")[index] : 5), 2) : 0;
                                            }
                                        }
                                    });
                                }
                                if (eventMapReceived) {
                                    eventMap.map((elem, eventIndex) => {
                                        if (e.evento_os_received.split("@.@")[eventIndex] == e.os.split("@.@")[index]) {
                                            if (this.state.moeda == e.evento_moeda_received.split("@.@")[eventIndex]) {
                                                received += e.evento_valor_received.split("@.@")[eventIndex] ? util.toFixed(parseFloat(e.evento_valor_received.split("@.@")[eventIndex]), 2) : 0;
                                            } else if (this.state.moeda == 5) {
                                                received += e.evento_valor_received.split("@.@")[eventIndex] ? util.toFixed(parseFloat(e.evento_valor_received.split("@.@")[eventIndex]) * parseFloat(e.ROE && !!e.ROE.split("@.@")[index] && e.ROE.split("@.@")[index] != 0 ? e.ROE.split("@.@")[index] : 5), 2) : 0;
                                            } else if (this.state.moeda == 6) {
                                                received += e.evento_valor_received.split("@.@")[eventIndex] ? util.toFixed(parseFloat(e.evento_valor_received.split("@.@")[eventIndex]) / parseFloat(e.ROE && !!e.ROE.split("@.@")[index] && e.ROE.split("@.@")[index] != 0 ? e.ROE.split("@.@")[index] : 5), 2) : 0;
                                            }
                                        }
                                    });
                                }
                                if (eventMapDiscount) {
                                    eventMap.map((elem, eventIndex) => {
                                        if (e.evento_os_discount.split("@.@")[eventIndex] == e.os.split("@.@")[index]) {
                                            if (this.state.moeda == e.evento_moeda_discount.split("@.@")[eventIndex]) {
                                                discount += e.evento_valor_discount.split("@.@")[eventIndex] ? util.toFixed(parseFloat(e.evento_valor_discount.split("@.@")[eventIndex]), 2) : 0;
                                            } else if (this.state.moeda == 5) {
                                                discount += e.evento_valor_discount.split("@.@")[eventIndex] ? util.toFixed(parseFloat(e.evento_valor_discount.split("@.@")[eventIndex]) * parseFloat(e.ROE && !!e.ROE.split("@.@")[index] && e.ROE.split("@.@")[index] != 0 ? e.ROE.split("@.@")[index] : 5), 2) : 0;
                                            } else if (this.state.moeda == 6) {
                                                discount += e.evento_valor_discount.split("@.@")[eventIndex] ? util.toFixed(parseFloat(e.evento_valor_discount.split("@.@")[eventIndex]) / parseFloat(e.ROE && !!e.ROE.split("@.@")[index] && e.ROE.split("@.@")[index] != 0 ? e.ROE.split("@.@")[index] : 5), 2) : 0;
                                            }
                                        }
                                    });
                                }

                                if (this.state.moeda == 5) {
                                    FDA += e.bankCharges.split("@.@")[index] && e.bankCharges.split("@.@")[index] > 0 ? parseFloat(e.bankCharges.split("@.@")[index]) : 0;
                                    FDA += e.governmentTaxes.split("@.@")[index] && e.governmentTaxes.split("@.@")[index] > 0 ? parseFloat(e.governmentTaxes.split("@.@")[index]) : 0;
                                } else if (this.state.moeda == 6) {
                                    FDA += e.bankCharges.split("@.@")[index] && e.bankCharges.split("@.@")[index] > 0 ? util.toFixed(parseFloat(e.bankCharges.split("@.@")[index]) / parseFloat(e.ROE && !!e.ROE.split("@.@")[index] && e.ROE.split("@.@")[index] != 0 ? e.ROE.split("@.@")[index] : 5), 2) : 0;
                                    FDA += e.governmentTaxes.split("@.@")[index] && e.governmentTaxes.split("@.@")[index] > 0 ? util.toFixed(parseFloat(e.governmentTaxes.split("@.@")[index]) / parseFloat(e.ROE && !!e.ROE.split("@.@")[index] && e.ROE.split("@.@")[index] != 0 ? e.ROE.split("@.@")[index] : 5), 2) : 0;
                                }

                                const balance = parseFloat(FDA) - parseFloat(discount) - parseFloat(received);
                                if (parseFloat(balance.toFixed(2)) > 0) {
                                    rows.push({
                                        ship: e.navio ? util.removeAcentos(e.navio.split('@.@')[index]) : '',
                                        os: e.os ? util.removeAcentos(e.os.split('@.@')[index]) : '',
                                        port: e.porto ? util.removeAcentos(e.porto.split('@.@')[index]) : '',
                                        sailed: e.sailed ? e.sailed.split('@.@')[index] : '',
                                        billing: e.envio ? moment(e.envio.split('@.@')[index]).isValid() ? moment(e.envio.split('@.@')[index]).format("DD/MM/YY") : '' : '',
                                        roe: e.ROE ? e.ROE.split("@.@")[index] : "",
                                        fda: FDA,
                                        discount,
                                        received,
                                        balance
                                    })
                                }

                                checkBalance += parseFloat(balance.toFixed(2));
                            })

                            if (!checkBalance) {
                                return (<></>)
                            }

                            let totalFDAPorGrupo = 0;
                            let totalDiscountPorGrupo = 0;
                            let totalReceivedPorGrupo = 0;
                            let totalBalancePorGrupo = 0;

                            return (
                                <div>

                                    <table className='pdfTable'>
                                        <tr>
                                            <th colSpan={9}>
                                                <span style={{ fontSize: 15 }}>{this.state.por == "porCliente" && e.pessoa ? e.pessoa.split('@.@')[0]
                                                    : this.state.por == "porVencimento" && e.vencimento ? moment(e.vencimento.split('@.@')[0]).format('DD/MM/YYYY')
                                                        : e.dataPagamento ? moment(e.dataPagamento.split('@.@')[0]).format('DD/MM/YYYY') : ''}</span>
                                            </th>
                                        </tr>
                                        <tr style={{ fontSize: 13 }}>
                                            <th>SHIP'S NAME</th>
                                            <th>PO</th>
                                            <th>PORT OF CALL</th>
                                            <th>SAILED</th>
                                            {!this.state.clientes[0] &&
                                                <th>BILLING</th>
                                            }
                                            <th>ROE</th>
                                            <th>FDA</th>
                                            <th>DISCOUNT</th>
                                            <th>RECEIVED</th>
                                            <th>BALANCE</th>
                                        </tr>
                                        {rows.toSorted((a, b) => moment(a.sailed).diff(moment(b.sailed))).map((row, index) => {
                                            if (parseFloat(row.balance) > 0) {
                                                totalFDA += parseFloat(row.fda);
                                                totalDiscount += parseFloat(row.discount);
                                                totalReceived += parseFloat(row.received);
                                                this.setState({ totalBalance: this.state.totalBalance + parseFloat(row.balance) });

                                                totalFDAPorGrupo += parseFloat(row.fda);
                                                totalDiscountPorGrupo += parseFloat(row.discount);
                                                totalReceivedPorGrupo += parseFloat(row.received);
                                                totalBalancePorGrupo += parseFloat(row.balance);

                                                return (
                                                    <tr style={{ fontSize: 12 }} className="SOA_row">
                                                        <td style={{ backgroundColor: "inherit", whiteSpace: "nowrap", maxWidth: 135, minWidth: 135 }}>{row.ship}</td>
                                                        <td style={{ backgroundColor: "inherit", whiteSpace: "nowrap", maxWidth: 55, minWidth: 55 }}>{row.os}</td>
                                                        {!this.state.clientes[0] &&
                                                            <>
                                                                <td style={{ backgroundColor: "inherit", whiteSpace: "nowrap", maxWidth: 85, minWidth: 85 }}>{row.port}</td>
                                                                <td style={{ backgroundColor: "inherit", whiteSpace: "nowrap", maxWidth: 60, minWidth: 60 }}>{moment(row.sailed).format("DD/MM/YY")}</td>
                                                                <td style={{ backgroundColor: "inherit", whiteSpace: "nowrap", maxWidth: 55, minWidth: 55 }}>{row.billing}</td>
                                                            </>
                                                        }
                                                        {this.state.clientes[0] &&
                                                            <>
                                                                <td style={{ backgroundColor: "inherit", whiteSpace: "nowrap", maxWidth: 105, minWidth: 105 }}>{row.port}</td>
                                                                <td style={{ backgroundColor: "inherit", whiteSpace: "nowrap", maxWidth: 95, minWidth: 95 }}>{moment(row.sailed).format("MMM Do YYYY")}</td>
                                                            </>
                                                        }
                                                        <td style={{ backgroundColor: "inherit", whiteSpace: "nowrap", maxWidth: 65, minWidth: 65 }}>{row.roe}</td>
                                                        <td style={{ backgroundColor: "inherit", whiteSpace: "nowrap", maxWidth: 95, minWidth: 95 }}>{this.state.moeda == 5 ? "R$" : "USD"} {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row.fda)}</td>
                                                        <td style={{ backgroundColor: "inherit", whiteSpace: "nowrap", maxWidth: 95, minWidth: 95 }}>{this.state.moeda == 5 ? "R$" : "USD"} {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row.discount)}</td>
                                                        <td style={{ backgroundColor: "inherit", whiteSpace: "nowrap", maxWidth: 95, minWidth: 95 }}>{this.state.moeda == 5 ? "R$" : "USD"} {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row.received)}</td>
                                                        <td style={{ backgroundColor: "inherit", whiteSpace: "nowrap" }}>{this.state.moeda == 5 ? "R$" : "USD"} {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row.balance)}</td>
                                                    </tr>
                                                )
                                            }
                                        })}
                                        <tr style={{ fontSize: 13 }}>
                                            <th colSpan={this.state.clientes[0] ? '5' : '6'}>{"Total ->"}</th>
                                            <td style={{ paddingRight: '15px', borderTop: "1px solid black", whiteSpace: "nowrap" }}>{this.state.moeda == 5 ? "R$" : "USD"} {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalFDAPorGrupo)}</td>
                                            <td style={{ paddingRight: '15px', borderTop: "1px solid black", whiteSpace: "nowrap" }}>{this.state.moeda == 5 ? "R$" : "USD"} {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalDiscountPorGrupo)}</td>
                                            <td style={{ paddingRight: '15px', borderTop: "1px solid black", whiteSpace: "nowrap" }}>{this.state.moeda == 5 ? "R$" : "USD"} {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalReceivedPorGrupo)}</td>
                                            <td style={{ paddingRight: '15px', borderTop: "1px solid black", whiteSpace: "nowrap" }}>{this.state.moeda == 5 ? "R$" : "USD"} {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalBalancePorGrupo)}</td>
                                        </tr>
                                    </table>
                                    <hr />
                                </div>
                            )
                        })}
                        <table className='totalTablePDF'>
                            <tr style={{ fontSize: 13 }}>
                                <th></th>
                                <th style={{ borderBottom: "1px solid black" }}>FDA</th>
                                <th style={{ borderBottom: "1px solid black" }}>DISCOUNT</th>
                                <th style={{ borderBottom: "1px solid black" }}>RECEIVED</th>
                                <th style={{ borderBottom: "1px solid black" }}>BALANCE</th>
                            </tr>
                            <tr style={{ fontSize: 12 }}>
                                <th>{"Total ->"}</th>
                                <td style={{ paddingRight: '15px', whiteSpace: "nowrap" }}>{this.state.moeda == 5 ? "R$" : "USD"} {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalFDA)}</td>
                                <td style={{ paddingRight: '15px', whiteSpace: "nowrap" }}>{this.state.moeda == 5 ? "R$" : "USD"} {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalDiscount)}</td>
                                <td style={{ paddingRight: '15px', whiteSpace: "nowrap" }}>{this.state.moeda == 5 ? "R$" : "USD"} {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalReceived)}</td>
                                <td style={{ paddingRight: '15px', whiteSpace: "nowrap" }}>{this.state.moeda == 5 ? "R$" : "USD"} {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(this.state.totalBalance)}</td>
                            </tr>
                        </table>

                        <br />
                        <br />
                        <br />

                        <h5 style={{ width: "100%", textAlign: "center" }}>BANKING DETAILS</h5>
                        <table style={{ width: "80%", marginLeft: "5%" }}>
                            <tr>
                                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}><b style={{ paddingRight: 5 }}>Bank's name:</b> Banco do Brasil</td>
                            </tr>
                            <tr>
                                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}><b style={{ paddingRight: 5 }}>Branch's name:</b> Rio Grande</td>
                            </tr>
                            <tr>
                                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}><b style={{ paddingRight: 5 }}>Address:</b> Benjamin Constant St, 72</td>
                            </tr>
                            <tr>
                                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}><b style={{ paddingRight: 5 }}>Swift Code:</b> BRASBRRJCTA</td>
                            </tr>
                            <tr>
                                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}><b style={{ paddingRight: 5 }}>IBAN:</b> BR6400000000026940001614410C1</td>
                            </tr>
                            <tr>
                                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}><b style={{ paddingRight: 5 }}>Branch's number:</b> 2694-8</td>
                            </tr>
                            <tr>
                                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}><b style={{ paddingRight: 5 }}>Account number:</b> 161441-X</td>
                            </tr>
                            <tr>
                                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}><b style={{ paddingRight: 5 }}>Account name:</b> SUL TRADE AGENCIAMENTOS MARITIMOS LTDA-ME</td>
                            </tr>
                            <tr>
                                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}><b style={{ paddingRight: 5 }}>Phone:</b> +55 53 3235 3500</td>
                            </tr>
                            <tr>
                                <td style={{ padding: "0px 3px 0px 3px", paddingRight: 100 }}><b style={{ paddingRight: 5 }}>CNPJ:</b> 10.432.546/0001-75</td>
                            </tr>

                        </table>
                    </div>
                }
                {
                    this.props.location.state.backTo == 'contasPagas' || this.props.location.state.backTo == 'contasPagar' &&
                    <div className='pdfContent'>
                        {relatorio.map((e) => {
                            console.log(e);
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
                                            <th style={{ minWidth: 100 }}>Nº DOCTO</th>
                                            <th style={{ minWidth: 75 }}>PO</th>
                                            <th style={{ minWidth: 100 }}>PESSOA</th>
                                            <th style={{ minWidth: 150 }}>HISTORICO</th>
                                            <th style={{ minWidth: 100 }}>SALDO</th>
                                            <th style={{ minWidth: 100 }}>VALOR</th>
                                        </tr>
                                        <tr style={{ backgroundColor: "#999999", border: "1px solid black" }}>
                                            <th colSpan={6}>
                                                <span style={{ fontSize: "1.2em" }}>{this.state.por == "porCliente" && e.pessoa ? e.pessoa.split('@.@')[0]
                                                    : this.state.por == "porVencimento" && e.vencimento ? moment(e.vencimento.split('@.@')[0]).format('DD/MM/YYYY')
                                                        : e.dataPagamento ? moment(e.dataPagamento.split('@.@')[0]).format('DD/MM/YYYY') : ''}</span>
                                            </th>
                                        </tr>
                                        {map.map((el, index) => {
                                            let valor = 0;
                                            let saldo = 0;

                                            if (e.os_moeda && this.state.moeda == e.os_moeda.split("@.@")[index] || !e.os_moeda) {
                                                valor = e.valor ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(e.valor.split("@.@")[index] /* - e.valorDescontos*/) : '0,00';
                                                saldo = e.saldo ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(e.saldo.split("@.@")[index] /* - e.valorDescontos*/) : "0,00";
                                            } else if (this.state.moeda == 5) {
                                                valor = e.valor ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(e.ROE && !!e.ROE.split("@.@")[index] && e.ROE.split("@.@")[index] != 0 ? e.ROE.split("@.@")[index] : 5) * parseFloat(e.valor.split("@.@")[index] /* - e.valorDescontos*/)) : "0,00";
                                                saldo = e.saldo ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(e.ROE && !!e.ROE.split("@.@")[index] && e.ROE.split("@.@")[index] != 0 ? e.ROE.split("@.@")[index] : 5) * parseFloat(e.saldo.split("@.@")[index] /* - e.valorDescontos*/)) : "0,00";
                                            } else {
                                                valor = e.valor ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(e.valor.split("@.@")[index] /* - e.valorDescontos*/) / parseFloat(e.ROE && !!e.ROE.split("@.@")[index] && e.ROE.split("@.@")[index] != 0 ? e.ROE.split("@.@")[index] : 5)) : "0,00";
                                                saldo = e.saldo ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(e.saldo.split("@.@")[index] /* - e.valorDescontos*/) / parseFloat(e.ROE && !!e.ROE.split("@.@")[index] && e.ROE.split("@.@")[index] != 0 ? e.ROE.split("@.@")[index] : 5)) : "0,00";
                                            }


                                            totalValor += parseFloat(valor.replaceAll('.', '').replaceAll(',', '.'));
                                            totalValorPorGrupo += parseFloat(valor.replaceAll('.', '').replaceAll(',', '.'));

                                            totalSaldo += parseFloat(saldo.replaceAll('.', '').replaceAll(',', '.'));
                                            totalSaldoPorGrupo += parseFloat(saldo.replaceAll('.', '').replaceAll(',', '.'));


                                            if (parseFloat(valor.replaceAll('.', '').replaceAll(",", ".")) > 0) {
                                                return (
                                                    <tr style={{ backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#999999" }}>
                                                        <td style={{ minWidth: 100, backgroundColor: "inherit" }}>{e.documento ? util.removeAcentos(e.documento.split('@.@')[index]) : ''}</td>
                                                        <td style={{ minWidth: 75, backgroundColor: "inherit" }}>{e.os ? util.removeAcentos(e.os.split('@.@')[index]) : ''}</td>
                                                        <td style={{ minWidth: 100, backgroundColor: "inherit" }}>{e.pessoa ? util.removeAcentos(e.pessoa.split('@.@')[index]) : ''}</td>
                                                        <td style={{ minWidth: 150, backgroundColor: "inherit" }}>{e.historico ? util.removeAcentos(e.historico.split('@.@')[index]) : ''}</td>
                                                        <td style={{ minWidth: 100, backgroundColor: "inherit", paddingLeft: 3, paddingRight: 3 }}>{this.state.moeda == 5 ? "R$" : "USD"} {valor}</td>
                                                        <td style={{ minWidth: 100, backgroundColor: "inherit", paddingLeft: 3, paddingRight: 3 }}>{this.state.moeda == 5 ? "R$" : "USD"} {saldo}</td>
                                                    </tr>
                                                )
                                            }
                                        })}
                                        <tr>
                                            <th colSpan='4'>{"Total ->"}</th>
                                            <td style={{ borderTop: "1px solid black", paddingLeft: 3, paddingRight: 3 }}>{this.state.moeda == 5 ? "R$" : "USD"} {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalValorPorGrupo)}</td>
                                            <td style={{ borderTop: "1px solid black", paddingLeft: 3, paddingRight: 3 }}>{this.state.moeda == 5 ? "R$" : "USD"} {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalSaldoPorGrupo)}</td>
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
                await this.setState({ contatos: response.data, fornecedorEmail: response.data.find((e) => e.Tipo == "EM") ? response.data.find((e) => e.Tipo == "EM")?.Campo1 : "" })
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
                                fileName={this.state.pdfNome}
                                scale={0.6}
                                portrait={true}

                                paperSize="A4"
                                margin="0.5cm"
                                ref={this.pdfExportComponent}>
                                {this.state.pdfgerado}
                            </PDFExport>

                            <div style={{ display: "flex", flexDirection: "row", width: "100%", justifyContent: "center" }}>
                                <button className="btn btn-danger" style={{ margin: 20 }} onClick={() => this.pdfExportComponent.current.save()}>Exportar PDF</button>
                                {this.state.clientes[0] && !this.state.clientes[1] &&
                                    <button className="btn btn-info" style={{ margin: 20 }} onClick={() => this.setState({ emailModal: true })}>Enviar por email</button>
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
                                                        {/* <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Conta</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ planosContasOptionsTexto: e }) }} value={this.state.planosContasOptions.filter(option => option.value == this.state.conta)[0]} search={true} onChange={(e) => { this.setState({ conta: e.value, }) }} />
                                                        </div> */}
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Centro de Custo</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.centrosCustosOptions.filter(e => this.filterSearch(e, this.state.centrosCustosOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ centrosCustosOptionsTexto: e }) }} value={this.state.centrosCustosOptions.filter(option => option.value == this.state.centroCusto)[0]} search={true} onChange={(e) => { this.setState({ centroCusto: e.value, }) }} />
                                                        </div>

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Pessoas</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.pessoasOptions.filter(e => this.filterSearch(e, this.state.pessoasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ pessoasOptionsTexto: e }) }} search={true} onChange={(e) => { if (!this.state.clientes.find((c) => c == e.value)) this.setState({ clientes: [...this.state.clientes, e.value], emails: [], failures: [], successes: [] }) }} />
                                                            <div style={{ marginBottom: 20, color: 'white', fontSize: 13 }}>
                                                                {this.state.clientes.map((e, i) => (
                                                                    <span class="click_to_erase" onClick={() => this.setState({ clientes: this.state.clientes.filter((c) => c != e), emails: [], failures: [], successes: [] })}>{`${this.state.pessoas.find((p) => p.Chave == e)?.Nome}${i != this.state.clientes.length - 1 ? ', ' : ' '}`}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Moeda</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.moedasOptions.filter(e => this.filterSearch(e, this.state.moedasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ moedasOptionsTexto: e }) }} value={this.state.moedasOptions.filter(option => option.value == this.state.moeda)[0]} search={true} onChange={(e) => { this.setState({ moeda: e.value, }) }} />
                                                        </div>
                                                        {/* <div className="col-12">
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
                                                        </div> */}
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
                                                                        <span className='listaEmail failureEmail' title='Email inválido' onClick={async () => await this.removeEmail(e)}>{e}{this.state.failures[i + 1] ? ", " : ""}</span>
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

