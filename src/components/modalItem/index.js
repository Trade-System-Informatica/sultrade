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


class ModalItem extends Component {
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
                            {this.props.itens.filter((e) => e.valor).map((e) => (
                                <div className='modalItemContent'>
                                    <div className='modalItemTitulo'>{e.titulo}:</div>
                                    <div className='modalItemValor'>{e.valor}</div>
                                </div>
                            ))}
                            <br />
                            <br />
                            {(this.props.itemContatos || this.props.itemEnderecos) &&
                                <div className='modalItemContent' style={{ marginBottom: '10px' }}>
                                    {this.props.itemContatos &&
                                        <span className='iconelixo giveMargin' type='button' >
                                            <Link to={this.props.itemContatos}
                                            >
                                                <FontAwesomeIcon icon={faHome} />
                                            </Link>
                                        </span>
                                    }
                                    {this.props.itemEnderecos &&
                                        <span className='iconelixo giveMargin' type='button' >
                                            <Link to={this.props.itemEnderecos}
                                            >
                                                <FontAwesomeIcon icon={faEnvelope} />
                                            </Link>
                                        </span>
                                    }
                                </div>
                            }

                            <div className='modalItemContent'>
                                {this.props.itemAdd &&
                                    <span className='iconelixo giveMargin' type='button' >
                                        <Link to={this.props.itemAdd}
                                        >
                                            <FontAwesomeIcon icon={faPlus} />
                                        </Link>
                                    </span>
                                }
                                {this.props.itemEdit &&
                                    <span className='iconelixo giveMargin' type='button' >
                                        <Link to={this.props.itemEdit}
                                        >
                                            <FontAwesomeIcon icon={faPen} />
                                        </Link>
                                    </span>
                                }
                                {this.props.solicitacao &&
                                    <span className='iconelixo giveMargin' type='button' >
                                        <Link to={this.props.itemFinanceiro}
                                        >
                                            <FontAwesomeIcon icon={faDollarSign} />
                                        </Link>
                                    </span>

                                }


                                {this.props.itemDelete && this.props.acessosPermissoes.filter((e) => { if (e.acessoAcao == this.props.itemPermissao) { return e } }).map((e) => e.permissaoDeleta)[0] == 1 &&

                                    <span type='button' className='iconelixo' onClick={(a) => this.deleteItem()} >
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                    </span>
                                }
                            </div>

                            {this.props.itemEditMini && this.props.acessosPermissoes.filter((e) => { if (e.acessoAcao == this.props.itemPermissao) { return e } }).map((e) => e.permissaoEdita)[0] == 1 &&
                                <Formik
                                    initialValues={{
                                        name: '',
                                    }}
                                    onSubmit={async values => {
                                        await new Promise(r => setTimeout(r, 1000))
                                        await this.props.itemEditMini.onSubmit();

                                    }}
                                >
                                    <Form className="contact-form" >


                                        <div className="row">

                                                    {this.props.itemEditMini.valores.map((valor) => (
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
                                                                            <select className='form-control nextToInput fieldDividido_1' value={valor.valor1} onChange={async (e) => {console.log(e.currentTarget.value); await valor.onChange1(e.currentTarget.value)}}>
                                                                                {valor.options1.map((e) => (
                                                                                    <option value={e.value}>{e.label}</option>
                                                                                ))}
                                                                            </select>
                                                                            <Field className="form-control fieldDividido_2 text-right " type="text" onClick={(e) => e.target.select()} value={valor.valor2} onChange={async (e) => await valor.onChange2(e.currentTarget.value)} onBlur={async e => await valor.onBlur2(e.currentTarget.value)} />
                                                                        </div>

                                                                    </>
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

export default (ModalItem)