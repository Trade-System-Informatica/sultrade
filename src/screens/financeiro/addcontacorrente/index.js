import React, { Component } from 'react'
import './styles.css'
import { Formik, Field, Form } from 'formik'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import ModalListas from '../../../components/modalListas'
import Skeleton from '../../../components/skeleton'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import ModalLogs from '../../../components/modalLogs'
import { apiEmployee } from '../../../services/apiamrg'
import moment from 'moment'
import loader from '../../../classes/loader'
import Select from 'react-select';

const estadoInicial = {
    conta: '',
    chave: 0,
    titulo: "",
    tipoConta: "",
    banco: "",
    agencia: "",
    numeroConta: "",
    saldoInicial: "",
    saldoData: "",

    logs: [],
    modalLog: false,

    dadosIniciais: [],
    dadosFinais: [],

    acessos: [],
    permissoes: [],
    acessosPermissoes: [],

    modalAberto: false,
    modal: 0,
    modalLista: '',
    modalPesquisa: '',

    bloqueado: false,
    loading: true
}

class AddContaCorrente extends Component {

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
            await this.setState({ conta: this.props.location.state.conta })


            await this.setState({
                titulo: "",
                tipoConta: "",
                banco: "",
                agencia: "",
                numeroConta: "",
                saldoInicial: "",
                saldoData: "",
            })

            await this.setState({
                dadosIniciais: [

                ]


            })
            if (this.state.contaProvisao != 0) {
                await this.setState({ provisaoCheck: true })
            }
        }
        await this.loadAll();

        this.state.acessosPermissoes.map((e) => {
            if ((e.acessoAcao == "CONTAS_CORRENTES" && e.permissaoInsere == 0 && this.state.chave == 0) || (e.acessoAcao == "CONTAS_CORRENTES" && e.permissaoEdita == 0 && this.state.chave != 0)) {
                this.setState({ bloqueado: true })
            }
        })

    }

    loadAll = async () => {
        //await this.getPessoas();

        await this.setState({
            acessos: await loader.getBase('getTiposAcessos.php'),
            permissoes: await loader.getBase('getPermissoes.php')
        })

        await this.setState({
            acessosPermissoes: await loader.testaAcesso(this.state.acessos, this.state.permissoes, this.state.usuarioLogado),
            loading: false
        })
    }

    getPessoas = async () => {
        if (this.state.tipo == '0') {
            this.setState({
                pessoas: await loader.getBase('getClientes.php'),
                pessoasOptions: await loader.getBaseOptionsCustomLabel('getClientes.php', "Nome", "Cnpj_Cpf", "Chave")
            })
        } else if (this.state.tipo == '1') {
            this.setState({
                pessoas: await loader.getBase('getFornecedores.php'),
                pessoasOptions: await loader.getBaseOptionsCustomLabel('getFornecedores.php', "Nome", "Cnpj_Cpf", "Chave")
            });
        }
    }

    salvarConta = async (validForm) => {
        this.setState({ bloqueado: true });

        await this.setState({
            dadosFinais: [
            ]
        })

        if (parseInt(this.state.chave) === 0 && validForm) {
            await apiEmployee.post(`insertContaCorrente.php`, {
                token: true,
                values: ``,
            }).then(
                async res => {
                    if (res.data[0].Chave) {
                        await this.setState({ chave: res.data[0].Chave })
                        await loader.salvaLogs('contas_correntes', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].Chave);

                        await this.setState({ finalizaOperacao: true })
                    } else {
                        await alert(`Erro ${JSON.stringify(res.data)}`)
                    }
                },
                async res => await console.log(`Erro: ${res.data}`)
            )
        } else if (validForm) {
            await apiEmployee.post(`updateContaCorrente.php`, {
                token: true,
                Chave: this.state.chave,
            }).then(
                async res => {
                    if (res.data === true) {
                        await loader.salvaLogs('contas_correntes', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.chave, `CONTAS CORRENTES: `);
                        await this.setState({ finalizaOperacao: true })
                    } else {
                        await alert(`Erro ${JSON.stringify(res.data)}`)
                    }
                },
                async res => await console.log(`Erro: ${res.data}`)
            )
        }

    }

    /*alteraModal = async (valor) => {
        this.setState({ modal: valor });
    }

    alteraPessoa = async (valor, categoria) => {
        if (this.state.tipo == '0' && categoria.split('')[0] == '1') {
            await this.setState({ pessoa: valor });
        }

        if (this.state.tipo == '1' && categoria.split('')[1] == '1') {
            await this.setState({ pessoa: valor });
        }

        await this.setState({ modalAberto: false })
        await this.getPessoas();

    }

    alteraCentroCusto = async (valor) => {
        await this.setState({ centroCusto: valor });
        await this.setState({ modalAberto: false });
        await this.setState({
            centrosCustos: await loader.getBase('getCentrosCustos.php'),
            centrosCustosOptions: await loader.getBaseOptions('getCentrosCustos.php', 'Descricao', 'Chave')
        })
    }*/

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
        await this.setState({ logs: await loader.getLogs("contas_correntes", this.state.chave) })
        await this.setState({ modalLog: true })
    }


    render() {

        const validations = []
        /*validations.push(this.state.tipo)
        validations.push(this.state.pessoa)
        validations.push(!this.state.ultimaTransacao[0] || this.state.ultimaTransacao[0].id_status == 0 || this.state.ultimaTransacao[0].id_status == 1)
        validations.push(this.state.vencimento)
        validations.push(this.state.vencimentoOrig)
        validations.push(this.state.valor && this.state.valor.replaceAll('.', '').replaceAll(',', '.') == parseFloat(this.state.valor.replaceAll('.', '').replaceAll(',', '.')))
        validations.push(this.state.meioPagamento)
        validations.push(this.state.tipo == 0 || this.state.contaDesconto)
        validations.push(this.state.meioPagamentoNome != 'GRU' && this.state.meioPagamentoNome != 'BOL' || this.state.codBarras)
        validations.push(this.state.meioPagamentoNome != 'DARF' && this.state.meioPagamentoNome != 'GPS' || this.state.codigoReceita)
        validations.push(this.state.meioPagamentoNome != 'DARF' && this.state.meioPagamentoNome != 'GPS' && this.state.meioPagamentoNome != 'GRU' || this.state.contribuinte)
        validations.push(this.state.meioPagamentoNome != 'DARF' && this.state.meioPagamentoNome != 'GPS' || this.state.codigoIdentificadorTributo)
        validations.push(this.state.meioPagamentoNome != 'DARF' && this.state.meioPagamentoNome != 'GPS' || this.state.mesCompetNumRef)
        validations.push(this.state.meioPagamentoNome != 'DARF' && this.state.meioPagamentoNome != 'GPS' || this.state.dataApuracao)
        validations.push(this.state.meioPagamentoNome != 'DARF' && this.state.meioPagamentoNome != 'GPS' || this.state.darfValor && this.state.darfValor.replaceAll('.', '').replaceAll(',', '.') == parseFloat(this.state.darfValor.replaceAll('.', '').replaceAll(',', '.')))
        validations.push(this.state.meioPagamentoNome != 'DARF' && this.state.meioPagamentoNome != 'GPS' || this.state.darfPagamento && this.state.darfPagamento.replaceAll('.', '').replaceAll(',', '.') == parseFloat(this.state.darfPagamento.replaceAll('.', '').replaceAll(',', '.')))
        validations.push(!this.state.bloqueado)*/
        validations.push(false);

        const validForm = validations.reduce((t, a) => t && a)

        return (
            <div className='allContent'>

                {this.state.loading &&
                    <Skeleton />
                }

                {this.state.redirect &&
                    <Redirect to={'/'} />
                }

                {this.state.finalizaOperacao &&
                    <Redirect to={{ pathname: `/financeiro/contascorrentes`, state: { chave: this.state.chave } }} />
                }

                {!this.state.loading &&
                    <>
                        <section>

                            <Header voltarContasCorrentes titulo="Contas Correntes" chave={this.state.chave != 0 ? this.state.chave : ''} />

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
                            nome={this.state.historico}
                            chave={this.state.chave}
                            modalAberto={this.state.modalLog}
                        />
                        {/*<ModalListas
                            alteraModal={this.alteraModal}
                            alteraCliente={this.alteraPessoa}
                            alteraCentroCusto={this.alteraCentroCusto}
                            modalAberto={this.state.modalAberto}
                            modal={this.state.modal}
                            modalLista={this.state.modalLista}
                            pesquisa={this.state.modalPesquisa}
                            acessosPermissoes={this.state.acessosPermissoes}
                            closeModal={() => { this.setState({ modalAberto: false }) }}
                    />*/}

                        <div className="contact-section">

                            <div className="row">
                                <div className="col-lg-12">
                                    <Formik
                                        initialValues={{
                                            name: '',
                                        }}
                                        onSubmit={async values => {
                                            await new Promise(r => setTimeout(r, 1000))
                                            this.salvarConta(validForm)
                                        }}
                                    >
                                        <Form className="contact-form" onBlur={() => {/*this.verificadorspans()*/ }} >

                                            <div className="row">
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2"></div>

                                                <div className="col-xl-8 col-lg-8 col-md-8 col-sm-8 col-12 ">

                                                    <div className="row addservicos">
                                                        {this.state.chave != 0 &&
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel">
                                                                <label>Chave</label>
                                                            </div>
                                                        }
                                                        {this.state.chave != 0 &&
                                                            <div className='col-1'></div>
                                                        }
                                                        {this.state.chave != 0 &&
                                                            <div className="col-xl-2 col-lg-2 col-md-3 col-sm-10 col-10 ">
                                                                <Field className="form-control" style={{ backgroundColor: '#dddddd' }} type="text" disabled value={this.state.chave} />
                                                            </div>
                                                        }
                                                        {this.state.chave != 0 &&
                                                            <div className="col-xl-4 col-lg-4 col-md-3 col-sm-1 col-1 ">
                                                            </div>
                                                        }
                                                        <div className={this.state.chave == 0 ? "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel" : "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm"}>
                                                            <label>Titulo</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.titulo &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="text" value={this.state.titulo} onChange={async e => { this.setState({ titulo: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Tipo de Conta</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="text" value={this.state.tipoConta} onChange={async e => { this.setState({ tipoConta: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Banco</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.banco &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="text" value={this.state.banco} onChange={async e => { this.setState({ banco: e.currentTarget.value }) }} />
                                                        </div>
                                                        
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Agência</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.agencia &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="text" value={this.state.agencia} onChange={async e => { this.setState({ agencia: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Nº da Conta</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.numeroConta &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="text" value={this.state.numeroConta} onChange={async e => { this.setState({ numeroConta: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Saldo Inicial</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.saldoInicial &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="text" value={this.state.saldoInicial} onChange={async e => { this.setState({ saldoInicial: e.currentTarget.value }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Saldo Data</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.saldoData &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Field className="form-control" type="date" value={this.state.saldoData} onChange={async e => { this.setState({ saldoData: e.currentTarget.value }) }} />
                                                        </div>
                                                    </div>


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

export default connect(mapStateToProps, null)(AddContaCorrente)

