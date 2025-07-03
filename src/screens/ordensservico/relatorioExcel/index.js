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
import XLSX from "xlsx-js-style";


const estadoInicial = {
    situacao: 'F',
    porto: '',
    centroCusto: '',
    navio: '',
    cliente: '',
    periodoInicial: moment('2024-01-01').format('YYYY-MM-DD'),
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

class RelatorioExcel extends Component {

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

    gerarExcel = async (validForm) => {
        this.setState({ loading: true });
        if (!validForm) {
            return;
        }
    
        const empresa = `os.Empresa = ${this.state.empresa}`;
        const situacao = this.state.situacao == 'A' ? `os.cancelada != 1 AND (os.Data_Encerramento = "" OR os.Data_Encerramento = "0000-00-00 00:00:00")` : this.state.situacao == "E" ? `os.cancelada != 1 AND (os.Data_Encerramento != "" AND os.Data_Encerramento != "0000-00-00 00:00:00" AND (os.Data_Faturamento = "" OR os.Data_Faturamento = "0000-00-00 00:00:00"))` : this.state.situacao == "F" ? `os.cancelada != 1 AND (os.Data_Faturamento != "" AND os.Data_Faturamento != "0000-00-00 00:00:00")` : this.state.situacao == "C" ? `os.cancelada = 1` : ``;
        const navio = this.state.navio ? `os.chave_navio = '${this.state.navio}'` : '';
        const cliente = this.state.cliente ? `os.chave_cliente = '${this.state.cliente}'` : '';
        const centroCusto = this.state.centroCusto ? `os.centro_custo = '${this.state.centroCusto}'` : '';
        const porto = this.state.porto ? `os.porto = '${this.state.porto}'` : '';
        const periodoInicial = this.state.periodoInicial ? `os.${this.state.situacao == "F" ? "Data_Faturamento" : "Data_Abertura"} >= '${moment(this.state.periodoInicial).format('YYYY-MM-DD')}'` : '';
        const periodoFinal = this.state.periodoFinal ? `os.${this.state.situacao == "F" ? "Data_Faturamento" : "Data_Abertura"} <= '${moment(this.state.periodoFinal).format('YYYY-MM-DD')}'` : '';
    
        let where = [empresa, situacao, navio, centroCusto, porto, periodoInicial, periodoFinal, cliente];
        where = where.filter((e) => e.trim() != "");
    
        await apiEmployee.post(`gerarRelatorioExcel.php`, {
            token: true,
            where: where.join(' AND ')
        }).then(
            async res => {
                await this.gerarPlanilhaExcel(res.data);
            },
            async err => { this.erroApi(JSON.stringify(err)) }
        )
        this.setState({ loading: false });
    }
    
    gerarPlanilhaExcel = (relatorio) => {
        function formatarValor(valor){
            return new Intl.NumberFormat('pt-BR', {
                style: 'decimal',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(valor);
        }

        const faturamentoDataInicial = moment(this.state.periodoInicial).format('MM/YYYY');
        const faturamentoDataFinal = moment(this.state.periodoFinal).format('MM/YYYY');
        const faturamentoData = faturamentoDataInicial === faturamentoDataFinal
            ? faturamentoDataInicial 
            : `${faturamentoDataInicial} - ${faturamentoDataFinal}`;

        const workbook = XLSX.utils.book_new();

        console.log(relatorio)

        const dadosFormatados = relatorio.map(item => {
            const parseValor = (valor) => {
                return valor !== null && !isNaN(parseFloat(valor)) ? parseFloat(valor) : 0;
            };
        
            // Calcula valores de STA
            const valorStaRig = parseValor(item.valorLiquidoStaRig);
            const valorStaSantos = parseValor(item.valorLiquidoStaSantos);

            return {
            'CLIENTES': item.pessoaNome,               
            'ST': item.codigo,                          
            'NAVIO': item.navioNome,                
            'PORTOS': item.portoNome,               
            'UND FATURAMENTO': item.portoNome === 'SANTOS' ? 'SANTOS' : 'RIO GRANDE', 
            'NACIONALIDADE': '',

            'STA RIG': item.portoNome === 'SANTOS' 
            ? formatarValor(0) 
            : formatarValor(valorStaRig),

            'STA SANTOS': item.portoNome === 'SANTOS'
            ? formatarValor(valorStaRig + valorStaSantos)
            : formatarValor(valorStaSantos),
        
            'PORTO BRASIL': formatarValor(parseValor(item.valorLiquidoPortoBrasil)),
        
            'COAST': formatarValor(parseValor(item.valorLiquidoCoast)),
        
            'TOTAL CUSTEIO': formatarValor([
                item.valorLiquidoStaRig,
                item.valorLiquidoStaSantos,
                item.valorLiquidoPortoBrasil,
                item.valorLiquidoCoast
            ].reduce((total, valor) => {
                const valorNumerico = parseFloat(valor);
                return !isNaN(valorNumerico) ? total + valorNumerico : total;
            }, 0)),    

            'SERVIÇO': item.tipoServicoNome,                                 
                          
        }});
    
        // Criar a worksheet manualmente
        const worksheet = {};

        // Configurar a linha inicial dos dados
        const linhaInicialDados = 2;

        // Adicionar subheaders
        worksheet[XLSX.utils.encode_cell({ r: 0, c: 0 })] = {
            v: `FATURAMENTO ${faturamentoData}`,
            s: {
                alignment: { horizontal: 'center', vertical: 'center' },
                fill: { fgColor: { rgb: 'FFFFFF' } },
                font: { bold: true }
            }
        };
        worksheet[XLSX.utils.encode_cell({ r: 0, c: 6 })] = {
            v: 'CUSTEIO',
            s: {
                alignment: { horizontal: 'center', vertical: 'center' },
                fill: { fgColor: { rgb: 'A9D08E' } },
                font: { bold: true }
            }
        };
        worksheet[XLSX.utils.encode_cell({ r: 0, c: 10 })] = {
            v: '',
            s: {
                alignment: { horizontal: 'center', vertical: 'center' },
                fill: { fgColor: { rgb: 'FFFFFF' } },
                font: { bold: true }
            }
        };

        // Mesclar células para os subheaders
        worksheet['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // "FATURAMENTO" cobre CLIENTES a NACIONALIDADE
            { s: { r: 0, c: 6 }, e: { r: 0, c: 9 } }, // "CUSTEIO" cobre STA RIG a COAST
            { s: { r: 0, c: 10 }, e: { r: 0, c: 14 } } // "OUTROS" cobre TOTAL CUSTEIO a ETS
        ];

        // Adicionar cabeçalhos na linha especificada
        const headers = [
            'CLIENTES', 'ST', 'NAVIO', 'PORTOS', 'UND FATURAMENTO', 'NACIONALIDADE',
            'STA RIG', 'STA SANTOS', 'PORTO BRASIL', 'COAST',
            'TOTAL CUSTEIO', 'SERVIÇO'
        ];  
        const headerColors = [
            '9ED1E1', '9ED1E1', '9ED1E1', '9ED1E1', '9ED1E1', '9ED1E1',
            '9ED1E1', '9ED1E1', '9ED1E1', '9ED1E1',
            'FFFF00', // Amarelo para TOTAL CUSTEIO
            '9ED1E1', '9ED1E1', '9ED1E1', '9ED1E1'
        ];

        for (let col = 0; col < headers.length; col++) {
            worksheet[XLSX.utils.encode_cell({ r: linhaInicialDados - 1, c: col })] = {
                v: headers[col],
                s: {
                    fill: { fgColor: { rgb: headerColors[col] } }, 
                    alignment: { horizontal: 'center', vertical: 'center' },
                    border: {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    }
                }
            };
        }

        // Adicionar dados após os cabeçalhos
        dadosFormatados.forEach((item, index) => {
            const row = linhaInicialDados + index; // Define a linha inicial dos dados
            Object.values(item).forEach((value, col) => {
                worksheet[XLSX.utils.encode_cell({ r: row, c: col })] = {
                    v: value,
                    s: {
                        alignment: { horizontal: 'center', vertical: 'center' },
                        border: {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        }
                    }
                };
            });
        });

        const colunasCusteio = ['STA RIG', 'STA SANTOS', 'PORTO BRASIL', 'COAST', 'TOTAL CUSTEIO'];
        const totaisCusteio = colunasCusteio.map(coluna =>
            dadosFormatados.reduce((total, item) => {
              const valorLimpo = item[coluna]
                .replace(/\./g, '')
                .replace(',', '.');    
              const valorNumerico = parseFloat(valorLimpo);
              return !isNaN(valorNumerico) ? total + valorNumerico : total;
            }, 0)
          );

        const totalRows = linhaInicialDados + dadosFormatados.length;

        const custeioColumns = [6, 10];
        for (let row = 0; row <= totalRows; row++) {
            for (let col of custeioColumns) {
                const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: col })];
                if (cell) {
                    cell.s = {
                        ...cell.s,
                        border: {
                            top: { style: 'thin' },
                            left: { style: 'medium' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        }
                    };
                }
            }
        }

        worksheet[XLSX.utils.encode_cell({ r: totalRows, c: 5 })] = {
            v: "TOTAL",
            s: {
                alignment: { horizontal: 'center', vertical: 'center' },
                font: { bold: true },
                border: {
                    top: { style: 'medium' },
                    left: { style: 'medium' },
                    bottom: { style: 'medium' },
                    right: { style: 'medium' }
                }
            }
        };
        
        const quantidadeST = dadosFormatados.filter(item => item['ST']).length;

        worksheet[XLSX.utils.encode_cell({ r: totalRows, c: 0 })] = {
            v: "TOTAL CUSTEIOS EMITIDOS",
            s: {
                alignment: { horizontal: 'center', vertical: 'center' },
                font: { bold: true },
                border: {
                    top: { style: 'medium' },
                    left: { style: 'medium' },
                    bottom: { style: 'medium' },
                    right: { style: 'thin' }
                }
            }
        };

        worksheet[XLSX.utils.encode_cell({ r: totalRows, c: 1 })] = {
            v: quantidadeST,
            s: {
                alignment: { horizontal: 'center', vertical: 'center' },
                font: { bold: true },
                border: {
                    top: { style: 'medium' },
                    left: { style: 'thin' },
                    bottom: { style: 'medium' },
                    right: { style: 'medium' }
                }
            }
        };

        totaisCusteio.forEach((total, index) => {
            const colunaIndex = 6 + index; // Índice real da coluna (6 é a coluna STA RIG)
            worksheet[XLSX.utils.encode_cell({ r: totalRows, c: colunaIndex })] = {
                v: formatarValor(total), 
                s: {
                    alignment: { horizontal: 'center', vertical: 'center' },
                    font: { bold: true },
                    border: {
                        top: { style: 'medium' },
                        left: { style: 'thin' },
                        bottom: { style: 'medium' },
                        right: { style: 'medium' }
                    }
                }
            };
        });

        worksheet['!ref'] = XLSX.utils.encode_range({
            s: { r: 0, c: 0 }, // Início (subheader)
            e: { r: totalRows, c: headers.length - 1 } // Final
        });

        // Definir larguras de colunas
        const colWidths = headers.map((header, index) => ({
            wch: Math.max(header.length + 2, ...dadosFormatados.map(item => (item[headers[index]] || '').toString().length + 2))
        }));
        worksheet['!cols'] = colWidths;

        // Adicionar a worksheet ao workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório de OS");

        // Gerar o arquivo Excel
        try {
            XLSX.writeFile(workbook, "relatorio_os.xlsx");
        } catch (error) {
            console.error('Error writing Excel file:', error);
        }
    };

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
                                            this.gerarExcel(validForm)
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

export default connect(mapStateToProps, null)(RelatorioExcel)

