const serverLocal = 'http://192.168.0.250:3006'
const server = 'http://187.86.138.21:3006'
//const server = 'http://192.168.0.250:3006'

function showError(err) {
    if(err.response && err.response.data){
        alert(`Ocorreu um problema: Mensagem: ${err.response.data}`)
    }else{
        alert(`Ocorreu um problema: Mensagem: ${err}`)
    }
}

function showSuccess(msg){
    alert(`Sucesso! ${msg}`)
}

export {server, serverLocal, showError, showSuccess}