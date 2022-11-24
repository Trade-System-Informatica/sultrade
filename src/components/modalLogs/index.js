import React, { Component } from 'react'
import './styles.css'
import { Link } from 'react-router-dom'
import Modal from '@material-ui/core/Modal';
import 'react-confirm-alert/src/react-confirm-alert.css'
import moment from 'moment';

const estadoInicial = {
    pesquisa: '',
    tipoPesquisa: 1,
    load: 100,


}


class ModalLogs extends Component {
    state = {
        ...estadoInicial,
    }


    componentDidMount = async () => {
    }

    fecharModal = () => {
        this.props.closeModal();
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
                                <span>{this.props.nome} - ({this.props.chave})</span>
                            </div>

                            {!this.props.logs[0] &&
                                <div style={{width: '100%', textAlign:'center'}}>
                                    <span>-- Nenhum Log Encontrado --</span>
                                </div>
                            }
                            {this.props.logs.map((e, i) => (
                                <div className={`modalItemContent ${i%2 == 0 ? "modalItemPar" : "modalItemImpar"}`}>
                                    <div className='modalItemData'>{moment(e.Data).format('DD/MM/YYYY HH:mm:ss')}</div>
                                    <div className='modalItemOperador'>{e.operadorNome}:</div>
                                    <div className='modalItemCampos'>{e.Campos}</div>
                                </div>
                            ))}


                        </div>


                    </div>
                </div>
            </Modal >

        )
    }

}

export default (ModalLogs)