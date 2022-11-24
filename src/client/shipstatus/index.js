import React, {Component} from 'react'
import {apiClient} from '../../services/apiamrg'
import {connect} from 'react-redux'
import {primary} from '../../commonStyles'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPhotoVideo, faUserCircle, faWindowClose} from '@fortawesome/free-solid-svg-icons'
import moment from 'moment'

import HeaderClient from '../../components/headerclient'
import Picture from '../../components/picture'
import ModalFumigator from '../../components/modalfumigator'
import ProgressBar from 'react-bootstrap/ProgressBar'
import {Link} from 'react-router-dom'
import './styles.css'

let fotos = []
let documents = []

class ShipStatus extends Component {

    state = {
        token: null,
        id: null,
        id_employee: 4,
        feeds: [],
        documents: [],
        ship: [],
        screen: 2,
        modal: false,
        employee: [],
        photosModal: [],
        embarcadores: []
    }

    componentDidMount = async () => {
        await this.setState({token: this.props.token})
        var id = await this.props.match.params.id
        this.setState({ship: this.props.location.query})
        await this.setState({id})
        await this.carregaStatus(id)
        await this.carregaEmployee(this.state.id_employee)
        await this.carregaEmbarcadores(id)
        await this.carregaDocuments(id)
    }

    carregaEmbarcadores = async (id) => {
       // console.log(this.state.token)
        await apiClient.post('clientsships.php', {
            token: this.state.token,
            id_ship: id
        }).then(
            async res => {
                if(res.data == 'false'){
                    alert('Não logado!')
                }else{
                    await this.setState({embarcadores: res.data})
                }
            },
            async res => {
                alert(res.data)
            }
        )
    }

    carregaStatus = async (id) => {
        await apiClient.post('shipstatus.php', {
            token: this.state.token,
            id_ship: id
        }).then(
            async res => {
                if(res.data == 'false'){
                    alert('Não logado!')
                }else{
                    await this.setState({feeds: res.data})
                    this.state.feeds.map(async feed => {
                        feed.pictures && feed.pictures.map(async picture => {                        
                            await fotos.push(picture)
                        })
                    })
                }
            },
            async res => {
                alert(res.data)
            }
        )
    }

    carregaDocuments = async (id) => {
        await apiClient.post('shipDocuments.php', {
            token: this.state.token,
            id_ship: id
        }).then(
            async res => {
                if(res.data == 'false'){
                    alert('Não logado!')
                }else{
                    await this.setState({documents: res.data})
                    console.log(JSON.stringify(this.state.documents))
                }
            },
            async res => {
                alert(res.data)
            }
        )
    }

    carregaEmployee = async (id) => {
        await apiClient.post('contact.php', {
            token: this.state.token,
            id_employee: id
        }).then(
            async res => {
                if(res.data == 'false'){
                    alert('Não logado!')
                }else{
                    await this.setState({employee: res.data})
                }
            },
            async res => {
                alert(res.data)
            }
        )
    }

    openModal = async () => {
        await this.setState({modal: true})
    }

    abreFoto = async (pictures) => {
        await this.setState({photosModal: []})
        await this.setState({photosModal: pictures})
        await this.setState({screen: 5})
    }

    renderFeed(){
        return (
            <div>
                <div className="col-12 text-right">
                    <FontAwesomeIcon style={{cursor: 'pointer'}} onClick={() => this.openModal()} className="bordaCircular" icon={faUserCircle} size="3x" color='white' /> 
                </div>
                {this.state.modal &&
                    <ModalFumigator fumigator={this.state.employee} fecharModal={() => this.setState({modal: false})}/>
                }
                <h2 id="title">Feed {this.state.ship ? `${this.state.ship.name}` : ''}</h2>
                {this.state.feeds.map(feed => (
                    <div key={feed.id} className="row feed">
                        <div className="col-1"></div>
                        <div className="col-10">
                            <div className="row">
                                <div className="col-2 text-center">
                                    <p>{feed.month}/{feed.day}</p>
                                </div>
                                <div className="col-8 text-center">
                                    <p className="textNavio">{feed.text}</p>
                                </div>
                                <div className="col-2 text-center">
                                    {feed.pictures &&
                                        <FontAwesomeIcon
                                            style={{cursor: 'pointer'}} 
                                            onClick={() => { this.abreFoto(feed.pictures)}}
                                            icon={faPhotoVideo} size="2x" color={primary}
                                         />
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="col-1"></div>
                    </div> 
                ))}
            </div>
        )
    }

    renderEmbarcadores(){
        return (
            this.state.embarcadores.map( (embarcador, index) => (
                    <b key={index}>{embarcador.name}, </b>
                )
            )
        )
    }

    renderAbout(){
        return (
            <div>
                <h2 id="title">About {this.state.ship ? `${this.state.ship.name}` : ''}</h2>
                
                <section className="updated">
                    <h4>Updated: {moment(`${this.state.ship.year}-${this.state.ship.month}-${this.state.ship.day}`).format("MMM")}/{this.state.ship.day} {this.state.ship.time}</h4>
                </section>

                <section className="loadingProcess">
                    <h4>Loading Process</h4>
                    <ProgressBar 
                        className="barraProgresso" 
                        now={this.state.ship.shipment / this.state.ship.full_shipment * 100} 
                        label={`${(this.state.ship.shipment / this.state.ship.full_shipment * 100).toFixed(1)}%`}
                        variant={this.state.ship.shipment / this.state.ship.full_shipment * 100 < 100 ? "warning" : "primary"} 
                        animated={this.state.ship.shipment / this.state.ship.full_shipment * 100 < 100 ? true : false} 
                    />
                    <p className="sectionItem"><b className="negrito">Cargo: </b> {this.state.ship.cargo}</p>
                    <p className="sectionItem"><b className="negrito">Quantity: </b> {this.state.ship.shipment} / {this.state.ship.full_shipment} Ton.</p> 
                </section>

                <section className="information">
                    <h4>Information</h4>
                    <p className="sectionItem"><b className="negrito">Shippers: </b> {this.renderEmbarcadores()}</p>
                    <p className="sectionItem"><b className="negrito">Origin: </b> {this.state.ship.seaport_orig}</p>
                    <p className="sectionItem"><b className="negrito">Destination: </b> {this.state.ship.seaport_dest}</p>
                    <p className="sectionItem"><b className="negrito">Terminal: </b> {this.state.ship.terminal}</p>
                    <p className="sectionItem"><b className="negrito">Agent: </b> {this.state.ship.agent}</p>
                    <p className="sectionItem"><b className="negrito">E.T.A.: </b> {this.state.ship.ETA}</p>
                    <p className="sectionItem"><b className="negrito">E.T.B.: </b> {this.state.ship.ETB}</p>
                    <p className="sectionItem"><b className="negrito">E.T.S.: </b> {this.state.ship.ETS}</p>
                    <p className="sectionItem"><b className="negrito">Condemned Cargo: </b> {parseInt(this.state.ship.doomed) === 1 ? 'Yes' : parseInt(this.state.ship.doomed) === 0 ? 'No' : 'Awaiting Information'}</p>
                    <p className="sectionItem"><b className="negrito">Temperature: </b> {this.state.ship.temperature} ºC</p>
                </section>

                <section className="fumigation">
                    <h4>Fumigation</h4>
                    <p className="sectionItem"><b className="negrito">Method: </b> {this.state.ship.type}</p>
                    <p className="sectionItem"><b className="negrito">Dosage: </b> {this.state.ship.dosage} g/m³</p>
                </section>
            </div>
        )
    }

    renderPictures(){
        return (
          
            <Picture fotos={fotos} /> 
            
        )
    }

    renderPicture(){
        return (
            <div className="row">
                <div className="col-12 text-right">
                    <FontAwesomeIcon onClick={async () => await this.setState({screen: 1})} icon={faWindowClose} size="3x" color={primary} />
                </div>
                <div className="col-12 text-center">
                    <Picture fotos={this.state.photosModal} />
                </div>
            </div>  
        )
    }

    renderDocuments(){
        return (
            <div className="row">
                {this.state.documents.length > 0 && this.state.documents.map(document => (
                    <div key={document.id} className="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 text-center">
                        <a 
                            href={`http://rgfumigacao.com.br/api/documents/${document.link}.pdf`} 
                            target='_blank'                                
                        >
                            <p>{document.link}.pdf</p>
                        </a>     
                    </div> 
                ))}
                {this.state.documents.length == 0 &&
                    <div className="col-12 text-center">
                        <h4>Sem documentos</h4>
                    </div>
                }
                
            </div>
            
            
        )
    }

    render(){
        return (
            <div>
                <HeaderClient voltar/>
                <div className="row">
                    <div className="col-6 col-sm-6 col-md-6 col-lg-3 col-xl-3"><button onClick={async () => await this.setState({screen: 1})} className="btn btn-success w-100">Feed</button></div>
                    <div className="col-6 col-sm-6 col-md-6 col-lg-3 col-xl-3"><button onClick={async () => await this.setState({screen: 2})} className="btn btn-primary w-100">About</button></div>
                    <div className="col-6 col-sm-6 col-md-6 col-lg-3 col-xl-3"><button onClick={async () => await this.setState({screen: 3})} className="btn btn-secondary w-100">Pictures</button></div>
                    <div className="col-6 col-sm-6 col-md-6 col-lg-3 col-xl-3"><button onClick={async () => await this.setState({screen: 4})} className="btn btn-light w-100">Documents</button></div>
                </div>
                {this.state.screen == 1 &&
                    this.renderFeed()
                }
                {this.state.screen == 2 &&
                    <div className="row">
                         <div className="col-1 col-sm-1 col-md-2 col-lg-3 col-xl-4"></div>
                         <div className="col-10 col-sm-10 col-md-8 col-lg-6 col-xl-4">
                            {this.renderAbout()}
                         </div>
                         <div className="col-1 col-sm-1 col-md-2 col-lg-3 col-xl-4"></div>
                    </div> 
                }
                {this.state.screen == 3 &&
                    this.renderPictures()
                }
                {this.state.screen == 4 &&
                    this.renderDocuments()
                }

                {this.state.screen == 5 &&
                    this.renderPicture()
                }
            </div>
        )
    }
}

const mapStateToProps = ({user}) => {
    return{
        token: user.token
    }
}

export default connect(mapStateToProps, null)(ShipStatus)
