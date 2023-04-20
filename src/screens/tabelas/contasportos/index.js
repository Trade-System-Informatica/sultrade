import React, { Component } from 'react'
import './styles.css'
import { Formik, Form } from 'formik'
import Select from 'react-select';
import Header from '../../../components/header'
import Rodape from '../../../components/rodape'
import loader from '../../../classes/loader'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import util from '../../../classes/util'

const estadoInicial = {
    dadosIniciais: '',
    dadosFinais: '',

    taxa: '',
    porto: '',
    conta: '',

    taxaAtiva: false,
    portoAtivo: false,
    contaAtiva: false,

    taxas: [],
    portos: [],
    contas: [],

    contasOptions: [],
    contasOptionsTexto: '',

    portosOptions: [],
    portosOptionsTexto: '',

    taxasOptions: [],
    taxasOptionsTexto: '',

    acessos: [],
    permissoes: [],
    acessosPermissoes: [],

    bloqueado: false,

    modal: false,
    modalLista: [],
    modalPesquisa: '',

}

class ContasPortos extends Component {

    state = {
        ...estadoInicial,
        usuarioLogado: this.props.user
    }

    componentDidMount = async () => {
        window.scrollTo(0, 0)

        await this.loadAll();

        this.state.acessosPermissoes.map((e) => {
            if ((e.acessoAcao == "CONTAS_PORTOS" && e.permissaoInsere == 0 && this.state.chave == 0) || (e.acessoAcao == "CONTAS_PORTOS" && e.permissaoEdita == 0 && this.state.chave != 0)) {
                this.setState({ bloqueado: true })
            }
        })
    }

    loadAll = async () => {
        await this.setState({
            taxas: await loader.getBase('getTaxas.php'),
            portos: await loader.getBase("getPortos.php"),
            contas: await loader.getBase("getPlanosContasAnaliticas.php"),
            acessos: await loader.getBase('getTiposAcessos.php'),
            permissoes: await loader.getBase('getPermissoes.php'),
        });


        await this.setState({
            acessosPermissoes: await loader.testaAcesso(this.state.acessos, this.state.permissoes, this.state.usuarioLogado),
            taxasOptions: await util.turnToOption(this.state.taxas, "descricao", "chave"),
            portosOptions: await util.turnToOption(this.state.portos, "Descricao", "Chave"),
            contasOptions: await util.turnToOption(this.state.contas, "Descricao", "Chave")
        });
    }

    addPorto = (value) => {
        const portos = this.state.porto ? this.state.porto : []; 
        
        if (portos.find((porto) => porto == value)) {
            return;
        }
        portos.push(value); 
        this.setState({ porto: portos });  
    }

    removePorto = (value) => {
        let portos = this.state.porto ? this.state.porto : []; 
        
        if (!portos.find((porto) => porto == value)) {
            return;
        }

        portos = portos.filter((porto) => porto != value);        
        this.setState({ porto: portos }); 
    }

    addTaxa = (value) => {
        const taxas = this.state.taxa ? this.state.taxa : []; 
        
        if (taxas.find((taxa) => taxa == value)) {
            return;
        }
        taxas.push(value); 
        this.setState({ taxa: taxas });  
    }

    removeTaxa = (value) => {
        let taxas = this.state.taxa ? this.state.taxa : []; 
        
        if (!taxas.find((taxa) => taxa == value)) {
            return;
        }

        taxas = taxas.filter((taxa) => taxa != value);        
        this.setState({ taxa: taxas }); 
    }

    reset = () => {
        window.location.reload();
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

    render() {
        const validations = []
        validations.push(!this.state.bloqueado)

        const validForm = validations.reduce((t, a) => t && a)

        return (
            <div className='allContent'>

                {this.state.redirect &&
                    <Redirect to={'/'} />
                }

                <section>
                    <Header voltarTabelas titulo="Contas de Portos" />
                    <br />
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
                                    this.salvarConta(validForm)
                                }}
                            >
                                <Form className="contact-form" onBlur={() => {/*this.verificadorspans()*/ }} >

                                    <div className="row">
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2"></div>

                                        <div className="col-xl-8 col-lg-8 col-md-8 col-sm-8 col-12 ">

                                            <div className="row addservicos">
                                                {!(this.state.portoAtivo && this.state.contaAtiva) &&
                                                    <>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Taxa</label>
                                                        </div>
                                                        <div className="col-1 errorMessage">
                                                        </div>
                                                        <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                                            <Select className='SearchSelect' isDisabled={this.state.taxaAtiva} options={this.state.taxasOptions.filter(e => this.filterSearch(e, this.state.taxasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ taxasOptionsTexto: e }) }} value={this.state.taxasOptions.filter(option => option.value == this.state.taxa)[0]} search={true} onChange={(e) => { if (!this.state.taxaAtiva) { this.setState({ taxa: e.value, taxaAtiva: true }) } }} />
                                                        </div>
                                                        <div className="col-1">
                                                        </div>
                                                    </>
                                                }
                                                {!(this.state.taxaAtiva && this.state.contaAtiva) &&
                                                    <>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Porto</label>
                                                        </div>
                                                        <div className="col-1 errorMessage">
                                                        </div>
                                                        <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                                            <Select className='SearchSelect' isDisabled={this.state.portoAtivo} options={this.state.portosOptions.filter(e => this.filterSearch(e, this.state.portosOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ portosOptionsTexto: e }) }} value={this.state.portosOptions.filter(option => option.value == this.state.porto)[0]} search={true} onChange={(e) => { if (!this.state.portoAtivo) { this.setState({ porto: e.value, portoAtivo: true }) } }} />
                                                        </div>
                                                        <div className="col-1">
                                                        </div>
                                                    </>
                                                }
                                                {!(this.state.taxaAtiva && this.state.portoAtivo) &&
                                                    <>
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Conta</label>
                                                        </div>
                                                        <div className="col-1 errorMessage">
                                                        </div>
                                                        <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                                            <Select className='SearchSelect' isDisabled={this.state.contaAtiva} options={this.state.contasOptions.filter(e => this.filterSearch(e, this.state.contasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ contasOptionsTexto: e }) }} value={this.state.contasOptions.filter(option => option.value == this.state.conta)[0]} search={true} onChange={(e) => { if (!this.state.contaAtiva) { this.setState({ conta: e.value, contaAtiva: true }) } }} />
                                                        </div>
                                                        <div className="col-1">
                                                        </div>
                                                    </>
                                                }


                                                {this.state.portoAtivo && this.state.contaAtiva &&
                                                    <>
                                                        <br /><br /><br />
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Taxas</label>
                                                        </div>
                                                        <div className="col-1 errorMessage">
                                                        </div>
                                                        <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.taxasOptions.filter(e => this.filterSearch(e, this.state.taxasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ taxasOptionsTexto: e }) }} search={true} onChange={(e) => { this.addTaxa(e.value) }} />
                                                            <div>
                                                                {this.state.taxa && this.state.taxa.map((taxa, index) => (
                                                                    <span className='multipleOptions' onClick={() => this.removeTaxa(taxa)}>
                                                                        {this.state.taxasOptions.find((conta) => conta.value == taxa) ? this.state.taxasOptions.find((conta) => conta.value == taxa).label : ""}
                                                                        {this.state.taxa[index+1] ? ", " : ""}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="col-1">
                                                        </div>
                                                    </>
                                                }
                                                {this.state.taxaAtiva && this.state.contaAtiva &&
                                                    <>
                                                        <br /><br /><br />
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Portos</label>
                                                        </div>
                                                        <div className="col-1 errorMessage">
                                                        </div>
                                                        <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.portosOptions.filter(e => this.filterSearch(e, this.state.portosOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ portosOptionsTexto: e }) }} search={true} onChange={(e) => { this.addPorto(e.value);}} />
                                                            <div>
                                                                {this.state.porto && this.state.porto.map((porto, index) => (
                                                                    <span className='multipleOptions' onClick={() => this.removePorto(porto)}>
                                                                        {this.state.portosOptions.find((conta) => conta.value == porto) ? this.state.portosOptions.find((conta) => conta.value == porto).label : ""}
                                                                        {this.state.porto[index+1] ? ", " : ""}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="col-1">
                                                        </div>
                                                    </>
                                                }
                                                {this.state.taxaAtiva && this.state.portoAtivo &&
                                                    <>
                                                        <br /><br /><br />
                                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                            <label>Conta</label>
                                                        </div>
                                                        <div className="col-1 errorMessage">
                                                        </div>
                                                        <div className="col-xl-6 col-lg-5 col-md-5 col-sm-10 col-10">
                                                            <Select className='SearchSelect' options={this.state.contasOptions.filter(e => this.filterSearch(e, this.state.contasOptionsTexto)).slice(0, 20)} onInputChange={e => { this.setState({ contasOptionsTexto: e }) }} value={this.state.contasOptions.filter(option => option.value == this.state.conta)[0]} search={true} onChange={(e) => { this.setState({ conta: e.value }) }} />
                                                        </div>
                                                        <div className="col-1">
                                                        </div>
                                                    </>
                                                }
                                            </div>


                                        </div>
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                    </div>

                                    <div className="row">
                                        <div className="col-2"></div>
                                        <div className="col-8" style={{ display: 'flex', justifyContent: 'center' }}>
                                            <button disabled={!validForm} type="submit" style={validForm ? { width: 150 } : { backgroundColor: '#eee', opacity: 0.3, width: 150, marginRight: 10 }} >Salvar</button>
                                            <button onClick={() => this.reset()} style={{ width: 150, marginLeft: 10 }} >Reset</button>
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

export default connect(mapStateToProps, null)(ContasPortos)

