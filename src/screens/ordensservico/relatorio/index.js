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
import { apiEmployee } from '../../../services/apiamrg'
import loader from '../../../classes/loader'
import moment from 'moment'
import Select from 'react-select';
import { Skeleton } from '@mui/material';
import Modal from '@material-ui/core/Modal';


const estadoInicial = {
    situacao: 'A',
    porto: '',
    centroCusto: '',
    navio: '',
    cliente: '',
    periodoInicial: moment('2000-01-01').format('YYYY-MM-DD'),
    periodoFinal: moment().format('YYYY-MM-DD'),
    lancamentoInicial: moment('1900-1-1').format('YYYY-MM-DD'),
    lancamentoFinal: moment('2100-12-31').format('YYYY-MM-DD'),
    excluirTipos: false,
    moeda: 6,

    moedasOptions: [],
    moedasOptionsTexto: "",

    situacaoOptions: [
        {value: "T", label: "Todos"},
        {value: "A", label: "Em Aberto"},
        {value: "E", label: "Encerradas"},
        {value: "F", label: "Faturadas"},
        {value: "C", label: "Canceladas"}
    ],
    
    naviosOptions: [],
    naviosOptionsTexto: '',
    clientesOptions: [],
    clientesOptionsTexto: '',
    centrosCustos: [],
    centrosCustosOptions: [],
    centrosCustosOptionsTexto: '',
    portosOptions: [],
    portosOptionsTexto: '',

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

class RelatorioOS extends Component {

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

        await this.loadAll();
    }

    loadAll = async () => {
        await this.setState({
            acessos: await loader.getBase('getTiposAcessos.php'),
            permissoes: await loader.getBase('getPermissoes.php'),
            naviosOptions: await loader.getBaseOptions("getNavios.php", "nome", "chave"),
            clientesOptions: await loader.getBaseOptionsCustomLabel(
                "getClientes.php",
                "Nome",
                "Cnpj_Cpf",
                "Chave"
              ),
            portosOptions: await loader.getBaseOptions("getPortos.php", "Descricao", "Chave"),
            centrosCustosOptions: await loader.getBaseOptions("getCentrosCustos.php", "Descricao", "Chave")
        })

        const {naviosOptions, portosOptions, centrosCustosOptions, clientesOptions} = this.state;

        naviosOptions.unshift({value: "", label: "Todos"});
        portosOptions.unshift({value: "", label: "Todos"});
        centrosCustosOptions.unshift({value: "", label: "Todos"});
        clientesOptions.unshift({value: "", label: "Todos"});

        await this.setState({
            acessosPermissoes: await loader.testaAcesso(this.state.acessos, this.state.permissoes, this.state.usuarioLogado),
            naviosOptions,
            portosOptions,
            centrosCustosOptions,
            clientesOptions,
            loading: false,
        })
    }

    gerarRelatorio = async (validForm) => {
        this.setState({ loading: true });
        if (!validForm) {
            return;
        }

        const empresa = `os.Empresa = ${this.state.empresa}`;
        const situacao = this.state.situacao == 'A' ? `os.cancelada != 1 AND (os.Data_Encerramento = "" OR os.Data_Encerramento = "0000-00-00 00:00:00" OR os.Data_Encerramento is null)` : this.state.situacao == "E" ? `os.cancelada != 1 AND (os.Data_Encerramento != "" AND os.Data_Encerramento != "0000-00-00 00:00:00" AND os.Data_Encerramento is not null AND (os.Data_Faturamento = "" OR os.Data_Faturamento = "0000-00-00 00:00:00" OR os.Data_Faturamento is null))` : this.state.situacao == "F" ? `os.cancelada != 1 AND (os.Data_Faturamento != "" AND os.Data_Faturamento != "0000-00-00 00:00:00" AND os.Data_Faturamento is not null)` : this.state.situacao == "C" ? `os.cancelada = 1` : ``;
        const navio = this.state.navio ? `os.chave_navio = '${this.state.navio}'` : '';
        const cliente = this.state.cliente ? `os.chave_cliente = '${this.state.cliente}'` : '';
        const centroCusto = this.state.centroCusto ? `os.centro_custo = '${this.state.centroCusto}'` : '';
        const porto = this.state.porto ? `os.porto = '${this.state.porto}'` : '';
        const periodoInicial = this.state.periodoInicial ? `os.${this.state.situacao == "F" ? "Data_Faturamento" : "Data_Abertura"} >= '${moment(this.state.periodoInicial).format('YYYY-MM-DD')}'` : '';
        const periodoFinal = this.state.periodoFinal ? `os.${this.state.situacao == "F" ? "Data_Faturamento" : "Data_Abertura"} <= '${moment(this.state.periodoFinal).format('YYYY-MM-DD')}'` : '';

        let where = [empresa, situacao, navio, centroCusto, porto, periodoInicial, periodoFinal, cliente];
        where = where.filter((e) => e.trim() != "");

        await apiEmployee.post(`gerarRelatorioOS.php`, {
            token: true,
            where: where.join(' AND ')
        }).then(
            async res => {
                await this.setState({ relatorio: res.data })
                this.relatorio();
            },
            async err => { this.erroApi(JSON.stringify(err)) }
        )
        this.setState({ loading: false });
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

    // Função para determinar a situação da OS
    getSituacaoOS = (os) => {
        // Cancelada
        if (os.cancelada == 1) return "Cancelada";
        // Faturada
        if (os.Data_Faturamento && os.Data_Faturamento != "" && os.Data_Faturamento != "0000-00-00 00:00:00" && os.Data_Faturamento != null)
            return "Faturada";
        // Encerrada
        if (os.Data_Encerramento && os.Data_Encerramento != "" && os.Data_Encerramento != "0000-00-00 00:00:00" && os.Data_Encerramento != null)
            return "Encerrada";
        // Em Aberto
        return "Em Aberto";
    }

    relatorio = async () => {
        this.setState({ loading: true });
        const relatorio = this?.state?.relatorio;

        // Cores para situações
        const situacaoColors = {
            "Em Aberto": "#f7ca18",
            "Encerrada": "#3498db",
            "Faturada": "#27ae60",
            "Cancelada": "#e74c3c"
        };

        let pdf =
            <div style={{ zoom: 1 }} key={546546554654}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                    <img className="img-fluid" src="https://i.ibb.co/vmKJkx4/logo.png" alt="logo-Strade" border="0" style={{ width: '30%', height: '180px', maxWidth: "100%", marginBottom: 10 }} />
                    <h2 style={{ margin: 0, color: '#2c3e50' }}>Relatório de OS</h2>
                </div>
                <div className='pdfContent'>
                    <table style={{width: "100%", borderCollapse: "collapse", fontSize: "0.95em"}}>
                        <thead>
                        <tr style={{background: "#f4f4f4"}}>
                            <th style={{borderBottom: "2px solid #2c3e50", padding: "10px", textAlign: "center"}}>Código</th>
                            <th style={{borderBottom: "2px solid #2c3e50", padding: "10px", textAlign: "center"}}>Navio</th>
                            <th style={{borderBottom: "2px solid #2c3e50", padding: "10px", textAlign: "center"}}>Porto</th>
                            <th style={{borderBottom: "2px solid #2c3e50", padding: "10px", textAlign: "center"}}>ETA</th>
                            <th style={{borderBottom: "2px solid #2c3e50", padding: "10px", textAlign: "center"}}>ETB</th>
                            <th style={{borderBottom: "2px solid #2c3e50", padding: "10px", textAlign: "center"}}>ETS</th>
                            <th style={{borderBottom: "2px solid #2c3e50", padding: "10px", textAlign: "center"}}>Cliente</th>
                            <th style={{borderBottom: "2px solid #2c3e50", padding: "10px", textAlign: "center"}}>Tipo de Serviço</th>
                            <th style={{borderBottom: "2px solid #2c3e50", padding: "10px", textAlign: "center"}}>Situação</th>
                        </tr>
                        </thead>
                        <tbody>
                        {relatorio?.map((e, idx) => {
                            const situacao = this.getSituacaoOS(e);
                            return (
                                <tr key={idx} style={{background: idx % 2 === 0 ? "#fff" : "#f9f9f9"}}>
                                    <td style={{borderBottom: "1px solid #ddd", padding: "8px", textAlign: "center"}}>{e.codigo}</td>
                                    <td style={{borderBottom: "1px solid #ddd", padding: "8px", textAlign: "center"}}>{e.navioNome}</td>
                                    <td style={{borderBottom: "1px solid #ddd", padding: "8px", textAlign: "center"}}>{e.portoNome}</td>
                                    <td style={{borderBottom: "1px solid #ddd", padding: "8px", textAlign: "center"}}>{moment(e.ETA).format("DD/MM/YYYY") === "Invalid date" ? "" : moment(e.ETA).format("DD/MM/YYYY")}</td>
                                    <td style={{borderBottom: "1px solid #ddd", padding: "8px", textAlign: "center"}}>{moment(e.ETB).format("DD/MM/YYYY") === "Invalid date" ? "" : moment(e.ETB).format("DD/MM/YYYY")}</td>
                                    <td style={{borderBottom: "1px solid #ddd", padding: "8px", textAlign: "center"}}>{moment(e.ETS).format("DD/MM/YYYY") === "Invalid date" ? "" : moment(e.ETS).format("DD/MM/YYYY")}</td>
                                    <td style={{borderBottom: "1px solid #ddd", padding: "8px", textAlign: "center"}}>{e.pessoaNomeFantasia ? e.pessoaNomeFantasia : e.pessoaNome}</td>
                                    <td style={{borderBottom: "1px solid #ddd", padding: "8px", textAlign: "center"}}>{e.tipoServicoNome}</td>
                                    <td style={{borderBottom: "1px solid #ddd", padding: "8px", textAlign: "center"}}>
                                        <span style={{
                                            background: situacaoColors[situacao] || "#bdc3c7",
                                            color: "#fff",
                                            borderRadius: "12px",
                                            padding: "4px 12px",
                                            fontWeight: "bold",
                                            fontSize: "0.95em"
                                        }}>{situacao}</span>
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>
            </div >

        await this.setState({ pdfgerado: pdf, pdfView: true, loading: false, pdfEmail: ReactDOMServer.renderToString(pdf) })
        this.handleExportWithComponent()
    }

    handleExportWithComponent = event => {
        this.pdfExportComponent.current.save();
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
        validations.push(!this.state.bloqueado)

        const validForm = validations.reduce((t, a) => t && a)


        return (
            <div className='allContent'>
                {this.state.loading &&
                    <Skeleton />
                }
                {!this.state.loading &&
                    <>
                        <div
                            style={{
                                position: "absolute",
                                left: "-900000px",
                                top: 0,
                            }}


                        >
                            <PDFExport
                                fileName={"relatorio_os"}
                                scale={0.6}
                                landscape={true}
                                className={"pdfExp"}
                                paperSize="A4"
                                margin="0.5cm"
                                forcePageBreak=".page-break"
                                ref={this.pdfExportComponent}>
                                {this.state.pdfgerado}
                            </PDFExport>
                        </div>
                        {this.state.redirect &&
                            <Redirect to={'/'} />
                        }

                        <section>
                            <Header voltarOS relatorio titulo="OS" />
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
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Situação</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.situacaoOptions} value={this.state.situacaoOptions.find(option => option.value == this.state.situacao)} search={true} onChange={(e) => { this.setState({ situacao: e.value, }) }} />
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
                                                            <label>Navio</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.naviosOptions.filter(e => this.filterSearch(e, this.state.naviosOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ naviosOptionsTexto: e }) }} value={this.state.naviosOptions.find(option => option.value == this.state.navio)} search={true} onChange={(e) => { this.setState({ navio: e.value, }) }} />
                                                        </div>

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Cliente</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.clientesOptions.filter(e => this.filterSearch(e, this.state.clientesOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ clientesOptionsTexto: e }) }} value={this.state.clientesOptions.find(option => option.value == this.state.cliente)} search={true} onChange={(e) => { this.setState({ cliente: e.value, }) }} />
                                                        </div>

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Porto</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.portosOptions.filter(e => this.filterSearch(e, this.state.portosOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ portosOptionsTexto: e }) }} value={this.state.portosOptions.find(option => option.value == this.state.porto)} search={true} onChange={(e) => { this.setState({ porto: e.value, }) }} />
                                                        </div>
                                                        <div className="col-12">
                                                            <label className="center relatorioLabelTitulo">{this.state.situacao == "F" ? "Data faturamento" : "Abertura"}</label>
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
                    </>
                }
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

export default connect(mapStateToProps, null)(RelatorioOS)

