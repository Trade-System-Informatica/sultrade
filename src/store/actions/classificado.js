import {SELECIONA_GRUPO_CLASSIFICADO} from './actionTypes'

export const grupoClassificado = classificado => {
    return {
        type: SELECIONA_GRUPO_CLASSIFICADO,
        payload: classificado
    }
}