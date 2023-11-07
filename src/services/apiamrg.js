import axios from 'axios'
import { CAMINHO_API, CAMINHO_API_EXTERNO } from '../config'

var url = '187.86.143.231'
if (document.URL.search('10.0.0.220') >= 0) {
    console.log('interno' + document.URL)
    url = '10.0.0.220'
}
var apiClient = axios.create({
    //baseURL: 'http://10.0.0.220:8080/html/site/api/client/',
    baseURL: `http://ftptrade.ddns.net/sultrade/api/client/`,
    timeout: 15000
})

var apiEmployee = axios.create({
    //baseURL: 'http://10.0.0.220:8080/html/site/api/employee/',
    baseURL: `${document.URL.search('192.168.59.232') >= 0 ? CAMINHO_API : CAMINHO_API_EXTERNO }`,
    timeout: 30000
})



export { apiClient, apiEmployee }