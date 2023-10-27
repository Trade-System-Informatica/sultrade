import React, { Component } from 'react'
import './styles.css'
import { Formik, Field, Form } from 'formik'
import { apiEmployee } from '../../../services/apiamrg'
import Header from '../../../components/header'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { PRECISA_LOGAR } from '../../../config'
import loader from '../../../classes/loader'
import util from '../../../classes/util'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import ModalLogs from '../../../components/modalLogs'

import 'react-confirm-alert/src/react-confirm-alert.css'
import Select from 'react-select';


const estadoInicial = {
    ship: [],
    nome: '',
    bandeira: '',
    imo: '',
    grt: '0',
    dwt: '0',
    loa: '0',
    beam: '0',

    logs: [],
    modalLog: false,

    paises: [],
    paisesOptions: [],

    dadosIniciais: '',
    dadosFinais: '',

    dadosIniciais: '',
    dadosFinais: '',

    acessos: [],
    permissoes: [],
    acessosPermissoes: [],

    bloqueado: false,
}

class AddShip extends Component {

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        window.scrollTo(0, 0)
        var id = this.props.match.params.id
        //alert(JSON.stringify(this.props.location.state.ship))
        await this.setState({ token: this.props.token })
        await this.setState({ chave: id })
        if (id != 0) {
            await this.setState({ ship: this.props.location.state.ship })
            await this.loadData(this.props.location.state.ship)
            //await this.carregaEmbarcadores(id)
            //await this.carregaDocumentos(id)
        }
        await this.carregaPaises()
        await this.getLugares();

        await this.carregaTiposAcessos()
        await this.carregaPermissoes()
        await this.testaAcesso()

        if (this.state.chave != 0) {
            await this.setState({
                dadosIniciais: [
                    { titulo: 'Nome', valor: util.formatForLogs(this.state.nome) },
                    { titulo: 'Bandeira', valor: util.formatForLogs(this.state.bandeira, 'options', '', '', this.state.paisesOptions) },
                    { titulo: 'IMO', valor: util.formatForLogs(this.state.imo) },
                    { titulo: 'GRT', valor: util.formatForLogs(this.state.grt?.replace(/[^0-9\\.]/gi, '').replace('.', ',')) },
                    { titulo: 'DWT', valor: util.formatForLogs(this.state.dwt?.replace(/[^0-9\\.]/gi, '').replace('.', ',')) },
                    { titulo: 'LOA', valor: util.formatForLogs(this.state.loa?.replace(/[^0-9\\.]/gi, '').replace('.', '.')) },
                    { titulo: 'BEAM', valor: util.formatForLogs(this.state.beam?.replace(/[^0-9\\.]/gi, '').replace('.', ',')) },
                ]
            })
        }

        this.state.acessosPermissoes.map((e) => {
            if ((e.acessoAcao == "NAVIOS" && e.permissaoInsere == 0 && this.state.chave == 0) || (e.acessoAcao == "NAVIOS" && e.permissaoEdita == 0 && this.state.chave != 0)) {
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

    getLugares = async () => {
        await apiEmployee.post('getLugares.php', {
            token: true
        }).then(
            async res => {
                this.setState({ paises: res.data.paises });

                let options = this.state.paises.map((e) => {
                    return { label: e.Nome, value: e.Chave }
                })
                this.setState({ paisesOptions: options });

            },
            async err => console.log('erro: ' + err)
        )
    }

    carregaPaises = async () => {
        await apiEmployee.post('getPaises.php', {
            token: true,
        }).then(
            async res => {
                if (res.data == 'false') {
                    alert('Não logado!')
                } else {
                    await this.setState({ paises: res.data })
                }
            },
            async err => {
                alert('Erro: ' + err)
            }
        )
    }

    salvarNavio = async (validForm) => {
        if (!validForm) {
            return;
        }
        this.setState({ ...util.cleanStates(this.state) })
        this.setState({
            bloqueado: true,
            loading: true
        })

        await apiEmployee.post(`insertNavio.php`, {
            token: this.props.token,
            values: `'${this.state.nome}', '${this.state.bandeira}', '${this.state.imo}', '${this.state.grt?.replace(/[^0-9\\,]/gi, '').replace(',', '.')}', '${this.state.dwt?.replace(/[^0-9\\,]/gi, '').replace(',', '.')}', '${this.state.loa?.replace(/[^0-9\\,]/gi, '').replace(',', '.')}', '${this.state.beam?.replace(/[^0-9\\,]/gi, '').replace(',', '.') }'`,
        }).then(
            async res => {
                if (res.data[0].chave) {
                    await this.setState({ chave: res.data[0].chave })
                    await loader.salvaLogs('os_navios', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].chave);
                }
                this.setState({ loading: false, bloqueado: false })
            },
            async res => await console.log(`erro: ${res.data}`)
        )
    }

    editarNavio = async (validForm) => {
        if (!validForm) {
            return;
        }
        this.setState({ ...util.cleanStates(this.state) })
        this.setState({ bloqueado: true })

        await this.setState({
            dadosFinais: [
                { titulo: 'Nome', valor: util.formatForLogs(this.state.nome) },
                { titulo: 'Bandeira', valor: util.formatForLogs(this.state.bandeira, 'options', '', '', this.state.paisesOptions) },
                { titulo: 'IMO', valor: util.formatForLogs(this.state.imo) },
                { titulo: 'GRT', valor: util.formatForLogs(this.state.grt?.replace(/[^0-9\\,]/gi, '').replace(',', '.')) },
                { titulo: 'DWT', valor: util.formatForLogs(this.state.dwt?.replace(/[^0-9\\,]/gi, '').replace(',', '.')) },
                { titulo: 'LOA', valor: util.formatForLogs(this.state.loa?.replace(/[^0-9\\,]/gi, '').replace(',', '.')) },
                { titulo: 'BEAM', valor: util.formatForLogs(this.state.beam?.replace(/[^0-9\\,]/gi, '').replace(',', '.')) },
            ],
            loading: true
        })

        await apiEmployee.post(`updateShip.php`, {
            token: true,
            chave: this.state.chave,
            nome: this.state.nome,
            bandeira: this.state.bandeira,
            imo: this.state.imo,
            grt: this.state.grt?.replace(/[^0-9\\,]/gi, '').replace(',', '.'),
            dwt: this.state.dwt?.replace(/[^0-9\\,]/gi, '').replace(',', '.'),
            loa: this.state.loa?.replace(/[^0-9\\,]/gi, '').replace(',', '.'),
            beam: this.state.beam?.replace(/[^0-9\\,]/gi, '').replace(',', '.'),
        }).then(
            async res => {
                if (res.data === true) {
                    await loader.salvaLogs('os_navios', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.chave, `NAVIO: ${this.state.nome}`);

                    await this.setState({ loading: false, bloqueado: false })
                } else {
                    console.log(res.data)
                }
            },
            async res => await alert(`erro: ${res.data}`)
        )
    }

    ver = () => {
        console.log(this.state.ativo2, this.state.ativo3, this.state.ativo4, this.state.ativo5, this.state.numero)
    }

    loadData = async (produto) => {
        if (produto !== 0) {
            await this.setState({
                nome: produto.nome,
                bandeira: produto.bandeira,
                imo: produto.imo,
                grt: produto.grt?.replace('.',','),
                dwt: produto.dwt?.replace('.',','),
                loa: produto.loa?.replace('.',','),
                beam: produto.beam?.replace('.',','),
            })
        }
    }


    erroApi = async (res) => {
        alert(PRECISA_LOGAR)
        await this.setState({ redirect: true })
    }

    openLogs = async () => {
        await this.setState({ logs: await loader.getLogs("os_navios", this.state.chave) })
        await this.setState({ modalLog: true })
    }

    render() {
        const validations = []
        validations.push(this.state.nome)
        validations.push(!this.state.bloqueado)

        const validForm = validations.reduce((t, a) => t && a)

        return (
            <div>

                <Header voltarShips titulo="Navios" chave={this.state.chave != 0 ? this.state.chave : ''} />
                <br />
                <br />
                <br />
                {this.state.redirect &&
                    <Redirect to={'/'} />
                }

                {this.state.chave != 0 && this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'LOGS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                    <div className="logButton">
                        <button onClick={() => this.openLogs()}>Logs</button>
                    </div>
                }

                <ModalLogs
                    closeModal={() => { this.setState({ modalLog: false }) }}
                    logs={this.state.logs}
                    nome={this.state.nome}
                    chave={this.state.chave}
                    modalAberto={this.state.modalLog}
                />

                <div className="contact-section">
                    <div>
                        <div className="row">
                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-0 col-0"></div>
                            <div className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12">
                                {this.state.chave == 0 &&
                                    <Formik
                                        initialValues={{
                                            name: '',
                                        }}
                                        onSubmit={async values => {
                                            await new Promise(r => setTimeout(r, 1000))
                                            this.salvarNavio(validForm)
                                        }}
                                    >
                                        <Form className="contact-form" >

                                            <div className="row">
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2"></div>

                                                <div className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12 ">

                                                    <div className="row addservicos">

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel">
                                                            <label >Nome</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.nome &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                            <Field type='text' className='form-control' value={this.state.nome} onChange={e => this.setState({ nome: e.currentTarget.value })} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Bandeira</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                            <Select className='SearchSelect' options={this.state.paisesOptions} onChange={(e) => { this.setState({ bandeira: e.label }) }} autocomplete={'off'} placeholder={this.state.bandeira} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>I.M.O.</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                            <Field type='text' className='form-control' value={this.state.imo} onChange={e => this.setState({ imo: e.currentTarget.value })} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Grt</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                            <Field type='text' className='form-control' value={this.state.grt} onChange={e => this.setState({ grt: e.currentTarget.value?.replace(/[^0-9\\,]/gi, '') })} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Dwt</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                            <Field type='text' className='form-control' value={this.state.dwt} onChange={e => this.setState({ dwt: e.currentTarget.value?.replace(/[^0-9\\,]/gi, '') })} />
                                                        </div>

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Loa</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                            <Field type='text' className='form-control' value={this.state.loa} onChange={e => this.setState({ loa: e.currentTarget.value?.replace(/[^0-9\\,]/gi, '') })} />
                                                        </div>

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Beam</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                            <Field type='text' className='form-control' value={this.state.beam} onChange={e => this.setState({ beam: e.currentTarget.value?.replace(/[^0-9\\,]/gi, '') })} />
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
                                }
                                {this.state.chave != 0 &&
                                    <Formik
                                        initialValues={{
                                            name: '',
                                        }}
                                        onSubmit={async values => {
                                            await new Promise(r => setTimeout(r, 1000))
                                            this.editarNavio(validForm)
                                        }}
                                    >
                                        <Form className="contact-form" >

                                            <div className="row">
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2"></div>

                                                <div className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12 ">

                                                    <div className="row addservicos">
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstlabel">
                                                            <label>Chave</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-2 col-lg-2 col-md-3 col-sm-10 col-10 ">
                                                            <Field className="form-control" style={{ backgroundColor: '#dddddd' }} type="text" disabled value={this.state.chave} />
                                                        </div>
                                                        <div className="col-xl-4 col-lg-4 col-md-3 col-sm-1 col-1 ">
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label >Nome</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.nome &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                            <Field type='text' className='form-control' value={this.state.nome} onChange={e => this.setState({ nome: e.currentTarget.value })} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Bandeira</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                            <Select className='SearchSelect' options={this.state.paisesOptions} onChange={(e) => { this.setState({ bandeira: e.label }) }} autocomplete={'off'} placeholder={this.state.bandeira} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>I.M.O.</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                            <Field type='text' className='form-control' value={this.state.imo} onChange={e => this.setState({ imo: e.currentTarget.value })} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Grt</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                            <Field type='text' className='form-control' value={this.state.grt} onChange={e => this.setState({ grt: e.currentTarget.value?.replace(/[^0-9\\,]/gi, '') })} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Dwt</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                            <Field type='text' className='form-control' value={this.state.dwt} onChange={e => this.setState({ dwt: e.currentTarget.value?.replace(/[^0-9\\,]/gi, '') })} />
                                                        </div>

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Loa</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                            <Field type='text' className='form-control' value={this.state.loa} onChange={e => this.setState({ loa: e.currentTarget.value?.replace(/[^0-9\\,]/gi, '') })} />
                                                        </div>

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Beam</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                            <Field type='text' className='form-control' value={this.state.beam} onChange={e => this.setState({ beam: e.currentTarget.value?.replace(/[^0-9\\,]/gi, '') })} />
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
                                }


                                <div className="col-12 " style={{ display: 'flex', justifyContent: 'center' }}>



                                </div>
                            </div>
                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-0 col-0"></div>
                        </div>
                    </div>
                </div>
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

export default connect(mapStateToProps, null)(AddShip)

