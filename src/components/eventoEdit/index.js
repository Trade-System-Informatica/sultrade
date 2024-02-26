import React, { Component } from 'react'
import './styles.css'
import { Formik, Field, Form } from 'formik'
import Modal from '@material-ui/core/Modal';
import Select from 'react-select';
import 'react-confirm-alert/src/react-confirm-alert.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'

const estadoInicial = {
    pesquisa: '',
    tipoPesquisa: 1,
    load: 100,

    optionsTexto: "",
    itemEdit: {},
    habilitado: false,
}


class EventoEdit extends Component {
    state = {
        ...estadoInicial,
    }


    componentDidUpdate = async (prevProps, prevState) => {
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

        if (itemEdit.valores.find((e, i) => i === index)?.titulo == "Valor" && itemEdit.valores.find((e) => e.titulo == "Repasse")?.valor) {
            itemEdit.valores = itemEdit.valores.map((e) => e.titulo == "VCP" ? ({ ...e, valor: value }) : ({ ...e }));
            if (blur) {
                itemEdit.valores.find((e) => e.titulo == "Valor").onChange2(value);
                itemEdit.valores.find((e) => e.titulo == "VCP").onChange(value);
            }
        } else if (itemEdit.valores.find((e, i) => i === index)?.titulo == "Taxa" && !itemEdit.valores.find((e) => e.titulo == "Repasse")?.valor) {
            const newValue = itemEdit.valores.find((e, i) => i === index)?.options.find((e) => e.value == value)?.money;

            itemEdit.valores = itemEdit.valores.map((e) => e.titulo == "Valor" ? ({ ...e, valor2: newValue ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(newValue) : '0,00' }) : ({ ...e }))
        } else if (itemEdit.valores.find((e, i) => i === index)?.titulo == "Repasse") {
            if (value) {
                const VCP = itemEdit.valores.find((e) => e.titulo == "VCP")?.valor;
                itemEdit.valores = itemEdit.valores.map((e) => e.titulo == "Valor" ? ({ ...e, valor2: VCP }) : ({ ...e }))
                itemEdit.valores = itemEdit.valores.map((e) => e.titulo == "VCP" ? ({ ...e, hidden: true }) : ({ ...e }))
                itemEdit.valores.find((e) => e.titulo == "Valor").onChange2(itemEdit.valores.find((e) => e.titulo == "Valor")?.valor2);
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
                                                        {!this.props.chave? 
                                                            this.props.editavel ?
                                                                <button type="submit" disabled={!this.props.valid} style={this.props.valid ? { width: 300, backgroundColor: "white" } : { width: 300 }} >Salvar</button>
                                                            :
                                                                <button type="submit" disabled={!this.props.valid && this.state.habilitado} style={this.props.valid && this.state.habilitado ? { width: 300, backgroundColor: "white" } : { width: 300 }} >Salvar</button>
                                                            
                                                        : <button type="submit" disabled={!this.props.valid} style={this.props.valid ? { width: 300, backgroundColor: "white" } : { width: 300 }} >Salvar</button>
                                                        }
                                                    </div>
                                                    <div className="col-2"></div>
                                                </div>
                                                <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                                {!this.props.chave? !this.props.editavel? !this.state.habilitado? <p style={{ display: 'flex', justifyContent: 'center', margin: 'auto' , color: 'white'}}>Os encerrada, somente eventos do tipo: Desconto ou Recebimento de Remessas</p> : null : null : null}
                                            </div>
                                        </div>
                                    </div>

                                </Form>
                            </Formik>
                        }

                    </div>
                </div>
            </div>

        )
    }

}

export default (EventoEdit)