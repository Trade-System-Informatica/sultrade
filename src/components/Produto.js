import React from 'react'

function Produto({produto, chave}){
    return (
        <div>
            <h2>
                {chave} Produto: {produto.Descricao}. Chave: {chave}
            </h2>
        </div>
    )
}

export default Produto