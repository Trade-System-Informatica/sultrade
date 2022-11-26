import axios from 'axios'
/*
let api = axios.create({
    baseURL: 'http://127.0.0.1:3006/',
});
*/

const teste =  async() =>{
let ip =  await axios.get('http://ip-api.com/json')

}
teste()

let apiLocal = axios.create({
    baseURL: 'http://192.168.0.250:3006/'
})

let api = axios.create({
    baseURL: 'http://187.86.138.21:3006/'
})

let localUrl = 'http://192.168.0.250:3006/'
let onlineUrl = 'http://187.86.138.21:3006/'

export {api, apiLocal, localUrl, onlineUrl}