import {PESQUISAR, LIMPA_PESQUISA} from './actionTypes'

export const pesquisar = pesquisa => {
    return {
        type: PESQUISAR,
        payload: pesquisa
    }
}

export const apagar = () => {
    return{
        type: LIMPA_PESQUISA
    }
}