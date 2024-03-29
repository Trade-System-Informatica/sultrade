import React, { Component } from 'react'
import './styles.css'
import { Formik, Field, Form } from 'formik'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import loader from '../../../classes/loader'
import util from '../../../classes/util'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { apiEmployee } from '../../../services/apiamrg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import Select from 'react-select';
import ModalLogs from '../../../components/modalLogs'
import ModalCopiarCampos from '../../../components/modalCopiarCampos'

const estadoInicial = {
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

    dadosIniciais: '',
    dadosFinais: '',

    descricao: '',
    grupo: '',
    grupos: [],
    gruposOptions: [],

    quantidadeCampos: 0,
    campos: [],
    camposOriginal: [],
    tiposOptions: [
        { label: "Texto", value: "TEXTO" },
        { label: "Lista", value: "LISTA" }
    ],

    copiarCamposModal: false,
    camposCopiar: [],
    subgruposOptions: [],

    acessos: [],
    permissoes: [],
    acessosPermissoes: [],

    bloqueado: false,
}

class AddSubgrupo extends Component {

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        window.scrollTo(0, 0)
        var id = await this.props.match.params.id
        await this.setState({ chave: id })
        if (parseInt(id) !== 0) {
            await this.setState({ subgrupo: this.props.location.state.subgrupo })
            //console.log('Servicos: ' + JSON.stringify(this.state.tiposervico))
            //await this.loadData(this.state.tiposervico)
            await this.setState({
                descricao: this.state.subgrupo.descricao,
                grupo: this.state.subgrupo.chave_grupo
            })
            await this.carregaCampos()
        }
        await this.carregaGrupos()
        await this.carregaTiposAcessos()
        await this.carregaPermissoes()
        await this.testaAcesso()

        if (this.state.chave != 0) {
            await this.setState({
                dadosIniciais: [
                    { titulo: 'Descrição', valor: util.formatForLogs(this.state.descricao) },
                    { titulo: 'Grupo', valor: util.formatForLogs(this.state.grupo, 'options', '', '', this.state.gruposOptions) }
                ]
            })

        }

        this.state.acessosPermissoes.map((e) => {
            if ((e.acessoAcao == "SUBGRUPOS_TAXAS" && e.permissaoInsere == 0 && this.state.chave == 0) || (e.acessoAcao == "SUBGRUPOS_TAXAS" && e.permissaoEdita == 0 && this.state.chave != 0)) {
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

    carregaGrupos = async () => {
        await apiEmployee.post('getGrupos.php', {
            token: true
        }).then(
            async res => {
                await this.setState({ grupos: res.data })

                const options = this.state.grupos.map((e) => {
                    return { label: e.descricao, value: e.chave }
                })

                await this.setState({ gruposOptions: options })
            },
            async err => console.log(`erro: ` + err)
        )
    }

    carregaCampos = async () => {
        await apiEmployee.post('getCamposSubgrupos.php', {
            token: true,
            subgrupo: this.state.chave
        }).then(
            async res => {
                await this.setState({ campos: res.data.map((e) => ({ ...e, obrigatorio: e?.obrigatorio == 1 ? true : false })) });
                this.setState({ camposOriginal: this.state.campos });
            },
            async err => console.log(`erro: ` + err)
        )
    }

    setCamposCopiar = async () => {
        this.setState({
            camposCopiar: this.state.campos.map((e, i) => ({
                ...e,
                checked: false,
                onChange: (index) => this.setState({ camposCopiar: this.state.camposCopiar.map((e, i) => i === index ? ({ ...e, checked: !e.checked }) : ({ ...e })) })
            })),
        })
        const subgrupos = await loader.getBase(`getSubgrupos.php`);
        
        this.setState({ subgruposOptions: subgrupos.filter((grupo) => grupo.chave != this.state.chave)?.map((grupo) => ({label: grupo.descricao, value: grupo.chave}))});
    }

    salvarSubgrupo = async (validForm) => {
        this.setState({ ...util.cleanStates(this.state) })
        this.setState({ bloqueado: true })


        await this.setState({
            dadosFinais: [
                { titulo: 'Descrição', valor: util.formatForLogs(this.state.descricao) },
                { titulo: 'Grupo', valor: util.formatForLogs(this.state.grupo, 'options', '', '', this.state.gruposOptions) }
            ],
            loading: true
        })

        if (parseInt(this.state.chave) === 0 && validForm) {
            await apiEmployee.post(`insertSubgrupo.php`, {
                token: true,
                values: `'${this.state.descricao}', '${this.state.grupo}'`
            }).then(
                async res => {
                    if (res.data[0].chave) {
                        await this.setState({ chave: res.data[0].chave })
                        await loader.salvaLogs('os_subgrupos_taxas', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].chave);

                        await this.setState({ loading: false, bloqueado: false })
                    } else {
                    }
                },
                async res => await console.log(`Erro: ${res.data}`)
            )

            if (this.state.campos[0]) {
                await apiEmployee.post(`insertSubgrupoCampos.php`, {
                    token: true,
                    values: this.state.campos,
                    subgrupo: this.state.chave
                }).then(
                    async res => {
                        if (res.data) {
                            await this.setState({ loading: false, bloqueado: false })
                        }
                    },
                    async err => await console.log(`Erro: ${err.data}`)
                )
            }
        } else if (validForm) {
            await apiEmployee.post(`updateSubgrupo.php`, {
                token: true,
                chave: this.state.chave,
                descricao: this.state.descricao,
                grupo: this.state.grupo
            }).then(
                async res => {
                    if (res.data === true) {
                        await loader.salvaLogs('os_subgrupos_taxas', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.chave, `SUBGRUPOS DE TAXAS: ${this.state.descricao}`);

                        await this.setState({ loading: false, bloqueado: false })
                    } else {
                    }
                },
                async res => await console.log(`Erro: ${res.data}`)
            )

            if (this.state.campos.find((c) => c?.chave != 0) || this.state.camposOriginal[0]) {
                await apiEmployee.post(`updateSubgrupoCampos.php`, {
                    token: true,
                    values: this.state.campos.filter((campo) => campo?.chave != 0),
                    subgrupo: this.state.chave
                }).then(
                    async res => {
                        if (res.data) {
                            await this.setState({ loading: false, bloqueado: false })
                        }
                    },
                    async err => await console.log(`Erro: ${err.data}`)
                )
            }

            if (this.state.campos[0]) {
                if (this.state.campos.find((c) => c?.chave == 0)) {
                    await apiEmployee.post(`insertSubgrupoCampos.php`, {
                        token: true,
                        values: this.state.campos.filter((campo) => campo?.chave == 0),
                        subgrupo: this.state.chave
                    }).then(
                        async res => {
                            if (res.data) {
                                await this.carregaCampos();
                                await this.setState({ loading: false, bloqueado: false })
                            }
                        },
                        async err => await console.log(`Erro: ${err.data}`)
                    )
                }
            }
        }
    }

    copiarCampos = async (subgrupos) => {
        await apiEmployee.post(`insertCamposCopiados.php`,{
            campos: this.state.camposCopiar.filter((campo) => campo.checked)?.map((campo) => ({...campo, obrigatorio: campo.obrigatorio ? 1 : 0, onChange: undefined, checked: undefined})),
            subgrupos,
        }).then(
            async res => {
            },
            async err => {
                console.log(err);
            }
        )
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
        await this.setState({ logs: await loader.getLogs("os_subgrupos_taxas", this.state.chave) })
        await this.setState({ modalLog: true })
    }


    render() {

        const validations = []
        validations.push(this.state.descricao);
        validations.push(this.state.grupo);
        validations.push(!this.state.campos[0] || !this.state.campos.find((c, i) => c.nome == "" || c.tipo == ""));
        validations.push(!this.state.bloqueado);

        const validForm = validations.reduce((t, a) => t && a);

        return (
            <div className='allContent'>

                {this.state.redirect &&
                    <Redirect to={'/'} />
                }

                <section>
                    <Header voltarSubgrupos titulo="Subgrupos de Taxa" chave={this.state.chave != 0 ? this.state.chave : ''} />
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

                <ModalCopiarCampos
                    modalAberto={this.state.copiarCamposModal}
                    closeModal={() => { this.setState({ copiarCamposModal: false }) }}
                    campos={this.state.camposCopiar}
                    subgruposOptions={this.state.subgruposOptions}
                    nome={this.state.descricao}
                    onSubmit={async (subgrupos) => await this.copiarCampos(subgrupos)}
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
                                    this.salvarSubgrupo(validForm)
                                }}
                            >
                                <Form className="contact-form">

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
                                                        <Field className="form-control" style={{ textAlign: 'center', backgroundColor: '#dddddd' }} type="text" disabled value={this.state.chave} />
                                                    </div>
                                                }
                                                {this.state.chave != 0 &&
                                                    <div className="col-xl-4 col-lg-4 col-md-3 col-sm-1 col-1 " s>
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
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                    <Field className="form-control" type="text" value={this.state.descricao} onChange={async e => { this.setState({ descricao: e.currentTarget.value }) }} />
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <label>Grupo</label>
                                                </div>
                                                <div className='col-1 errorMessage'>
                                                    {!this.state.grupo &&
                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                    }
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                    <Select className='SearchSelect' options={this.state.gruposOptions} value={this.state.gruposOptions.filter(option => option.value == this.state.grupo)} search={true} onChange={(e) => { this.setState({ grupo: e.value }) }} />
                                                </div>
                                                <div>
                                                    <hr style={{ color: "#cfcfcf" }} />
                                                </div>
                                                <div className="col-12 text-center labelForm">
                                                    <label>Campos</label>
                                                </div>
                                                {this.state.campos.map((campo, idx) => (
                                                    <>
                                                        <div className='col-12' style={{ color: "white", display: "flex", justifyContent: "flex-end" }}>
                                                            <div
                                                                style={{ border: "1px solid white", borderRadius: 100, minHeight: 30, minWidth: 30, display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer" }}
                                                                onClick={() => this.setState({ campos: this.state.campos.filter((c, i) => i !== idx) })}
                                                            >
                                                                X
                                                            </div>
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Nome</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.campos[idx]?.nome &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                            <Field className="form-control" type="text" value={this.state.campos[idx]?.nome} onChange={async e => { this.setState({ campos: this.state.campos.map((c, i) => i === idx ? ({ ...c, nome: e.currentTarget.value }) : ({ ...c })) }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Tipo</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                            {!this.state.campos[idx]?.tipo &&
                                                                <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                            }
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                            <Select className='SearchSelect' options={this.state.tiposOptions} value={this.state.tiposOptions.filter(option => option.value == this.state.campos[idx]?.tipo)} search={true} onChange={(e) => { this.setState({ campos: this.state.campos.map((c, i) => i === idx ? ({ ...c, tipo: e.value }) : ({ ...c })) }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Obrigatório?</label>
                                                        </div>
                                                        <div className='col-1'></div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <input className='form_control' checked={this.state.campos[idx]?.obrigatorio} onChange={(e) => { this.setState({ campos: this.state.campos.map((c, i) => i === idx ? ({ ...c, obrigatorio: e.target.checked }) : ({ ...c })) }) }} type="checkbox" />
                                                        </div>
                                                        <div>
                                                            <hr style={{ color: "#cfcfcf" }} />
                                                        </div>
                                                    </>
                                                ))}
                                                <div className="col-12 text-center">
                                                    <span onClick={() => this.setState({ campos: [...this.state.campos, { chave: 0, nome: "", tipo: "", obrigatorio: false }] })} style={{ color: "#00CCFF", textDecoration: "underline", cursor: "pointer" }}>Adicionar um campo</span>
                                                </div>
                                                {this.state.campos.length > 0 &&
                                                    <div className="col-12 text-center">
                                                        <span onClick={async () => { await this.setCamposCopiar(); this.setState({ copiarCamposModal: true }) }} style={{ color: "#00CCFF", textDecoration: "underline", cursor: "pointer" }}>Copiar campos</span>
                                                    </div>
                                                }

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

export default connect(mapStateToProps, null)(AddSubgrupo)

