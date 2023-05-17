import React, { Component } from 'react'
import './styles.css'
import { Formik, Field, Form } from 'formik'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import loader from '../../../classes/loader'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import ModalLogs from '../../../components/modalLogs'
import { apiEmployee } from '../../../services/apiamrg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import Select from 'react-select';
import moment from 'moment';

const estadoInicial = {
    chave: [0],
    data: moment().format("YYYY-MM-DD"),
    contaDebito: [0],
    contaCredito: [0],
    tipoDocto: "",
    centroControle: "",
    historicoPadrao: [""],
    historico: [""],
    pessoa: "",
    valor: [""],
    chavePr: "",
    usuarioInclusao: "",
    usuarioAlteracao: "",
    dataInclusao: moment().format("YYYY-MM-DD"),
    dataAlteracao: moment().format("YYYY-MM-DD"),
    lote: 0,
    conciliado: "",
    atualizado: "",

    numeroContas: 1,
    tipo: 0,

    contasAbertoOptions: [],
    contasAbertoOptionsTexto: "",

    historicosOptions: [],
    historicosOptionsTexto: "",

    planoContasOptions: [],
    planoContasOptionsTexto: "",

    tipoDocumentosOptions: [],
    tipoDocumentosOptionsTexto: "",

    centrosCustosOptions: [],
    centrosCustosOptionsTexto: "",

    pessoasOptions: [],
    pessoasOptionsTexto: "",

    logs: [],
    modalLog: false,

    dadosIniciais: '',
    dadosFinais: '',

    acessos: [],
    permissoes: [],
    acessosPermissoes: [],

    bloqueado: false,
}

class AddLancamento extends Component {

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        window.scrollTo(0, 0)
        var id = await this.props.match.params.id
        if (this.props.location && this.props.location.state && this.props.location.state.tipo) {
            this.setState({ tipo: 1 });
        }
        if (this.state.tipo == 1 && parseInt(id) !== 0) {
            this.setState({ lote: id });

            const lancamentos = await loader.getBody(`getLancamentosPorLote.php`, { token: true, lote: id });

            if (lancamentos[0]) {
                await this.setState({
                    numeroContas: lancamentos.length,
                    data: lancamentos[0].Data,
                    tipoDocto: lancamentos[0].TipoDocto,
                    centroControle: lancamentos[0].CentroControle,
                    usuarioInclusao: lancamentos[0].Usuario_Inclusao,
                    usuarioAlteracao: lancamentos[0].Usuario_Alteracao,
                    dataInclusao: lancamentos[0].Data_Inclusao,
                    conciliado: lancamentos[0].Conciliado,
                    atualizado: lancamentos[0].atualizado,
                })

                const contaDebito = [];
                const contaCredito = [];
                const valor = [];
                const historicoPadrao = [];
                const historico = [];
                const chave = [];

                lancamentos.map((lancto) => {
                    contaDebito.push(lancto.ContaDebito);
                    contaCredito.push(lancto.ContaCredito);
                    valor.push(lancto.Valor ? lancto.Valor.replaceAll(".", ",") : "");
                    historicoPadrao.push(lancto.Historico_Padrao);
                    historico.push(lancto.Historico);
                    chave.push(lancto.Chave);
                })

                await this.setState({
                    contaDebito,
                    contaCredito,
                    valor,
                    historicoPadrao,
                    historico,
                    chave
                })
            }

        } else if (parseInt(id) !== 0) {
            await this.setState({ chave: [id] })

            await this.setState({ lancamento: this.props.location.state.lancamento })
            //console.log('Servicos: ' + JSON.stringify(this.state.tiposervico))
            //await this.loadData(this.state.tiposervico)

            await this.setState({
                data: this.state.lancamento.Data,
                contaDebito: [this.state.lancamento.ContaDebito],
                contaCredito: [this.state.lancamento.ContaCredito],
                tipoDocto: this.state.lancamento.TipoDocto,
                centroControle: this.state.lancamento.CentroControle,
                historicoPadrao: [this.state.lancamento.Historico_Padrao],
                historico: [this.state.lancamento.Historico],
                valor: this.state.lancamento.Valor ? [this.state.lancamento.Valor.replaceAll(".", ",")] : [""],
                usuarioInclusao: this.state.lancamento.Usuario_Inclusao,
                usuarioAlteracao: this.state.lancamento.Usuario_Alteracao,
                dataInclusao: this.state.lancamento.Data_Inclusao,
                lote: this.state.lancamento.Lote,
                conciliado: this.state.lancamento.Conciliado,
                atualizado: this.state.lancamento.atualizado,
            })
        }


        await this.loadAll();

        if (this.state.chave != 0) {
            this.setState({
                dadosIniciais: [
                    { titulo: 'Data', valor: this.state.data },
                    { titulo: 'Conta Débito', valor: util.formatForLogs(this.state.contaDebito, 'options', '', '', this.state.planoContasOptions) },
                    { titulo: 'Conta Crédito', valor: util.formatForLogs(this.state.contaCredito, 'options', '', '', this.state.planoContasOptions) },
                    { titulo: 'Tipo de Documento', valor: util.formatForLogs(this.state.tipoDocto, 'options', '', '', this.state.tipoDocumentosOptions) },
                    { titulo: 'Centro de Custo', valor: util.formatForLogs(this.state.centroControle, 'options', '', '', this.state.centrosCustosOptions) },
                    { titulo: 'Histórico Padrão', valor: util.formatForLogs(this.state.historicoPadrao) },
                    { titulo: 'Histórico', valor: util.formatForLogs(this.state.historico) },
                    { titulo: 'Valor', valor: util.formatForLogs(this.state.valor, 'money') },
                    { titulo: 'Usuario da Inclusão', valor: util.formatForLogs(this.state.usuarioInclusao) },
                    { titulo: 'Usuario da Alteração', valor: util.formatForLogs(this.state.usuarioAlteracao) },
                    { titulo: 'Data de Inclusão', valor: util.formatForLogs(this.state.dataInclusao, 'date') },
                    { titulo: 'Data de Alteração', valor: util.formatForLogs(this.state.dataAlteracao, 'date') },
                    { titulo: 'Lote', valor: util.formatForLogs(this.state.lote) },
                    { titulo: 'Conciliado', valor: util.formatForLogs(this.state.conciliado, 'bool') },
                    { titulo: 'Atualizado', valor: util.formatForLogs(this.state.atualizado, 'bool') }
                ]
            })

        }

        this.state.acessosPermissoes.map((e) => {
            if ((e.acessoAcao == "LANCAMENTOS" && e.permissaoInsere == 0 && this.state.chave == 0) || (e.acessoAcao == "LANCAMENTOS" && e.permissaoEdita == 0 && this.state.chave != 0)) {
                this.setState({ bloqueado: true })
            }
        })
    }

    loadAll = async () => {
        await this.setState({
            contas: await loader.getBase('getContasAbertoOptions.php'),
            planoContasOptions: await loader.getBaseOptions('getPlanosContasAnaliticas.php', "Descricao", "Codigo_Red"),
            historicosOptions: await loader.getBaseOptions('getHistoricos.php', "Descricao", "chave"),
            tipoDocumentosOptions: await loader.getBaseOptions('getTiposDocumento.php', "descricao", "chave"),
            centrosCustosOptions: await loader.getBaseOptions('getCentrosCustos.php', "Descricao", "Chave"),
            acessos: await loader.getBase('getTiposAcessos.php'),
            permissoes: await loader.getBase('getPermissoes.php'),
        });

        const planoContasOptions = this.state.planoContasOptions;
        planoContasOptions.unshift({ label: "Select...", value: "0" });

        await this.setState({
            acessosPermissoes: await loader.testaAcesso(this.state.acessos, this.state.permissoes, this.state.usuarioLogado),
            contasAbertoOptions: this.state.contas.map((conta) => ({ value: conta.Chave, label: conta.Historico, valor: conta.Valor, pessoa: conta.Pessoa, tipo: conta.Tipo, contaProvisao: conta.Conta_Provisao ? conta.Conta_Provisao : "", contaDesconto: conta.Conta_Desconto, centroCusto: conta.Centro_Custo, tipoDocto: conta.tipodocto })),
            planoContasOptions,
            loading: false
        });
    }

    salvarLancamento = async (validForm) => {
        this.setState({ ...util.cleanStates(this.state) });
        this.setState({ bloqueado: true })

        await this.setState({
            dadosFinais: [
                { titulo: 'Data', valor: this.state.data },
                { titulo: 'Conta Débito', valor: util.formatForLogs(this.state.contaDebito, 'options', '', '', this.state.planoContasOptions) },
                { titulo: 'Conta Crédito', valor: util.formatForLogs(this.state.contaCredito, 'options', '', '', this.state.planoContasOptions) },
                { titulo: 'Tipo de Documento', valor: util.formatForLogs(this.state.tipoDocto, 'options', '', '', this.state.tipoDocumentosOptions) },
                { titulo: 'Centro de Custo', valor: util.formatForLogs(this.state.centroControle, 'options', '', '', this.state.centrosCustosOptions) },
                { titulo: 'Histórico Padrão', valor: util.formatForLogs(this.state.historicoPadrao) },
                { titulo: 'Histórico', valor: util.formatForLogs(this.state.historico) },
                { titulo: 'Valor', valor: util.formatForLogs(this.state.valor, 'money') },
                { titulo: 'Usuario da Inclusão', valor: util.formatForLogs(this.state.usuarioInclusao) },
                { titulo: 'Usuario da Alteração', valor: util.formatForLogs(this.state.usuarioAlteracao) },
                { titulo: 'Data de Inclusão', valor: util.formatForLogs(this.state.dataInclusao, 'date') },
                { titulo: 'Data de Alteração', valor: util.formatForLogs(this.state.dataAlteracao, 'date') },
                { titulo: 'Lote', valor: util.formatForLogs(this.state.lote) },
                { titulo: 'Conciliado', valor: util.formatForLogs(this.state.conciliado, 'bool') },
                { titulo: 'Atualizado', valor: util.formatForLogs(this.state.atualizado, 'bool') }
            ],
            loading: true
        })

        for (let i = 0; i < this.state.numeroContas; i++) {
            const contaDebito = this.state.contaDebito[i];
            const contaCredito = this.state.contaCredito[i];
            const valor = this.state.valor[i].replaceAll(".", "").replaceAll(",", ".");
            const historicoPadrao = this.state.historicoPadrao[i];
            const historico = this.state.historico[i];
            const chave = this.state.chave[i];

            if (parseInt(chave) === 0 && validForm) {

                await apiEmployee.post(`insertLancamento.php`, {
                    token: true,
                    values: `'${this.state.data}', '${contaDebito}', '${contaCredito}', '${this.state.tipoDocto}', '${this.state.centroControle}', '${historicoPadrao}', '${historico}', '${this.state.pessoa}', '${valor}', '${this.state.chavePr}', '${this.state.usuarioLogado.chave}', '${this.state.usuarioLogado.chave}', '${this.state.dataInclusao}', '${this.state.dataAlteracao}', '${this.state.conciliado}', '${this.state.atualizado}'`,
                    lote: this.state.lote
                }).then(
                    async res => {
                        if (res.data[0].Chave) {
                            this.setState({ lote: res.data[0].Lote })
                            let chav = this.state.chave;
                            chav[i] = res.data[0].Chave;

                            await this.setState({ chave: chav })
                            await loader.salvaLogs('lancamentos', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].chave);

                            //alert('Serviço Inserido!')
                            await this.setState({ loading: false, bloqueado: false })
                        } else {
                            //alert(`Erro: ${res.data}`)
                        }
                    },
                    async res => await console.log(`Erro: ${res.data}`)
                )
            } else if (validForm) {
                await apiEmployee.post(`updateLancamento.php`, {
                    token: true,
                    Chave: chave,
                    Data: this.state.data,
                    ContaDebito: contaDebito,
                    ContaCredito: contaCredito,
                    TipoDocto: this.state.tipoDocto,
                    CentroControle: this.state.centroControle,
                    Historico_Padrao: historicoPadrao,
                    Historico: historico,
                    Pessoa: this.state.pessoa,
                    Valor: valor,
                    ChavePr: this.state.chavePr,
                    Usuario_Alteracao: this.state.usuarioLogado.chave,
                    Data_Alteracao: moment().format("YYYY-MM-DD"),
                    Conciliado: this.state.conciliado,
                    atualizado: this.state.atualizado
                }).then(
                    async res => {

                        if (res.data === true) {
                            await loader.salvaLogs('lancamentos', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, chave, `LANÇAMENTO: ${this.state.descricao}`);

                            //await alert(`Serviço alterado`)
                            await this.setState({ loading: false, bloqueado: false })
                        } else {
                            await alert(`Erro ${JSON.stringify(res)}`)
                        }
                    },
                    async res => await console.log(`Erro: ${res.data}`)
                )
            }

        }
    }

    componentDidUpdate = (prevProps, prevStates) => {
        if (prevStates.numeroContas < this.state.numeroContas) {
            this.setState({
                contaDebito: [...this.state.contaDebito, 0],
                contaCredito: [...this.state.contaCredito, 0],
                chave: [...this.state.chave, 0],
                historico: [...this.state.historico, ""],
                historicoPadrao: [...this.state.historicoPadrao, ""],
                valor: [...this.state.valor, ""]
            })
        }
    }

    erroApi = async (res) => {
        await this.setState({ redirect: true })
    }

    filterSearch = (e, state) => {
        if (e == "") {
            return true
        } else if (!e.label) {
            return false;
        }


        const text = state.toUpperCase();
        return (e.label.toUpperCase().includes(text))
    }

    openLogs = async () => {
        await this.setState({ logs: await loader.getLogs("lancamentos", this.state.chave) })
        await this.setState({ modalLog: true })
    }

    verificarValores = () => {
        if (this.state.numeroContas == 1 && this.state.valor[0] == 0) {
            return false;
        } else if (this.state.numeroContas == 1) {
            return true;
        }

        let valorCredito = 0;
        let valorDebito = 0;

        [...Array(this.state.numeroContas)].map((conta, contaIndex) => {
            if (this.state.contaDebito[contaIndex] != 0 && this.state.contaCredito[contaIndex] == 0) {
                valorDebito += parseFloat(this.state.valor[contaIndex].replaceAll(".", "").replaceAll(",", "."));
            } else if (this.state.contaCredito[contaIndex] != 0 && this.state.contaDebito[contaIndex] == 0) {
                valorCredito += parseFloat(this.state.valor[contaIndex].replaceAll(".", "").replaceAll(",", "."));
            }
        })

        return valorCredito == valorDebito;
    }

    render() {

        const validations = [];
        [...Array(this.state.numeroContas)].map((conta, contaIndex) => {
            validations.push(this.state.chave[0] != 0 && this.state.lote || (this.state.numeroContas == 1 && this.state.contaDebito[contaIndex] != 0 && this.state.contaCredito[contaIndex]) || (this.state.numeroContas > 1 && this.state.contaDebito[contaIndex] != 0 && this.state.contaCredito[contaIndex] == 0) || (this.state.numeroContas > 1 && this.state.contaDebito[contaIndex] == 0 && this.state.contaCredito[contaIndex] != 0))
        });
        validations.push(this.verificarValores());
        validations.push(!this.state.bloqueado);
        //validations.push(this.state.porto && this.state.porto > 0)
        //o formulário só será válido se todas as validações forem verdadeiras, com este reduce implementado

        const validForm = validations.reduce((t, a) => t && a)
        return (
            <div className='allContent'>

                {this.state.redirect &&
                    <Redirect to={'/'} />
                }

                {this.state.finalizaOperacao &&
                    <Redirect to={{ pathname: '/tabelas/lancamentos', state: { chave: this.state.chave } }} />
                }

                <section>
                    <Header voltarLancamentos titulo="Lancamentos" chave={this.state.chave != 0 ? this.state.chave : ''} />
                </section>
                <br />
                <br />
                <br />

                {this.state.chave != 0 && this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'LOGS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                    <div className="logButton">
                        <button onClick={() => this.openLogs()}>Logs</button>
                    </div>
                }

                <ModalLogs
                    closeModal={() => { this.setState({ modalLog: false }) }}
                    logs={this.state.logs}
                    nome={this.state.historico}
                    chave={this.state.chave}
                    modalAberto={this.state.modalLog}
                />

                <div className="contact-section">

                    <div className="row">
                        <div className="col-lg-12">
                            <Formik
                                initialValues={{
                                    name: '',
                                }}
                                onSubmit={async values => {
                                    await new Promise(r => setTimeout(r, 1000))
                                    this.salvarLancamento(validForm)
                                }}
                            >
                                <Form className="contact-form" onBlur={() => {/*this.verificadorspans()*/ }} >

                                    <div className="row">
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2"></div>

                                        <div className="col-xl-8 col-lg-8 col-md-8 col-sm-8 col-12 ">

                                            <div className="row addservicos">
                                                {this.state.chave != 0 && this.state.chave.length == 1 &&
                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel">
                                                        <label>Chave</label>
                                                    </div>
                                                }
                                                {this.state.chave != 0 && this.state.chave.length == 1 &&
                                                    <div className='col-1'></div>
                                                }
                                                {this.state.chave != 0 && this.state.chave.length == 1 &&
                                                    <div className="col-xl-2 col-lg-2 col-md-3 col-sm-10 col-10 ">
                                                        <Field className="form-control" style={{ textAlign: 'center', backgroundColor: '#dddddd' }} type="text" disabled value={this.state.chave} />
                                                    </div>
                                                }
                                                {this.state.chave != 0 && this.state.chave.length == 1 &&
                                                    <div className="col-xl-4 col-lg-4 col-md-3 col-sm-1 col-1 " s>
                                                    </div>
                                                }
                                                {this.state.lote != 0 &&
                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel">
                                                        <label>Lote</label>
                                                    </div>
                                                }
                                                {this.state.lote != 0 &&
                                                    <div className='col-1'></div>
                                                }
                                                {this.state.lote != 0 &&
                                                    <div className="col-xl-2 col-lg-2 col-md-3 col-sm-10 col-10 ">
                                                        <Field className="form-control" style={{ textAlign: 'center', backgroundColor: '#dddddd' }} type="text" disabled value={this.state.lote} />
                                                    </div>
                                                }
                                                {this.state.lote != 0 &&
                                                    <div className="col-xl-4 col-lg-4 col-md-3 col-sm-1 col-1 " s>
                                                    </div>
                                                }
                                                <div className="col-12 spaceBetween">
                                                    <button type="button" className={`addRemoveButton ${this.state.numeroContas == 1 ? "addRemoveButtonDisabled" : ""}`} disabled={this.state.numeroContas == 1} onClick={() => this.state.numeroContas != 1 ? this.setState({ numeroContas: this.state.numeroContas - 1 }) : {}}>-</button>
                                                    <button type="button" className="addRemoveButton" onClick={() => this.setState({ numeroContas: this.state.numeroContas + 1 })}>+</button>
                                                </div>
                                                <div>
                                                    <hr style={{ color: "#cfcfcf" }} />
                                                </div>
                                                {[...Array(this.state.numeroContas)].map((conta, contaIndex) => (
                                                    <>
                                                        <div className={this.state.chave == 0 ? "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel" : "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm"}>
                                                            <label>Conta Debito</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {((this.state.numeroContas > 1 && this.state.contaCredito[contaIndex] == 0 && this.state.contaDebito[contaIndex] == 0) || (this.state.numeroContas == 1 && !this.state.contaDebito[contaIndex]) || (this.state.numeroContas > 1 && this.state.contaCredito[contaIndex] != 0 && this.state.contaDebito[contaIndex] != 0)) &&
                                                                <FontAwesomeIcon title={(this.state.numeroContas > 1 && this.state.contaCredito[contaIndex] != 0 && this.state.contaDebito[contaIndex] != 0) ? "Insira apenas uma entre conta débito ou crédito" : `Preencha o campo`} icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                            <Select className='SearchSelect' options={this.state.planoContasOptions.filter(e => this.filterSearch(e, this.state.planoContasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ planoContasOptionsTexto: e }) }} value={this.state.planoContasOptions.filter(option => option.value == this.state.contaDebito[contaIndex])[0]} search={true} onChange={(e) => { let contaDeb = this.state.contaDebito; contaDeb[contaIndex] = e.value; this.setState({ contaDebito: contaDeb, }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Conta Credito</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {((this.state.numeroContas > 1 && this.state.contaCredito[contaIndex] == 0 && this.state.contaDebito[contaIndex] == 0) || (this.state.numeroContas == 1 && !this.state.contaCredito[contaIndex]) || (this.state.numeroContas > 1 && this.state.contaCredito[contaIndex] != 0 && this.state.contaDebito[contaIndex] != 0)) &&
                                                                <FontAwesomeIcon title={(this.state.numeroContas > 1 && this.state.contaCredito[contaIndex] != 0 && this.state.contaDebito[contaIndex] != 0) ? "Insira apenas uma entre conta débito ou crédito" : `Preencha o campo`} icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                            <Select className='SearchSelect' options={this.state.planoContasOptions.filter(e => this.filterSearch(e, this.state.planoContasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ planoContasOptionsTexto: e }) }} value={this.state.planoContasOptions.filter(option => option.value == this.state.contaCredito[contaIndex])[0]} search={true} onChange={(e) => { let contaCred = this.state.contaCredito; contaCred[contaIndex] = e.value; this.setState({ contaCredito: contaCred, }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Histórico Padrão</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                            <Select className='SearchSelect' options={this.state.historicosOptions.filter(e => this.filterSearch(e, this.state.historicosOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ historicosOptionsTexto: e }) }} value={this.state.historicosOptions.filter(option => option.label == this.state.historico[contaIndex])[0]} search={true} onChange={(e) => { let histPad = this.state.historicoPadrao; let hist = this.state.historico; histPad[contaIndex] = e.value; hist[contaIndex] = e.label; this.setState({ historicoPadrao: histPad, historico: hist }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Histórico</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                            <Field className='form-control' value={this.state.historico[contaIndex]} onChange={(e) => { let hist = this.state.historico; hist[contaIndex] = e.currentTarget.value; this.setState({ historico: hist }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Valor</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.valor[contaIndex] &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                            <Field className="form-control text-right" type="text" value={this.state.valor[contaIndex]} onClick={(e) => e.target.select()} onChange={async e => { let val = this.state.valor; val[contaIndex] = e.currentTarget.value; this.setState({ valor: val }) }} onBlur={async e => { let val = this.state.valor; val[contaIndex] = Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR').format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : ''; this.setState({ valor: val }) }} />
                                                        </div>
                                                        {contaIndex != this.state.numeroContas - 1 &&
                                                            <>
                                                                <br /><br /><br /><br /><br />
                                                            </>
                                                        }
                                                    </>
                                                ))}
                                                <div>
                                                    <hr style={{ color: "#cfcfcf" }} />
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <label>Tipo de Documento</label>
                                                </div>
                                                <div className='col-1 errorMessage'>
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                    <Select className='SearchSelect' options={this.state.tipoDocumentosOptions.filter(e => this.filterSearch(e, this.state.tipoDocumentosOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ tipoDocumentosOptionsTexto: e }) }} value={this.state.tipoDocumentosOptions.filter(option => option.value == this.state.tipoDocto)[0]} search={true} onChange={(e) => { this.setState({ tipoDocto: e.value, }) }} />
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <label>Centro de Custo</label>
                                                </div>
                                                <div className='col-1 errorMessage'>
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                    <Select className='SearchSelect' options={this.state.centrosCustosOptions.filter(e => this.filterSearch(e, this.state.centrosCustosOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ centrosCustosOptionsTexto: e }) }} value={this.state.centrosCustosOptions.filter(option => option.value == this.state.centroControle)[0]} search={true} onChange={(e) => { this.setState({ centroControle: e.value, }) }} />
                                                </div>
                                            </div>


                                        </div>
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                    </div>

                                    <div className="row">
                                        <div className="col-2"></div>
                                        <div className="col-8" style={{ display: 'flex', justifyContent: 'center' }}>
                                            <button disabled={!validForm} title={!this.verificarValores() ? "Valores de Débito não são iguais aos de Crédito" : ""} type="submit" style={validForm ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} >Salvar</button>
                                        </div>
                                        <div className="col-2"></div>
                                    </div>

                                </Form>
                            </Formik>
                        </div>
                    </div>

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

export default connect(mapStateToProps, null)(AddLancamento)

