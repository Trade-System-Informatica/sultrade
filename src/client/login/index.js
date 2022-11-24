import React, {Component} from 'react'
import './styles.css'
import {Formik, Field, Form} from 'formik'
import Logo from '../../img/logos/rgf.png'
import {Link, Redirect} from 'react-router-dom'
import {apiClient} from '../../services/apiamrg'
import axios from 'axios'
import {server, showError, showSuccess} from '../../common'
import {connect} from 'react-redux'
import {login} from '../../store/actions/user'
import md5 from 'md5'

import {confirmAlert} from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'

const estadoInicial = {
    login: 'adm',
    senha: 'rgf10',
    login2: '',
    nome: '',
    token: '',
    redirect: false
}

class Login extends Component {
    
    state = {
        ...estadoInicial
    }

    componentDidMount = () => {

    }

    /*
    signin = async () => {
        
        try{
            const res = await axios.post(`${server}/signinclient`, {
                login: this.state.login,
                senha: this.state.senha,
            })
            //alert(JSON.stringify(res))
            // return 1
            const res2 = await axios.get(`${server}/signinclient/${this.state.login}`)
            //alert(JSON.stringify(res2))
            await this.setState({nome: res2.data.name})
            await this.setState({login2: res2.data.username})
            await this.setState({token: res.data.token})
            await this.props.onLogin({...this.state})
            //alert(this.state.token)            
            axios.defaults.headers.common['Authorization'] = `bearer ${res.data.token}`

            //alert(this.state.nome)
            this.setState({redirect: true})
        }catch(e){
            showError(e)
        }     
    }
    */
   signin = async() => {
       try{          
           await apiClient.post(`login.php`, {
               username: this.state.login,
               password: '752733790960c17265c299f8247681ff'
               //password: md5(this.state.senha)
           }).then(
               async res => {
                    if(res.data == 'false'){
                        confirmAlert({
                            customUI: ({ onClose }) => {
                              return (
                                <div className='custom-ui text-center'>
                                  <h1>Rio Grande Fumigação</h1>
                                  <p>Falha no acesso, usuário ou senha incorretos!</p>
                                  <button 
                                      style={{marginRight: 5}}
                                      className="btn btn-danger w-50"
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
                    }else{
                        confirmAlert({
                            customUI: ({ onClose }) => {
                              return (
                                <div className='custom-ui text-center'>
                                  <h1>Rio Grande Fumigação</h1>
                                  <p>Login realizado!</p>
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
                        await this.setState({token: res.data})
                        await this.props.onLogin({...this.state})
                        await this.setState({redirect: true})
                       
                    }
                },
               async res => alert(res.data) 
           )
       }catch(e){
           alert(e)
       }
   }

    render(){
        return (
            <div className='row'>
                
                {this.state.redirect &&
                    <Redirect to={'/client/inicio'} />
                }
                <div className="col-2"></div>
                <div className="col-xl-8 col-lg-8 col-md-8 col-sm-8 col-8 text-center" id='logoRGF'>
                    <img src={Logo} />
                </div>
                <div className="col-2"></div>
                        
                <div className="col-2"></div>
                <div className="col-8">

                        <Formik 
                            initialValues={{
                                login: '',
                                senha: ''
                            }}
                            onSubmit={async values => {
                                await new Promise(r => setTimeout(r, 500))
                                this.signin()
                            }}
                        >
                            <Form className="contact-form">
                                <div className="row">
                                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 text-center">
                                        <Field value={this.state.login} onChange={e => { this.setState({login: e.currentTarget.value})}} id="login" name="login" type="text" placeholder="Login" />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 text-center">
                                        <Field value={this.state.senha} onChange={e => { this.setState({senha: e.currentTarget.value})}} id="senha" name="senha" type="password" placeholder="Password" />
                                    </div>
                                </div>
                                <div className="row"></div>
                                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 text-right">
                                        <button type="submit" style={{backgroundColor: '#eee', opacity: 0.9}} >Login</button>
                                    </div>
                            </Form>
                        </Formik>
                    </div>
                    <div className="col-2"></div>                
                </div>
                
        
        )
    }
}

const mapDispatchToProps = dispatch => {
    return{
        onLogin: user => dispatch(login(user))
    }
}

export default connect(null, mapDispatchToProps)(Login)


/****  
<Link to={{pathname: `/admin/inicio`}}><button type="submit" style={{backgroundColor: '#eee', opacity: 0.9}} >Entrar</button></Link> 
****/