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
        if (this.props != prevprops) {
            if (this.props.alert.msg) {
                this.setState({timer: setTimeout(() => this.props.setAlert({type: "", msg: ""}), 10000)});
            } else {
                clearTimeout(this.state.timer);
            }
        }
    }

    render() {
        return (
            <>
            {this.props.alert.msg &&
            <div className="centerDiv" onClick={() => this.props.setAlert({type: "", msg: ""})}>
                <div className="alertMessage">
                    <div className="alertTitle" style={{color: this.props.alert.type === "error" ? "red" : "green"}}>{this.props.alert.type}</div>
                    <div>
                        {this.props.alert.type === "error" &&
                            <FontAwesomeIcon style={{color: "red"}} icon={faExclamationTriangle}/>
                        }
                        {this.props.alert.msg}
                    </div>    
                </div>
            </div>
            }
        </>
        )
    }
}

export default (Alert)