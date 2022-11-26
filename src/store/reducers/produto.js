import { ADD_PROD, REMOVE_PROD, LIST_PROD, ALTERAR_PROD, LIMPAR_CARRINHO, SELECIONA_FRETE, REMOVE_FRETE} from '../actions/actionTypes'

const initialState = {
    produtos: [],
    totalProdutos: 0,
    totalVenda: 0,
    frete: 5
}

const reducer = (state = initialState, action) => {
    switch(action.type) {
        case ADD_PROD:
            return{
                ...state,
                totalProdutos: state.totalProdutos + 1,
                totalVenda: state.totalVenda + action.payload.total,
                produtos: [...state.produtos, action.payload.produtoAdd]
            } 
        
        case REMOVE_PROD:
            var atualizado =  [...state.produtos]  
            var posicao = action.payload.posicao 
            atualizado.splice(posicao, 1)
            return{
                ...state,
                totalProdutos: state.totalProdutos - 1,
                totalVenda: state.totalVenda - action.payload.totalProduto,
                produtos: [...atualizado]
            }
        
        /*case LIST_PROD:
            var atualizado =  [...state.produtos]  
            var posicao = action.payload.posicao 
            atualizado.splice(posicao, 1, [action.payload.produto])
            return{
                ...state,
                produtos: state.produtos,
                totalVenda: state.totalVenda - action.payload.totalAntigo + action.payload.totalProduto,
                produtos: [...atualizado]
            }
        */
        case ALTERAR_PROD:
            var chave = action.payload.chave
            var novaQuantidade = action.payload.qtd
            return{
                ...state,
                produtos: []
            }
        
        case LIMPAR_CARRINHO: 
            return {
                ...state,
                produtos: [],
                totalProdutos: 0,
                totalVenda: 0,
                frete: 0
            }
        case SELECIONA_FRETE:
            return {
                ...state,
                frete: action.payload.frete
            }
        case REMOVE_FRETE:
            return{
                ...state,
                frete: 0
            }
        default:
            return state
    }
}

export default reducer