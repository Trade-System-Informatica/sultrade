import 'react-confirm-alert/src/react-confirm-alert.css'
import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faPaperclip, faTimes, faFileContract } from '@fortawesome/free-solid-svg-icons'
import 'react-confirm-alert/src/react-confirm-alert.css'

import './styles.css'
import { Link } from 'react-router-dom'

class Notification extends Component {
    state = {
    }

    render() {
        return (
            <>
                {this.props.notification.msg &&
                    <div className="notificationWrapper" style={{ bottom: 10 + (85 * this.props.index) }}>
                        <div className={`notificationMessage ${this.props.notification.type === "urgent" ? "notificationUrgent" : ""}`}>
                            <div className="notificationClose">
                                {this.props.link &&
                                <a className="nonLink" target="_blank" href={this.props.link}><FontAwesomeIcon icon={faPaperclip} /></a>
                                }
                                <FontAwesomeIcon icon={faFileContract} />
                                <div onClick={this.props.close} ><FontAwesomeIcon icon={faTimes} /></div>
                            </div>
                            <div style={this.props.notification.type === "urgent" ? { color: "red", fontWeight: "bolder" } : {}}>
                                {this.props.notification.type === "" &&
                                    <FontAwesomeIcon style={{ color: "gold" }} icon={faExclamationTriangle} />
                                }
                                {this.props.notification.type === "urgent" &&
                                    <FontAwesomeIcon style={{ color: "red" }} icon={faExclamationTriangle} />
                                }
                                <Link to={this.props.editAnexo} className="notificationText">
                                    {this.props.notification.msg}
                                </Link>
                            </div>
                        </div>
                    </div>
                }
            </>
        )
    }
}

export default (Notification)