import React, { Component } from 'react'
import './styles.css'
import { Formik, Field, Form } from 'formik'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import Alert from '../../../components/alert'
import { apiEmployee } from '../../../services/apiamrg'
import moment from 'moment'
import Select from 'react-select';
import ModalLogs from '../../../components/modalLogs'
import loader from '../../../classes/loader';

const estadoInicial = {
    data: '',
    porto: 0,
    thumb: [],
    imagem: '',
    taxa: [],
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

    dadosIniciais: '',
    dadosFinais: '',

    chave: '',
    descricao: '',
    data: moment().format('YYYY-MM-DD'),
    encerramento: false,
    cliente: '',
    conta: '',

    pessoas: [],
    pessoasOptions: [],
    pessoasOptionsTexto: '',

    acessos: [],
    permissoes: [],
    acessosPermissoes: [],

    bloqueado: false,
    alert: {type: "", msg: ""}
}

class AddCentroCusto extends Component {

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        window.scrollTo(0, 0)
        var id = await this.props.match.params.id
        await this.setState({ chave: id })
        if (parseInt(id) !== 0) {
            await this.setState({ centroCusto: this.props.location.state.centroCusto })
            //console.log('Servicos: ' + JSON.stringify(this.state.tiposervico))
            //await this.loadData(this.state.tiposervico)
            await this.setState({
                codigo: this.state.centroCusto.Codigo,
                descricao: this.state.centroCusto.Descricao,
                data: moment(this.state.centroCusto.Data).format('YYYY-MM-DD'),
                encerramento: moment(this.state.centroCusto.Encerrado).format('YYYY-MM-DD'),
                cliente: this.state.centroCusto.Cliente,
                conta: this.state.centroCusto.Conta
            })

            await this.setState({
                dadosIniciais: [
                    {titulo: 'Cliente', valor: this.state.cliente},
                    {titulo: 'Descricao', valor: this.state.descricao},
                    {titulo: 'Data', valor: this.state.data},
                    {titulo: 'Encerrado', valor: this.state.encerrado},
                ]
            })
        }
        await this.loadAll();

        this.state.acessosPermissoes.map((e) => {
            if ((e.acessoAcao == "CENTROS_CUSTOS" && e.permissaoInsere == 0 && this.state.chave == 0) || (e.acessoAcao == "CENTROS_CUSTOS" && e.permissaoEdita == 0 && this.state.chave != 0)) {
                this.setState({ bloqueado: true })
            }
        })
    }

    loadAll = async () => {
        await this.setState({
            pessoas: await loader.getBase('getPessoas.php'),
            pessoasOptions: await loader.getBaseOptionsCustomLabel('getPessoas.php', 'Nome', 'Cnpj_Cpf', 'Chave'),
            acessos: await loader.getBase('getTiposAcessos.php'),
            permissoes: await loader.getBase('getPermissoes.php')
        })

        await this.setState({
            acessosPermissoes: await loader.testaAcesso(this.state.acessos, this.state.permissoes, this.state.usuarioLogado),
            loading: false,
        })
    }

    salvarCentroCusto = async (validForm) => {
        if (this.state.variavel) {
            this.setState({ variavel: 1 })
        } else {
            this.setState({ variavel: 0 })
        }
        this.setState({ bloqueado: true })

        await this.setState({
            dadosFinais: [
                {titulo: 'Cliente', valor: this.state.cliente},
                {titulo: 'Descricao', valor: this.state.descricao},
                {titulo: 'Data', valor: this.state.data},
                {titulo: 'Encerrado', valor: this.state.encerrado},
            ],
            loading: true
        })

        if (parseInt(this.state.chave) === 0 && validForm) {
            if (!this.state.codigo) {
                await this.setState({codigo: await loader.getCodigoCC()});    
            }
            
            await apiEmployee.post(`insertCentroCusto.php`, {
                token: true,
                values: `'${this.state.descricao}', '${moment(this.state.data).format('YYYY-MM-DD')}', '${this.state.cliente}', '${this.state.codigo}'`,
                codigo: this.state.codigo,
                tipo: 'CC'
            }).then(
                async res => {
                    if (res.data[0].Chave) {
                        await this.setState({ chave: res.data[0].Chave })
                        loader.salvaLogs('centros_custos', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].Chave);
                        await this.setState({ loading: false, bloqueado: false })
                    } else if (res.data.error) {
                        this.setState({alert: {type: "error", msg: res.data.error}})
                    } else {
                        console.log(res);
                    }
                },
                async res => await console.log(`Erro: ${res.data}`)
            )
        } else if (validForm) {
            await apiEmployee.post(`updateCentroCusto.php`, {
                token: true,
                Codigo: this.state.codigo,
                Chave: this.state.chave,
                Descricao: this.state.descricao,
                Data: moment(this.state.data).format('YYYY-MM-DD'),
                Encerrado: this.state.encerramento ? moment(this.state.encerramento).format('YYYY-MM-DD') : '',
                Cliente: this.state.cliente,
                Conta: this.state.conta,
            }).then(
                async res => {
                    if (res.data === true) {
                        loader.salvaLogs('centros_custos', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.chave, `CENTRO DE CUSTO: ${this.state.descricao}`);
                        await this.setState({ loading: false, bloqueado: false })
                    } else {
                        console.log(res.data)
                    }
                },
                async res => await console.log(`Erro: ${res.data}`)
            )

        }

    }

    erroApi = async (res) => {
        console.log(res)
        await this.setState({ redirect: true })
    }

    filterSearch = (e, state) => {
        if (e == "") {
            return true
        }

        const text = state.toUpperCase();
        return (e.label.toUpperCase().includes(text))
    }


    openLogs = async () => {
        await this.setState({ logs: await loader.getLogs("centros_custos", this.state.chave) })
        await this.setState({ modalLog: true })
    }


    render() {
        const validations = [];
        validations.push(this.state.descricao);
        validations.push(!this.state.codigo || this.state.codigo == parseInt(this.state.codigo));
        validations.push(!this.state.bloqueado);


        const validForm = validations.reduce((t, a) => t && a)

        return (
            <div className='allContent'>

                {this.state.redirect &&
                    <Redirect to={'/'} />
                }

                <section>
                    <Header voltarCentrosCustos titulo="Centro de Custo" chave={this.state.chave != 0 ? this.state.chave : ''}/>
                </section>
                <Alert alert={this.state.alert} setAlert={(value) => this.setState({ alert: value })} />

                {this.state.chave !=0 && this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'LOGS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
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
                                    this.salvarCentroCusto(validForm)
                                }}
                            >
                                <Form className="contact-form" onBlur={() => {/*this.verificadorspans()*/ }} >

                                    <div className="row">
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2"></div>

                                        <div className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12 ">

                                            <div className="row addservicos">
                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel">
                                                        <label>Codigo</label>
                                                    </div>
                                                    <div className='col-1'></div>
                                                    <div className="col-xl-2 col-lg-2 col-md-3 col-sm-10 col-10 ">
                                                        <Field className="form-control" type="text" disabled={this.state.chave != 0} value={this.state.codigo} onChange={(e) => this.state.chave == 0 ? this.setState({codigo: e.currentTarget.value}) : {}}/>
                                                    </div>
                                                    <div className="col-xl-4 col-lg-4 col-md-3 col-sm-1 col-1 ">
                                                    </div>
                                                
                                                <div className={"col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm"}>
                                                    <label>Descricao</label>
                                                </div>
                                                <div className="col-1 errorMessage">
                                                    {!this.state.descricao &&
                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                    }
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                    <Field className="form-control" type="text" value={this.state.descricao} onChange={async e => { this.setState({ descricao: e.currentTarget.value }) }} />
                                                </div>
                                                <div className="col-1"></div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <label>Data</label>
                                                </div>
                                                <div className="col-1 errorMessage">
                                                    {!this.state.data &&
                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                    }
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                    <Field className="form-control" type="date" value={this.state.data} onChange={async e => { this.setState({ data: e.currentTarget.value }) }} />
                                                </div>
                                                <div className="col-1"></div>
                                                {this.state.chave != 0 &&
                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                        <label>Data Encerramento</label>
                                                    </div>
                                                }
                                                {this.state.chave != 0 &&
                                                    <div className="col-1 errorMessage">
                                                    </div>
                                                }
                                                {this.state.chave != 0 &&
                                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                        <Field className="form-control" type="date" value={this.state.encerramento} onChange={async e => { this.setState({ encerramento: e.currentTarget.value }) }} />
                                                    </div>
                                                }
                                                {this.state.chave != 0 &&
                                                    <div className="col-1"></div>
                                                }
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <label>Cliente</label>
                                                </div>
                                                <div className="col-1 errorMessage">
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                    <Select className='SearchSelect' options={this.state.pessoasOptions.filter(e => this.filterSearch(e, this.state.pessoasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ pessoasOptionsTexto: e }) }} value={this.state.pessoasOptions.filter(option => option.value == this.state.cliente)[0]} search={true} onChange={(e) => { this.setState({ cliente: e.value, }) }} />
                                                </div>
                                                <div className="col-1"></div>

                                            </div>
                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                        </div>

                                        <div className="row">
                                            <div className="col-2"></div>
                                            <div className="col-8" style={{ display: 'flex', justifyContent: 'center' }}>
                                                <button disabled={!validForm} type="submit" style={validForm ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} >Salvar</button>
                                            </div>
                                            <div className="col-2"></div>
                                        </div>
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

export default connect(mapStateToProps, null)(AddCentroCusto)

