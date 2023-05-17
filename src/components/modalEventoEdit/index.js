import React, { Component } from 'react'
import './styles.css'
import { Formik, Field, Form } from 'formik'
import Modal from '@material-ui/core/Modal';
import Select from 'react-select';
import 'react-confirm-alert/src/react-confirm-alert.css'

const estadoInicial = {
    pesquisa: '',
    tipoPesquisa: 1,
    load: 100,

    optionsTexto: "",
    itemEdit: {},
}


class ModalEventoEdit extends Component {
    state = {
        ...estadoInicial,
    }


    componentDidUpdate = async (prevProps, prevState) => {
        if (!prevProps.itemEdit?.valores && this.props.itemEdit?.valores) {
            let itemEdit = { valores: [...this.props.itemEdit.valores], onSubmit: this.props.itemEdit.onSubmit };

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

            this.setState({
                itemEdit
            })
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

        if (itemEdit.valores.find((e, i) => i === index)?.titulo == "VCP" && itemEdit.valores.find((e) => e.titulo == "Repasse")?.valor) {
            itemEdit.valores = itemEdit.valores.map((e) => e.titulo == "Valor" ? ({ ...e, valor2: value }) : ({ ...e }));
            if (blur) {
                itemEdit.valores.find((e) => e.titulo == "Valor").onChange2(value);
                itemEdit.valores.find((e) => e.titulo == "VCP").onChange(value);
            }
        } else if (itemEdit.valores.find((e, i) => i === index)?.titulo == "Taxa" && !itemEdit.valores.find((e) => e.titulo == "Repasse")?.valor) {
            itemEdit.valores = itemEdit.valores.map((e) => e.titulo == "Valor" ? ({ ...e, valor2: itemEdit.valores.find((e, i) => i === index)?.options.find((e) => e.value == value)?.money }) : ({ ...e }))
        } else if (itemEdit.valores.find((e, i) => i === index)?.titulo == "Repasse") {
            if (value) {
                const VCP = itemEdit.valores.find((e) => e.titulo == "VCP")?.valor;
                itemEdit.valores = itemEdit.valores.map((e) => e.titulo == "Valor" ? ({ ...e, valor2: VCP, disabled2: true }) : ({ ...e }))
                itemEdit.valores.find((e) => e.titulo == "Valor").onChange2(itemEdit.valores.find((e) => e.titulo == "Valor")?.valor2);
            } else {
                itemEdit.valores = itemEdit.valores.map((e) => e.titulo == "Valor" ? ({ ...e, disabled2: false }) : ({ ...e }))
            }
        }

        this.setState({ itemEdit })
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

        return (
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                style={{ display: 'flex', overflow: 'scroll' }}
                open={this.props.modalAberto}
                onClose={async () => await this.setState({ modalAberto: false })}
            >
                <div className='modalItemContainer darkBack'>
                    <div className='modalCriar' >
                        <div className='containersairlistprodmodal'>
                            <div className='botaoSairModal' onClick={async () => { await this.fecharModal() }}>
                                <span>X</span>
                            </div>
                        </div>
                        <div className='modalContent darkBack'>
                            <div className='tituloModal'>
                                <span>{this.props.nome}</span>
                            </div>
                            <br />

                            {this.props.acessosPermissoes.filter((e) => { if (e.acessoAcao == this.props.itemPermissao) { return e } }).map((e) => e.permissaoEdita)[0] == 1 &&
                                <Formik
                                    initialValues={{
                                        name: '',
                                    }}
                                    onSubmit={async values => {
                                        await new Promise(r => setTimeout(r, 1000))
                                        await this.state.itemEdit?.onSubmit();

                                    }}
                                >
                                    <Form className="contact-form" >


                                        <div className="row edit_modal_wrapper">

                                            {this.state.itemEdit?.valores?.map((valor, index) => (
                                                <>
                                                    {valor.half && !valor.hidden &&
                                                        <>
                                                            <>
                                                                <div className="col-12 labelForm edit_modal_label" >
                                                                    <label>{valor.titulo}</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                </div>
                                                                <div className="fieldDividido col-10 edit_modal_input">
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
                                                                        onBlur={async (e) => { this.changeState(index, Number(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) ? new Intl.NumberFormat('pt-BR').format(e.currentTarget.value.replaceAll('.', '').replaceAll(',', '.')) : '0,00', 2, true); await valor.onBlur2(e.currentTarget.value) }}
                                                                    />
                                                                </div>

                                                            </>
                                                        </>
                                                    }
                                                    {!valor.half && !valor.hidden &&
                                                        <>
                                                            <div className="col-12 labelForm edit_modal_label">
                                                                <label>{valor.titulo}</label>
                                                            </div>
                                                            <div className='col-1 errorMessage'>
                                                            </div>
                                                            <div className="col-10  edit_modal_input">
                                                                {valor.tipo == "select" &&
                                                                    <Select
                                                                        className='SearchSelect color_black'
                                                                        options={valor.options.filter(e => this.filterSearch(e, this.state.optionsTexto)).slice(0, 20)}
                                                                        onInputChange={e => { this.setState({ optionsTexto: e }) }} value={valor.options.filter(option => option.value == valor.valor)}
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
                                                                {valor.tipo != "select" && valor.tipo != "money" && valor.tipo != "check" &&
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

                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                        </div>

                                        <div className="row">
                                            <div className="col-2"></div>
                                            <div className="col-8" style={{ display: 'flex', justifyContent: 'center' }}>
                                                <button type="submit" disabled={!this.props.valid} style={this.props.valid ? { width: 300, backgroundColor: "white" } : { width: 300 }} >Salvar</button>
                                            </div>
                                            <div className="col-2"></div>
                                        </div>

                                    </Form>
                                </Formik>
                            }

                        </div>


                    </div>
                </div>
            </Modal >

        )
    }

}

export default (ModalEventoEdit)