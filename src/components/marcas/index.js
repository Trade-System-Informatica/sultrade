import React, {useState, useEffect} from 'react'
import api from '../../services/api'
import './styles.css'
import OwlCarousel from 'react-owl-carousel'
import 'owl.carousel/dist/assets/owl.carousel.css'
import 'owl.carousel/dist/assets/owl.theme.default.css'
import { requirePropFactory } from '@material-ui/core'

function Marcas(){
    return (

        <OwlCarousel
        className="hero-slider"
        loop
        margin={10}
        nav
        items={3}
    >       

    </OwlCarousel>
    )
}

export default Marcas