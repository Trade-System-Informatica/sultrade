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

    gruposEscolhidos: [],
    optionsTexto: "",
}


class ModalCopiarCampos extends Component {
    state = {
        ...estadoInicial,
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
        const validations = [];
        validations.push(this.props.campos.find((e) => e.checked));
        validations.push(this.state.gruposEscolhidos[0]);
        
        const validForm = validations.reduce((a,b) => a && b);

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

                                <Formik
                                    initialValues={{
                                        name: '',
                                    }}
                                    onSubmit={async values => {
                                        await new Promise(r => setTimeout(r, 1000))
                                        await this.props.onSubmit(this.state.gruposEscolhidos);

                                    }}
                                >
                                    <Form className="contact-form" >


                                        <div className="row edit_modal_wrapper">
                                            <div className="col-12">
                                                <label className="center">Campos</label>
                                            </div>
                                            {this.props.campos?.map((campo, i) => (
                                                <>
                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                        <label>{campo.nome}</label>
                                                    </div>
                                                    <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                                        <Field type="checkbox" name={campo.nome} checked={campo.checked} onChange={async e => { await campo.onChange(i) } } />
                                                    </div>
                                                </>
                                            ))}
                                        <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12 col-12 labelForm">
                                            <label>Copiar para</label>
                                        </div>
                                        <div className='col-1 errorMessage'>
                                        </div>
                                        <div className="col-xl-6 col-lg-6 col-md-6 col-sm-10 col-10 ">
                                            <Select className='SearchSelect color_black' options={this.props.subgruposOptions} search={true} onChange={(e) => { this.setState({ gruposEscolhidos: [...this.state.gruposEscolhidos, e.value] }) }} />
                                            {this.state.gruposEscolhidos.map((e, i) =>{
                                                return (
                                                <span class="click_to_erase" onClick={() => this.setState({ gruposEscolhidos: this.state.gruposEscolhidos.filter((c) => c != e) })}>{`${this.props.subgruposOptions.find((p) => p.value == e)?.label}${i != this.state.gruposEscolhidos.length - 1 ? ', ' : ' '}`}</span>
                                            )})}
                                        </div>
                                            

                                            <div className="col-xl-2 col-lg-2 col-md-2 col-sm-1 col-1"></div>
                                        </div>

                                        <div className="row">
                                            <div className="col-2"></div>
                                            <div className="col-8" style={{ display: 'flex', justifyContent: 'center' }}>
                                                <button type="submit" disabled={!validForm} style={validForm ? { width: 300, backgroundColor: "white" } : { width: 300 }} >Salvar</button>
                                            </div>
                                            <div className="col-2"></div>
                                        </div>

                                    </Form>
                                </Formik>

                        </div>


                    </div>
                </div>
            </Modal >

        )
    }

}

export default (ModalCopiarCampos)