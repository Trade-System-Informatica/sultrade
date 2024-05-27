import axios from 'axios'
import { CAMINHO_API } from '../config'

var url = '187.86.143.231'
if (document.URL.search('10.0.0.220') >= 0) {
    console.log('interno' + document.URL)
    url = '10.0.0.220'
}
var apiClient = axios.create({
    //baseURL: 'http://10.0.0.220:8080/html/site/api/client/',
    //baseURL: `http://ftptrade.ddns.net/sultrade/api/client/`,
    baseURL: `http://132.255.147.28:8080/sultrade/api/client/`,
    timeout: 15000
})

var apiEmployee = axios.create({
    //baseURL: 'http://10.0.0.220:8080/html/site/api/employee/',
    baseURL: `${CAMINHO_API}`,
    //baseURL: `http://localhost/sultrade/api/employee/`,
    timeout: 30000
})



export { apiClient, apiEmployee }