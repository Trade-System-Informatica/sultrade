import {ADD_SERVER, LIMPA_SERVER} from './actionTypes'

export const setserver = servidor => {
    return {
        type: ADD_SERVER,
        payload: servidor
    }
}

export const apagarserver = () => {
    return{
        type: LIMPA_SERVER
    }
}