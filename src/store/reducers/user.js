import { USER_LOGGED_IN, USER_LOGGED_OUT, USER_EXTEND_EXPIRATION} from '../actions/actionTypes'
import moment from 'moment'

const initialState = {
    nome: '',
    email: '',
    chave: null,
    token: '',
    expiry: 0,
    justLogged: false,
}

const reducer = (state = initialState, action) => {
    switch(action.type) {
        case USER_LOGGED_IN:
            return{
                ...state,
                nome: action.payload.nome,
                codigo: action.payload.codigo,
                empresa: action.payload.empresa,
                token: null,
                expiry: moment().add(60,'minutes'),
                justLogged: true
            } 
        case USER_EXTEND_EXPIRATION: 
            return {
                ...state,
                nome: action.payload.nome,
                codigo: action.payload.codigo,
                empresa: action.payload.empresa,
                token: null,
                expiry: moment().add(60,'minutes'),
                justLogged: false
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