import {USER_EXTEND_EXPIRATION, USER_LOGGED_IN, USER_LOGGED_OUT} from './actionTypes'

export const login = user => {
    return {
        type: USER_LOGGED_IN,
        payload: user
    }
}

export const extendExpiration = user => {
    return {
        type: USER_EXTEND_EXPIRATION,
        payload: user
    }
}

export const logout = () => {
    return{
        type: USER_LOGGED_OUT
    }
}