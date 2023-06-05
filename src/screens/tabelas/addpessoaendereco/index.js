import React, { Component } from 'react'
import './styles.css'
import { Formik, Field, Form } from 'formik'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import loader from '../../../classes/loader'
import util from '../../../classes/util'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { apiEmployee } from '../../../services/apiamrg'
import InputMask from 'react-input-mask';
import ModalLogs from '../../../components/modalLogs'
import CEP from 'cep-promise'
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
    pessoa: {},
    tipo: '',
    endereco: '',
    numero: '',
    complemento: '',
    cidade: '',
    cep: '',
    uf: '',
    bairro: '',
    cidade_descricao: '',
    pais: 1,
    cepLimpo: '',

    cidadeLock: false,
    ufLock: false,
    bairroLock: false,
    enderecoLock: false,

    ufNome: '',
    paisNome: '',
    tipoNome: '',

    paises: [],
    paisesOptions: [],
    estados: [],
    estadosOptions: [],
    cidades: [],
    cidadesOptions: [],
    tipos: [
        {
            label: "Padrao",
            value: 0
        },
        {
            label: "Entrega",
            value: 1
        }, {
            label: "Cobranca",
            value: 2
        }, {
            label: "Residencial",
            value: 3
        }
    ],

    acessos: [],
    permissoes: [],
    acessosPermissoes: [],

    bloqueado: false,
    savedRedirect: false
}

class AddPessoaEndereco extends Component {

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        window.scrollTo(0, 0)
        var ed = await this.props.match.params.ed
        await this.setState({ chave: ed, chave_pessoa: this.props.match.params.id })
        if (parseInt(ed) != 0) {
            await this.setState({ endereco: this.props.location.state.endereco })
            
            await this.setState({
                tipo: this.state.endereco.Tipo,
                endereco: this.state.endereco.Endereco,
                numero: this.state.endereco.Numero,
                complemento: this.state.endereco.Complemento,
                cidade: this.state.endereco.Cidade,
                cep: this.state.endereco.Cep,
                cepLimpo: this.state.endereco.Cep,
                uf: this.state.endereco.UF,
                bairro: this.state.endereco.bairro,
                cidade_descricao: this.state.endereco.Cidade_Descricao,
                pais: this.state.endereco.pais,
            })
            await this.setState({
                cidadeLock: (this.state.cep && this.state.cidade ? true : false),
                ufLock: (this.state.cep && this.state.uf ? true : false),
                bairroLock: (this.state.cep && this.state.bairro ? true : false),
                enderecoLock: (this.state.cep && this.state.endereco ? true : false),
                tipoNome: this.state.tipos[this.state.tipo].label
            })

        } else {
            this.getCPF();
        }
        this.setState({
            pessoa: await loader.getOne(`getPessoa.php`, this.state.chave_pessoa)
        })

        this.getLugares();

        await this.carregaTiposAcessos()
        await this.carregaPermissoes()
        await this.testaAcesso()

        if (this.state.chave != 0) {
            await this.setState({
                dadosIniciais: [
                    { titulo: 'Tipo', valor: util.formatForLogs(this.state.tipo, 'options', '', '', this.state.tipos) },
                    { titulo: 'Endereço', valor: util.formatForLogs(this.state.endereco) },
                    { titulo: 'Número', valor: util.formatForLogs(this.state.numero) },
                    { titulo: 'Complemento', valor: util.formatForLogs(this.state.complemento) },
                    { titulo: 'Cidade', valor: util.formatForLogs(this.state.cidade, 'options', '', '', this.state.cidadesOptions) },
                    { titulo: 'Cep', valor: util.formatForLogs(this.state.cepLimpo) },
                    { titulo: 'UF', valor: util.formatForLogs(this.state.uf, 'options', '', '', this.state.estadosOptions) },
                    { titulo: 'Bairro', valor: util.formatForLogs(this.state.bairro) },
                    { titulo: 'Cidade Descrição', valor: util.formatForLogs(this.state.cidade_descricao) },
                    { titulo: 'País', valor: util.formatForLogs(this.state.pais, 'options', '', '', this.state.paisesOptions) },
                ]
            })
        }

        this.state.acessosPermissoes.map((e) => {
            if ((e.acessoAcao == "PESSOAS_ENDERECOS" && e.permissaoInsere == 0 && this.state.chave == 0) || (e.acessoAcao == "PESSOAS_ENDERECOS" && e.permissaoEdita == 0 && this.state.chave != 0)) {
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

    componentDidUpdate = async (prevProps, prevState) => {
        if (prevState.cep != this.state.cep) {
            this.setState({ cidadeLock: false, ufLock: false, enderecoLock: false, bairroLock: false })
        }
    }

    getCPF = async () => {
        await apiEmployee.post(`getCPF.php`, {
            token: true, chave: this.state.chave_pessoa
        }).then(
            async res => {
                if (!res.data[0] || !res.data[0].cpf) {
                    this.setState({ uf: 81, ufNome: "EXTERIOR" });
                }
            },
            async err => {
                console.log(err)
            }
        );

    }

    getLugares = async () => {
        await apiEmployee.post('getLugares.php', {
            token: true
        }).then(
            async res => {
                this.setState({ paises: res.data.paises, estados: res.data.estados, cidades: res.data.cidades });

                let options = this.state.estados.map((e) => {
                    return { label: e.Descricao, value: e.Chave, pais: e.Pais }
                })
                this.setState({ estadosOptions: options });

                options = this.state.paises.map((e) => {
                    return { label: e.Nome, value: e.Chave }
                })
                this.setState({ paisesOptions: options });

                options = this.state.cidades.map((e) => {
                    return { label: e.Descricao, value: e.Chave, estado: e.Estado }
                })
                this.setState({ cidadesOptions: options });

                if (await this.props.match.params.ed != 0) {
                    let option = this.state.estadosOptions.filter((e) => { if (e.value == this.state.uf) { return e } })
                    this.setState({ ufNome: option[0].label });

                    option = this.state.paisesOptions.filter((e) => { if (e.value == this.state.pais) { return e } })
                    this.setState({ paisNome: option[0].label });
                }
            },
            async err => console.log('erro: ' + err)
        )
    }

    salvarEndereco = async (validForm) => {
        this.setState({ ...util.cleanStates(this.state) })
        this.setState({ bloqueado: true });

        await this.setState({
            dadosFinais: [
                { titulo: 'Tipo', valor: util.formatForLogs(this.state.tipo, 'options', '', '', this.state.tipos) },
                { titulo: 'Endereço', valor: util.formatForLogs(this.state.endereco) },
                { titulo: 'Número', valor: util.formatForLogs(this.state.numero) },
                { titulo: 'Complemento', valor: util.formatForLogs(this.state.complemento) },
                { titulo: 'Cidade', valor: util.formatForLogs(this.state.cidade, 'options', '', '', this.state.cidadesOptions) },
                { titulo: 'Cep', valor: util.formatForLogs(this.state.cepLimpo) },
                { titulo: 'UF', valor: util.formatForLogs(this.state.uf, 'options', '', '', this.state.estadosOptions) },
                { titulo: 'Bairro', valor: util.formatForLogs(this.state.bairro) },
                { titulo: 'Cidade Descrição', valor: util.formatForLogs(this.state.cidade_descricao) },
                { titulo: 'País', valor: util.formatForLogs(this.state.pais, 'options', '', '', this.state.paisesOptions) },
            ],
            loading: true
        })

        if (parseInt(this.state.chave) === 0 && validForm) {
            await apiEmployee.post(`insertEndereco.php`, {
                token: true,
                values: `'${this.state.tipo}', '${this.state.endereco}', '${this.state.numero}', '${this.state.complemento}', '${this.state.cidade}', '${this.state.cepLimpo}', ${this.state.uf}, '${this.state.bairro}', '${this.state.cidade_descricao}', '${this.state.pais}', ${this.state.chave_pessoa}`,
                Tipo: this.state.tipo,
                Chave_Pessoa: this.state.chave_pessoa
            }).then(
                async res => {
                    if (res.data[0].Chave) {
                        await this.setState({ chave: res.data[0].Chave })
                        await loader.salvaLogs('pessoas_enderecos', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].Chave);


                        await this.setState({ loading: false, bloqueado: false, savedRedirect: true })
                    } else {
                        alert(`Erro: ${JSON.stringify(res)}`)
                    }
                },
                async res => await console.log(`Erro: ${res.data}`)
            )
        } else if (validForm) {
            await apiEmployee.post(`updateEndereco.php`, {
                token: true,
                Chave: this.state.chave,
                Tipo: this.state.tipo,
                Endereco: this.state.endereco,
                Numero: this.state.numero,
                Complemento: this.state.complemento,
                Cidade: this.state.cidade,
                Cep: this.state.cepLimpo,
                UF: this.state.uf,
                bairro: this.state.bairro,
                Cidade_Descricao: this.state.cidade_descricao,
                pais: this.state.pais,
                Chave_Pessoa: this.state.chave_pessoa,
            }).then(
                async res => {
                    if (res.data === true) {
                        await loader.salvaLogs('pessoas_enderecos', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.chave, `ENDERECO: ${this.state.endereco}`);

                        await this.setState({ loading: false, bloqueado: false, savedRedirect: true })
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

    buscarDados = async (cep) => {
        try {
            const obj = await CEP(cep)
            await apiEmployee.post('getEstadoCidade.php', {
                token: true,
                cidade: obj.city,
                estado: obj.state.toUpperCase()
            }).then(
                async res => {
                    this.setState({ cidade: res.data.cidade[0].Chave, uf: res.data.estado[0].Chave, ufNome: res.data.estado[0].Descricao, cidade_descricao: res.data.cidade[0].Descricao })
                },
                async err => { console.log('erro: ' + err) }
            )

            await this.setState({ cepLimpo: obj.cep, bairro: obj.neighborhood, endereco: obj.street })
            await this.setState({ cidadeLock: (obj.city ? true : false), ufLock: (obj.state ? true : false), bairroLock: (obj.neighborhood ? true : false), enderecoLock: (obj.street ? true : false) })
            //return true
        } catch (e) {
            //return false
        }
    }

    filterSearch = (e) => {
        if (e == "") {
            return true
        }

        const text = this.state.pessoasOptionsTexto.toUpperCase();
        return (e.label.toUpperCase().includes(text))
    }


    openLogs = async () => {
        await this.setState({ logs: await loader.getLogs("pessoas_enderecos", this.state.chave) })
        await this.setState({ modalLog: true })
    }



    render() {
        const validations = []
        validations.push(this.state.endereco)
        validations.push(this.state.uf == 81 || this.state.cepLimpo)
        validations.push(this.state.pais)
        validations.push(this.state.cidade || this.state.uf == 81)
        validations.push(this.state.tipo || parseInt(this.state.tipo) === 0)
        validations.push(!this.state.bloqueado)
        //validations.push(this.state.porto && this.state.porto > 0)
        //o formulário só será válido se todas as validações forem verdadeiras, com este reduce implementado

        const validForm = validations.reduce((t, a) => t && a)

        return (
            <div className='allContent'>
                {this.state.redirect &&
                    <Redirect to={'/'} />
                }
                {this.state.savedRedirect && this.props.location.state.backTo == "enderecos" &&
                    <Redirect to={{ pathname: `/tabelas/pessoaenderecos/${this.state.chave_pessoa}` }} />
                }
                {this.state.savedRedirect && this.props.location.state.backTo == "addpessoa" &&
                    <Redirect to={{ pathname: `/tabelas/addpessoa/${this.state.chave_pessoa}` }} />
                }

                <section>
                    {this.props.location.state.backTo == 'addpessoa' &&
                        <Header voltarAddPessoa pessoa={this.state.chave_pessoa} titulo="Endereços" />
                    }
                    {this.props.location.state.backTo == 'enderecos' &&
                        <Header voltarPessoaEnderecos pessoa={this.state.chave_pessoa} titulo="Endereços" chave={this.state.chave != 0 ? this.state.chave : ''} />
                    }
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
                    nome={this.state.endereco}
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
                                    this.salvarEndereco(validForm)
                                }}
                            >
                                <Form className="contact-form" >

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
                                                {this.state.uf != 81 &&
                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel">
                                                        <label>Cep</label>
                                                    </div>
                                                }
                                                {this.state.uf != 81 &&
                                                    <div className='col-1 errorMessage'>
                                                        {!this.state.cepLimpo &&
                                                            <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                        }
                                                    </div>
                                                }
                                                {this.state.uf != 81 &&
                                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                        <InputMask
                                                            type='text'
                                                            mask='99.999-999'
                                                            className='form-control'
                                                            value={this.state.cep}
                                                            onChange={(e) => { this.setState({ cep: e.currentTarget.value }); if (this.state.ufLock) { this.setState({ cepLimpo: '', bairro: '', endereco: '', cidadeLock: '', ufLock: '', bairroLock: '', enderecoLock: '', ufNome: '', cidade_descricao: '' }) } if (this.state.cep.length == 10) { this.buscarDados(e.currentTarget.value) } }}
                                                        />
                                                    </div>
                                                }
                                                <div className={this.state.chave == 0 && this.state.uf == 81 ? "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstLabel" : "col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm"}>
                                                    <label>UF</label>
                                                </div>
                                                <div className='col-1 errorMessage'>
                                                    {!this.state.uf &&
                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                    }
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                    <Select isDisabled={this.state.ufLock} className='SearchSelect' value={this.state.uf} options={this.state.estadosOptions} onChange={async (e) => { await this.setState({ uf: e.value, ufNome: e.label, pais: e.pais }); if (this.state.uf == 81) { this.setState({ pais: null, cidade: null }) } }} placeholder={this.state.ufNome} />
                                                </div>
                                                {this.state.uf != 81 &&
                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                        <label>Cidade</label>
                                                    </div>
                                                }
                                                {this.state.uf != 81 &&
                                                    <div className='col-1 errorMessage'>
                                                        {!this.state.cidade &&
                                                            <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                        }
                                                    </div>
                                                }
                                                {this.state.uf != 81 &&
                                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                        <Select isDisabled={this.state.cidadeLock} className='SearchSelect' value={this.state.cidade} options={this.state.cidadesOptions.filter((e) => (e.estado == this.state.uf))} onChange={(e) => { this.setState({ cidade: e.value, cidade_descricao: e.label }) }} placeholder={this.state.cidade_descricao} />
                                                    </div>
                                                }
                                                {this.state.uf == 81 &&
                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                        <label>País</label>
                                                    </div>
                                                }
                                                {this.state.uf == 81 &&
                                                    <div className='col-1 errorMessage'>
                                                        {!this.state.pais &&
                                                            <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                        }
                                                    </div>
                                                }
                                                {this.state.uf == 81 &&
                                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                        <Select className='SearchSelect' value={this.state.pais} options={this.state.paisesOptions} onChange={(e) => { this.setState({ pais: e.value, paisNome: e.label }) }} placeholder={this.state.paisNome} />
                                                    </div>
                                                }
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <label>Bairro</label>
                                                </div>
                                                <div className='col-1'></div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                    <Field disabled={this.state.bairroLock} className="form-control" type="text" value={this.state.bairro} onChange={async e => { this.setState({ bairro: e.currentTarget.value }) }} />
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <label>Rua</label>
                                                </div>
                                                <div className='col-1 errorMessage'>
                                                    {!this.state.endereco &&
                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                    }
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                    <Field disabled={this.state.enderecoLock} className="form-control" type="text" value={this.state.endereco} onChange={async e => { this.setState({ endereco: e.currentTarget.value }) }} />
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <label>Numero</label>
                                                </div>
                                                <div className='col-1'></div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                    <Field className="form-control" type="text" value={this.state.numero} onChange={async e => { this.setState({ numero: e.currentTarget.value }) }} />
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <label>Complemento</label>
                                                </div>
                                                <div className='col-1'></div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                    <Field className="form-control" type="text" value={this.state.complemento} onChange={async e => { this.setState({ complemento: e.currentTarget.value }) }} />
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <label>Tipo</label>
                                                </div>
                                                <div className='col-1 errorMessage'>
                                                    {!this.state.tipo && this.state.tipo !== 0 &&
                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                    }
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                    <Select className='SearchSelect' value={this.state.tipo} options={this.state.tipos} onChange={(e) => { this.setState({ tipo: e.value, tipoNome: e.label }) }} placeholder={this.state.tipoNome} />
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

export default connect(mapStateToProps, null)(AddPessoaEndereco)

