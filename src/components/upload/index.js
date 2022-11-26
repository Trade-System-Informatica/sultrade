import React, {Component} from 'react'
/*
const express = require('express')
	, app = express()
	, multer = require('multer')

// cria uma instância do middleware configurada
const upload = multer({ dest: 'uploads/' })

app.use(express.static('public'))
*/

// rota indicado no atributo action do formulário
class Upload extends Component {

    render(){
        
        return (
            <h2>Upload realizado com sucesso</h2>
        )
    }
} 

export default Upload

