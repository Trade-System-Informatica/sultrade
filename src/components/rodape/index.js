import React from 'react'
import './styles.css'

function Rodape(){
    return (

        <footer className='footer_bottom'>
                 <div className='containertradeinfo'>
                    <span style={{ cursor: 'pointer' }} onClick={() => window.open('http://tradesystem.com.br/', '_blank')}>Copyright © Todos os Direitos Reservados | Sistema produzido e distribuido por Trade System</span>
                </div>
        </footer>
    )
}

export default Rodape