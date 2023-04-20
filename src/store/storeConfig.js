import {createStore, combineReducers} from 'redux'
import {persistStore, persistReducer} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import userReducer from './reducers/user'
import produtosReducer from './reducers/produto'
import empresaReducer from './reducers/empresa'
import pesquisaReducer from './reducers/pesquisa'
import classificadoReducer from './reducers/classificado'
import servidorReducer from './reducers/server'

const persistConfig = {
    key: 'root',
    storage,
}

const reducers = combineReducers({
    user: userReducer,
    produtos: produtosReducer,
    empresa: empresaReducer,
    pesquisa: pesquisaReducer,
    classificado: classificadoReducer,
    servidor: servidorReducer
})

const persistedReducer = persistReducer(persistConfig, reducers)
const storeConfig = createStore(persistedReducer)
const persistor = persistStore(storeConfig)

export {storeConfig, persistor}
