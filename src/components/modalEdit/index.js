import React, { Component } from 'react'
import './styles.css'
import { Formik, Field, Form } from 'formik'
import { Link } from 'react-router-dom'
import Modal from '@material-ui/core/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faPen, faPlus, faDollarSign, faHome, faEnvelope } from '@fortawesome/free-solid-svg-icons'
import 'react-confirm-alert/src/react-confirm-alert.css'

const estadoInicial = {
    pesquisa: '',
    tipoPesquisa: 1,
    load: 100,


}


class ModalEdit extends Component {
    state = {
        ...estadoInicial,
    }


    componentDidMount = async () => {
    }

    fecharModal = () => {
        this.props.closeModal();
    }

    deleteItem = async () => {
        this.props.closeModal();
        this.props.itemDelete(this.props.chave, this.props.nome);
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
                                        await this.props.onSubmit();

                                    }}
                                >
                                    <Form className="contact-form" >


                                        <div className="row">

                                            {this.props.itemEditMini.valores.filter((valor) => !valor.hidden).map((valor) => (
                                                <>
                                                    {valor.half &&
                                                        <>
                                                            <>
                                                                <div className="col-12 labelForm">
                                                                    <label>{valor.titulo}</label>
                                                                </div>
                                                                <div className='col-1 errorMessage'>
                                                                </div>
                                                                <div className="fieldDividido col-10">
                                                                    <select className='form-control nextToInput fieldDividido_1' value={valor.valor1} onChange={async (e) => { await valor.onChange1(e.currentTarget.value) }}>
                                                                        {valor.options1.map((e) => (
                                                                            <option value={e.value}>{e.label}</option>
                                                                        ))}
                                                                    </select>
                                                                    <Field className="form-control fieldDividido_2 text-right " type="text" onClick={(e) => e.target.select()} value={valor.valor2} onChange={async (e) => await valor.onChange2(e.currentTarget.value)} onBlur={async e => await valor.onBlur2(e.currentTarget.value)} />
                                                                </div>

                                                            </>
                                                        </>
                                                    }
                                                    {!valor.half &&
                                                        <>
                                                            <div className="col-12 labelForm">
                                                                <label>{valor.titulo}</label>
                                                            </div>
                                                            <div className='col-1 errorMessage'>
                                                            </div>
                                                            <div className="col-10">
                                                                {valor.tipo == "select" &&
                                                                    <select className='form-control nextToInput fieldDividido_1' value={valor.valor} onChange={async (e) => { await valor.onChange(e.currentTarget.value) }}>
                                                                        {valor.options.map((e) => (
                                                                            <option value={e.value}>{e.label}</option>
                                                                        ))}
                                                                    </select>
                                                                }
                                                                {valor.tipo == "money" &&
                                                                    <Field className="form-control text-right " type="text" onClick={(e) => e.target.select()} value={valor.valor} onChange={async (e) => await valor.onChange(e.currentTarget.value)} onBlur={async e => await valor.onBlur(e.currentTarget.value)} />
                                                                }
                                                                {valor.tipo != "select" && valor.tipo != "money" &&
                                                                    <Field className="form-control" type={valor.tipo} value={valor.valor} onChange={async (e) => await valor.onChange(e.currentTarget.value)} />
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
                                                <button type="submit" style={{ width: 300 }} >Enviar</button>
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

export default (ModalEdit)