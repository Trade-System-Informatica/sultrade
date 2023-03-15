import 'react-confirm-alert/src/react-confirm-alert.css'
import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import 'react-confirm-alert/src/react-confirm-alert.css'

import './styles.css'
import { Link } from 'react-router-dom'

class AddButton extends Component {
    state = {
        timer: ""
    }

    render() {
        return (
                <Link to={this.props.addLink}>
            <div className="addButton">
                    <FontAwesomeIcon icon={faPlus} size={60} />
            </div>
                </Link>
        )
    }
}

export default (AddButton)