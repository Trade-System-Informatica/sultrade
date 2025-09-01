import axios from 'axios'

const apiHeroku = axios.create({
    baseURL: "https://apisiacweb.herokuapp.com/sultrade",
    //baseURL: "http://localhost:3334/sultrade",
    headers: {
        Authorization: '07256661000128', //CNPJ
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },  
    timeout: 240000
})

// Interceptor para garantir que os headers CORS sejam sempre enviados
apiHeroku.interceptors.request.use(
    (config) => {
        config.headers['Access-Control-Allow-Origin'] = '*';
        config.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        config.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiHeroku