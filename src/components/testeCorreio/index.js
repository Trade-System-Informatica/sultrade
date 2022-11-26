import React from 'react'
import './styles.css'
import api from '../../services/api'

function TesteCorreio(){
    const id = 18230

    /*
    async function handleCarregarProduto(id){
        try{
            await api.get(`produtos/${id}`, {
            });
            setProduto(produtos.filter(produto => produto.chave !== id));
        }catch(err){
            alert("Produto inexistente no sistema");
        }
    }
    */
	
	function teste(){
		let Correios = require('node-correios')
		let correios = new Correios()
		/*
		correios.consultaCEP({cep: '96211090'})
		.then(result => {
			console.log(result)
		  })
		  .catch(error => {
			console.log(error)
		  })
		*/
		  let args = {
			  nCdServico: '04510',
			  sCepOrigem: '96211090',
			  sCepDestino: '96200090',
			  nVlPeso: '1',
			  nCdFormato: 1,
			  nVlComprimento: 0.25,
			  nVlAltura: 0.16,
			  nVlDiametro: 0.10
		  }

		  correios.calcPreco(args)
		  .then(result => {
			  console.log(result)
		  })
		  .catch(error => {
			  console.log(error)
		  })
	}
	
    return (
        <div>
            <h1>Detalhes do Produto</h1>
            <p>Produto Descricao</p>
            <p> R$66,66</p>
			<button onClick={teste}>API Correios</button>
        </div>
    )
}

export default TesteCorreio