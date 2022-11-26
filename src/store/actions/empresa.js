import {EMPRESA_LOGGED_IN, EMPRESA_LOGGED_OUT} from './actionTypes'

export const login = empresa => {
    return {
        type: EMPRESA_LOGGED_IN,
        payload: empresa
    }
}

export const logout = () => {
    return{
        type: EMPRESA_LOGGED_OUT
    }
}