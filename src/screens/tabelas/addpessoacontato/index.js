import React, { Component } from 'react'
import './styles.css'
import { Formik, Field, Form } from 'formik'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import loader from '../../../classes/loader'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { Redirect } from 'react-router-dom'
import { apiEmployee } from '../../../services/apiamrg'
import ModalLogs from '../../../components/modalLogs'
import Select from 'react-select';

const estadoInicial = {
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
    chave_pessoa: '',
    tipo: '',
    campo1: '',
    campo2: '',

    tipos: [],
    tiposOptions: [],
    tipoNome: '',

    acessos: [],
    permissoes: [],
    acessosPermissoes: [],

    bloqueado: false,
    savedRedirect: false
}

class AddPessoaContato extends Component {

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        window.scrollTo(0, 0)
        var ed = await this.props.match.params.ed
        await this.setState({ chave: ed })
        if (parseInt(ed) !== 0) {
            await this.setState({ contato: this.props.location.state.contato })
            //console.log('Servicos: ' + JSON.stringify(this.state.tiposervico))
            //await this.loadData(this.state.tiposervico)
            await this.setState({
                tipo: this.state.contato.Tipo,
                tipoNome: this.state.contato.tipoNome,
                campo1: this.state.contato.Campo1,
                campo2: this.state.contato.Campo2,
            })
        }
        this.setState({ chave_pessoa: this.props.match.params.id })
        this.carregaTipos();


        await this.carregaTiposAcessos()
        await this.carregaPermissoes()
        await this.testaAcesso()

        if (this.state.chave != 0) {
            await this.setState({
                dadosIniciais: [
                    { titulo: 'Tipo', valor: util.formatForLogs(this.state.tipo) },
                    { titulo: 'Descrição', valor: util.formatForLogs(this.state.campo1) },
                    { titulo: 'Complementar', valor: util.formatForLogs(this.state.campo2) },
                ]
            });
        }

        this.state.acessosPermissoes.map((e) => {
            if ((e.acessoAcao == "PESSOAS_CONTATOS" && e.permissaoInsere == 0 && this.state.chave == 0) || (e.acessoAcao == "PESSOAS_CONTATOS" && e.permissaoEdita == 0 && this.state.chave != 0)) {
                this.setState({ bloqueado: true })
            }
        })
    }

    carregaTipos = async () => {
        await apiEmployee.post("getTiposComplementares.php", {
            token: true
        }).then(
            async res => {
                this.setState({ tipos: res.data });

                let options = this.state.tipos.map((e) => {
                    return { label: e.Descricao, value: e.Codigo }
                })
                this.setState({ tiposOptions: options });
            },
            async err => console.log('erro: ' + err)
        )
    }

    carregaTiposAcessos = async () => {
        await apiEmployee.post(`getTiposAcessos.php`, {
            token: true,
        }).then(
            async res => {
                await this.setState({ acessos: res.data });
            },
            async err => { this.erroApi(err) }
        )
    }

    carregaPermissoes = async () => {
        await apiEmployee.post(`getPermissoes.php`, {
            token: true,
        }).then(
            async res => {
                await this.setState({ permissoes: res.data })
            },
            async err => { this.erroApi(err) }
        )
    }

    testaAcesso = async () => {
        let permissao = '';

        const acessosPermissoes = this.state.acessos.map((e, i) => {
            permissao = this.state.permissoes.filter((permissao) => {
                if (permissao.Usuario == this.state.usuarioLogado.codigo && permissao.Acessos == e.Chave && permissao.Empresa == this.state.usuarioLogado.empresa) {
                    return permissao;
                }
            })[0]
            return {
                acesso: e.Chave,
                acessoAcao: e.Acao,
                permissaoInsere: permissao ? permissao.Liberacao.split(``)[0] : 0,
                permissaoEdita: permissao ? permissao.Liberacao.split(``)[1] : 0,
                permissaoConsulta: permissao ? permissao.Liberacao.split(``)[2] : 0,
                permissaoDeleta: permissao ? permissao.Liberacao.split(``)[3] : 0
            }
        })

        await this.setState({ acessosPermissoes: acessosPermissoes });



    }

    salvarContato = async (validForm) => {
        this.setState({ ...util.cleanStates(this.state) })
        this.setState({ bloqueado: true })

        await this.setState({
            dadosFinais: [
                { titulo: 'Tipo', valor: util.formatForLogs(this.state.tipo) },
                { titulo: 'Descrição', valor: util.formatForLogs(this.state.campo1) },
                { titulo: 'Complementar', valor: util.formatForLogs(this.state.campo2) },
            ],
            loading: true
        })

        if (parseInt(this.state.chave) === 0 && validForm) {
            //$cols = 'data, titulo, texto, imagem, link, inativo';
            await apiEmployee.post(`insertContato.php`, {
                token: true,
                values: `'${this.state.tipo}', '${this.state.campo1}', '${this.state.campo2}', ${this.state.chave_pessoa}`
            }).then(
                async res => {
                    if (res.data[0]) {
                        await this.setState({ chave: res.data[0].Chave })
                        await loader.salvaLogs('pessoas_contatos', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].Chave);

                        await this.setState({ loading: false, bloqueado: false, savedRedirect: true })
                    } else {
                        //alert(`Erro: ${res.data}`)
                    }
                },
                async res => await console.log(`Erro: ${res.data}`)
            )
        } else if (validForm) {
            await apiEmployee.post(`updateContato.php`, {
                token: true,
                Chave: this.state.chave,
                Tipo: this.state.tipo,
                Campo1: this.state.campo1,
                Campo2: this.state.campo2,
                Chave_Pessoa: this.state.chave_pessoa,
            }).then(
                async res => {
                    if (res.data === true) {
                        await loader.salvaLogs('pessoas_contatos', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.chave, `CONTATO: ${this.state.campo1}`);

                        await this.setState({ loading: false, bloqueado: false, savedRedirect: true })
                    } else {
                        //await alert(`Erro`)
                    }
                },
                async res => await console.log(`Erro: ${res}`)
            )

        }

    }

    erroApi = async (res) => {
        console.log(res)
        await this.setState({ redirect: true })
    }


    filterSearch = (e) => {
        if (e == "") {
            return true
        }

        const text = this.state.pessoasOptionsTexto.toUpperCase();
        return (e.label.toUpperCase().includes(text))
    }

    openLogs = async () => {
        await this.setState({ logs: await loader.getLogs("pessoas_contatos", this.state.chave) })
        await this.setState({ modalLog: true })
    }

    render() {
        const validations = []
        validations.push(this.state.campo1)
        validations.push(this.state.tipo)
        validations.push(!this.state.bloqueado)

        const validForm = validations.reduce((t, a) => t && a)

        return (
            <div className='allContent'>

                {this.state.redirect &&
                    <Redirect to={'/'} />
                }
                {this.state.savedRedirect && this.props.location.state.backTo == "contatos" &&
                    <Redirect to={{ pathname: `/tabelas/pessoacontatos/${this.state.chave_pessoa}` }} />
                }
                {this.state.savedRedirect && this.props.location.state.backTo == "addpessoa" &&
                    <Redirect to={{ pathname: `/tabelas/addpessoa/${this.state.chave_pessoa}` }} />
                }


                <section>
                    {this.props.location.state.backTo == 'addpessoa' &&
                        <Header voltarAddPessoa pessoa={this.state.chave_pessoa} titulo="Contatos" />
                    }
                    {this.props.location.state.backTo == 'contatos' &&
                        <Header voltarPessoaContatos pessoa={this.state.chave_pessoa} chave={this.state.chave != 0 ? this.state.chave : ''} titulo="Contatos" />
                    }
                </section>

                {this.state.chave != 0 && this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'LOGS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                    <div className="logButton">
                        <button onClick={() => this.openLogs()}>Logs</button>
                    </div>
                }

                <ModalLogs
                    closeModal={() => { this.setState({ modalLog: false }) }}
                    logs={this.state.logs}
                    nome={this.state.tiposOptions.find((e) => this.state.tipo == e.value) ? this.state.tiposOptions.find((e) => this.state.tipo == e.value).label : this.state.campo1}
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
                                    this.salvarContato(validForm)
                                }}
                            >
                                <Form className="contact-form">

                                    <div className="row">
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2"></div>

                                        <div className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12 ">

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
                                                    <label>Tipo</label>
                                                </div>
                                                <div className='col-1 errorMessage'>
                                                    {!this.state.tipo &&
                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                    }
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                    <Select className='SearchSelect' value={this.state.tipo} options={this.state.tiposOptions} onChange={(e) => { this.setState({ tipo: e.value, tipoNome: e.label }) }} placeholder={this.state.tipoNome} />
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <label>Descrição</label>
                                                </div>
                                                <div className='col-1 errorMessage'>
                                                    {!this.state.campo1 &&
                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                    }
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                    <Field className="form-control" type="text" value={this.state.campo1} onChange={async e => { this.setState({ campo1: e.currentTarget.value }) }} />
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <label>Complemento</label>
                                                </div>
                                                <div className='col-1'></div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                    {this.state.tipo != "PX" &&
                                                        <Field className="form-control" type="text" value={this.state.campo2} onChange={async e => { this.setState({ campo2: e.currentTarget.value }) }} />
                                                    }
                                                    {this.state.tipo == "PX" &&
                                                        <select className="form-control" value={this.state.campo2} onChange={async e => { this.setState({ campo2: e.currentTarget.value }) }}>
                                                            <option value=""></option>
                                                            <option value="E-mail">E-mail</option>
                                                            <option value="Telefone">Celular</option>
                                                            <option value="CPF/CNPJ">CPF/CNPJ</option>
                                                        </select>
                                                    }
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

export default connect(mapStateToProps, null)(AddPessoaContato)

