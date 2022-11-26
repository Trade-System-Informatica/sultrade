import { ADD_SERVER, LIMPA_SERVER} from '../actions/actionTypes'

const initialState = {  
    online: false
}

const reducer = (state = initialState, action) => {
    switch(action.type) {
        case ADD_SERVER:
            return{
                ...state,
                online: action.payload.online
            } 
        case LIMPA_SERVER:
            return{
                ...state,
                online: null
            }
        default:
            return state
    }
}

export default reducer