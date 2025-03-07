import React, { Component } from 'react'
import './styles.css'
import { Formik, Field, Form } from 'formik'
import Modal from '@material-ui/core/Modal';
import Select from 'react-select';
import 'react-confirm-alert/src/react-confirm-alert.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import ModalListas from '../modalListas';
import { apiEmployee } from '../../services/apiamrg';
import util from '../../classes/util'

const estadoInicial = {
    pesquisa: '',
    tipoPesquisa: 1,
    load: 100,

    optionsTexto: "",
    itemEdit: {},
    habilitado: false,
    editavelDataFaturamento: true,
    valoresIniciais: {},

    modalAberto: false,
    modal: '',
    modalLista: [],
    modalPesquisa: '',
    fornecedorCusteioAtivo: false,
    pessoas: [],
    pessoasOptions: [],
    pessoasOptionsTexto: '',

    taxas: [],
    taxasOptions: [],
    taxasOptionsTexto: '',
    
    descricoesPadrao: [],
    descricoesPadraoOptions: [],
    descricoesPadraoOptionsTexto: '',
}


class EventoEdit extends Component {
    state = {
        ...estadoInicial,
    }

    componentDidMount() {
        this.setState({
            editavelDataFaturamento: this.props.EventoEdit?.editavelDataFaturamento
        });
    }

    componentDidUpdate = async (prevProps, prevState) => {
        if ((this.props.itemEdit?.valores) && ((!prevProps.itemEdit?.valores) || (!prevProps.aberto && this.props.aberto))) {
            this.setState({
                valoresIniciais: { 
                    valores: [...this.props.itemEdit.valores],
                    onSubmit: this.props.itemEdit.onSubmit 
                }
            });
        }
        if ((this.props.itemEdit?.valores) && ((!prevProps.itemEdit?.valores) || (!prevProps.aberto && this.props.aberto))) {
            let itemEdit = { valores: [...this.props.itemEdit.valores], onSubmit: this.props.itemEdit.onSubmit };

            if (itemEdit.valores.find((e) => e.titulo == "Tipo")?.valor == 0) {
                itemEdit.valores = itemEdit.valores.map((e) => e.titulo == "Repasse" || e.titulo == "Fornecedor" || e.titulo == "Taxa" ? ({ ...e, hidden: false }) : ({ ...e }));
                itemEdit.valores = itemEdit.valores.map((e) => e.titulo == "Taxa" ? ({ ...e, options: this.props.taxas.filter((taxa) => taxa.Tipo == "P")?.map((taxa) => ({ label: taxa.descricao, value: taxa.chave, money: taxa.valor })) }) : ({ ...e }))
            } else if (itemEdit.valores.find((e) => e.titulo == "Tipo")?.valor == 1) {
                itemEdit.valores = itemEdit.valores.map((e) => e.titulo == "Repasse" || e.titulo == "Fornecedor" ? ({ ...e, hidden: true }) : e.titulo == "Taxa" ? ({ ...e, hidden: false }) : ({ ...e }));
                itemEdit.valores = itemEdit.valores.map((e) => e.titulo == "Taxa" ? ({ ...e, options: this.props.taxas.filter((taxa) => taxa.Tipo == "R")?.map((taxa) => ({ label: taxa.descricao, value: taxa.chave, money: taxa.valor })) }) : ({ ...e }))
            } else {
                itemEdit.valores = itemEdit.valores.map((e) => e.titulo == "Repasse" || e.titulo == "Taxa" ? ({ ...e, hidden: true }) : e.titulo == "Fornecedor" ? ({ ...e, hidden: false }) : ({ ...e }));
            }

            if (!itemEdit.valores.find((e) => e.titulo == "Repasse")?.valor) {
                itemEdit.valores = itemEdit.valores.map((e) => e.titulo == "Fornecedor Custeio" ? ({ ...e, hidden: false }) : ({ ...e }));
            } else {
                itemEdit.valores = itemEdit.valores.map((e) => e.titulo == "Fornecedor Custeio" ? ({ ...e, hidden: true }) : ({ ...e }));
            }

            this.setState({
                itemEdit
            })
        }

        if(prevState.itemEdit != this.state.itemEdit){
            console.log('TESTANDO SIFOIIIIIII')
            if(this.state.itemEdit?.valores?.find((e) => e.titulo == "Tipo")?.valor == 0 || this.state.itemEdit?.valores?.find((e) => e.titulo == "Tipo")?.valor == 1){
                if(!this.props.editavel){
                    this.setState({habilitado: false})
                }
            }else {
                this.setState({habilitado: true})
            }
        }
        
    }
    alteraModal = async (valor) => {
        this.setState({ modal: valor });
    }
    alteraCliente = async (valor, categoria) => {
        if (categoria.split('')[1] == '1' && !this.state.fornecedorCusteioAtivo) {
            await this.setState({ fornecedor: valor });
        } else if (categoria.split('')[1] == '1') {
            await this.setState({ fornecedorCusteio: valor });
        }
        await this.setState({ modalAberto: false });
        await this.getPessoas()
    }
    alteraTaxa = async (valor, tipo) => {
        await this.getTaxas()

        if (tipo == "P" && this.state.tipo != 1) {
            await this.setState({ taxa: valor });

            const taxa = this.state.taxasOptions.find((option) => option.value = valor);

            if (taxa) {
                await this.setState({ valor: taxa.money })
            }

        } else if (tipo == "R" && this.state.tipo != 0) {
            await this.setState({ taxa: valor });

            const taxa = this.state.taxasOptions.find((option) => option.value = valor);

            if (taxa) {
                await this.setState({ valor: taxa.money })
            }
        } else if (tipo != "P" && tipo != "R") {
            await this.setState({ taxa: valor });

            const taxa = this.state.taxasOptions.find((option) => option.value = valor);

            if (taxa) {
                await this.setState({ valor: taxa.money })
            }
        }

        await this.setState({ modalAberto: false });
    }
    alteraDescricaoPadrao = async (valor) => {
        await this.setState({ descricao: valor });

        await this.setState({ modalAberto: false });
        await this.getDescricaoPadrao()
    }

    getTaxas = async () => {
        await apiEmployee.post(`getTaxas.php`, {
            token: true,
        }).then(
            async res => {
                await this.setState({ taxas: res.data })

                await this.getTaxasOptions();
            },
            async err => { this.erroApi(err) }
        )
    }
    
    getDescricaoPadrao = async () => {
        await apiEmployee.post(`getDescricaoPadrao.php`, {
            token: true,
        }).then(
            async res => {
                await this.setState({ descricoesPadrao: res.data })

                const options = this.state.descricoesPadrao.map((e) => {
                    return { label: e.descricao, value: e.chave }
                })

                await this.setState({ descricoesPadraoOptions: options })
            },
            async err => { this.erroApi(err) }
        )
    }

    getPessoas = async () => {
        await apiEmployee.post(`getFornecedores.php`, {
            token: true,
        }).then(
            async res => {
                await this.setState({ pessoas: res.data })

                const options = this.state.pessoas.map((e) => {
                    return { label: `${e.Nome_Fantasia ? e.Nome_Fantasia : e.Nome}${e.Cnpj_Cpf ? ` - ${util.formataCPF(e.Cnpj_Cpf)}` : ""}`, value: e.Chave }
                })

                options.unshift({ label: 'Nenhum', value: '' })

                await this.setState({ pessoasOptions: options })
            },
            async err => { this.erroApi(err) }
        )
    }

    changeState = (index, value, half = 0, blur = false) => {
        let itemEdit = { valores: this.state.itemEdit.valores.map((e, i) => i === index ? half == 0 ? ({ ...e, valor: value }) : half == 1 ? ({ ...e, valor1: value }) : ({ ...e, valor2: value }) : ({ ...e })), onSubmit: this.state.itemEdit.onSubmit };
        if (itemEdit.valores.find((e) => e.titulo == "Tipo")?.valor == 0) {
            itemEdit.valores = itemEdit.valores.map((e) => e.titulo == "Repasse" || e.titulo == "Fornecedor" || e.titulo == "Taxa" ? ({ ...e, hidden: false }) : ({ ...e }));
        } else if (itemEdit.valores.find((e) => e.titulo == "Tipo")?.valor == 1) {
            itemEdit.valores = itemEdit.valores.map((e) => e.titulo == "Repasse" || e.titulo == "Fornecedor" ? ({ ...e, hidden: true }) : e.titulo == "Taxa" ? ({ ...e, hidden: false }) : ({ ...e }));
        } else {
            itemEdit.valores = itemEdit.valores.map((e) => e.titulo == "Repasse" || e.titulo == "Taxa" ? ({ ...e, hidden: true }) : e.titulo == "Fornecedor" ? ({ ...e, hidden: false }) : ({ ...e }));
        }

        if (!itemEdit.valores.find((e) => e.titulo == "Repasse")?.valor) {
            itemEdit.valores = itemEdit.valores.map((e) => e.titulo == "Fornecedor Custeio" ? ({ ...e, hidden: false }) : ({ ...e }));
        } else {
            itemEdit.valores = itemEdit.valores.map((e) => e.titulo == "Fornecedor Custeio" ? ({ ...e, hidden: true }) : ({ ...e }));
        }

        if (itemEdit.valores.find((e, i) => i === index)?.titulo == "Tipo") {
            itemEdit.valores = itemEdit.valores.map((e) => e.titulo == "Repasse" ? ({ ...e, valor: false }) : e.titulo == "Taxa" ? ({ ...e, valor: "" }) : ({ ...e }));
            if (itemEdit.valores.find((e) => e.titulo == "Tipo")?.valor == 0) {
                itemEdit.valores = itemEdit.valores.map((e) => e.titulo == "Taxa" ? ({ ...e, options: this.props.taxas.filter((taxa) => taxa.Tipo == "P")?.map((taxa) => ({ label: taxa.descricao, value: taxa.chave, money: taxa.valor })) }) : ({ ...e }))
                itemEdit.valores = itemEdit.valores.map((e) => e.titulo == "Fornecedor" ? ({ ...e, obrigatorio: true }) : e.titulo == "Fornecedor Custeio" ? ({ ...e, obrigatorio: false }) : ({ ...e }))
            } else if (itemEdit.valores.find((e) => e.titulo == "Tipo")?.valor == 1) {
                itemEdit.valores = itemEdit.valores.map((e) => e.titulo == "Taxa" ? ({ ...e, options: this.props.taxas.filter((taxa) => taxa.Tipo == "R")?.map((taxa) => ({ label: taxa.descricao, value: taxa.chave, money: taxa.valor })) }) : ({ ...e }))
                itemEdit.valores = itemEdit.valores.map((e) => e.titulo == "Fornecedor" ? ({ ...e, obrigatorio: false }) : e.titulo == "Fornecedor Custeio" ? ({ ...e, obrigatorio: true }) : ({ ...e }))
            }
        }

        if (itemEdit.valores.find((e, i) => i === index)?.titulo == "Valor unitário" && itemEdit.valores.find((e) => e.titulo == "Repasse")?.valor) {
            itemEdit.valores = itemEdit.valores.map((e) => e.titulo == "VCP" ? ({ ...e, valor: value }) : ({ ...e }));
            if (blur) {
                itemEdit.valores.find((e) => e.titulo == "Valor unitário").onChange2(value);
                itemEdit.valores.find((e) => e.titulo == "VCP").onChange(value);
            }
        } else if (itemEdit.valores.find((e, i) => i === index)?.titulo == "Taxa" && !itemEdit.valores.find((e) => e.titulo == "Repasse")?.valor) {
            const newValue = itemEdit.valores.find((e, i) => i === index)?.options.find((e) => e.value == value)?.money;

            itemEdit.valores = itemEdit.valores.map((e) => e.titulo == "Valor unitário" ? ({ ...e, valor2: newValue ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(newValue) : '0,00' }) : ({ ...e }))
        } else if (itemEdit.valores.find((e, i) => i === index)?.titulo == "Repasse") {
            if (value) {
                const VCP = itemEdit.valores.find((e) => e.titulo == "VCP")?.valor;
                itemEdit.valores = itemEdit.valores.map((e) => e.titulo == "Valor unitário" ? ({ ...e, valor2: VCP }) : ({ ...e }))
                itemEdit.valores = itemEdit.valores.map((e) => e.titulo == "VCP" ? ({ ...e, hidden: true }) : ({ ...e }))
                itemEdit.valores.find((e) => e.titulo == "Valor unitário").onChange2(itemEdit.valores.find((e) => e.titulo == "Valor unitário")?.valor2);
            } else {
                itemEdit.valores = itemEdit.valores.map((e) => e.titulo == "VCP" ? ({ ...e, hidden: false }) : ({ ...e }))
            }
        }

        if (itemEdit.valores.find((e, i) => i === index)?.titulo == "Descrição Padrão") {
            itemEdit.valores = itemEdit.valores.map((e) => e.titulo == "Descrição" ? ({ ...e, valor: value }) : ({ ...e }))
        }

        this.setState({ itemEdit })
        if(!this.props.editavel){
            if(this.state.itemEdit?.valores?.find((e) => e.titulo == "Tipo")?.valor == 0 || this.state.itemEdit?.valores?.find((e) => e.titulo == "Tipo")?.valor == 1){
                this.setState({habilitado: false})
            } else{
                this.setState({habilitado: true})
            }
        }
    }

    fecharModal = () => {
        this.props.closeModal();
    }

    filterSearch = (e, state) => {
        if (e == "") {
            return true
        }

        const text = state.toUpperCase();
        return (e.label.toUpperCase().includes(text))
    }

    verificaAlteracoes = () => {
        const { itemEdit, valoresIniciais } = this.state;
        const { editavel, editavelDataFaturamento } = this.props;
        // Verifica se a OS está encerrada ou faturada
        const osBloqueada = !editavel || !editavelDataFaturamento;
    
        // Se a OS não estiver bloqueada, permite qualquer alteração
        if (!osBloqueada) {
            return true;
        }
    
        // Verifica se o campo "Remarks" foi alterado
        const currentRemark = itemEdit?.valores?.find((e) => e.titulo === "Remarks")?.valor;
        const initialRemark = valoresIniciais?.valores?.find((e) => e.titulo === "Remarks")?.valor;
    
        // Verifica se outros campos (diferentes de "Remarks") foram alterados
        const otherFieldsChanged = itemEdit?.valores?.some((e) => {
            if (e.titulo === "Remarks") {
                return false; // Ignora o campo "Remarks"
            }
            const initialValue = valoresIniciais?.valores?.find((initialE) => initialE.titulo === e.titulo)?.valor;
            return e.valor !== initialValue; // Verifica se o valor foi alterado
        });
    
        if (otherFieldsChanged) {
            return false; // Bloqueia salvamento
        } else if (currentRemark !== initialRemark) {
            return true; // Permite salvamento
        } else {
            return false; // Bloqueia salvamento
        }
    }

    render() {

        if (!this.props.aberto) {
            return (<></>)
        }

        return (
            <div className="contact-section">
                <div className="row">
                    <div className="col-lg-12">
                        <br />

                        <div className="relatoriosSection">
                            <div className="relatorioButton">
                                <button className="btn btn-danger" onClick={() => this.props.openTemplates()}>Carregar template</button>
                            </div>
                        </div>

                        <br />

                        {this.props.acessosPermissoes.filter((e) => { if (e.acessoAcao == this.props.itemPermissao) { return e } }).map((e) => e.permissaoEdita)[0] == 1 &&
                            <Formik
                                initialValues={{
                                    name: '',
                                }}
                                onSubmit={async values => {
                                    if (!this.verificaAlteracoes()) {
                                        alert("Não é possível salvar. Apenas o campo 'Remarks' pode ser alterado.");
                                        return;
                                    }

                                    await this.props.setItemEdit(this.state.itemEdit);
                                    await new Promise(r => setTimeout(r, 1000))
                                    await setTimeout(async () => {
                                        await this.state.itemEdit?.onSubmit();
                                    }, 1000)

                                }}
                            >
                                <Form className="contact-form" >

                                    <div className='row'>
                                        <div className="col-xl-2 col-lg-2 col-md-2 col-sm-2 col-2"></div>

                                        <div className="col-xl-8 col-lg-8 col-md-8 col-sm-12 col-12 ">
                                            <div className='row addservicos'>
                                                <div className="col-12 " style={{ marginBottom: 20 }} >
                                                    {this.props.chave ? console.log(this.props.chave ) : null}
                                                    <h3 style={{ textAlign: "center", color: "white" }}>{this.props.chave == 0 ? "Criar" : "Editar"} evento</h3>
                                                </div>
                                                
                                                {this.state.itemEdit?.valores?.map((valor, index) => (
                                                    <>
                                                        {valor.half && !valor.hidden &&
                                                            <>
                                                                <>
                                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm" >
                                                                        <label>{valor.titulo}</label>
                                                                    </div>
                                                                    <div className='col-1 errorMessage'>
                                                                        {valor.obrigatorio && (!valor.valor1 && valor.valor != "0" || !valor.valor2 && valor.valor != "0") &&
                                                                            <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                        }
                                                                    </div>
                                                                    <div className="fieldDividido col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                                        <select disabled={valor.disabled1} className='form-control nextToInput fieldDividido_1' value={valor.valor1} onChange={async (e) => { this.changeState(index, e.currentTarget.value, 1); await valor.onChange1(e.currentTarget.value) }}>
                                                                            {valor.options1.map((e) => (
                                                                                <option value={e.value}>{e.label}</option>
                                                                            ))}
                                                                        </select>
                                                                        <Field
                                                                            className="form-control fieldDividido_2 text-right"
                                                                            type="text"
                                                                            onClick={(e) => e.target.select()}
                                                                            value={valor.valor2}
                                                                            disabled={valor.disabled2}
                                                                            onChange={async (e) => this.changeState(index, e.currentTarget.value, 2)}
                                                                            onBlur={async (e) => { this.changeState(index, Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '0,00', 2, true); await valor.onBlur2(e.currentTarget.value) }}
                                                                        />
                                                                    </div>

                                                                </>
                                                            </>
                                                        }
                                                        {!valor.half && !valor.hidden &&
                                                            <>
                                                                <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                                    <label>{valor.titulo}</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                    {valor.obrigatorio && !valor.valor && valor.valor != "0" &&
                                                                        <FontAwesomeIcon title='Preencha o campo' icon={faExclamationTriangle} />
                                                                    }
                                                                </div>
                                                                <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                                                    {valor.tipo == "select" &&
                                                                        <Select
                                                                            className='SearchSelect color_black'
                                                                            options={valor.options.filter(e => this.filterSearch(e, this.state.optionsTexto)).slice(0, 20)}
                                                                            onInputChange={e => { this.setState({ optionsTexto: e }); }} value={valor.options.filter(option => option.value == valor.valor)}
                                                                            isDisabled={valor.disabled}
                                                                            search={true}
                                                                            onChange={(e) => { this.changeState(index, e.value); valor.onChange(e.value) }} />
                                                                    }
                                                                    {valor.titulo == 'Fornecedor'?
                                                                    this.props.acessosPermissoes.filter((e) => { if (e.acessoAcao == 'PESSOAS') { return e } }).map((e) => e.permissaoConsulta)[0] == 1 &&
                                                                        <div className='insideFormButton' onClick={() => { this.setState({ modalAberto: true, modal: 'listarCliente', modalPesquisa: this.state.fornecedor, modalLista: this.state.pessoas, fornecedorCusteioAtivo: false }) }}>...</div>
                                                                    : null}
                                                                    
                                                                    {valor.tipo == "money" &&
                                                                        <Field
                                                                            className="form-control text-right"
                                                                            type="text"
                                                                            onClick={(e) => e.target.select()}
                                                                            value={valor.valor}
                                                                            disabled={valor.disabled}
                                                                            onChange={async (e) => { this.changeState(index, e.currentTarget.value) }}
                                                                            onBlur={async e => { this.changeState(index, Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '0,00', 0, true); await valor.onBlur(e.currentTarget.value) }} />
                                                                    }
                                                                    {valor.tipo == "check" &&
                                                                        <input
                                                                            className='form_control'
                                                                            disabled={valor.disabled}
                                                                            checked={valor.valor}
                                                                            onChange={(e) => { this.changeState(index, e.target.checked); valor.onChange(e.target.checked) }}
                                                                            type="checkbox" />
                                                                    }
                                                                    {valor.tipo == "textarea" &&
                                                                        <Field
                                                                            className="form-control textareaFix"
                                                                            as={"textarea"}
                                                                            rows="3"
                                                                            type="text"
                                                                            onClick={(e) => e.target.select()}
                                                                            value={valor.valor}
                                                                            disabled={valor.disabled}
                                                                            onChange={async (e) => { this.changeState(index, e.currentTarget.value) }} />
                                                                    }
                                                                    {valor.tipo != "select" && valor.tipo != "money" && valor.tipo != "check" && valor.tipo != "textarea" &&
                                                                        <Field
                                                                            className="form-control"
                                                                            disabled={valor.disabled}
                                                                            type={valor.tipo}
                                                                            value={valor.valor}
                                                                            onChange={(e) => this.changeState(index, e.currentTarget.value)}
                                                                            onBlur={async (e) => await valor.onChange(e.currentTarget.value)} />
                                                                    }
                                                                </div>
                                                            </>
                                                        }
                                                    </>
                                                ))}


                                            <div className="row">
                                                <div className="col-2"></div>
                                                <div className="col-8" style={{ display: 'flex', justifyContent: 'center' }}>
                                                <button 
                                                    type="submit" 
                                                    disabled={!this.props.valid || !this.verificaAlteracoes()} 
                                                    style={this.props.valid && this.verificaAlteracoes() ? { width: 300, backgroundColor: "white" } : { width: 300 }}
                                                >
                                                    Salvar
                                                </button>
                                                </div>
                                                <div className="col-2"></div>
                                            </div>
                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                            {!this.verificaAlteracoes() && 
                                                <p style={{ display: 'flex', justifyContent: 'center', margin: 'auto', fontWeight: 'bold', color: 'red', marginBottom: 15}}>
                                                    Apenas o campo "Remarks" pode ser alterado quando a OS está encerrada ou faturada.
                                                </p>
                                            }
                                            </div>
                                        </div>
                                    </div>

                                </Form>
                            </Formik>
                        }
                    <ModalListas
                        pesquisa={this.state.modalPesquisa}
                        alteraModal={this.alteraModal}
                        alteraCliente={this.alteraCliente}
                        alteraTaxa={this.alteraTaxa}
                        alteraDescricaoPadrao={this.alteraDescricaoPadrao}
                        acessosPermissoes={this.state.acessosPermissoes}
                        modalAberto={this.state.modalAberto}
                        modal={this.state.modal}
                        modalLista={this.state.modalLista}
                        closeModal={() => { this.setState({ modalAberto: false }) }}
                    />

                    </div>
                </div>
            </div>

        )
    }

}

export default (EventoEdit)