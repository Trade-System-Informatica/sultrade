import axios from 'axios'

const apiHeroku = axios.create({
    baseURL: "http://ftptrade.ddns.net:3335/sultrade",
    headers: {
        Authorization: '07256661000128', //CNPJ
    },  
    timeout: 30000
})

export default apiHeroku