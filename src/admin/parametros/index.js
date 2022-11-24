import React, { Component } from 'react'
import './styles.css'
import { Formik, Form } from 'formik'
import Header from '../../components/header'
import Rodape from '../../components/rodape'
import loader from '../../classes/loader'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { apiEmployee } from '../../services/apiamrg'
import Skeleton from '../../components/skeleton'
import Select from 'react-select';

const estadoInicial = {
    parametros: [],

    desconto: '',
    INSS: '',
    IR: '',
    ISS: '',
    PIS: '',
    COFINS: '',
    CSLL: '',

    planosContas: [],
    planosContasOptions: [],
    planosContasOptionsTexto: '',

    acessos: [],
    permissoes: [],
    acessosPermissoes: [],

    bloqueado: false,
    bloqueadoContabiliza: false,
    loading: true,

}

class Parametros extends Component {


    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        await this.loadAll();

        await this.setState({
            dadosIniciais: [
                { titulo: 'conta_desconto', valor: this.state.desconto },
                { titulo: 'conta_retencao_inss', valor: this.state.INSS },
                { titulo: 'conta_retencao_ir', valor: this.state.IR },
                { titulo: 'conta_retencao_iss', valor: this.state.ISS },
                { titulo: 'conta_retencao_pis', valor: this.state.PIS },
                { titulo: 'conta_retencao_cofins', valor: this.state.COFINS },
                { titulo: 'conta_retencao_csll', valor: this.state.CSLL }
            ]
        })

        this.state.acessosPermissoes.map((e) => {
            if ((e.acessoAcao == "PARAMETROS" && e.permissaoInsere == 0 && this.state.chave == 0) || (e.acessoAcao == "SERVICOS_ITENS" && e.permissaoEdita == 0 && this.state.chave != 0)) {
                this.setState({ bloqueado: true })
            }
        })
    }

    loadAll = async () => {
        await this.setState({
            parametros: await loader.getBody('getParametros.php', { token: true, empresa: this.state.usuarioLogado.empresa }),

            planosContas: await loader.getBase('getPlanosContasAnaliticas.php'),
            planosContasOptions: await loader.getPlanosContasAnaliticasOptions(),

            acessos: await loader.getBase('getTiposAcessos.php'),
            permissoes: await loader.getBase('getPermissoes.php')
        })

        await this.setState({
            desconto: this.state.parametros[0].conta_desconto,
            INSS: this.state.parametros[0].conta_retencao_inss,
            IR: this.state.parametros[0].conta_retencao_ir,
            ISS: this.state.parametros[0].conta_retencao_iss,
            PIS: this.state.parametros[0].conta_retencao_pis,
            COFINS: this.state.parametros[0].conta_retencao_cofins,
            CSLL: this.state.parametros[0].conta_retencao_csll,

            acessosPermissoes: await loader.testaAcesso(this.state.acessos, this.state.permissoes, this.state.usuarioLogado),
            loading: false
        })
    }

    alterarParametros = async (validForm) => {
        this.setState({ bloqueado: true });

        await this.setState({
            dadosFinais: [
                { titulo: 'conta_desconto', valor: this.state.desconto },
                { titulo: 'conta_retencao_inss', valor: this.state.INSS },
                { titulo: 'conta_retencao_ir', valor: this.state.IR },
                { titulo: 'conta_retencao_iss', valor: this.state.ISS },
                { titulo: 'conta_retencao_pis', valor: this.state.PIS },
                { titulo: 'conta_retencao_cofins', valor: this.state.COFINS },
                { titulo: 'conta_retencao_csll', valor: this.state.CSLL }
            ]
        })

        if (validForm) {
            await apiEmployee.post(`updateParametros.php`, {
                token: true,
                Empresa: this.state.usuarioLogado.empresa,
                conta_desconto: this.state.desconto,
                conta_retencao_inss: this.state.INSS,
                conta_retencao_ir: this.state.IR,
                conta_retencao_iss: this.state.ISS,
                conta_retencao_pis: this.state.PIS,
                conta_retencao_cofins: this.state.COFINS,
                conta_retencao_csll: this.state.CSLL
            }).then(
                async res => {
                    console.log(res.data)
                    if (res.data === true) {                        
                        await loader.salvaLogs('parametros', this.state.usuarioLogado.codigo, this.state.dadosIniciais, this.state.dadosFinais, this.state.chave);
                        await this.setState({ finalizaOperacao: true });
                    } else {
                        await alert(`Erro ${JSON.stringify(res)}`)
                    }
                },
                async res => await console.log(`Erro: ${res}`)
            )

        }

    }

    erroApi = async (res) => {
        alert(res)
        await this.setState({ redirect: true })
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
        validations.push(this.state.desconto);
        validations.push(this.state.INSS);
        validations.push(this.state.IR);
        validations.push(this.state.ISS);
        validations.push(this.state.PIS);
        validations.push(this.state.COFINS);
        validations.push(this.state.CSLL);

        const validForm = validations.reduce((t, a) => t && a)

        return (
            <div className='allContent'>
                {this.state.loading &&
                    <Skeleton />
                }

                {this.state.redirect &&
                    <Redirect to={'/admin'} />
                }

                {this.state.finalizaOperacao &&
                    <Redirect to={{ pathname: `/admin/utilitarios/` }} />
                }

                {!this.state.loading &&
                    <>
                        <section>
                            <Header voltarUtilitarios titulo="Parametros" />
                            <div className="col-2"></div>
                            <br />
                            <br />
                        </section>

                        <div className="contact-section">

                            <div className="row">
                                <div className="col-lg-12">
                                    <Formik
                                        initialValues={{
                                            name: '',
                                        }}
                                        onSubmit={async values => {
                                            await new Promise(r => setTimeout(r, 1000))
                                            this.alterarParametros(validForm)
                                        }}
                                    >
                                        <Form className="contact-form" >

                                            <div className="row">
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2"></div>

                                                <div className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12 ">

                                                    <div className="row addservicos">
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Desconto</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ planosContasOptionsTexto: e }) }} value={this.state.planosContasOptions.filter(option => option.value == this.state.desconto)[0]} search={true} onChange={(e) => { this.setState({ desconto: e.value, }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>INSS</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ planosContasOptionsTexto: e }) }} value={this.state.planosContasOptions.filter(option => option.value == this.state.INSS)[0]} search={true} onChange={(e) => { this.setState({ INSS: e.value, }) }} />
                                                        </div>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>IR</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ planosContasOptionsTexto: e }) }} value={this.state.planosContasOptions.filter(option => option.value == this.state.IR)[0]} search={true} onChange={(e) => { this.setState({ IR: e.value, }) }} />
                                                        </div>

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>ISS</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ planosContasOptionsTexto: e }) }} value={this.state.planosContasOptions.filter(option => option.value == this.state.ISS)[0]} search={true} onChange={(e) => { this.setState({ ISS: e.value, }) }} />
                                                        </div>

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>PIS</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ planosContasOptionsTexto: e }) }} value={this.state.planosContasOptions.filter(option => option.value == this.state.PIS)[0]} search={true} onChange={(e) => { this.setState({ PIS: e.value, }) }} />
                                                        </div>

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>COFINS</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ planosContasOptionsTexto: e }) }} value={this.state.planosContasOptions.filter(option => option.value == this.state.COFINS)[0]} search={true} onChange={(e) => { this.setState({ COFINS: e.value, }) }} />
                                                        </div>

                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>CSLL</label>
                                                        </div>
                                                        <div className='col-1 errorMessage'>
                                                        </div>
                                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.planosContasOptions.filter(e => this.filterSearch(e, this.state.planosContasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ planosContasOptionsTexto: e }) }} value={this.state.planosContasOptions.filter(option => option.value == this.state.CSLL)[0]} search={true} onChange={(e) => { this.setState({ CSLL: e.value, }) }} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-2"></div>
                                                    <div className="col-8" style={{ display: 'flex', justifyContent: 'center' }}>
                                                        <button disabled={!validForm} type="submit" style={validForm ? { width: 300 } : { backgroundColor: '#eee', opacity: 0.3, width: 300 }} >Salvar</button>
                                                    </div>
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

export default connect(mapStateToProps, null)(Parametros)

