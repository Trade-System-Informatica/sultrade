import axios from 'axios'

const apiHeroku = axios.create({
    baseURL: "https://apisiacweb.herokuapp.com/sultrade",
    headers: {
        Authorization: '07256661000128', //CNPJ
    },  
    timeout: 30000
})

export default apiHeroku