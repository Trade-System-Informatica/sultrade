import React, { Component } from 'react'
import './styles.css'
import { Formik, Form } from 'formik'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import util from '../../../classes/util'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { apiEmployee } from '../../../services/apiamrg'
import loader from '../../../classes/loader'
import moment from 'moment'
import Select from 'react-select';
import Skeleton from '../../../components/skeleton'
import XLSX from "xlsx-js-style";
import apiHeroku from '../../../services/apiHeroku'

const estadoInicial = {
    situacao: 'F',
    centroCusto: '',
    moeda: 5,
    ordenacao: '',
    clientes: [],
    periodoInicial: moment('2024-10-25').format('YYYY-MM-DD'),
    periodoFinal: moment().format('YYYY-MM-DD'),
    
    moedasOptions: [],
    moedasOptionsTexto: "",

    situacaoOptions: [
        {value: "T", label: "Todas"},
        {value: "F", label: "Faturadas"},
        {value: "E", label: "Enviadas"}
    ],
    
    ordenacaoOptions: [
        {value: "porCliente", label: "Por Cliente"},
        {value: "porLancamento", label: "Por Lançamento"}
    ],

    centrosCustos: [],
    centrosCustosOptions: [],
    centrosCustosOptionsTexto: '',
    
    pessoasOptions: [],
    pessoasOptionsTexto: '',
    pessoas: [],

    bloqueado: false,
    loading: false,
    relatorio: []
}

class DemonstrativoDeResultado extends Component {
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
        this.setState({ loading: true });
        
        try {
            const [acessos, permissoes, moedasOptions, centrosCustosOptions] = await Promise.all([
                loader.getBase('getTiposAcessos.php'),
                loader.getBase('getPermissoes.php'),
                loader.getBaseOptions("getMoedas.php", "Descricao", "Chave"),
                loader.getBaseOptions("getCentrosCustos.php", "Descricao", "Chave")
            ]);
            
            await this.setState({
                acessos,
                permissoes,
                moedasOptions,
                centrosCustosOptions
            });
            
            const acessosPermissoes = await loader.testaAcesso(
                this.state.acessos, 
                this.state.permissoes, 
                this.state.usuarioLogado
            );
            
            await this.setState({ acessosPermissoes });
            await this.getPessoasCategorias();
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        } finally {
            this.setState({ loading: false });
        }
    }

    getPessoasCategorias = async () => {
        try {
            const res = await apiEmployee.post(`getPessoasCategoria.php`, {
                token: true,
                categoria: "1%",
            });
            
            await this.setState({ pessoas: res.data });

            const options = this.state.pessoas.map((e) => {
                return {
                    label: `${e.Nome_Fantasia ? e.Nome_Fantasia : e.Nome}${
                        e.Cnpj_Cpf ? ` - ${util.formataCPF(e.Cnpj_Cpf)}` : ""
                    }`,
                    value: e.Chave,
                };
            });

            await this.setState({ pessoasOptions: options });
        } catch (err) {
            this.erroApi(err);
        }
    };

    gerarRelatorio = async (validForm) => {
        this.setState({ loading: true });
        
        if (!validForm) {
            this.setState({ loading: false });
            return;
        }
        
        try {
            const res = await apiHeroku.post(`/demonstrativo`, {
                token: true,
                all: this.state.clientes.length === 0, 
                chaves: this.state.clientes, 
                orderBy: this.state.ordenacao == "porCliente" ? "chave_cliente" : "Lancto",
                centro_custo: this.state.centroCusto,
                data_inicial: this.state.periodoInicial,
                data_final: this.state.periodoFinal,
                situacao: this.state.situacao
            });
            
            await this.setState({ relatorio: res.data });
            await this.gerarPlanilhaExcel(res.data);
        } catch (err) {
            this.erroApi(JSON.stringify(err));
        } finally {
            this.setState({ loading: false });
        }
    }
    
    gerarPlanilhaExcel = (relatorio) => {
        // Função para formatar datas
        const formatarData = (data) => {
            if (!data || data === "0000-00-00 00:00:00" || data === "TO BE SEND") return data;
            return moment(data).format("DD/MM/YYYY");
        };

        // Obter nome da pessoa selecionada para o cabeçalho
        let nomeCliente = "DEMONSTRATIVO DE RESULTADO";
        if (this.state.clientes.length === 1) {
            const clienteSelecionado = this.state.pessoas.find(p => p.Chave == this.state.clientes[0]);
            if (clienteSelecionado) {
                nomeCliente = clienteSelecionado.Nome_Fantasia || clienteSelecionado.Nome;
            }
        } else if (this.state.clientes.length > 1) {
            nomeCliente = "MÚLTIPLOS CLIENTES";
        }

        // Preparar dados formatados
        const dadosFormatados = relatorio.map((item, index) => {
            return {
                'Order': index + 1,
                'PO Number (Sultrade)': item.codigo || 'ST' + Math.floor(1000 + Math.random() * 9000),
                'Vessel': item.navioNome || 'NAVIO DESCONHECIDO',
                'ETS': formatarData(item.ETS),
                'FDA issued': formatarData(item.FDA_issued || item.Data_Faturamento),
                'Payment date': item.Payment_date === "OPEN" ? "OPEN" : formatarData(item.Payment_date),
                'Gross Profit': item.Gross_Profit || 0,
                'Costs': item.Costs || 0,
                'Net Profit': (item.Gross_Profit || 0) - (item.Costs || 0)
            };
        });

        // Criar workbook
        const workbook = XLSX.utils.book_new();
        
        // Criar worksheet vazio primeiro
        const worksheet = {};
        
        // Adicionar cabeçalho personalizado com o nome do cliente na linha 1
        XLSX.utils.sheet_add_aoa(worksheet, [[nomeCliente]], { origin: "A1" });
        
        // Adicionar cabeçalhos das colunas na linha 3
        const headers = ['Order', 'PO Number (Sultrade)', 'Vessel', 'ETS', 'FDA issued', 'Payment date', 'Time', 'Gross Profit', 'Costs', 'Net Profit'];
        XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A3" });
        
        // Adicionar dados a partir da linha 4
        dadosFormatados.forEach((row, index) => {
            const linha = 4 + index;
            const rowData = [
                row.Order,
                row['PO Number (Sultrade)'],
                row.Vessel,
                row.ETS,
                row['FDA issued'],
                row['Payment date'],
                "", // Time será preenchido depois como fórmula
                row['Gross Profit'],
                row.Costs,
                row['Net Profit']
            ];
            XLSX.utils.sheet_add_aoa(worksheet, [rowData], { origin: `A${linha}` });
            
            // Adicionar fórmula para coluna Time (coluna G)
            const item = relatorio[index];
            const cellAddressTime = XLSX.utils.encode_cell({ r: linha - 1, c: 6 }); // Coluna G (Time)
            
            if (!item.FDA_issued || item.FDA_issued === "0000-00-00 00:00:00" || item.FDA_issued === "TO BE SEND") {
                worksheet[cellAddressTime] = { v: "TO BE SEND", t: "s" };
            } else if (!item.Payment_date || item.Payment_date === "0000-00-00 00:00:00" || item.Payment_date === "OPEN") {
                worksheet[cellAddressTime] = { f: `TODAY()-E${linha}` };
            } else {
                worksheet[cellAddressTime] = { f: `F${linha}-E${linha}` };
            }
        });
        
        // Calcular linha onde começam os totais
        const linhaInicioTotais = 4 + dadosFormatados.length + 2;
        const ultimaLinhaDados = 3 + dadosFormatados.length;
        
        // Adicionar labels dos totais
        XLSX.utils.sheet_add_aoa(worksheet, [
            ["", "Resultado liquido (Total):"],
            ["", "Receita Bruta (média):"],
            ["", "Custo (média):"],
            ["", "Receita Liquida (média):"]
        ], { origin: `A${linhaInicioTotais}` });

        // Adicionar fórmulas dos totais na coluna C com 2 casas decimais
        const cellResultadoTotal = XLSX.utils.encode_cell({ r: linhaInicioTotais - 1, c: 2 });
        const cellReceitaMedia = XLSX.utils.encode_cell({ r: linhaInicioTotais, c: 2 });
        const cellCustoMedia = XLSX.utils.encode_cell({ r: linhaInicioTotais + 1, c: 2 });
        const cellLiquidaMedia = XLSX.utils.encode_cell({ r: linhaInicioTotais + 2, c: 2 });

        // CORRIGIDO: Fórmulas com formatação de 2 casas decimais
        worksheet[cellResultadoTotal] = { 
            f: `ROUND(SUM(J4:J${ultimaLinhaDados}),2)`,
            z: "0.00"
        };
        worksheet[cellReceitaMedia] = { 
            f: `ROUND(SUM(H4:H${ultimaLinhaDados})/${dadosFormatados.length},2)`,
            z: "0.00"
        };
        worksheet[cellCustoMedia] = { 
            f: `ROUND(SUM(I4:I${ultimaLinhaDados})/${dadosFormatados.length},2)`,
            z: "0.00"
        };
        worksheet[cellLiquidaMedia] = { 
            f: `ROUND(SUM(J4:J${ultimaLinhaDados})/${dadosFormatados.length},2)`,
            z: "0.00"
        };

        // Definir estilos
        const titleStyle = {
            font: { bold: true, size: 16, color: { rgb: "FFFFFF" } },
            alignment: { horizontal: "center" },
            fill: { fgColor: { rgb: "1E4A72" } }, // Azul mais forte
            border: {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
            }
        };

        const headerStyle = {
            fill: { fgColor: { rgb: "4A90E2" } }, // Azul médio
            font: { bold: true, color: { rgb: "FFFFFF" } },
            alignment: { horizontal: "center" },
            border: {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
            }
        };

        const evenRowStyle = {
            fill: { fgColor: { rgb: "E3F2FD" } }, // Azul claro
            border: {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
            }
        };

        const oddRowStyle = {
            fill: { fgColor: { rgb: "FFFFFF" } }, // Branco
            border: {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
            }
        };

        // Estilo para valores monetários (2 casas decimais)
        const moneyStyle = {
            ...evenRowStyle,
            numFmt: "0.00"
        };

        const moneyStyleOdd = {
            ...oddRowStyle,
            numFmt: "0.00"
        };

        // Definir range da planilha
        const range = { s: { r: 0, c: 0 }, e: { r: linhaInicioTotais + 3, c: 9 } };
        worksheet['!ref'] = XLSX.utils.encode_range(range);

        // Aplicar estilos
        // Título (linha 1) - mesclar células A1:J1
        for (let c = 0; c <= 9; c++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: c });
            if (!worksheet[cellAddress]) worksheet[cellAddress] = { v: c === 0 ? nomeCliente : "" };
            worksheet[cellAddress].s = titleStyle;
        }
        worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }];

        // Cabeçalhos (linha 3)
        for (let c = 0; c <= 9; c++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 2, c: c });
            if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
            worksheet[cellAddress].s = headerStyle;
        }

        // Dados (linhas 4 em diante) - intercalar cores e aplicar formato monetário
        for (let r = 3; r < 3 + dadosFormatados.length; r++) {
            const isEven = (r - 3) % 2 === 0;
            
            for (let c = 0; c <= 9; c++) {
                const cellAddress = XLSX.utils.encode_cell({ r: r, c: c });
                if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
                
                // Aplicar formato monetário nas colunas H, I, J (Gross Profit, Costs, Net Profit)
                if (c >= 7 && c <= 9) {
                    worksheet[cellAddress].s = isEven ? moneyStyle : moneyStyleOdd;
                } else {
                    worksheet[cellAddress].s = isEven ? evenRowStyle : oddRowStyle;
                }
            }
        }

        // Definir largura das colunas
        worksheet['!cols'] = [
            { wch: 8 },  // Order
            { wch: 25 }, // PO Number - aumentado para comportar os textos das médias
            { wch: 20 }, // Vessel
            { wch: 15 }, // ETS - aumentado para datas
            { wch: 15 }, // FDA issued - aumentado para datas
            { wch: 15 }, // Payment date - aumentado para datas
            { wch: 10 }, // Time - aumentado para números
            { wch: 12 }, // Gross Profit
            { wch: 10 }, // Costs
            { wch: 12 }  // Net Profit
        ];

        // Adicionar worksheet ao workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório Completo");

        // Gerar o arquivo Excel com nome personalizado
        const nomeArquivo = this.state.clientes.length === 1 
            ? `${nomeCliente.replace(/[^a-zA-Z0-9]/g, '_')}_Demonstrativo.xlsx`
            : "Demonstrativo_De_Resultado.xlsx";

        try {
            XLSX.writeFile(workbook, nomeArquivo);
        } catch (error) {
            console.error('Erro ao gerar Excel:', error);
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
        validations.push(this.state.ordenacao)
        validations.push(!this.state.bloqueado)

        const validForm = validations.reduce((t, a) => t && a)

        return (
            <div className='allContent'>
                {this.state.loading &&
                    <Skeleton variant="rectangular" height={600} />
                }
                {!this.state.loading &&
                    <>
                        {this.state.redirect &&
                            <Redirect to={'/'} />
                        }

                        <section>
                            <Header voltarOS relatorio titulo="Demonstrativo de resultado" />
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
                                                            <label>Ordenar</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.ordenacao && (
                                                                <FontAwesomeIcon
                                                                    title="Preencha o campo"
                                                                    icon={faExclamationTriangle}
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select 
                                                                className='SearchSelect' 
                                                                options={this.state.ordenacaoOptions} 
                                                                value={this.state.ordenacaoOptions.find(option => option.value == this.state.ordenacao)} 
                                                                search={true} 
                                                                onChange={(e) => { this.setState({ ordenacao: e.value }) }} 
                                                            />
                                                        </div>
                                                        
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Centro de Custo</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select 
                                                                className='SearchSelect' 
                                                                options={this.state.centrosCustosOptions.filter(e => this.filterSearch(e, this.state.centrosCustosOptionsTexto)).slice(0, 20)} 
                                                                onInputChange={e => { this.setState({ centrosCustosOptionsTexto: e }) }} 
                                                                value={this.state.centrosCustosOptions.filter(option => option.value == this.state.centroCusto)[0]} 
                                                                search={true} 
                                                                onChange={(e) => { this.setState({ centroCusto: e.value }) }} 
                                                            />
                                                        </div>

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Pessoas</label>
                                                        </div>
                                                        <div className="col-1 errorMessage"></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select
                                                                className="SearchSelect"
                                                                options={this.state.pessoasOptions
                                                                    .filter((e) => this.filterSearch(e, this.state.pessoasOptionsTexto))
                                                                    .slice(0, 20)}
                                                                onInputChange={(e) => {
                                                                    this.setState({ pessoasOptionsTexto: e });
                                                                }}
                                                                search={true}
                                                                onChange={(e) => {
                                                                    if (!this.state.clientes.find(c => c == e.value))
                                                                        this.setState({
                                                                            clientes: [...this.state.clientes, e.value]
                                                                        });
                                                                }}
                                                            />
                                                            <div
                                                                style={{
                                                                    color: "white",
                                                                    fontSize: 13,
                                                                }}
                                                            >
                                                                {this.state.clientes.map((e, i) => (
                                                                    <span
                                                                        key={e}
                                                                        className="click_to_erase"
                                                                        onClick={() =>
                                                                            this.setState({
                                                                                clientes: this.state.clientes.filter(c => c != e)
                                                                            })
                                                                        }
                                                                    >{`${this.state.pessoas.find(p => p.Chave == e)?.Nome}${i != this.state.clientes.length - 1 ? ", " : " "}`}</span>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Situação</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select 
                                                                className='SearchSelect' 
                                                                options={this.state.situacaoOptions} 
                                                                value={this.state.situacaoOptions.find(option => option.value == this.state.situacao)} 
                                                                search={true} 
                                                                onChange={(e) => { this.setState({ situacao: e.value }) }} 
                                                            />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Moeda</label>
                                                        </div>
                                                        <div className="col-1 errorMessage"></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select
                                                                className="SearchSelect"
                                                                options={this.state.moedasOptions
                                                                    .filter(e => this.filterSearch(e, this.state.moedasOptionsTexto))
                                                                    .slice(0, 20)}
                                                                onInputChange={(e) => {
                                                                    this.setState({ moedasOptionsTexto: e });
                                                                }}
                                                                value={this.state.moedasOptions.filter(option => option.value == this.state.moeda)[0]}
                                                                search={true}
                                                                onChange={(e) => {
                                                                    this.setState({ moeda: e.value });
                                                                }}
                                                            />
                                                        </div>

                                                        {/* Espaçamento entre Moeda e Data Inicial */}
                                                        <div className="col-12" style={{ marginBottom: '20px' }}></div>

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Data Inicial</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                value={this.state.periodoInicial}
                                                                onChange={(e) => this.setState({ periodoInicial: e.target.value })}
                                                            />
                                                        </div>
                                                        
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Data Final</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                value={this.state.periodoFinal}
                                                                onChange={(e) => this.setState({ periodoFinal: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                                        

                                            <div className="row">
                                                <div className="col-2"></div>
                                                <div className="col-8" style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <button 
                                                        disabled={!validForm} 
                                                        type="submit" 
                                                        style={validForm ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} 
                                                    >
                                                        Gerar Excel
                                                    </button>
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

export default connect(mapStateToProps, null)(DemonstrativoDeResultado)