import { PESQUISAR, LIMPA_PESQUISA} from '../actions/actionTypes'

const initialState = {
    pesquisa: ''
}

const reducer = (state = initialState, action) => {
    switch(action.type) {
        case PESQUISAR:
            return{
                ...state,
                pesquisa: action.payload.pesquisa
            } 
        case LIMPA_PESQUISA:
            return{
                ...state,
                pesquisa: null
            }
        default:
            return state
    }
}

export default reducer