import { SELECIONA_GRUPO_CLASSIFICADO } from '../actions/actionTypes'

const initialState = {
    classificado: null
}

const reducer = (state = initialState, action) => {
    switch(action.type) {
        case SELECIONA_GRUPO_CLASSIFICADO:
            return{
                ...state,
                classificado: action.payload.grupo
            } 
        default:
            return state
    }
}

export default reducer