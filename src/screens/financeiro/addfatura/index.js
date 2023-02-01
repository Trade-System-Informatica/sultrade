import React, { Component } from 'react'
import './styles.css'
import { Formik, Field, Form } from 'formik'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import Skeleton from '../../../components/skeleton'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import ModalLogs from '../../../components/modalLogs'
import { apiEmployee } from '../../../services/apiamrg'
import moment from 'moment'
import loader from '../../../classes/loader';
import Select from 'react-select';
import Xml from '../../../classes/xml'

const estadoInicial = {
    chave: 0,
    logs: [],

    fatura: '',
    formulario: '',
    emissao: moment().format('YYYY-MM-DD'),
    vencimento: '',
    cliente: '',
    praca: 'Rio Grande',
    observacoes: '',
    total: '',
    discriminacaoServico: '',
    atividade: 1006,
    tributada: false,
    enviarXml: false,

    pessoas: [],
    pessoasOptions: [],
    pessoasOptionsTexto: '',

    formularios: [],

    acessos: [],
    permissoes: [],
    acessosPermissoes: [],
}

class AddFatura extends Component {

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        window.scrollTo(0, 0)
        var id = await this.props.match.params.id;
        if (this.state.usuarioLogado.empresa != 0) {
            await this.setState({ empresa: this.state.usuarioLogado.empresa })
        }
        await this.setState({ chave: id })

        if (parseInt(id) !== 0) {
            await this.setState({ fatura: this.props.location.state.fatura })

            await this.setState({
                faturaNum: this.state.fatura.Fatura,
                emissao: moment(this.state.fatura.Emissao).format('YYYY-MM-DD'),
                vencimento: moment(this.state.fatura.Vencto).format('YYYY-MM-DD'),
                praca: this.state.fatura.Praca_Pagto,
                cliente: this.state.fatura.Cliente,
                atividade: this.state.fatura.atividade,
                total: this.state.fatura.Valor.replaceAll('.', ','),
                observacoes: this.state.fatura.Obs,
                formulario: this.state.fatura.Formulario,
                formularioInicial: this.state.fatura.Formulario,
                discriminacaoServico: this.state.fatura.discriminacaoservico,
                tributada: this.state.fatura.Cobranca && this.state.fatura.Cobranca != '0' ? true : false
            })

            await this.setState({
                dadosIniciais: [
                    { titulo: 'Emissao', valor: this.state.emissao },
                    { titulo: 'Vencto', valor: this.state.vencimento },
                    { titulo: 'Praca_Pagto', valor: this.state.praca },
                    { titulo: 'atividade', valor: this.state.atividade },
                    { titulo: 'Cliente', valor: this.state.cliente },
                    { titulo: 'Valor', valor: parseFloat(this.state.total.replaceAll('.', '').replaceAll('.', '')) },
                    { titulo: 'Obs', valor: this.state.observacoes },
                    { titulo: 'Cobranca', valor: this.state.tributada },

                ]
            })
        }
        await this.loadAll();

        this.state.acessosPermissoes.map((e) => {
            if ((e.acessoAcao == "FATURAS" && e.permissaoInsere == 0 && this.state.chave == 0) || (e.acessoAcao == "FATURAS" && e.permissaoEdita == 0 && this.state.chave != 0)) {
                this.setState({ bloqueado: true })
            }
        })
    }

    loadAll = async () => {
        await this.setState({
            formularios: await loader.getBase('getFormularios.php'),

            pessoas: await loader.getBase('getPessoas.php'),
            pessoasOptions: await loader.getBaseOptions('getPessoas.php', "Nome", "Chave"),

            acessos: await loader.getBase('getTiposAcessos.php'),
            permissoes: await loader.getBase('getPermissoes.php')
        })

        const nfe = this.state.formularios.find((form) => form.Codigo === "NFE");

        if (nfe) {
            this.setState({ formulario: nfe.chave });
        }

        await this.setState({
            acessosPermissoes: await loader.testaAcesso(this.state.acessos, this.state.permissoes, this.state.usuarioLogado),
            loading: false, bloqueado: false
        })
    }

    enviaNota = async () => {
        const retorno = await Xml.criaXml(this.state.chave);

        const link = document.createElement("a");
        link.href = retorno.linkImpressao;
        link.target = "_blank";
        link.click();

        await apiEmployee.post(`updateFaturaNotaEnviada.php`, {
            Chave: this.state.chave,
            chavenfe: retorno.numero,
            protocolonfe: retorno.autenticidade,
            urlqrcode: retorno.linkImpressao,
            serie: 'S1'
        }).then();
    }


    salvarFatura = async (validForm) => {
        this.setState({ bloqueado: true });


        await this.setState({
            dadosFinais: [
                { titulo: 'Emissao', valor: this.state.emissao },
                { titulo: 'Vencto', valor: this.state.vencimento },
                { titulo: 'Praca_Pagto', valor: this.state.praca },
                { titulo: 'atividade', valor: this.state.atividade },
                { titulo: 'Cliente', valor: this.state.cliente },
                { titulo: 'Valor', valor: parseFloat(this.state.total.replaceAll('.', '').replaceAll('.', '')) },
                { titulo: 'Obs', valor: this.state.observacoes },
                { titulo: 'Formulario', valor: this.state.formulario },
                { titulo: 'Cobranca', valor: this.state.tributada },
                { titulo: 'discriminacaoservico', valor: this.state.discriminacaoServico }
            ],
            loading: true
        })

        if (parseInt(this.state.chave) === 0 && validForm) {
            await apiEmployee.post(`insertFatura.php`, {
                token: true,
                values: `'${moment(this.state.emissao).format('YYYY-MM-DD')}', '${moment(this.state.vencimento).format('YYYY-MM-DD')}', '${this.state.praca}', '${this.state.cliente}', '${this.state.total.replaceAll('.', '').replaceAll(',', '.')}', '${this.state.observacoes}', '${this.state.formulario}', '${this.state.tributada}', '${this.state.discriminacaoServico}', '${this.state.usuarioLogado.empresa}', '${this.state.atividade}'`,
                formulario: this.state.formulario
            }).then(
                async res => {
                    if (res.data[0].Chave) {
                        await this.setState({ chave: res.data[0].Chave })
                        await loader.salvaLogs('faturas', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].Chave);

                        await this.setState({ loading: false, bloqueado: false })
                    } else {
                        await alert(`Erro ${JSON.stringify(res.data)}`)
                    }
                },
                async res => await console.log(`Erro: ${res.data}`)
            )
        } else if (validForm) {
            await apiEmployee.post(`updateFatura.php`, {
                token: true,
                Chave: this.state.chave,
                Emissao: moment(this.state.emissao).format('YYYY-MM-DD'),
                Vencto: moment(this.state.vencimento).format('YYYY-MM-DD'),
                Praca_Pagto: this.state.praca,
                Cliente: this.state.cliente,
                Valor: this.state.total.replaceAll('.', '').replaceAll(',', '.'),
                Obs: this.state.observacoes,
                Cobranca: this.state.tributada ? 1 : 0,
                discriminacaoservico: this.state.discriminacaoServico,
                atividade: this.state.atividade
            }).then(
                async res => {
                    if (res.data === true) {
                        await loader.salvaLogs('faturas', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.chave, `FATURA: ${this.state.fatura}`);

                        await this.setState({ loading: true })

                    } else {
                        await alert(`Erro ${JSON.stringify(res.data)}`)
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
        await this.setState({ logs: await loader.getLogs("faturas", this.state.chave) })
        await this.setState({ modalLog: true })
    }

    render() {
        const validations = []
        validations.push(this.state.emissao)
        validations.push(this.state.cliente)
        validations.push(this.state.atividade)
        validations.push(this.state.total && this.state.total.replaceAll('.', '').replaceAll(',', '.') == parseFloat(this.state.total.replaceAll('.', '').replaceAll(',', '.')))
        validations.push(this.state.formulario)
        validations.push(this.state.discriminacaoServico)
        validations.push(!this.state.bloqueado)

        const validForm = validations.reduce((t, a) => t && a)

        return (
            <div className='allContent'>

                {this.state.loading &&
                    <Skeleton />
                }

                {this.state.redirect &&
                    <Redirect to={'/'} />
                }

                {!this.state.loading &&
                    <>
                        <section>
                            {(!this.props.location || !this.props.location.state || !this.props.location.state.backTo) &&
                                <Header voltarFaturas chave={this.state.chave} titulo="Notas Fiscais de Serviço" />
                            }
                            {this.props.location && this.props.location.state && this.props.location.state.backTo &&
                                <Header voltarFaturasOS state={this.props.location.state} chave={this.state.chave} titulo="Notas Fiscais de Serviço" />
                            }
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
                            nome={this.state.fatura}
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
                                        }}
                                    >
                                        <Form className="contact-form">

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
                                                                    <Field className="form-control" style={{ backgroundColor: '#dddddd' }} type="text" disabled value={this.state.chave} />
                                                                </div>
                                                                <div className="col-xl-4 col-lg-4 col-md-3 col-sm-1 col-1 ">
                                                                </div>
                                                                <div className={this.state.chave == 0 ? "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel" : "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm"}>
                                                                    <label>Fatura Nº</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                    <Field className="form-control" type="text" value={this.state.faturaNum} disabled />
                                                                </div>
                                                            </>
                                                        }
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Emissão</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.emissao &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="date" value={this.state.emissao} onChange={async e => { this.setState({ emissao: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Vencimento</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="date" value={this.state.vencimento} onChange={async e => { this.setState({ vencimento: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Cliente</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.cliente &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.pessoasOptions.filter(e => this.filterSearch(e, this.state.pessoasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ pessoasOptionsTexto: e }) }} value={this.state.pessoasOptions.filter(option => option.value == this.state.cliente)[0]} search={true} onChange={(e) => { this.setState({ cliente: e.value, }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Atividade</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.atividade &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <select className='form-control' value={this.state.atividade} onChange={(e) => { this.setState({ atividade: e.currentTarget.value }) }} >
                                                                <option value=""></option>
                                                                <option value="1006">Agenciamento Marítimo</option>
                                                                <option value="1602">Outros servicos de transporte de natureza municipal</option>
                                                                <option value="1702">Datilografia, digitação, estenografia, expediente</option>
                                                            </select>
                                                        </div>
                                                        <div className={this.state.chave == 0 ? "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel" : "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm"}>
                                                            <label>Discriminação Serviço</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.discriminacaoServico &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control textareaFix" rows="5" as={"textarea"} value={this.state.discriminacaoServico} onChange={async e => { this.setState({ discriminacaoServico: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className={this.state.chave == 0 ? "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel" : "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm"}>
                                                            <label>Obs</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="text" value={this.state.observacoes} onChange={async e => { this.setState({ observacoes: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Tributada PIS/COFINS</label>
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <Field type="checkbox" name='cliente' checked={this.state.tributada} onChange={async e => { await this.setState({ tributada: e.target.checked }) }} />
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-1 col-1 labelForm"></div>
                                                        <div className={this.state.chave == 0 ? "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel" : "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm"}>
                                                            <label>Total da Fatura</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.total &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="text" value={this.state.total} onChange={async e => { this.setState({ total: e.currentTarget.value }) }} onBlur={async e => { this.setState({ total: Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR').format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '' }) }} />
                                                        </div>

                                                    </div>


                                                </div>
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                            </div>

                                            <div className='row'>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-12" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                    <button disabled={!validForm} type="submit" style={validForm ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} onClick={async () => { await this.salvarFatura(validForm) }}>Salvar</button>
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-12" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                    <button disabled={!validForm} style={validForm ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} onClick={async () => { await this.salvarFatura(validForm); await this.enviaNota() }}>Enviar</button>
                                                </div>
                                            </div>

                                        </Form>
                                    </Formik>
                                </div>
                            </div>

                        </div>
                        <Rodape />
                    </>
                }
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

export default connect(mapStateToProps, null)(AddFatura)

