import React, {Component} from 'react'
import Modal from 'react-modal'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faEye, faPersonBooth, faSlidersH, faUserCircle, faWindowClose} from '@fortawesome/free-solid-svg-icons'

const customStyles = {
    content : {
        top                   : '50%',
        left                  : '50%',
        right                 : 'auto',
        bottom                : 'auto',
        marginRight           : '-50%',
        transform             : 'translate(-50%, -50%)'
    }
}

class ModalFumigator extends Component {
    
    render(){
        return (
            <Modal
                isOpen
                style={customStyles}
                contentLabel="Example Modal"
            >
                <h2>Fumigator in Charge</h2>
                <FontAwesomeIcon icon={faWindowClose} size="2x" color="red" onClick={() => this.props.fecharModal()} />
                <div>
                    <p>Nome</p>
                    <p>Email</p>
                    <p>Telefone</p>
                </div>
            </Modal>
        )
    }
}

export default ModalFumigator