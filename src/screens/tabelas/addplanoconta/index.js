import React, { Component } from 'react'
import './styles.css'
import { Formik, Field, Form } from 'formik'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import loader from '../../../classes/loader'
import util from '../../../classes/util'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import InputMask from 'react-input-mask';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { apiEmployee } from '../../../services/apiamrg'
import ModalLogs from '../../../components/modalLogs'

const estadoInicial = {
    chave: '',
    codigo: '',
    codigoReduzido: '',
    nivel: '',
    indicador: 'A',
    descricao: '',
    contaInativa: false,
    planoConta: 0,
    grupo: '05',

    logs: [],
    modalLog: false,

    dadosIniciais: '',
    dadosFinais: '',

    planoContas: [],
    planosContasOptions: [],
    planosContasOptionsTexto: '',

    acessos: [],
    permissoes: [],
    acessosPermissoes: [],

    bloqueado: false,

    codigoMask: '9.',
    codigoLimpo: '',

    indicadoresOptions: [
        {label: 'Analítico', value: 'A'},
        {label: 'Sintético', value: 'S'},
    ],

    gruposOptions: [
        {label: 'Contas de Ativo', value: '00'},
        {label: 'Passivo Circulante e Não Circulante', value: '01'},
        {label: 'Patrimônio Líquido', value: '02'},
        {label: 'Contas de Resultado', value: '03'},
        {label: 'Contas de Compensação', value: '04'},
        {label: 'Outra', value: '05'}
    ]
}

class AddPlanoConta extends Component {

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        window.scrollTo(0, 0)
        var id = await this.props.match.params.id
        await this.setState({ chave: id })
        if (parseInt(id) !== 0) {
            await this.setState({ planoConta: this.props.location.state.planoConta })
            //console.log('Servicos: ' + JSON.stringify(this.state.tiposervico))
            //await this.loadData(this.state.tiposervico)
            await this.setState({
                codigo: this.state.planoConta.Codigo.trim(),
                codigoLimpo: this.state.planoConta.Codigo.replaceAll('.','').trim(),
                codigoReduzido: this.state.planoConta.Codigo_Red,
                nivel: this.state.planoConta.Nivel,
                indicador: this.state.planoConta.Indicador,
                descricao: this.state.planoConta.Descricao,
                contaInativa: this.state.planoConta.Conta_Inativa == 1 ? true : false,
                grupo: this.state.planoConta.grupo
            })

        } else {
            if (this.props.location.state && this.props.location.state.planoPai) {
                await this.setState({ planoConta: this.props.location.state.planoPai })
                await this.setPlanoConta({ value: this.state.planoConta.Codigo, nivel: this.state.planoConta.Nivel })
            } else {
                await this.setPlanoConta({ value: 0 })
            }
        }
        await this.carregaPlanosContas();

        await this.carregaTiposAcessos()
        await this.carregaPermissoes()
        await this.testaAcesso()

        if (this.state.chave != 0 ) {
            await this.setState({
                dadosIniciais: [
                    { titulo: 'Código', valor: util.formatForLogs(this.state.codigoLimpo) },
                    { titulo: 'Código Red', valor: util.formatForLogs(this.state.codigoReduzido) },
                    { titulo: 'Nível', valor: util.formatForLogs(this.state.nivel) },
                    { titulo: 'Indicador', valor: util.formatForLogs(this.state.indicador, 'options', '', '', this.state.indicadoresOptions) },
                    { titulo: 'Descrição', valor: util.formatForLogs(this.state.descricao) },
                    { titulo: 'Conta Inativa', valor: util.formatForLogs(this.state.contaInativa, 'bool') },
                    { titulo: 'Grupo', valor: util.formatForLogs(this.state.grupo, 'options', '', '', this.state.gruposOptions) },
                ]
            })
        }

        this.state.acessosPermissoes.map((e) => {
            if ((e.acessoAcao == "PLANOS_CONTAS" && e.permissaoInsere == 0 && this.state.chave == 0) || (e.acessoAcao == "PLANOS_CONTAS" && e.permissaoEdita == 0 && this.state.chave != 0)) {
                this.setState({ bloqueado: true })
            }
        })
    }

    componentDidUpdate = async (prevProps, prevState) => {
        if (prevState.codigo != this.state.codigo) {
            let numberPattern = /\d+/g;
            var codigoLimpo = ''
            if (this.state.codigo != '_' && this.state.codigo != '_._' && this.state.codigo != '_._._' && this.state.codigo != '_._._.__' && this.state.codigo != '_._._.__.__' && this.state.codigo != '_._._.__.__.___' && this.state.codigo != '_._._.__.__.___.___' && this.state.codigo != '') {
                let codigoLimpo2 = this.state.codigo.match(numberPattern)
                var codigoLimpo = codigoLimpo2.join('')
            }
            this.setState({ codigoLimpo: codigoLimpo })
        }
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

    carregaPlanosContas = async () => {
        await apiEmployee.post('getPlanosContas.php', {
            token: true
        }).then(
            async res => {
                await this.setState({ planosContas: res.data })

                if (this.state.planosContas[0]) {
                    const options = this.state.planosContas.filter((e) => (e.Nivel < 7 && e.Descricao && e.Codigo && e.Indicador == 'S')).map((e) => {
                        return { label: e.Descricao, value: e.Codigo, nivel: e.Nivel }
                    })
                    options.unshift({ label: 'Nenhum', value: 0, nivel: 0 })
                    
                    await this.setState({ planosContasOptions: options })
                }
            },
            async err => console.log(`erro: ` + err)
        )
    }

    carregaCodigos = async () => {
        await apiEmployee.post('getCodigos.php', {
            token: true,
            tipo: 'PR'
        }).then(
            async res => {
                await this.setState({ codigoReduzido: res.data[0].Proximo })
            }
        )


        await apiEmployee.post('getCodigos.php', {
            token: true,
            tipo: 'PL'
        }).then(
            async res => {
                await this.setState({ chave: res.data[0].Proximo })
            }
        )
    }

    setPlanoConta = async (plano) => {
        if (plano.value == 0) {
            await apiEmployee.post('getPlanoContaNivel.php', {
                token: true,
                nivel: 1
            }).then(
                async res => {
                    const codigosPlanos = res.data.map(e => parseInt(e.Codigo));


                    this.setState({ nivel: 1, codigo: `${Math.max(...codigosPlanos, 0) + 1}.` })
                },
                async err => console.log(`erro: ` + err)
            )
        } else {

            let codigoCorrigido = plano.value.split('.').filter((e, i) => i <= plano.nivel);
            codigoCorrigido.splice(plano.nivel - 1);
            if (codigoCorrigido[0]) {
                codigoCorrigido = `${codigoCorrigido.join('.')}.`;
            } else {
                codigoCorrigido = codigoCorrigido.join('.');
            }

            await apiEmployee.post('getPlanoContaCodigo.php', {
                token: true,
                codigo: codigoCorrigido
            }).then(
                async res => {
                    const planosContas = res.data;

                    const codigosPlanos = planosContas.filter((e) => e.Nivel == parseInt(plano.nivel)).map(e => parseInt(e.Codigo.split('.')[parseInt(e.Nivel) - 1]));
                    let codigo = await this.checkCodigo(`${codigoCorrigido.trim()}${(Math.max(...codigosPlanos, 0) + 1)}`)

                    if (plano.nivel != 6) {
                        codigo = `${codigo}.`;
                    }

                    await this.setState({ codigo: codigo, nivel: plano.nivel })

                },
                async err => console.log(`erro: ` + err)
            )
        }
    }

    checkCodigo = async (value) => {
        let valueArray = value.split('.');

        if (valueArray[3] && valueArray[3].length < 2) {
            valueArray[3] = `0${valueArray[3]}`
        }
        if (valueArray[4] && valueArray[4].length < 2) {
            valueArray[4] = `0${valueArray[4]}`
        }

        if (valueArray[5] && valueArray[5].length < 2) {
            valueArray[5] = `0${valueArray[5]}`
        }
        if (valueArray[5] && valueArray[5].length < 3) {
            valueArray[5] = `0${valueArray[5]}`
        }

        if (valueArray[6] && valueArray[6].length < 2) {
            valueArray[6] = `0${valueArray[6]}`
        }
        if (valueArray[6] && valueArray[6].length < 3) {
            valueArray[6] = `0${valueArray[6]}`
        }

        return valueArray.join('.')

    }

    setNivel = async (value) => {
        let nivel = '?';

        if (value.length == 1) {
            nivel = 1;
        } else if (value.length == 2) {
            nivel = 2;
        } else if (value.length == 3) {
            nivel = 3;
        } else if (value.length == 5) {
            nivel = 4;
        } else if (value.length == 7) {
            nivel = 5;
        } else if (value.length == 10) {
            nivel = 6;
        } else if (value.length == 14) {
            nivel = 7;
        }

        this.setState({ nivel: nivel })
    }

    salvarPlanoConta = async (validForm) => {
        this.setState({...util.cleanStates(this.state)});
        
        const codigo = this.state.codigo.split('');
        if (codigo[codigo.length-1] == "." || codigo[codigo.length-1] == "_") {
            codigo.pop();
        }
        
        await this.setState({codigo: codigo.join('')})
        //this.getMaxNews()
        if (this.state.contaInativa) {
            await this.setState({ contaInativa: 1 })
        } else {
            await this.setState({ contaInativa: 0 })
        }

        if (this.state.grupo.length == 1) {
            await this.setState({ grupo: `0${this.state.grupo}` });
        }

        this.setState({ bloqueado: true })


        await this.setState({
            dadosFinais: [
                { titulo: 'Código', valor: util.formatForLogs(this.state.codigoLimpo) },
                { titulo: 'Código Red', valor: util.formatForLogs(this.state.codigoReduzido) },
                { titulo: 'Nível', valor: util.formatForLogs(this.state.nivel) },
                { titulo: 'Indicador', valor: util.formatForLogs(this.state.indicador, 'options', '', '', this.state.indicadoresOptions) },
                { titulo: 'Descrição', valor: util.formatForLogs(this.state.descricao) },
                { titulo: 'Conta Inativa', valor: util.formatForLogs(this.state.contaInativa, 'bool') },
                { titulo: 'Grupo', valor: util.formatForLogs(this.state.grupo, 'options', '', '', this.state.gruposOptions) },
            ],
            loading: true
        })
        
        
        if (parseInt(this.props.match.params.id) === 0 && validForm) {
            await this.carregaCodigos();
            await apiEmployee.post(`insertPlanoConta.php`, {
                token: true,
                values: `'${this.state.chave}', '${this.state.codigo}.', '${this.state.codigoReduzido}', '${this.state.nivel}', '${this.state.indicador}', '${this.state.descricao}', '${this.state.contaInativa}', '${this.state.grupo}'`,
                codigo: this.state.codigoReduzido,
                chave: this.state.chave
            }).then(
                async res => {
                    if (res.data[0].Chave) {
                        await this.setState({ codigo: res.data[0].Codigo })
                        await loader.salvaLogs('planocontas', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].Chave);

                        await this.setState({ loading: false, bloqueado: false })
                    } else {
                        console.log(res)
                    }
                },
                async res => await console.log(`Erro: ${res}`)
            )
        } else if (validForm) {
            await apiEmployee.post(`updatePlanoConta.php`, {
                token: true,
                Chave: this.state.chave,
                Codigo: `${this.state.codigo}.`,
                Nivel: this.state.nivel,
                Indicador: this.state.indicador,
                Descricao: this.state.descricao,
                Conta_Inativa: this.state.contaInativa,
                grupo: this.state.grupo
            }).then(
                async res => {
                    if (res.data === true) {
                        await loader.salvaLogs('planocontas', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.chave, `PLANO DE CONTA: ${this.state.descricao}`);

                        await this.setState({ loading: false, bloqueado: false })
                    } else {
                        alert(JSON.stringify(res))
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

    filterSearch = (e, state) => {
        if (e == "") {
            return true
        }

        const text = state.toUpperCase();
        return (e.label.toUpperCase().includes(text))
    }


    openLogs = async () => {
        await this.setState({ logs: await loader.getLogs("planocontas", this.state.chave) })
        await this.setState({ modalLog: true })
    }


    render() {
        const validations = [];
        validations.push(this.state.descricao);
        validations.push(this.state.nivel && this.state.nivel > 0 && this.state.nivel < 8 && this.state.nivel == parseInt(this.state.nivel));
        validations.push(this.state.codigo);
        validations.push(this.state.indicador && (this.state.indicador == 'A' || this.state.indicador == 'S'));
        validations.push(this.state.grupo && parseInt(this.state.grupo) <= 5 && parseInt(this.state.grupo) >= 0);
        validations.push(!this.state.bloqueado);


        const validForm = validations.reduce((t, a) => t && a)

        return (
            <div className='allContent'>

                {this.state.redirect &&
                    <Redirect to={'/'} />
                }

                <section>
                    <Header voltarPlanosContas titulo="Planos de Contas" chave={this.state.codigo != 0 ? this.state.codigo : ''}/>
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

                <div className="contact-section">

                    <div className="row">
                        <div className="col-lg-12">
                            <Formik
                                initialValues={{
                                    name: '',
                                }}
                                onSubmit={async values => {
                                    await new Promise(r => setTimeout(r, 1000))
                                    this.salvarPlanoConta(validForm)
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
                                                    <label>Código</label>
                                                </div>
                                                <div className="col-1 errorMessage">
                                                    {!this.state.codigoLimpo &&
                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                    }
                                                </div>
                                                <div className="col-xl-2 col-lg-2 col-md-3 col-sm-10 col-10">
                                                    <InputMask type='text' mask={
                                                        (this.state.codigoLimpo.length == 1) ?
                                                            '9'
                                                            : (this.state.codigoLimpo.length == 2) ?
                                                                '9.9'
                                                                : (this.state.codigoLimpo.length == 3) ?
                                                                    '9.9.9'
                                                                    : (this.state.codigoLimpo.length == 4 || this.state.codigoLimpo.length == 5) ?
                                                                        '9.9.9.99'
                                                                        : (this.state.codigoLimpo.length == 6 || this.state.codigoLimpo.length == 7) ?
                                                                            '9.9.9.99.99'
                                                                            : (this.state.codigoLimpo.length == 8 || this.state.codigoLimpo.length == 9 || this.state.codigoLimpo.length == 10) ?
                                                                                '9.9.9.99.99.999'
                                                                                : (this.state.codigoLimpo.length == 11 || this.state.codigoLimpo.length == 12 || this.state.codigoLimpo.length == 13 || this.state.codigoLimpo.length == 14) ?
                                                                                    '9.9.9.99.99.999.9999'
                                                                                    : '9'
                                                    } className='form-control' value={this.state.codigoLimpo} onChange={async e => { await this.setState({ codigo: e.currentTarget.value }); this.setNivel(this.state.codigoLimpo); }} onKeyDown={e => { if ((this.state.codigoLimpo.length == 1 || this.state.codigoLimpo.length == 2 || this.state.codigoLimpo.length == 3 || this.state.codigoLimpo.length == 5 || this.state.codigoLimpo.length == 7 || this.state.codigoLimpo.length == 10) && e.nativeEvent.key == parseInt(e.nativeEvent.key)) { this.setState({ codigoLimpo: `${this.state.codigoLimpo}${e.nativeEvent.key}` }) } }} />
                                                </div>
                                                <div className="col-xl-4 col-lg-4 col-md-3 col-sm-1 col-1">
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <label>Nível</label>
                                                </div>
                                                <div className="col-1 errorMessage">
                                                    {(this.state.nivel < 1 || this.state.nivel > 7 || this.state.nivel != parseInt(this.state.nivel)) &&
                                                        <FontAwesomeIcon title='Valor Inválido' icon={faExclamationTriangle} />
                                                    }
                                                </div>
                                                <div className="col-xl-2 col-lg-2 col-md-3 col-sm-10 col-10">
                                                    <Field className="form-control" style={{ backgroundColor: '#dddddd' }} type="text" disabled value={this.state.nivel} />
                                                </div>
                                                <div className="col-xl-4 col-lg-4 col-md-3 col-sm-1 col-1">
                                                </div>

                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <label>Descrição</label>
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
                                                    <label>Indicador</label>
                                                </div>
                                                <div className="col-1 errorMessage">
                                                    {!this.state.indicador &&
                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                    }
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                    <select className="form-control" value={this.state.indicador} onChange={(e) => { this.setState({ indicador: e.currentTarget.value }) }}>
                                                        {this.state.indicadoresOptions.map((i) => (
                                                            <option value={i.value}>{i.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-1"></div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <label>Conta Inativa</label>
                                                </div>
                                                <div className='col-1'></div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                    <input className='form_control' checked={this.state.contaInativa} onChange={(e) => { this.setState({ contaInativa: e.target.checked }) }} type="checkbox" />
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <label>Grupo</label>
                                                </div>
                                                <div className="col-1 errorMessage">
                                                    {!this.state.indicador &&
                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                    }
                                                </div>
                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                    <select className="form-control" value={this.state.grupo} onChange={(e) => { this.setState({ grupo: e.currentTarget.value }) }}>
                                                        {this.state.gruposOptions.map((g) => (
                                                            <option value={g.value}>{g.label}</option>
                                                        ))}
                                                    </select>
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

export default connect(mapStateToProps, null)(AddPlanoConta)

