import React, {Component} from 'react'
import api from '../../services/api'
import './styles.css'

import OwlCarousel from 'react-owl-carousel'
import 'owl.carousel/dist/assets/owl.carousel.css'
import 'owl.carousel/dist/assets/owl.theme.default.css'

const estadoInicial = {
    promocoes: []
}

class HeroSlider extends Component {

    state = {
        ...estadoInicial
    }

    componentDidMount(){
        this.carregaPromocoes()
    }

    carregaPromocoes = async () => {
        await api.get(`promocoes`, {
        }).then(response => {
        this.setState({promocoes: response.data})
        }) 
    }

    render(){
        return (
            <div>
                <OwlCarousel
                    className="hero-slider"
                    loop
                    margin={20}
                    nav
                    items={1}
                >

                    <div className="item">
                        <img src={require('../../img/slider-1.jpg')} />
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-12">
                                    <h1>2020</h1>
                                    <h2>Coleção<br/>Outono/Inverno</h2>
                                    <a href="#" className="primary-btn">Veja Mais</a>
                                </div>
                            </div>
                        </div>
                    </div>
                        
                    <div className="item">
                        <img src={require('../../img/slider-2.jpg')} />
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-12">
                                    <h1>2020</h1>
                                    <h2>Coleção<br/>Primavera</h2>
                                    <a href="#" className="primary-btn">Veja Mais</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="item">
                        <img src={require('../../img/slider-3.jpg')} />
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-12">
                                    <h1>2020</h1>
                                    <h2>Coleção<br/>Verão</h2>
                                    <a href="#" className="primary-btn">Veja Mais</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="item">
                        <img src={require('../../img/slider-1.jpg')} />
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-12">
                                    <h1>2021</h1>
                                    <h2>Coleção<br/>Inverno</h2>
                                    <a href="#" className="primary-btn">Veja Mais</a>
                                </div>
                            </div>
                        </div>
                    </div>
                        
                    <div className="item">
                        <img src={require('../../img/slider-2.jpg')} />
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-12">
                                    <h1>2022</h1>
                                    <h2>Coleção<br/>Outono</h2>
                                    <a href="#" className="primary-btn">Veja Mais</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="item">
                        <img src={require('../../img/slider-3.jpg')} />
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-12">
                                    <h1>2020</h1>
                                    <h2>Coleção<br/>Outono/Inverno</h2>
                                    <a href="#" className="primary-btn">Veja Mais</a>
                                </div>
                            </div>
                        </div>
                    </div>

                </OwlCarousel>
            </div>
           
        )
    }
}


export default HeroSlider

            /*
            <img src={require(`../../${promocao.url}`)} />
            {promocoes.map(promocao => (
                <div key={promocao.Chave} className="item">
                    <img src={require('../../' + promocao.url)} />
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <h1>{promocao.Nome}</h1>
                            </div>
                        </div>
                    </div>
                </div>  
            ))}  
            
               <OwlCarousel
            className="hero-slider"
            loop
            margin={20}
            nav
            items={1}
        >

            <div className="item">
                <img src={require('../../img/slider-1.jpg')} />
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <h1>2020</h1>
                            <h2>Coleção<br/>Outono/Inverno</h2>
                            <a href="#" className="primary-btn">Veja Mais</a>
                        </div>
                    </div>
                </div>
            </div>
                
            <div className="item">
                <img src={require('../../img/slider-2.jpg')} />
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <h1>2020</h1>
                            <h2>Coleção<br/>Primavera</h2>
                            <a href="#" className="primary-btn">Veja Mais</a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="item">
                <img src={require('../../img/slider-3.jpg')} />
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <h1>2020</h1>
                            <h2>Coleção<br/>Verão</h2>
                            <a href="#" className="primary-btn">Veja Mais</a>
                        </div>
                     </div>
                </div>
            </div>

            <div className="item">
                <img src={require('../../img/slider-1.jpg')} />
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <h1>2021</h1>
                            <h2>Coleção<br/>Inverno</h2>
                            <a href="#" className="primary-btn">Veja Mais</a>
                        </div>
                    </div>
                </div>
            </div>
                
            <div className="item">
                <img src={require('../../img/slider-2.jpg')} />
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <h1>2022</h1>
                            <h2>Coleção<br/>Outono</h2>
                            <a href="#" className="primary-btn">Veja Mais</a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="item">
                <img src={require('../../img/slider-3.jpg')} />
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <h1>2020</h1>
                            <h2>Coleção<br/>Outono/Inverno</h2>
                            <a href="#" className="primary-btn">Veja Mais</a>
                        </div>
                     </div>
                </div>
            </div>

        </OwlCarousel>         
            
            
            */ 
