import 'react-confirm-alert/src/react-confirm-alert.css'
import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import 'react-confirm-alert/src/react-confirm-alert.css'

import './styles.css'

class Alert extends Component {
    state = {
        timer: ""
    }

    componentDidUpdate = async (prevprops, prevstate) => {
        if (this.props != prevprops && this.props.alert.type !== "confirm") {
            if (this.props.alert.msg) {
                this.setState({ timer: setTimeout(() => this.props.setAlert({ type: "", msg: "" }), 10000) });
            } else {
                clearTimeout(this.state.timer);
            }
        }
    }

    render() {
        return (
            <>
                {this.props.alert.msg &&
                    <div className="centerDivAbsolute" onClick={() => this.props.alert.type == "confirm" ? {} : this.props.setAlert({ type: "", msg: "" })}>
                        <div className={`alertMessage ${this.props.alert.type === "confirm" ? "alertConfirm" : ""}`}>
                            <div className="alertTitle" style={{ color: this.props.alert.type === "error" ? "red" : "gold" }}>{this.props.alert.type == "error" ? "Erro" : ""}</div>
                            <div>
                                {this.props.alert.type === "confirm" &&
                                    <FontAwesomeIcon style={{ color: "gold" }} icon={faExclamationTriangle} />
                                }
                                {this.props.alert.type === "error" &&
                                    <FontAwesomeIcon style={{ color: "red" }} icon={faExclamationTriangle} />
                                }
                                <div style={{ overflow: "scroll", maxHeight: 200, padding: 15 }}>
                                    {this.props.alert.msg}
                                    {this.props.alert.checkboxes && this.props.alert.checkboxes.map((check) => (
                                        <div style={{display: "flex", flexDirection: "row", alignItems: "flex-start"}}>
                                            <input type="checkbox" value={check.value} style={{margin: 10}} onChange={() => this.props.alert.changeCheckbox ? this.props.alert.changeCheckbox(check.chave) : {}} />
                                            <div>{check.label}</div>
                                        </div>
                                    ))}
                                </div>
                                {this.props.alert.type === "confirm" &&
                                    <div className="confirmButtons">
                                        <button className="btn btn-success" style={{ paddingLeft: 15, paddingRight: 15 }} onClick={() => this.props.alertFunction()}>Sim</button>
                                        <button className="btn btn-danger" style={{ paddingLeft: 15, paddingRight: 15 }} onClick={() => this.props.setAlert({ type: "", msg: "" })}>Não</button>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                }
            </>
        )
    }
}

export default (Alert)