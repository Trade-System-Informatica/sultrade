import React, { Component } from 'react'
import './styles.css'
import { Formik, Field, Form } from 'formik'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import util from '../../../classes/util'
import loader from '../../../classes/loader'
import { PRECISA_LOGAR } from '../../../config'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import Image from 'react-bootstrap/Image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { apiEmployee } from '../../../services/apiamrg'
import moment from 'moment'
import Select from 'react-select';
import ModalLogs from '../../../components/modalLogs'

const estadoInicial = {
    porto: 0,
    thumb: [],
    imagem: '',
    terminal: [],
    id: null,
    seaports: [],
    redirect: false,
    finalizaOperacao: false,
    spanerror1: '',
    spanerror2: '',
    spanerror3: '',
    spanerror4: '',
    maxTerminal: null,

    logs: [],
    modalLog: false,

    dadosIniciais: [],
    dadosFinais: [],
    
    acessos: [],
    permissoes: [],
    acessosPermissoes: [],

    descricao: '',
    sigla: '',
    plural: '',
    cotacao: '',
    data: moment().format('YYYY-MM-DD'),

    bloqueado: false,
}

class AddMoeda extends Component {

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        window.scrollTo(0, 0)
        var id = await this.props.match.params.id
        await this.setState({ chave: id })
        if (parseInt(id) !== 0) {
            await this.setState({ moeda: this.props.location.state.moeda })
            //console.log('Servicos: ' + JSON.stringify(this.state.tiposervico))
            //await this.loadData(this.state.tiposervico)
            await this.setState({
                descricao: this.state.moeda.Descricao,
                sigla: this.state.moeda.Sigla,
                plural: this.state.moeda.plural,
                cotacao: new Intl.NumberFormat('pt-BR').format(this.state.moeda.Ultima_Cotacao),
            })

            await this.setState({
                dadosIniciais: [
                    {titulo: 'Descricao', valor: this.state.descricao},
                    {titulo: 'Sigla', valor: this.state.sigla},
                    {titulo: 'plural', valor: this.state.plural},
                    {titulo: 'cotacao', valor: this.state.cotacao}
                ]
            })
        }
        await this.carregaTiposAcessos()
        await this.carregaPermissoes()
        await this.testaAcesso()

        this.state.acessosPermissoes.map((e) => {
            if ((e.acessoAcao == "MOEDAS" && e.permissaoInsere == 0 && this.state.chave == 0) || (e.acessoAcao == "MOEDAS" && e.permissaoEdita == 0 && this.state.chave != 0)) {
                this.setState({ bloqueado: true })
            }
        })
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

    salvarMoeda = async (validForm) => {
        await this.setState({
            dadosFinais: [
                {titulo: 'Descricao', valor: this.state.descricao},
                {titulo: 'Sigla', valor: this.state.sigla},
                {titulo: 'plural', valor: this.state.plural},
                {titulo: 'cotacao', valor: this.state.cotacao}
            ]
        })

        this.setState({ bloqueado: true })
        if (parseInt(this.state.chave) === 0 && validForm) {
            await apiEmployee.post(`insertMoeda.php`, {
                token: true,
                values: `'${this.state.descricao}', '${this.state.sigla}', '${this.state.plural}', '${parseFloat(this.state.cotacao.replaceAll('.','').replaceAll(',', '.'))}'`,
                values2: `'${this.state.data}', '${this.state.cotacao}'`,
                search: `Descricao = '${this.state.descricao}' AND Sigla = '${this.state.sigla}' AND plural = '${this.state.plural}' AND Ultima_Cotacao = '${this.state.cotacao}'`
            }).then(
                async res => {
                    if (res.data[0].Chave) {
                        await this.setState({ chave: res.data[0].Chave })
                        await loader.salvaLogs('moedas', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].Chave);
                        //alert('Moeda Inserida!')
                        await this.setState({ finalizaOperacao: true })
                    } else {
                        alert(`Erro: ${JSON.stringify(res)}`)
                    }
                },
                async res => await console.log(`Erro: ${res.data}`)
            )
        } else if (validForm) {
            await apiEmployee.post(`updateMoeda.php`, {
                token: true,
                chave: this.state.chave,
                Descricao: this.state.descricao,
                Sigla: this.state.sigla,
                plural: this.state.plural,
                Ultima_Cotacao: parseFloat(this.state.cotacao.replaceAll('.','').replaceAll(',', '.')),
                data: this.state.data
            }).then(
                async res => {
                    if (res.data === true) {
                        await loader.salvaLogs('moedas', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.chave, `MOEDA: ${this.state.descricao}`);
                        
                        await this.setState({ finalizaOperacao: true })
                    } else if (res.data && res.data.includes('Duplicate')) {
                        await alert("Não foi possivel alterar a moeda, o valor já foi alterado na data de hoje")
                        await this.setState({ finalizaOperacao: true })
                    } else {
                        await alert(`Erro ${JSON.stringify(res)}`)
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

    guessPlural = (e) => {
        this.setState({ descricao: e });

        let plural = e.trim();
        let lastLetter = plural.slice(-1);
        if (lastLetter == "m") {
            plural = plural.substring(0, plural.length - 1) + "ns";
        } else if (lastLetter == 'l') {
            plural = plural.substring(0, plural.length - 1) + "is";
        } else if (['a', 'e', 'i', 'o', 'u'].includes(lastLetter)) {
            plural += "s";
        } else if (plural != "") {
            plural += "es";
        }

        this.setState({ plural: plural })
    }

    openLogs = async () => {
        await this.setState({ logs: await loader.getLogs("moedas", this.state.chave) })
        await this.setState({ modalLog: true })
    }

    render() {

        const validations = []
        validations.push(this.state.descricao)
        validations.push(this.state.plural)
        validations.push(this.state.cotacao && this.state.cotacao.replaceAll('.','').replaceAll(',','.') == parseFloat(this.state.cotacao.replaceAll('.','').replaceAll(',','.')))
        validations.push(this.state.sigla)
        validations.push(!this.state.bloqueado)

        //validations.push(this.state.porto && this.state.porto > 0)
        //o formulário só será válido se todas as validações forem verdadeiras, com este reduce implementado

        const validForm = validations.reduce((t, a) => t && a)

        return (
            <div className='allContent'>

                {this.state.redirect &&
                    <Redirect to={'/'} />
                }

                {this.state.finalizaOperacao &&
                    <Redirect to={{pathname: '/tabelas/moedas', state:{chave: this.state.chave}}} />
                }

                <section>
                    <Header voltarMoedas titulo="Moedas" chave={this.state.chave != 0 ? this.state.chave : ''}/>
                </section>

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
                                    this.salvarMoeda(validForm)
                                }}
                            >
                                <Form className="contact-form" >

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
                                                        <Field className="form-control" style={{backgroundColor: '#dddddd' }} type="text" disabled value={this.state.chave} />
                                                    </div>
                                                }
                                                {this.state.chave != 0 &&
                                                    <div className="col-xl-4 col-lg-4 col-md-3 col-sm-1 col-1 ">
                                                    </div>
                                                }
                                                <div className={this.state.chave == 0 ? "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel" : "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm"}>
                                                    <label>Nome</label>
                                                </div>
                                                <div className='col-1 errorMessage'>
                                                    {!this.state.descricao &&
                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                    }
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                    <Field className="form-control" type="text" value={this.state.descricao} onChange={async e => { this.guessPlural(e.currentTarget.value) }} />
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <label>Forma plural</label>
                                                </div>
                                                <div className='col-1 errorMessage'>
                                                    {!this.state.plural &&
                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                    }
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                    <Field className="form-control" type="text" value={this.state.plural} onChange={async e => { this.setState({ plural: e.currentTarget.value }) }} />
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <label>Sigla</label>
                                                </div>
                                                <div className='col-1 errorMessage'>
                                                    {!this.state.sigla &&
                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                    }
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                    <Field className="form-control" type="text" value={this.state.sigla} onChange={async e => { this.setState({ sigla: e.currentTarget.value }) }} />
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <label>Cotação atual</label>
                                                </div>
                                                <div className='col-1 errorMessage'>
                                                    {!this.state.cotacao &&
                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                    }
                                                    {this.state.cotacao && !this.state.cotacao.replaceAll('.','').replaceAll(',','.') == parseFloat(this.state.cotacao.replaceAll('.','').replaceAll(',','.')) &&
                                                        <FontAwesomeIcon title='Apenas numeros são permitidos' icon={faExclamationTriangle} />
                                                    }
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                    <Field className="form-control text-right" type="text" value={this.state.cotacao} onClick={(e) => e.target.select()} onChange={async e => { this.setState({ cotacao: e.currentTarget.value }) }} onBlur={async e => { this.setState({cotacao: Number(e.currentTarget.value.replaceAll('.','').replaceAll(',','.')) ? new Intl.NumberFormat('pt-BR').format(e.currentTarget.value.replaceAll('.','').replaceAll(',','.')) : ''})}} />
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

export default connect(mapStateToProps, null)(AddMoeda)

