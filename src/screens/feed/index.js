import React, {Component} from 'react'
import Header from '../../components/header'
import './styles.css'
import {api} from '../../services/api'

import ImageGallery from 'react-image-gallery'

const images = [
    {
      original: 'https://picsum.photos/id/1018/1000/600/',
      thumbnail: 'https://picsum.photos/id/1018/250/150/',
    },
    {
      original: 'https://picsum.photos/id/1015/1000/600/',
      thumbnail: 'https://picsum.photos/id/1015/250/150/',
    },
    {
      original: 'https://picsum.photos/id/1019/1000/600/',
      thumbnail: 'https://picsum.photos/id/1019/250/150/',
    },
  ]

const estadoInicial = {
    employees: [],
    loading: false,
    shipsPerSeaport: [],
    seaports: []
}
/*
const itens = {
    return (

    )
}
*/

class Feed extends Component {
    
    state = {
        ...estadoInicial
    }

    componentDidMount = () => {
        this.getEmployees()
        this.getSeaports()
        this.intervalo()
        //this.getShipsPerSeaport(4)
    }

    intervalo = async () => {
        await this.state.seaports.map(porto => {
            //setInterval(this.alterarPorto(porto.id), 2000)
            return (
            <div key={porto.id}>
                <p>{porto.name}</p>
            </div>
        )}
        )
       
    }

    alterarPorto = async (posicao) => {
        await this.getShipsPerSeaport(posicao)
    }

    getEmployees = async () => {
        await api.get(`employees`, {
        }).then(response => {
            this.setState({employees: response.data})
        })
        await this.setState({loading: false}) 
    }

    getSeaports = async () => {
        await api.get(`seaports`, {
        }).then(response => {
            this.setState({seaports: response.data})
        })

        await this.setState({loading: false}) 
    }

    getShipsPerSeaport = async (seaport) => {
        await api.get(`shipsperseaport/${seaport}`, {
        }).then(res => {
            this.setState({shipsPerSeaport: res.data})
        })
    }

    renderSeaports(){
        
        return (
            <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 text-center">
                {this.state.seaports.map(porto => (
                    <p key={porto.id}>{porto.name}</p>
                ))}
            </div>
        )

    }

    render(){
        
        return(
            <div>
                <Header />
                <div className="product-filter">
                    
                    <div className="row">
                        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 text-center">
                            <div className="section-title">
                                <h3>Rio Grande Fumigação - Feed</h3>
                            </div>
                        </div>


                        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 text-center">
                            {this.state.shipsPerSeaport.map(e => (
                                <p key={e.id}>{e.name}</p>
                            ))}
                        </div>
                        
                        {this.renderSeaports()}
                        
                    </div>

                </div>
            </div>
        )

    }
    
}

export default Feed

/*** 
    <ImageGallery items={images} lazyLoad={true}/>
    <div>
        {this.state.employees.map(e => (
            <p key={e.id}>{e.username}</p>
        ))}
    </div>
 
 * ***/