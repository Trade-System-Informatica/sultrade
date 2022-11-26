import { USER_LOGGED_IN, USER_LOGGED_OUT} from '../actions/actionTypes'

const initialState = {
    nome: '',
    email: '',
    chave: null,
    token: ''
}

const reducer = (state = initialState, action) => {
    switch(action.type) {
        case USER_LOGGED_IN:
            return{
                ...state,
                nome: action.payload.nome,
                codigo: action.payload.codigo,
                empresa: action.payload.empresa,
                token: null
            } 
        case USER_LOGGED_OUT:
            return{
                ...state,
                nome: null,
                codigo: null,
                token: ''
            }
        default:
            return state
    }
}

export default reducer
/*
http://tacharrg.ddns.net/siacweb/web.php/ecommerce/venda_detalhe/57180011
*/ 