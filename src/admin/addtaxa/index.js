import React, { Component } from 'react'
import './styles.css'
import { Formik, Field, Form } from 'formik'
import Header from '../../components/header'
import Rodape from '../../components/rodape'
import util from '../../classes/util'
import loader from '../../classes/loader'
import { PRECISA_LOGAR } from '../../config'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import Image from 'react-bootstrap/Image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { apiEmployee } from '../../services/apiamrg'
import moment from 'moment'
import ModalListas from '../../components/modalListas'
import Select from 'react-select';
import ModalLogs from '../../components/modalLogs'

const estadoInicial = {
    data: '',
    porto: 0,
    thumb: [],
    imagem: '',
    taxa: [],
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

    dadosIniciais: '',
    dadosFinais: '',

    descricao: '',
    valor: '',
    variavel: false,
    moeda: 5,
    tipo: 'P',
    conta_contabil: '',
    conta_credito: '',
    historico_padrao: '',
    formula_ate: '',
    subgrupo: '',

    moedas: [],
    subgrupos: [],
    subgruposOptions: [],

    planosContas: [],
    planosContasOptions: [],
    planosContasOptionsTexto: '',

    historicos: [],
    historicosOptions: [],
    historicosOptionsTexto: '',

    acessos: [],
    permissoes: [],
    acessosPermissoes: [],

    bloqueado: false,

    modal: false,
    modalLista: [],
    modalPesquisa: '',

}

class AddTaxa extends Component {

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        window.scrollTo(0, 0)
        var id = await this.props.match.params.id
        await this.setState({ chave: id })
        if (parseInt(id) !== 0) {
            await this.setState({ taxa: this.props.location.state.taxa })
            //console.log('Servicos: ' + JSON.stringify(this.state.tiposervico))
            //await this.loadData(this.state.tiposervico)
            await this.setState({
                descricao: this.state.taxa.descricao,
                valor: new Intl.NumberFormat('pt-BR').format(this.state.taxa.valor),
                variavel: (this.state.taxa.variavel == 1) ? true : false,
                moeda: this.state.taxa.Moeda,
                tipo: this.state.taxa.Tipo,
                conta_contabil: this.state.taxa.Conta_Contabil,
                conta_credito: this.state.taxa.conta_credito,
                historico_padrao: this.state.taxa.historico_padrao,
                formula_ate: this.state.taxa.formula_ate,
                subgrupo: this.state.taxa.sub_grupo
            })
            
            await this.setState({
                dadosIniciais: [
                    { titulo: 'descricao', valor: this.state.descricao },
                    { titulo: 'valor', valor: this.state.valor },
                    { titulo: 'variavel', valor: this.state.variavel },
                    { titulo: 'Moeda', valor: this.state.moeda },
                    { titulo: 'Tipo', valor: this.state.tipo },
                    { titulo: 'Conta_Contabil', valor: this.state.conta_contabil },
                    { titulo: 'conta_credito', valor: this.state.conta_credito },
                    { titulo: 'historico_padrao', valor: this.state.historico_padrao },
                    { titulo: 'formula_ate', valor: this.state.formula_ate },
                    { titulo: 'sub_grupo', valor: this.state.subgrupo }
                ]
            })
        }
        await this.carregaMoedas();
        await this.carregaSubgrupos();
        await this.carregaPlanosContas();
        await this.carregaHistoricos();

        await this.carregaTiposAcessos()
        await this.carregaPermissoes()
        await this.testaAcesso()

        this.state.acessosPermissoes.map((e) => {
            if ((e.acessoAcao == "TAXAS" && e.permissaoInsere == 0 && this.state.chave == 0) || (e.acessoAcao == "TAXAS" && e.permissaoEdita == 0 && this.state.chave != 0)) {
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

    carregaMoedas = async () => {
        await apiEmployee.post('getMoedas.php', {
            token: true
        }).then(
            async res => {
                await this.setState({ moedas: res.data })
            },
            async err => console.log(`erro: ` + err)
        )
    }

    carregaSubgrupos = async () => {
        await apiEmployee.post('getSubgrupos.php', {
            token: true
        }).then(
            async res => {
                await this.setState({ subgrupos: res.data })

                const options = this.state.subgrupos.map((e) => {
                    return { label: e.descricao, value: e.chave }
                })

                await this.setState({ subgruposOptions: options })
            },
            async err => console.log(`erro: ` + err)
        )
    }

    carregaPlanosContas = async () => {
        await apiEmployee.post('getPlanosContas.php', {
            token: true
        }).then(
            async res => {
                await this.setState({ planosContas: res.data.filter((e) => e.Indicador == 'A') })

                const options = this.state.planosContas.map((e) => {
                    return { label: e.Descricao, value: e.Chave }
                })
                options.unshift({label: '---', value: ''})

                await this.setState({ planosContasOptions: options })
            },
            async err => console.log(`erro: ` + err)
        )
    }

    carregaHistoricos = async () => {
        await apiEmployee.post('getHistoricos.php', {
            token: true
        }).then(
            async res => {
                await this.setState({ historicos: res.data })

                const options = this.state.historicos.map((e) => {
                    return { label: e.Descricao, value: e.chave }
                })

                await this.setState({ historicosOptions: options })
            },
            async err => console.log(`erro: ` + err)
        )
    }

    salvarTaxa = async (validForm) => {
        //this.getMaxNews()
        if (this.state.variavel) {
            this.setState({ variavel: 1 })
        } else {
            this.setState({ variavel: 0 })
        }
        this.setState({ bloqueado: true })

        await this.setState({
            dadosFinais: [
                { titulo: 'descricao', valor: this.state.descricao },
                { titulo: 'valor', valor: this.state.valor },
                { titulo: 'variavel', valor: this.state.variavel },
                { titulo: 'Moeda', valor: this.state.moeda },
                { titulo: 'Tipo', valor: this.state.tipo },
                { titulo: 'Conta_Contabil', valor: this.state.conta_contabil },
                { titulo: 'conta_credito', valor: this.state.conta_credito },
                { titulo: 'historico_padrao', valor: this.state.historico_padrao },
                { titulo: 'formula_ate', valor: this.state.formula_ate },
                { titulo: 'sub_grupo', valor: this.state.subgrupo }
            ]
        })

        if (parseInt(this.state.chave) === 0 && validForm) {
            //$cols = 'data, titulo, texto, imagem, link, inativo';
            await apiEmployee.post(`insertTaxa.php`, {
                token: true,
                values: `'${this.state.descricao}', '${parseFloat(this.state.valor.replaceAll('.','').replaceAll(',', '.'))}', '${this.state.variavel}', '${this.state.moeda}', '${this.state.tipo}', '${this.state.conta_contabil}', '${this.state.historico_padrao}', '${this.state.formula_ate}', '${this.state.subgrupo}'`
            }).then(
                async res => {
                    if (res.data[0].chave) {
                        await this.setState({ chave: res.data[0].chave })
                        await loader.salvaLogs('os_taxas', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].chave);

                        //alert('Taxa Inserida!')
                        await this.setState({ finalizaOperacao: true })
                    } else {
                        //alert(`Erro: ${res.data}`)
                    }
                },
                async res => await console.log(`Erro: ${res.data}`)
            )
        } else if (validForm) {
            await apiEmployee.post(`updateTaxa.php`, {
                token: true,
                chave: this.state.chave,
                descricao: this.state.descricao,
                valor: parseFloat(this.state.valor.replaceAll('.','').replaceAll(',', '.')),
                variavel: this.state.variavel,
                Moeda: this.state.moeda,
                Tipo: this.state.tipo,
                Conta_Contabil: this.state.conta_contabil,
                conta_credito: this.state.conta_credito,
                historico_padrao: this.state.historico_padrao,
                formula_ate: this.state.formula_ate,
                sub_grupo: this.state.subgrupo
            }).then(
                async res => {
                    if (res.data === true) {
                        await loader.salvaLogs('os_taxas', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.chave, `TAXA: ${this.state.descricao}`);
                        
                        await this.setState({ finalizaOperacao: true })
                    } else {
                        await alert(`Erro ${JSON.stringify(res)}`)
                    }
                },
                async res => await console.log(`Erro: ${res.data}`)
            )

        }

    }

    alteraModal = async (valor) => {
        this.setState({ modal: valor });
    }

    alteraSubgrupo = async (valor) => {
        await this.setState({ subgrupo: valor });
        await this.setState({ modalAberto: false });
        await this.carregaSubgrupos()
    }

    alteraPlanoConta = async (valor, indicador) => {
        if (indicador == 'A') {
            await this.setState({ conta_contabil: valor });
        }
        await this.setState({ modalAberto: false });
        await this.carregaPlanosContas()
    }

    erroApi = async (res) => {
        console.log(res)
        await this.setState({ redirect: true })
    }


    filterSearch = (e, state) => {
        if (e == "") {
            return true
        }

        if (e.label) {
            const text = state.toUpperCase();
            return (e.label.toUpperCase().includes(text))
        }
    }

    openLogs = async () => {
        await this.setState({ logs: await loader.getLogs("os_taxas", this.state.chave) })
        await this.setState({ modalLog: true })
    }


    render() {
        const validations = []
        validations.push(this.state.descricao)
        validations.push(this.state.valor && parseFloat(this.state.valor.replaceAll('.','').replaceAll(',','.')) > 0)
        validations.push(this.state.subgrupo)
        validations.push(this.state.moeda)
        validations.push(this.state.valor && this.state.valor.replaceAll('.','').replaceAll(',','.') == parseFloat(this.state.valor.replaceAll('.','').replaceAll(',','.')))
        validations.push(!this.state.bloqueado)

        //validations.push(this.state.porto && this.state.porto > 0)
        //o formulário só será válido se todas as validações forem verdadeiras, com este reduce implementado

        const validForm = validations.reduce((t, a) => t && a)

        return (
            <div className='allContent'>

                {this.state.redirect &&
                    <Redirect to={'/admin'} />
                }

                {this.state.finalizaOperacao &&
                    <Redirect to={{pathname: '/admin/taxas', state:{chave: this.state.chave}}} />
                }

                <section>
                    <Header voltarTaxas titulo="Taxas" chave={this.state.chave != 0 ? this.state.chave : ''}/>
                    <br/>
                    <br/>
                    <br/>
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

                <ModalListas alteraModal={this.alteraModal} alteraSubgrupo={this.alteraSubgrupo} alteraPlanoConta={this.alteraPlanoConta} acessosPermissoes={this.state.acessosPermissoes} modalAberto={this.state.modalAberto} modal={this.state.modal} modalLista={this.state.modalLista} closeModal={() => { this.setState({ modalAberto: false }) }} pesquisa={this.state.modalPesquisa}/>

                <div className="contact-section">

                    <div className="row">
                        <div className="col-lg-12">
                            <Formik
                                initialValues={{
                                    name: '',
                                }}
                                onSubmit={async values => {
                                    await new Promise(r => setTimeout(r, 1000))
                                    this.salvarTaxa(validForm)
                                }}
                            >
                                <Form className="contact-form" onBlur={() => {/*this.verificadorspans()*/ }} >

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
                                                    <label>Descrição</label>
                                                </div>
                                                <div className='col-1 errorMessage'>
                                                    {!this.state.descricao &&
                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                    }
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                    <Field className="form-control" type="text" value={this.state.descricao} onChange={async e => { this.setState({ descricao: e.currentTarget.value }) }} />
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <label>Valor</label>
                                                </div>
                                                <div className='col-1 errorMessage'>
                                                    {!this.state.valor &&
                                                        <FontAwesomeIcon title='Preencha os campos' icon={faExclamationTriangle} />
                                                    }
                                                    {!this.state.moeda &&
                                                        <FontAwesomeIcon title='Preencha os campos' icon={faExclamationTriangle} />
                                                    }
                                                    {this.state.valor && this.state.moeda && !this.state.valor.replaceAll('.','').replaceAll(',','.') == parseFloat(this.state.valor.replaceAll('.','').replaceAll(',','.')) &&
                                                        <FontAwesomeIcon title='Apenas números são permitidos' icon={faExclamationTriangle} />
                                                    }
                                                </div>
                                                <div className="fieldDividido col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                    <select className='form-control fieldDividido_1' value={this.state.moeda} onChange={(e) => { this.setState({ moeda: e.target.value }) }}>
                                                        {this.state.moedas.map((e) => (
                                                            <option value={e.Chave}>{e.Sigla}</option>
                                                        ))}
                                                    </select>
                                                    <Field className="form-control fieldDividido_2 text-right" type="text" value={this.state.valor} onClick={(e) => e.target.select()} onChange={async e => { this.setState({ valor: e.currentTarget.value }) }} onBlur={async e => { this.setState({valor: Number(e.currentTarget.value.replaceAll('.','').replaceAll(',','.')) ? new Intl.NumberFormat('pt-BR').format(e.currentTarget.value.replaceAll('.','').replaceAll(',','.')) : ''})}} />
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <label>Grupo</label>
                                                </div>
                                                <div className='col-1 errorMessage'>
                                                    {!this.state.subgrupo &&
                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                    }
                                                </div>
                                                <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                                    <Select className='SearchSelect' options={this.state.subgruposOptions} value={this.state.subgruposOptions.filter(option => option.value == this.state.subgrupo)} search={true} onChange={(e) => { this.setState({ subgrupo: e.value }) }} />
                                                </div>
                                                <div className="col-xl-1 col-lg-2 col-md-2 col-sm-12 col-12">
                                                {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'TIPOS_SERVICOS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                                    <div className='insideFormButton' onClick={() => { this.setState({ modalPesquisa: this.state.subgrupo && this.state.subgrupo != 0 ? this.state.subgrupo : "", modalAberto: true, modal: 'listarSubgrupos', modalLista: this.state.subgrupos }) }}>...</div>
                                                }
                                                </div>
                                                <div className="col-1">
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <label>Tipo</label>
                                                </div>
                                                <div className='col-1'></div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                    <select className='form-control' value={this.state.tipo} onChange={(e) => { this.setState({ tipo: e.currentTarget.value }) }}>
                                                        <option value={'P'}>Pagar</option>
                                                        <option value={'R'}>Receber</option>
                                                        <option value={'GT'}>Government Taxes</option>
                                                        <option value={'BC'}>Bank Charges</option>
                                                    </select>
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <label>Variavel</label>
                                                </div>
                                                <div className='col-1'></div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                    <input className='form_control' checked={this.state.variavel} onChange={(e) => { this.setState({ variavel: e.target.checked }) }} type="checkbox" />
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <label>Conta Contabil</label>
                                                </div>
                                                <div className='col-1'></div>
                                                <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                                    <Select className='SearchSelect' options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ planosContasOptionsTexto: e }) }} value={this.state.planosContasOptions.filter(option => option.value == this.state.conta_contabil)[0]} search={true} onChange={(e) => { this.setState({ conta_contabil: e.value, }) }} />
                                                </div>
                                                <div className="col-xl-1 col-lg-2 col-md-2 col-sm-12 col-12">
                                                {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PLANOS_CONTAS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                                    <div className='insideFormButton' onClick={() => { this.setState({ modalPesquisa: this.state.conta_contabil && this.state.conta_contabil != 0 ? this.state.conta_contabil : "",modalAberto: true, modal: 'listarPlanosContas', modalLista: this.state.planosContas }) }}>...</div>
                                                }
                                                </div>
                                                <div className="col-1">
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <label>Historico Padrao</label>
                                                </div>
                                                <div className='col-1'></div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                    <Select className='SearchSelect' options={this.state.historicosOptions.filter(e => this.filterSearch(e, this.state.historicosOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ historicosOptionsTexto: e }) }} value={this.state.historicosOptions.filter(option => option.value == this.state.historico_padrao)[0]} search={true} onChange={(e) => { this.setState({ historico_padrao: e.value, }) }} />
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <label>Formula Ate</label>
                                                </div>
                                                <div className='col-1'></div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                    <Field className="form-control" type="number" value={this.state.formula_ate} onChange={async e => { this.setState({ formula_ate: e.currentTarget.value }) }} />
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

export default connect(mapStateToProps, null)(AddTaxa)

