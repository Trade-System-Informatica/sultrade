import axios from 'axios'

const apiHeroku = axios.create({
    baseURL: "https://apisiacweb.herokuapp.com/sultrade",
    //baseURL: "http://localhost:3334/sultrade",
    headers: {
        Authorization: '07256661000128', //CNPJ
    },  
    timeout: 240000
})

export default apiHeroku