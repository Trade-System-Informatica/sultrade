import React, { Component } from 'react'
import './styles.css'
import { Formik, Field, Form } from 'formik'
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import loader from '../../../classes/loader'
import { PRECISA_LOGAR, NOME_EMPRESA } from '../../../config'
import { connect } from 'react-redux'
import { Link, Redirect } from 'react-router-dom'
import { apiEmployee } from '../../../services/apiamrg'
import moment from 'moment'
import InputMask from 'react-input-mask';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faPen, faPlus, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { confirmAlert } from 'react-confirm-alert'
import ModalItem from '../../../components/modalItem'
import 'react-confirm-alert/src/react-confirm-alert.css'
import ModalLogs from '../../../components/modalLogs'
import { Skeleton } from '@mui/material'
import util from '../../../classes/util'

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

    modalItemAberto: false,
    itemInfo: [],
    itemNome: '',
    itemAdd: {},
    itemEdit: {},
    itemFinanceiro: {},
    itemDelete: '',

    dadosIniciais: '',
    dadosFinais: '',

    nome: '',
    nome_fantasia: '',
    cnpj_cpf: '',
    cnpj_cpfLimpo: '',
    rg_ie: '',
    inscricao_municipal: '',
    inclusao: moment().format('YYYY-MM-DD'),
    categoria: {
        cliente: false,
        fornecedor: false,
        prestador_servico: false,
        transportador: false,
        banco: false,
        adm_cartao: false,
        adm_convenio: false
    },
    nascimento: moment(),
    contato: [/*{
        tipo: '',
        campo: ''
    }*/],
    endereco: [/*{
        tipo: '',
        rua: '',
        endereco: '',
        numero: '',
        complemento: '',
        cidade: '',
        cep: '',
        UF: '',
        bairro: '',
        cidade_descricao: '',
        pais: '',
    }*/],
    contaContabil: '',
    contaProvisao: '',
    contaFaturar: '',

    cidades: [],
    cidadesOptions: [],

    deleteContato: false,
    deleteEndereco: false,

    planosContas: [],
    planosContasOptions: [],
    planosContasOptionsTexto: '',

    estados: [],
    estadosOptions: [],

    paises: [],
    paisesOptions: [],

    enderecos: [],
    contatos: [],

    acessos: [],
    permissoes: [],
    acessosPermissoes: [],

    cpfAprovado: false,
    proibido: false,

    bloqueado: false,

}

class AddPessoa extends Component {

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        window.scrollTo(0, 0)
        var id = await this.props.match.params.id
        await this.setState({ chave: id, loading: true })

        if (!this.props.location.state || !this.props.location.state.pessoa) {
            await this.getPessoa()
        } else {
            await this.setState({ pessoa: this.props.location.state.pessoa })
        }
        if (parseInt(id) !== 0 && this.state.pessoa) {
            //console.log('Servicos: ' + JSON.stringify(this.state.tiposervico))
            //await this.loadData(this.state.tiposervico)

            await this.setState({
                nome: this.state.pessoa.Nome,
                nome_fantasia: this.state.pessoa.Nome_Fantasia,
                cnpj_cpf: this.state.pessoa.Cnpj_Cpf,
                rg_ie: this.state.pessoa.Rg_Ie,
                inscricao_municipal: this.state.pessoa.Inscricao_Municipal,
                nascimento: this.state.pessoa.Nascimento_Abertura,
                inclusao: this.state.pessoa.Inclusao,
                contaContabilInicial: this.state.pessoa.Conta_Contabil,
                contaProvisaoInicial: this.state.pessoa.Conta_Provisao,
                contaFaturaInicial: this.state.pessoa.Conta_Fatura,
                contaContabil: this.state.pessoa.Conta_Contabil,
                contaProvisao: this.state.pessoa.Conta_Provisao,
                contaFaturar: this.state.pessoa.Conta_Faturar,
            })
            await this.converteCategoria();

            await this.setState({
                dadosIniciais: [
                    { titulo: 'Nome', valor: this.state.nome },
                    { titulo: 'Nome_Fantasia', valor: this.state.nome_fantasia },
                    { titulo: 'Cnpj_Cpf', valor: this.state.cnpj_cpf },
                    { titulo: 'Rg_Ie', valor: this.state.rg_ie },
                    { titulo: 'Inscricao_Municipal', valor: this.state.inscricao_municipal },
                    { titulo: 'Nascimento_Abertura', valor: this.state.nascimento },
                    { titulo: 'Inclusao', valor: this.state.inclusao },
                    { titulo: 'Conta_Provisao', valor: this.state.contaProvisao },
                    { titulo: 'Conta_Contabil', valor: this.state.contaContabil },
                    { titulo: 'Conta_Faturar', valor: this.state.contaFaturar }
                ]
            })
        }

        await this.loadAll();
        await this.getPessoaEnderecos();
        await this.getPessoaContatos();
        await this.getTipos();
        await this.adicionaInformacao();

        this.state.acessosPermissoes.map((e) => {
            if ((e.acessoAcao == "PESSOAS" && e.permissaoInsere == 0 && this.state.chave == 0) || (e.acessoAcao == "PESSOAS" && e.permissaoEdita == 0 && this.state.chave != 0)) {
                this.setState({ bloqueado: true })
            }
        })

    }

    loadAll = async () => {
        await this.setState({
            planosContas: await loader.getBase('getPlanosContasAnaliticas.php'),
            planosContasOptions: await loader.getPlanosContasAnaliticasOptions(),
            acessos: await loader.getBase('getTiposAcessos.php'),
            permissoes: await loader.getBase('getPermissoes.php')
        })

        await this.setState({
            acessosPermissoes: await loader.testaAcesso(this.state.acessos, this.state.permissoes, this.state.usuarioLogado),
            loading: false
        })
    }

    componentDidUpdate = async (prevProps, prevState) => {
        if (prevState.cnpj_cpf != this.state.cnpj_cpf) {
            let numberPattern = /\d+/g;
            var cpflimpo = ''
            if (this.state.cnpj_cpf) {
                if (this.state.cnpj_cpf != '___.___.___-__' && this.state.cnpj_cpf != '') {
                    let cpflimpo2 = this.state.cnpj_cpf.match(numberPattern)
                    var cpflimpo = cpflimpo2.join('')
                }
                if (this.state.cnpj_cpf.length > 10) {
                    this.setState({ cnpj_cpfLimpo: cpflimpo })
                }
            }
        }
        if (this.state.deleteContato && this.state.modalItemAberto != prevState.modalItemAberto) {
            await this.setState({
                modalItemAberto: false,
                deleteContato: false
            })
        }
        if (this.state.deleteEndereco && this.state.modalItemAberto != prevState.modalItemAberto) {
            await this.setState({
                modalItemAberto: false,
                deleteEndereco: false
            })
        }

    }

    getPessoa = async () => {
        await apiEmployee.post(`getPessoa.php`, {
            token: true,
            chave: this.state.chave
        }).then(
            async res => {
                await this.setState({ pessoa: res.data[0] })
            }
        )
    }

    getPessoaEnderecos = async () => {
        if (this.state.chave) {
            await apiEmployee.post(`getEnderecos.php`, {
                token: true,
                pessoa: this.props.match.params.id
            }).then(
                async response => {
                    await this.setState({ enderecos: response.data })
                    //console.log(response.data)
                    await this.setState({ loading: false })
                },
                response => { this.erroApi(response) }

            )
        }
    }

    erroApi = async () => {
        console.log(PRECISA_LOGAR)
        await this.setState({ redirect: true })
    }

    deleteEndereco = async (chave, nome) => {
        this.setState({ deleteEndereco: true })
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja remover esse endereço? ({nome}) </p>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-success w-25"
                            onClick={
                                async () => {
                                    onClose()
                                }
                            }
                        >
                            Não
                        </button>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-danger w-25"
                            onClick={
                                async () => {
                                    await apiEmployee.post(`deleteEndereco.php`, {
                                        token: true,
                                        chave: chave
                                    }).then(
                                        async response => {
                                            if (response.data == true) {
                                                await loader.salvaLogs('pessoas_enderecos', this.state.usuarioLogado.codigo, null, "Exclusão", chave);

                                                document.location.reload()
                                            }
                                        },
                                        async response => {
                                            this.erroApi(response)
                                        }
                                    )
                                    onClose()
                                }
                            }

                        >
                            Sim
                        </button>
                    </div>
                )
            }
        })
    }

    getPessoaContatos = async () => {
        if (this.state.chave) {
            await apiEmployee.post(`getContatos.php`, {
                token: true,
                pessoa: this.props.match.params.id
            }).then(
                async response => {
                    await this.setState({ contatos: response.data })
                    await this.setState({ loading: false })
                },
                response => { this.erroApi(response) }

            )
        }
    }

    getTipos = async () => {
        await apiEmployee.post("getTiposComplementares.php", {
            token: true
        }).then(
            async res => {
                this.setState({ tipos: res.data });
            },
            async err => console.log('erro: ' + err)
        )
    }

    adicionaInformacao = async () => {
        let tiposContatos = this.state.contatos.map((contato) => {
            return { ...contato, tipoNome: this.state.tipos.filter((tipo) => tipo.Codigo == contato.Tipo)[0].Descricao }
        })

        await this.setState({ contatos: tiposContatos })

    }

    deleteContato = async (chave, nome) => {
        this.setState({ deleteContato: true })
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Deseja remover esse contato? ({nome}) </p>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-success w-25"
                            onClick={
                                async () => {
                                    onClose()
                                }
                            }
                        >
                            Não
                        </button>
                        <button
                            style={{ marginRight: 5 }}
                            className="btn btn-danger w-25"
                            onClick={
                                async () => {
                                    await apiEmployee.post(`deleteContato.php`, {
                                        token: true,
                                        chave: chave
                                    }).then(
                                        async response => {
                                            if (response.data == true) {
                                                await loader.salvaLogs('pessoas_contatos', this.state.usuarioLogado.codigo, null, "Exclusão", chave);

                                                document.location.reload()
                                            }
                                        },
                                        async response => {
                                            this.erroApi(response)
                                        }
                                    )
                                    onClose()
                                }
                            }

                        >
                            Sim
                        </button>
                    </div>
                )
            }
        })
    }

    converteCategoria = async () => {
        let categoria = this.state.pessoa.Categoria.split('');
        const categoriaArray = categoria.map((e) => {
            if (e == 1) {
                return true;
            } else {
                return false;
            }
        });

        categoria = {
            cliente: categoriaArray[0],
            fornecedor: categoriaArray[1],
            prestador_servico: categoriaArray[2],
            transportador: categoriaArray[3],
            banco: categoriaArray[4],
            adm_cartao: categoriaArray[5],
            adm_convenio: categoriaArray[6]
        }

        this.setState({ categoria: categoria })

    }

    carregaLugares = async () => {
        await apiEmployee.post('getLugares', {
            token: true
        }).then(
            async res => {
                this.setState({ paises: res.data.paises, estados: res.data.estados, cidades: res.data.cidades });

                let options = this.state.paises.map((e) => {
                    return { label: e.Descricao, value: e.Chave }
                })
                this.setState({ paisesOptions: options });

                options = this.state.estados.map((e) => {
                    return { label: e.Descricao, value: e.Chave, pais: e.Pais }
                })
                this.setState({ estadosOptions: options });

                options = this.state.cidades.map((e) => {
                    return { label: e.Descricao, value: e.Chave, estado: e.Estado }
                })
                this.setState({ cidadesOptions: options });
            }
        )
    }

    testaCpf = async () => {
        await apiEmployee.post('testaCpf.php', {
            token: true,
            Cnpj_Cpf: this.state.cnpj_cpfLimpo
        }).then(
            async res => {
                if (!res.data[0] || res.data[0].Chave == this.state.chave || this.state.cnpj_cpfLimpo.trim() == "") {
                    await this.setState({ cpfAprovado: true })
                } else {
                    await this.setState({ pessoa: res.data[0] });
                    this.setState({
                        nome: this.state.pessoa.Nome,
                        nome_fantasia: this.state.pessoa.Nome_Fantasia,
                        cnpj_cpf: this.state.pessoa.Cnpj_Cpf,
                        rg_ie: this.state.pessoa.Rg_Ie,
                        nascimento: this.state.pessoa.Nascimento_Abertura,
                        inclusao: this.state.pessoa.Inclusao,
                        chave: this.state.pessoa.Chave
                    })
                }
            },
            async err => { console.log(err) }
        )
    }


    salvarPessoa = async (validForm) => {
        this.setState({ ...util.cleanStates(this.state) });

        let categoria = [this.state.categoria.cliente ? 1 : 0, this.state.categoria.fornecedor ? 1 : 0, this.state.categoria.prestador_servico ? 1 : 0, this.state.categoria.transportador ? 1 : 0, this.state.categoria.banco ? 1 : 0, this.state.categoria.adm_cartao ? 1 : 0, this.state.categoria.adm_convenio ? 1 : 0]
        categoria = categoria.join('');

        if (!validForm) {
            return;
        }

        if (this.state.cnpj_cpfLimpo.trim() != "") {
            await this.testaCpf();
            if (!this.state.cpfAprovado) {
                return;
            }
        }

        this.setState({ bloqueado: true })

        this.setState({
            dadosFinais: [
                { titulo: 'Nome', valor: this.state.nome },
                { titulo: 'Nome_Fantasia', valor: this.state.nome_fantasia },
                { titulo: 'Cnpj_Cpf', valor: this.state.cnpj_cpf },
                { titulo: 'Rg_Ie', valor: this.state.rg_ie },
                { titulo: 'Inscricao_Municipal', valor: this.state.inscricao_municipal },
                { titulo: 'Nascimento_Abertura', valor: this.state.nascimento },
                { titulo: 'Inclusao', valor: this.state.inclusao },
                { titulo: 'Conta_Provisao', valor: this.state.contaProvisao },
                { titulo: 'Conta_Contabil', valor: this.state.contaContabil },
                { titulo: 'Conta_Faturar', valor: this.state.contaFaturar }
            ],
            loading: true
        })

        if (this.state.chave == 0) {
            await apiEmployee.post(`insertPessoa.php`, {
                token: true,
                values: `"${this.state.nome.replaceAll("'", "\'")}", '${this.state.nome_fantasia.replaceAll("'", "\'")}', '${this.state.cnpj_cpfLimpo}', '${this.state.rg_ie}', '${this.state.inscricao_municipal}', '${this.state.nascimento}', '${this.state.inclusao}', '${categoria}', '${this.state.contaContabil}', '${this.state.contaProvisao}', '${this.state.contaFaturar}'`
            }).then(
                async res => {
                    if (res.data[0].Chave) {
                        await this.setState({ chave: res.data[0].Chave })
                        await loader.salvaLogs('pessoas', this.state.usuarioLogado.codigo, null, "Inclusão", res.data[0].Chave);
                        await this.setState({ loading: false, bloqueado: false })
                    } else {
                    }
                },
                async res => await console.log(`Erro: ${res.data}`)
            )
        } else {
            await apiEmployee.post(`updatePessoa.php`, {
                token: true,
                Chave: this.state.chave,
                Nome: this.state.nome.replaceAll("'", "\'"),
                Nome_Fantasia: this.state.nome_fantasia.replaceAll("'", "\'"),
                Cnpj_Cpf: this.state.cnpj_cpfLimpo,
                Rg_Ie: this.state.rg_ie,
                Inscricao_Municipal: this.state.inscricao_municipal,
                Nascimento_Abertura: this.state.nascimento,
                Inclusao: this.state.inclusao,
                Categoria: categoria,
                Conta_Contabil: this.state.contaContabil,
                Conta_Provisao: this.state.contaProvisao,
                Conta_Faturar: this.state.contaFaturar
            }).then(
                async res => {
                    console.log(res.data);
                    if (res.data === true) {
                        await loader.salvaLogs('pessoas', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.chave, `PESSOA: ${this.state.nome}`);

                        await this.setState({ loading: false, bloqueado: false })
                    } else {
                        //await alert(`Erro`)
                    }
                },
                async res => await console.log(`Erro: ${res}`)
            )

        }

    }

    alertSaved = async () => {
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui text-center'>
                        <h1>{NOME_EMPRESA}</h1>
                        <p>Pessoa salva!</p>
                        <button
                            style={{ textAlign: "center" }}
                            className="btn btn-success w-25"
                            onClick={
                                async () => {
                                    this.setState({ redirectSaved: true });
                                    onClose()
                                }
                            }
                        >Ok</button>
                    </div>
                )
            }
        })
    }

    erroApi = async (res) => {
        console.log(res)
        await this.setState({ redirect: true })
    }

    openLogs = async () => {
        await this.setState({ logs: await loader.getLogs("pessoas", this.state.chave) })
        await this.setState({ modalLog: true })
    }


    filterSearch = (e, state) => {
        if (e == "") {
            return true
        }

        const text = state.toUpperCase();
        return (e.label.toUpperCase().includes(text))
    }

    render() {
        const validations = []
        validations.push(this.state.nome)
        validations.push(!this.state.cnpj_cpfLimpo || (this.state.cnpj_cpfLimpo.length == 11 || this.state.cnpj_cpfLimpo.length == 14))
        validations.push(!this.state.bloqueado)

        const validForm = validations.reduce((t, a) => t && a)

        return (
            <div className='allContent'>

                <div>
                    {this.state.redirect &&
                        <Redirect to={'/'} />
                    }

                    {this.state.loading &&
                        <Skeleton />
                    }

                    <ModalItem
                        closeModal={() => { this.setState({ modalItemAberto: false }) }}
                        itens={this.state.itemInfo}
                        nome={this.state.itemNome}
                        chave={this.state.itemChave}
                        itemPermissao={this.state.itemPermissao}
                        modalAberto={this.state.modalItemAberto}
                        itemAdd={this.state.itemAdd}
                        itemEdit={this.state.itemEdit}
                        itemDelete={this.state.itemDelete}
                        acessosPermissoes={this.state.acessosPermissoes}
                    />

                    {!this.state.loading &&
                        <>
                            <section>
                                <Header voltarPessoas titulo="Pessoas" chave={this.state.chave != 0 ? this.state.chave : ''} />
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
                                nome={this.state.nome}
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
                                                this.salvarPessoa(validForm)
                                            }}
                                        >
                                            <Form className="contact-form" >

                                                <div className="row">
                                                    <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2"></div>

                                                    <div className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12 ">

                                                        <div className="row addservicos">
                                                            {this.state.chave != 0 &&
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm firstlabel">
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
                                                                <label>CPF/CNPJ</label>
                                                            </div>
                                                            <div className='col-1 errorMessage'>
                                                            </div>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                                <InputMask type='text' mask={this.state.cnpj_cpfLimpo.length <= 11 ? '999.999.999-99' : '99.999.999/9999-99'} className='form-control' value={this.state.cnpj_cpf} onChange={e => this.setState({ cnpj_cpf: e.currentTarget.value })} onKeyDown={e => { if (this.state.cnpj_cpfLimpo.length == 11 && e.nativeEvent.key == parseInt(e.nativeEvent.key)) { this.setState({ cnpj_cpfLimpo: `${this.state.cnpj_cpfLimpo}${e.nativeEvent.key}` }) } }} />

                                                            </div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Nome</label>
                                                            </div>
                                                            <div className='col-1 errorMessage'>
                                                                {!this.state.nome &&
                                                                    <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                }
                                                            </div>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                                <Field className="form-control" type="text" value={this.state.nome} onChange={async e => { this.setState({ nome: e.currentTarget.value }) }} />
                                                            </div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Nome Fantasia</label>
                                                            </div>
                                                            <div className='col-1'></div>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                                <Field className="form-control" type="text" value={this.state.nome_fantasia} onChange={async e => { this.setState({ nome_fantasia: e.currentTarget.value }) }} />
                                                            </div>
                                                            <div className='col-1'></div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>RG/IE</label>
                                                            </div>
                                                            <div className='col-1'></div>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                                <Field className="form-control" type="text" value={this.state.rg_ie} onChange={async e => { this.setState({ rg_ie: e.currentTarget.value }) }} />
                                                            </div>
                                                            <div className='col-1'></div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Inscrição Municipal</label>
                                                            </div>
                                                            <div className='col-1'></div>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                                <Field className="form-control" type="text" value={this.state.inscricao_municipal} onChange={async e => { this.setState({ inscricao_municipal: e.currentTarget.value }) }} />
                                                            </div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Nascimento / Abertura</label>
                                                            </div>
                                                            <div className='col-1'></div>
                                                            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                                <Field className="form-control" type="date" value={this.state.nascimento} onChange={async e => { this.setState({ nascimento: e.currentTarget.value }) }} />
                                                            </div>
                                                            {this.state.categoria.cliente &&
                                                                <>
                                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                        <label>Conta Contabil - Receber</label>
                                                                    </div>
                                                                    <div className='col-1 errorMessage'>
                                                                    </div>
                                                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                        <Select className='SearchSelect' options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ planosContasOptionsTexto: e }) }} value={this.state.planosContasOptions.filter(option => option.value == this.state.contaContabil)[0]} search={true} onChange={(e) => { this.setState({ contaContabil: e.value, }) }} />
                                                                    </div>
                                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                        <label>Conta Contabil - Faturar</label>
                                                                    </div>
                                                                    <div className='col-1 errorMessage'>
                                                                    </div>
                                                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                        <Select className='SearchSelect' options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ planosContasOptionsTexto: e }) }} value={this.state.planosContasOptions.filter(option => option.value == this.state.contaFaturar)[0]} search={true} onChange={(e) => { this.setState({ contaFaturar: e.value, }) }} />
                                                                    </div>
                                                                </>
                                                            }
                                                            {this.state.categoria.fornecedor &&
                                                                <>
                                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                        <label>Conta Contabil - Pagar</label>
                                                                    </div>
                                                                    <div className='col-1 errorMessage'>
                                                                    </div>
                                                                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                                        <Select className='SearchSelect' options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ planosContasOptionsTexto: e }) }} value={this.state.planosContasOptions.filter(option => option.value == this.state.contaProvisao)[0]} search={true} onChange={(e) => { this.setState({ contaProvisao: e.value, }) }} />
                                                                    </div>
                                                                </>
                                                            }
                                                            <div className="col-12">
                                                                <label className="center">Categorias</label>
                                                            </div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Cliente</label>
                                                            </div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <Field type="checkbox" name='cliente' checked={this.state.categoria.cliente} onChange={async e => { await this.setState({ categoria: { ...this.state.categoria, cliente: e.target.checked } }); if (e.target.checked) { await this.setState({ contaContabil: this.state.contaContabilInicial, contaFaturar: this.state.contaFaturaInicial }) } else { await this.setState({ contaContabil: "", contaFaturar: "" }) } }} />
                                                            </div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Fornecedor</label>
                                                            </div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <Field type="checkbox" name='fornecedor' checked={this.state.categoria.fornecedor} onChange={async e => { this.setState({ categoria: { ...this.state.categoria, fornecedor: e.target.checked } }); if (e.target.checked) { await this.setState({ contaProvisao: this.state.contaProvisaoInicial }) } else { await this.setState({ contaProvisao: "" }) } }} />
                                                            </div>
                                                            {/* <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Prestador de Serviços</label>
                                                            </div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <Field type="checkbox" name='prestador_servicos' checked={this.state.categoria.prestador_servico} onChange={async e => { this.setState({ categoria: { ...this.state.categoria, prestador_servico: e.target.checked } }) }} />
                                                            </div> */}
                                                            {/*<div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <label>Transportador</label>
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <Field type="checkbox" name='transportador' checked={this.state.categoria.transportador} onChange={async e => { this.setState({ categoria: { ...this.state.categoria, transportador: e.target.checked } }) }} />
                                                </div>*/}
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <label>Banco</label>
                                                            </div>
                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                <Field type="checkbox" name='banco' checked={this.state.categoria.banco} onChange={async e => { this.setState({ categoria: { ...this.state.categoria, banco: e.target.checked } }) }} />
                                                            </div>
                                                            {/*<div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <label>Adm. Cartão</label>
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <Field type="checkbox" name='adm_cartao' checked={this.state.categoria.adm_cartao} onChange={async e => { this.setState({ categoria: { ...this.state.categoria, adm_cartao: e.target.checked } }) }} />
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <label>Adm. Convênio</label>
                                                </div>
                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                    <Field type="checkbox" name='adm_convenio' checked={this.state.categoria.adm_convenio} onChange={async e => { this.setState({ categoria: { ...this.state.categoria, adm_convenio: e.target.checked } }) }} />
                                            </div>*/}


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
                                    {this.state.chave != 0 && this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS_ENDERECOS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&

                                        <div>

                                            <div>
                                                <div>
                                                    <div className="page-breadcrumb2"><h3>ENDERECOS</h3></div>
                                                </div>
                                                <div>
                                                    <div>
                                                        <div className="row" id="product-list">
                                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                                            <div className="col-lg-12 col-md-12 col-sm-12 col-12 mix all dresses bags">
                                                                <div className="single-product-item">
                                                                    <div className="row subtitulosTabela">
                                                                        {window.innerWidth >= 500 &&
                                                                            <>
                                                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-center">
                                                                                    <span className="subtituloships">Chave</span>
                                                                                </div>
                                                                                <div className="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-4 text-center">
                                                                                    <span className="subtituloships">Endereço</span>
                                                                                </div>
                                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-center">
                                                                                    <span className="subtituloships">Cep</span>
                                                                                </div>
                                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-center">

                                                                                    <Link to=
                                                                                        {{
                                                                                            pathname: `/tabelas/addpessoaendereco/${this.state.chave}/0`,
                                                                                            state: { endereco: {}, pessoa: { ...this.state.pessoa }, backTo: `addpessoa` }
                                                                                        }}
                                                                                    >
                                                                                        <FontAwesomeIcon icon={faPlus} />
                                                                                    </Link>
                                                                                </div>
                                                                            </>
                                                                        }
                                                                        {window.innerWidth < 500 &&
                                                                            <>
                                                                                <div className="col-xl-5 col-lg-5 col-md-5 col-sm-5 col-5 text-center">
                                                                                    <span className="subtituloships">Endereço</span>
                                                                                </div>
                                                                                <div className="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-4 text-center">
                                                                                    <span className="subtituloships">Cep</span>
                                                                                </div>
                                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-center">

                                                                                    <Link to=
                                                                                        {{
                                                                                            pathname: `/tabelas/addpessoaendereco/${this.state.chave}/0`,
                                                                                            state: { endereco: {}, pessoa: { ...this.state.pessoa }, backTo: `addpessoa` }
                                                                                        }}
                                                                                    >
                                                                                        <FontAwesomeIcon icon={faPlus} />
                                                                                    </Link>
                                                                                </div>
                                                                            </>
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-0"></div>
                                                        </div>

                                                        <div id="product-list">


                                                            {this.state.enderecos[0] != undefined && this.state.enderecos.map((feed, index) => (
                                                                <div key={feed.Chave} className="row row-list">
                                                                    <div className="col-xl-2 col-lg-2 col-md-0 col-sm-0 col-0"></div>
                                                                    <div className={index % 2 == 0 ? "col-lg-12 col-md-12 col-sm-12 col-12 mix all dresses bags par" : "col-lg-12 col-md-12 col-sm-12 col-12 mix all dresses bags itemLista impar"}>
                                                                        {window.innerWidth >= 500 &&
                                                                            <div className="row deleteMargin alignCenter">
                                                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-center">
                                                                                    <p>{feed.Chave}</p>
                                                                                </div>
                                                                                <div className="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-4 text-center">
                                                                                    <p>{feed.Endereco}</p>
                                                                                </div>
                                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-center" style={{ overflowWrap: 'anywhere' }}>
                                                                                    <p>{feed.Cep}</p>
                                                                                </div>
                                                                                <div className='col-1'></div>
                                                                                <div className="col-lg-1 col-md-1 col-sm-1 col-1  text-left  mobileajuster4 icones">
                                                                                    <div className='iconelixo giveMargin' type='button' >
                                                                                        <Link to=
                                                                                            {{
                                                                                                pathname: `/tabelas/addpessoaendereco/${feed.Chave_Pessoa}/0`,
                                                                                                state: { endereco: { ...feed }, pessoa: { ...this.state.pessoa }, backTo: `addpessoa` }
                                                                                            }}
                                                                                        >
                                                                                            <FontAwesomeIcon icon={faPlus} />
                                                                                        </Link>
                                                                                    </div>


                                                                                    <div className='iconelixo giveMargin' type='button' >
                                                                                        <Link to=
                                                                                            {{
                                                                                                pathname: `/tabelas/addpessoaendereco/${feed.Chave_Pessoa}/${feed.Chave}`,
                                                                                                state: { endereco: { ...feed }, pessoa: { ...this.state.pessoa }, backTo: `addpessoa` }
                                                                                            }}
                                                                                        >
                                                                                            <FontAwesomeIcon icon={faPen} />
                                                                                        </Link>
                                                                                    </div>

                                                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS_ENDERECOS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                                                                        <div type='button' className='iconelixo' onClick={(a) => this.deleteEndereco(feed.Chave, feed.Endereco)} >
                                                                                            <FontAwesomeIcon icon={faTrashAlt} />
                                                                                        </div>
                                                                                    }
                                                                                </div>


                                                                            </div>
                                                                        }

                                                                        {window.innerWidth < 500 &&
                                                                            <div
                                                                                onClick={() => {
                                                                                    this.setState({
                                                                                        modalItemAberto: true,
                                                                                        itemInfo: [{ titulo: 'Chave', valor: feed.Chave }, { titulo: 'Tipo', valor: ['Padrão', 'Entrega', 'Cobrança', 'Residencial'][feed.Tipo] }, { titulo: 'Endereço', valor: feed.Endereco }, { titulo: 'Numero', valor: feed.Numero }, { titulo: 'Complemento', valor: feed.Complemento }, { titulo: 'Bairro', valor: feed.bairro }, { titulo: 'Cidade', valor: feed.Cidade_Descricao }],
                                                                                        itemNome: feed.Endereco,
                                                                                        itemChave: feed.Chave,
                                                                                        itemPermissao: 'PESSOAS_ENDERECOS',
                                                                                        itemAdd: {
                                                                                            pathname: `/tabelas/addpessoaendereco/${feed.Chave_Pessoa}/0`,
                                                                                            state: { endereco: { ...feed }, pessoa: { ...this.state.pessoa }, backTo: `addpessoa` }
                                                                                        },
                                                                                        itemEdit: {
                                                                                            pathname: `/tabelas/addpessoaendereco/${feed.Chave_Pessoa}/${feed.Chave}`,
                                                                                            state: { endereco: { ...feed }, pessoa: { ...this.state.pessoa }, backTo: `addpessoa` }
                                                                                        },
                                                                                        itemDelete: this.deleteEndereco
                                                                                    })
                                                                                }}
                                                                                className="row deleteMargin alignCenter">
                                                                                <div className="col-xl-5 col-lg-5 col-md-5 col-sm-5 col-5 text-center">
                                                                                    <p>{feed.Endereco}</p>
                                                                                </div>
                                                                                <div className="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-4 text-center" style={{ overflowWrap: 'anywhere' }}>
                                                                                    <p>{feed.Cep}</p>
                                                                                </div>
                                                                                <div className="col-lg-1 col-md-1 col-sm-1 col-1  text-left  mobileajuster4 icones">
                                                                                    <div className='iconelixo giveMargin' type='button' >
                                                                                        <Link to=
                                                                                            {{
                                                                                                pathname: `/tabelas/addpessoaendereco/${feed.Chave_Pessoa}/0`,
                                                                                                state: { endereco: { ...feed }, pessoa: { ...this.state.pessoa }, backTo: `addpessoa` }
                                                                                            }}
                                                                                        >
                                                                                            <FontAwesomeIcon icon={faPlus} />
                                                                                        </Link>
                                                                                    </div>


                                                                                    <div className='iconelixo giveMargin' type='button' >
                                                                                        <Link to=
                                                                                            {{
                                                                                                pathname: `/tabelas/addpessoaendereco/${feed.Chave_Pessoa}/${feed.Chave}`,
                                                                                                state: { endereco: { ...feed }, pessoa: { ...this.state.pessoa }, backTo: `addpessoa` }
                                                                                            }}
                                                                                        >
                                                                                            <FontAwesomeIcon icon={faPen} />
                                                                                        </Link>
                                                                                    </div>

                                                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS_ENDERECOS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                                                                        <div type='button' className='iconelixo' onClick={(a) => this.deleteEndereco(feed.Chave, feed.Endereco)} >
                                                                                            <FontAwesomeIcon icon={faTrashAlt} />
                                                                                        </div>
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        }
                                                                    </div>
                                                                    <div className="col-xl-2 col-lg-2 col-md-0 col-sm-0 col-0"></div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <hr />
                                        </div>
                                    }
                                    {this.state.chave != 0 && this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS_ENDERECOS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 && this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS_CONTATOS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                        <div style={{ display: `flex`, justifyContent: `center`, alignItems: `center` }}>
                                            <hr style={{ width: `50%` }} />
                                        </div>
                                    }
                                    {this.state.chave != 0 && this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS_CONTATOS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                        <div>
                                            <div>
                                                <div>
                                                    <div className="page-breadcrumb2"><h3>CONTATOS</h3></div>
                                                </div>
                                                <div>
                                                    <div>
                                                        <div className="row" id="product-list">
                                                            <div className="col-xl-2 col-lg-2 col-md-0 col-sm-0 col-0"></div>
                                                            <div className="col-lg-12 col-md-12 col-sm-12 col-12 mix all dresses bags">
                                                                <div className="single-product-item">
                                                                    {window.innerWidth >= 500 &&
                                                                        <div className="row subtitulosTabela">
                                                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-center">
                                                                                <span className="subtituloships">Chave</span>
                                                                            </div>
                                                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-center">
                                                                                <span className="subtituloships">Tipo</span>
                                                                            </div>
                                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-center">
                                                                                <span className="subtituloships">Campo 1</span>
                                                                            </div>
                                                                            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-center">
                                                                                <span className="subtituloships">Campo 2</span>
                                                                            </div>
                                                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-center">
                                                                                <Link to=
                                                                                    {{
                                                                                        pathname: `/tabelas/addpessoacontato/${this.state.chave}/0`,
                                                                                        state: { contato: {}, pessoa: { ...this.state.pessoa }, backTo: `addpessoa` }
                                                                                    }}
                                                                                >
                                                                                    <FontAwesomeIcon icon={faPlus} />
                                                                                </Link>
                                                                            </div>
                                                                        </div>
                                                                    }
                                                                    {window.innerWidth < 500 &&
                                                                        <div className="row subtitulosTabela">
                                                                            <div className="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-4 text-center">
                                                                                <span className="subtituloships">Tipo</span>
                                                                            </div>
                                                                            <div className="col-xl-5 col-lg-5 col-md-5 col-sm-5 col-5 text-center">
                                                                                <span className="subtituloships">Campo 1</span>
                                                                            </div>
                                                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-center">
                                                                                <Link to=
                                                                                    {{
                                                                                        pathname: `/tabelas/addpessoacontato/${this.state.chave}/0`,
                                                                                        state: { contato: {}, pessoa: { ...this.state.pessoa }, backTo: `addpessoa` }
                                                                                    }}
                                                                                >
                                                                                    <FontAwesomeIcon icon={faPlus} />
                                                                                </Link>
                                                                            </div>
                                                                        </div>
                                                                    }
                                                                </div>
                                                            </div>
                                                            <div className="col-xl-2 col-lg-2 col-md-0 col-sm-0 col-0"></div>
                                                        </div>

                                                        <div id="product-list">
                                                            {this.state.contatos[0] != undefined && this.state.contatos.map((feed, index) => (
                                                                <div key={feed.Chave} className="row row-list">
                                                                    <div className="col-xl-2 col-lg-2 col-md-0 col-sm-0 col-0"></div>
                                                                    <div className={index % 2 == 0 ? "col-lg-12 col-md-12 col-sm-12 col-12 mix all dresses bags par" : "col-lg-12 col-md-12 col-sm-12 col-12 mix all dresses bags itemLista impar"}>
                                                                        {window.innerWidth >= 500 &&
                                                                            <div className="row deleteMargin alignCenter">
                                                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-center">
                                                                                    <p>{feed.Chave}</p>
                                                                                </div>
                                                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2 text-center">
                                                                                    <p>{feed.tipoNome}</p>
                                                                                </div>
                                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-center" style={{ overflowWrap: 'anywhere' }}>
                                                                                    <p>{feed.Campo1}</p>
                                                                                </div>
                                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col-3 text-center" style={{ overflowWrap: 'anywhere' }}>
                                                                                    <p>{feed.Campo2}</p>
                                                                                </div>
                                                                                <div className="col-lg-2 col-md-2 col-sm-2 col-2  text-left  mobileajuster4 icones" >
                                                                                    <div className='iconelixo giveMargin' type='button' >
                                                                                        <Link to=
                                                                                            {{
                                                                                                pathname: `/tabelas/addpessoacontato/${feed.Chave_Pessoa}/0`,
                                                                                                state: { contato: { ...feed }, pessoa: { ...this.state.pessoa }, backTo: `addpessoa` }
                                                                                            }}
                                                                                        >
                                                                                            <FontAwesomeIcon icon={faPlus} />
                                                                                        </Link>
                                                                                    </div>


                                                                                    <div className='iconelixo giveMargin' type='button' >
                                                                                        <Link to=
                                                                                            {{
                                                                                                pathname: `/tabelas/addpessoacontato/${feed.Chave_Pessoa}/${feed.Chave}`,
                                                                                                state: { contato: { ...feed }, pessoa: { ...this.state.pessoa }, backTo: `addpessoa` }
                                                                                            }}
                                                                                        >
                                                                                            <FontAwesomeIcon icon={faPen} />
                                                                                        </Link>
                                                                                    </div>

                                                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS_CONTATOS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                                                                        <div type='button' className='iconelixo' onClick={(a) => this.deleteContato(feed.Chave, feed.tipoNome)} >
                                                                                            <FontAwesomeIcon icon={faTrashAlt} />
                                                                                        </div>
                                                                                    }
                                                                                </div>

                                                                            </div>
                                                                        }
                                                                        {window.innerWidth < 500 &&
                                                                            <div
                                                                                onClick={() => {
                                                                                    this.setState({
                                                                                        modalItemAberto: true,
                                                                                        itemInfo: [{ titulo: 'Chave', valor: feed.Chave }, { titulo: 'Tipo', valor: feed.tipoNome }, { titulo: 'Campo 1', valor: feed.Campo1 }, { titulo: 'Campo 2', valor: feed.Campo2 }],
                                                                                        itemNome: feed.tipoNome,
                                                                                        itemChave: feed.Chave,
                                                                                        itemPermissao: 'PESSOAS_CONTATOS',
                                                                                        itemAdd: {
                                                                                            pathname: `/tabelas/addpessoacontato/${feed.Chave_Pessoa}/0`,
                                                                                            state: { contato: { ...feed }, pessoa: { ...this.state.pessoa }, backTo: `addpessoa` }
                                                                                        },
                                                                                        itemEdit: {
                                                                                            pathname: `/tabelas/addpessoacontato/${feed.Chave_Pessoa}/${feed.Chave}`,
                                                                                            state: { contato: { ...feed }, pessoa: { ...this.state.pessoa }, backTo: `addpessoa` }
                                                                                        },
                                                                                        itemDelete: this.deleteContato
                                                                                    })
                                                                                }}
                                                                                className="row deleteMargin alignCenter">
                                                                                <div className="col-xl-4 col-lg-4 col-md-4 col-sm-4 col-4 text-center">
                                                                                    <p>{feed.tipoNome}</p>
                                                                                </div>
                                                                                <div className="col-xl-5 col-lg-5 col-md-5 col-sm-5 col-5 text-center" style={{ overflowWrap: 'anywhere' }}>
                                                                                    <p>{feed.Campo1}</p>
                                                                                </div>
                                                                                <div className="col-lg-2 col-md-2 col-sm-2 col-2  text-left  mobileajuster4 icones" >
                                                                                    <div className='iconelixo giveMargin' type='button' >
                                                                                        <Link to=
                                                                                            {{
                                                                                                pathname: `/tabelas/addpessoacontato/${feed.Chave_Pessoa}/0`,
                                                                                                state: { contato: { ...feed }, pessoa: { ...this.state.pessoa }, backTo: `addpessoa` }
                                                                                            }}
                                                                                        >
                                                                                            <FontAwesomeIcon icon={faPlus} />
                                                                                        </Link>
                                                                                    </div>


                                                                                    <div className='iconelixo giveMargin' type='button' >
                                                                                        <Link to=
                                                                                            {{
                                                                                                pathname: `/tabelas/addpessoacontato/${feed.Chave_Pessoa}/${feed.Chave}`,
                                                                                                state: { contato: { ...feed }, pessoa: { ...this.state.pessoa }, backTo: `addpessoa` }
                                                                                            }}
                                                                                        >
                                                                                            <FontAwesomeIcon icon={faPen} />
                                                                                        </Link>
                                                                                    </div>

                                                                                    {this.state.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS_CONTATOS') { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                                                                        <div type='button' className='iconelixo' onClick={(a) => this.deleteContato(feed.Chave, feed.tipoNome)} >
                                                                                            <FontAwesomeIcon icon={faTrashAlt} />
                                                                                        </div>
                                                                                    }
                                                                                </div>

                                                                            </div>
                                                                        }
                                                                    </div>
                                                                    <div className="col-xl-2 col-lg-2 col-md-0 col-sm-0 col-0"></div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                </div>


                            </div>
                            <Rodape />
                        </>
                    }
                </div>
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

export default connect(mapStateToProps, null)(AddPessoa)

