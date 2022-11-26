import { requirePropFactory } from '@material-ui/core'
import React from 'react'
import {Link, useLocation, Redirect} from 'react-router-dom'
import './styles.css'

function Rodape(){
 const [mostrar1, setmostrar1] = React.useState(false)
 const [mostrar2, setmostrar2] = React.useState(false)
    return (

        <footer className='footer_bottom'>
                 <div className='containertradeinfo'>
                    <span style={{ cursor: 'pointer' }} onClick={() => window.open('http://tradesystem.com.br/', '_blank')}>Copyright © Todos os DIreitos Reservados | Sistema produzido e distribuido por Trade System</span>
                </div>
        </footer>
    )
}

export default Rodape