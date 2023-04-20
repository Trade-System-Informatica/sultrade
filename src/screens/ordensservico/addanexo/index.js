import React, { Component } from 'react'
import './styles.css'
import { Formik, Field, Form } from 'formik'
import Select from "react-select";
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import loader from '../../../classes/loader'
import moment from 'moment';
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import ModalLogs from '../../../components/modalLogs'
import { apiEmployee } from '../../../services/apiamrg'

const estadoInicial = {
    descricao: '',
    data: '',
    porto: 0,
    thumb: [],
    imagem: '',
    terminal: [],
    id: null,
    seaports: [],
    redirect: false,
    spanerror1: '',
    spanerror2: '',
    spanerror3: '',
    spanerror4: '',
    maxTerminal: null,

    logs: [],
    modalLog: false,

    modal: '',
    modalAberto: false,
    modalLista: [],
    modalPesquisa: '',

    fornecedor: "",
    os: "",
    osCodigo: "",
    validado: "",
    vencimento: "",
    vencimentoData: "",
    validadoData: "",
    validadoPor: "",

    fornecedoresOptions: [],

    dadosIniciais: '',
    dadosFinais: '',

    acessos: [],
    permissoes: [],
    acessosPermissoes: [],

    bloqueado: false,
    savedRedirect: false,

    optionsTexto: "",

    statusOptions: [
        { value: 0, label: "Aguardando validação..." },
        { value: 1, label: "Invalidado" },
        { value: 2, label: "Aprovado" },
        { value: 3, label: "Validado", nonSelectable: true },
    ]
}

class AddAnexo extends Component {

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        window.scrollTo(0, 0)
        var id = await this.props.match.params.id
        await this.setState({ chave: id, loading: true })
        if (parseInt(id) !== 0) {
            await this.setState({
                fornecedor: this.props.location.state.anexo.fornecedor,
                os: this.props.location.state.anexo.os,
                osCodigo: this.props.location.state.anexo.osCodigo,
                vencimento: this.props.location.state.anexo.vencimento,
                validado: !this.props.location.state.anexo.validado ? "0" : this.props.location.state.anexo.validado,
                validadoData: this.props.location.state.anexo.validadoData,
                validadoPor: this.props.location.state.anexo.validadoPor,
            })

            this.setState({
                dadosIniciais: [
                    { titulo: 'fornecedor', valor: this.state.fornecedor },
                    { titulo: 'os', valor: this.state.os },
                    { titulo: 'validado', valor: this.state.validado },
                    { titulo: 'validadoPor', valor: this.state.usuarioLogado },
                    { titulo: 'validadoData', valor: this.state.validadoData },
                ]
            })
        } else {
            this.setState({ savedRedirect: true });
        }

        await this.loadAll();

        this.state.acessosPermissoes.map((e) => {
            if ((e.acessoAcao == "ANEXOS" && e.permissaoInsere == 0 && this.state.chave == 0) || (e.acessoAcao == "ANEXOS" && e.permissaoEdita == 0 && this.state.chave != 0)) {
                this.setState({ bloqueado: true })
            }
        })
    }

    loadAll = async () => {
        await this.setState({
            acessos: await loader.getBase('getTiposAcessos.php'),
            permissoes: await loader.getBase('getPermissoes.php'),
            fornecedores: await loader.getBase('getFornecedores.php'),
            fornecedoresOptions: await loader.getBaseOptionsCustomLabel(`getFornecedores.php`, "Nome", "Cnpj_Cpf", "Chave"),
            operadores: await loader.getBody('getOperadoresBase.php',
                {
                    empresa: this.state.usuarioLogado.empresa
                }),
        })

        await this.setState({
            acessosPermissoes: await loader.testaAcesso(this.state.acessos, this.state.permissoes, this.state.usuarioLogado),
            loading: false,
        })
    }

    salvarAnexo = async (validForm) => {

        this.setState({ bloqueado: true })

        await this.setState({
            dadosFinais: [
                { titulo: 'fornecedor', valor: this.state.fornecedor },
                { titulo: 'os', valor: this.state.os },
                { titulo: 'validado', valor: this.state.validado },
                { titulo: 'validadoPor', valor: this.state.usuarioLogado },
                { titulo: 'validadoData', valor: this.state.validadoData },
            ],
            loading: true
        })

        if (parseInt(this.state.chave) === 0 && validForm) {
            this.setState({
                loading: false
            })
            return;
/*            //$cols = 'data, titulo, texto, imagem, link, inativo';
            await apiEmployee.post(`insertTarifa.php`, {
                token: true,
                values: `'${this.state.fornecedor}', '${this.state.servico}', '${nome}.${ext}', '${this.state.vencimento}', '${this.state.preferencial ? 1 : 0}'`,
                portos: this.state.portos,
                nome,
                documento,
                format,
                ext
            }).then(
                async res => {
                    if (res.data[0].chave) {
                        await this.setState({ chave: res.data[0].chave })
                        await loader.salvaLogs('tarifas', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].chave);

                        //alert('Serviço Inserido!')
                        await this.setState({ loading: false, bloqueado: false, savedRedirect: true })
                    } else {
                        //alert(`Erro: ${res.data}`)
                    }
                },
                async res => await console.log(`Erro: ${res.data}`)
            )
            */} else if (validForm) {

            await apiEmployee.post(`updateAnexo.php`, {
                token: true,
                chave: this.state.chave,
                operador: this.state.usuarioLogado.codigo,
                evento: this.state.evento,
                validado: this.state.validado,
                validadoData: moment().format("YYYY-MM-DD")
            }).then(
                async res => {
                    console.log(res.data);
                    if (res.data) {
                        await loader.salvaLogs('anexos', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.chave, `ANEXO: ${this.state.fornecedor}`);

                        await this.setState({ loading: false, bloqueado: false, savedRedirect: true })
                    } else {
                        // await alert(`Erro ${JSON.stringify(res)}`)
                    }
                },
                async res => await console.log(`Erro: ${res.data}`)
            )

        }

    }

    erroApi = async (res) => {
        await this.setState({ redirect: true })
    }

    filterSearch = (e) => {
        if (e == "") {
            return true
        }

        const text = this.state.optionsTexto.toUpperCase();
        return (e.label.toUpperCase().includes(text))
    }

    openLogs = async () => {
        await this.setState({ logs: await loader.getLogs("tarifas", this.state.chave) })
        await this.setState({ modalLog: true })
    }


    render() {

        const validations = []
        validations.push(this.state.fornecedor)
        //validations.push(this.state.porto && this.state.porto > 0)
        //o formulário só será válido se todas as validações forem verdadeiras, com este reduce implementado

        const validForm = validations.reduce((t, a) => t && a)

        if (this.state.loading) {
            return (<></>)
        }

        return (
            <div className='allContent'>

                {this.state.redirect &&
                    <Redirect to={'/'} />
                }

                {this.state.savedRedirect &&
                    <Redirect to={'/ordensservico/anexos'} />
                }

                <section>
                    <Header voltarAnexos titulo="Validações" chave={this.state.chave != 0 ? this.state.chave : ''} />
                    <br />
                    <br />
                    <br />
                    <br />
                </section>


                {this.state.chave != 0 && this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'LOGS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                    <div className="logButton">
                        <button onClick={() => this.openLogs()}>Logs</button>
                    </div>
                }

                <ModalLogs
                    closeModal={() => { this.setState({ modalLog: false }) }}
                    logs={this.state.logs}
                    nome={this.state.descricao}
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
                                    this.salvarAnexo(validForm)
                                }}
                            >
                                <Form className="contact-form" onBlur={() => {/*this.verificadorspans()*/ }} >

                                    <div className="row">
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2"></div>

                                        <div className="col-xl-8 col-lg-8 col-md-8 col-sm-8 col-12 ">

                                            <div className="row addservicos">
                                                {this.state.chave != 0 &&
                                                    <>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel">
                                                            <label>Chave</label>
                                                        </div>

                                                        <div className='col-1'></div>

                                                        <div className="col-xl-2 col-lg-2 col-md-3 col-sm-10 col-10 ">
                                                            <Field className="form-control" style={{ textAlign: 'center', backgroundColor: '#dddddd' }} type="text" disabled value={this.state.chave} />
                                                        </div>

                                                        <div className="col-xl-4 col-lg-4 col-md-3 col-sm-1 col-1 "></div>
                                                    </>
                                                }

                                                <div className={"col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm"}>
                                                    <label>Validado</label>
                                                </div>
                                                <div className='col-1 errorMessage'>
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                    <Select className='SearchSelect' isDisabled={!!this.state.validadoPor} options={this.state.validado != 3 ? this.state.statusOptions.filter((status) => !status.nonSelectable) : this.state.statusOptions.filter((status) => status.nonSelectable)} value={this.state.statusOptions.find(option => option.value == this.state.validado)} onChange={(e) => (!this.state.validadoPor) ? this.setState({ validado: e.value }) : {}} />
                                                </div>
                                                <div className="col-xl-1 col-lg-2 col-md-2 col-sm-12 col-12">
                                                </div>
                                                <div className={this.state.chave == 0 ? "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel" : "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm"}>
                                                    <label>Fornecedor</label>
                                                </div>
                                                <div className='col-1 errorMessage'>
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                    <Select className='SearchSelect' isDisabled={true} options={this.state.fornecedoresOptions.filter(e => this.filterSearch(e, this.state.fornecedoresOptionsTexto)).slice(0, 20)} value={this.state.fornecedoresOptions.find(option => option.value == this.state.fornecedor)} />
                                                </div>
                                                <div className="col-xl-1 col-lg-2 col-md-2 col-sm-12 col-12">
                                                </div>
                                                <div className={this.state.chave == 0 ? "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel" : "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm"}>
                                                    <label>Vencimentos</label>
                                                </div>
                                                <div className='col-1 errorMessage'>
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                    <Field type="date" disabled className='SearchSelect' value={this.state.vencimento} />
                                                </div>
                                                <div className={this.state.chave == 0 ? "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel" : "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm"}>
                                                    <label>OS</label>
                                                </div>
                                                <div className='col-1 errorMessage'>
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                    <Field disabled className='SearchSelect' value={this.state.osCodigo} />
                                                </div>
                                            </div>
                                            {this.state.validadoPor &&
                                                <div className="centerDiv">
                                                    {this.state.statusOptions.find((opt) => opt.value == this.state.validado)?.label} em {moment(this.state.validadoData).format("DD/MM/YYYY")} {this.state.validadoPor == -1 ? "pelo sistema (tempo expirado)" : `por ${this.state.operadores.find((op) => op.Codigo == this.state.validadoPor)?.Nome}`}
                                                </div>
                                            }


                                        </div>
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                    </div>

                                    {!this.state.validadoPor &&
                                        <div className="row">
                                            <div className="col-4"></div>
                                            <div className="col-4" style={{ display: 'flex', justifyContent: 'center' }}>
                                                <button disabled={!validForm} type="submit" style={validForm ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} >Salvar</button>
                                            </div>
                                            <div className="col-2"></div>
                                        </div>
                                    }

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

export default connect(mapStateToProps, null)(AddAnexo)

