import React, {Component} from 'react'
import Logo from '../../img/logos/rgf.png'
import {Link, Redirect} from 'react-router-dom'
import {logout} from '../../store/actions/user'
import {connect} from 'react-redux'

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faSignOutAlt, faArrowLeft} from '@fortawesome/free-solid-svg-icons'

import {confirmAlert} from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'

class HeaderClient extends Component {
 
    state = {
        token: '',
        nome: '',
        redirect: false
    }

    fazerLogout = async () => {
        await this.props.onLogout()
        confirmAlert({
            customUI: ({ onClose }) => {
              return (
                <div className='custom-ui text-center'>
                  <h1>Rio Grande Fumigação</h1>
                  <p>Logout realizado!</p>
                  <button 
                      style={{marginRight: 5}}
                      className="btn btn-success w-50"
                      onClick={
                          async () => {
                              onClose()
                          }
                      }
                  >
                      Ok
                  </button>
                </div>
              )
            }
        })
        //alert('Logout realizado!')
        await this.setState({redirect: true})
    }

    render(){
        return (
            <div className="row">
                {this.state.redirect &&
                    <Redirect to={'/client/login'} />
                }
                
                    <div className="col-xl-1 col-lg-1 col-md-1 col-sm-1 col-1 text-center">
                        {this.props.voltar &&
                            <Link to={{pathname: `/client/inicio`}}>
                                <FontAwesomeIcon cursor="pointer" icon={faArrowLeft} color="#17386b" size="2x" />
                            </Link>
                        }
                        {this.props.voltarShips &&
                            <Link to={{pathname: `/admin/ships`}}>
                                <FontAwesomeIcon cursor="pointer" icon={faArrowLeft} color="#17386b" size="2x" />
                            </Link>
                        }
                        {this.props.voltarClient &&
                            <Link to={{pathname: `/admin/clients`}}>
                                <FontAwesomeIcon cursor="pointer" icon={faArrowLeft} color="#17386b" size="2x" />
                            </Link>
                        }
                        {this.props.voltarEmployee &&
                            <Link to={{pathname: `/admin/employees`}}>
                                <FontAwesomeIcon cursor="pointer" icon={faArrowLeft} color="#17386b" size="2x" />
                            </Link>
                        }
                        {this.props.voltarFeed &&
                            <Link to={{pathname: `/admin/feeds`}}>
                                <FontAwesomeIcon cursor="pointer" icon={faArrowLeft} color="#17386b" size="2x" />
                            </Link>
                        }
                        {this.props.voltarSeaport &&
                            <Link to={{pathname: `/admin/seaports`}}>
                                <FontAwesomeIcon cursor="pointer" icon={faArrowLeft} color="#17386b" size="2x" />
                            </Link>
                        }
                    </div>
                    <div className="col-xl-8 col-lg-8 col-md-8 col-sm-8 col-8 text-center">
                        <Link to={{pathname: `/client/inicio`}}>
                            <img alt='logo' className="img-fluid logologado" src={Logo} style={{alignItems: 'center', justifyContent: 'center'}}/>
                        </Link>
                    </div>
                    <div className="col-xl-1 col-lg-1 col-md-1 col-sm-1 col-1 text-center">
                        <FontAwesomeIcon cursor="pointer" onClick={() => this.fazerLogout()} icon={faSignOutAlt} color="#d21524" size="2x" />
                    
                    </div>
                
            </div>
        )
    }
}

const mapDispatchToProps = dispatch => {
    return{
        onLogout: user => dispatch(logout(user))
    }
}

export default connect(null, mapDispatchToProps)(HeaderClient)