import moment from 'moment'

export default class Util {

    static completarZerosEsquerda(str, length) {
        const resto = length - String(str).length
        return '0'.repeat(resto > 0 ? resto : '0') + str
    }

    static formataData(data) {
        return moment(data).format('yyyy-MM-DD')
    }

    static async getBase64(file) {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.onerror = (err) => {
                reject(err)
            };
        })
    }

    static async removeSimbolos(string, retirarEspacos = true, numerico = true) {

        if (retirarEspacos) {
            string = string.trim();
        }
        string = string.replaceAll("nº", ",").replaceAll("Nº", ",").replaceAll("'", "")
        string = string.replaceAll("ª", "").replaceAll("º", "").replaceAll(".", "")
        if (numerico) {
            string = string.replaceAll("-", "")
        }
        string = string.replaceAll("(", "").replaceAll(")", "").replaceAll("*", "")
        string = string.replaceAll("/", "").replaceAll("\\", "").replaceAll("", "")
        string = string.replaceAll("@", "").replaceAll("%", "").replaceAll("&", "")

        if (retirarEspacos) {
            string = string.trim();
        }
        return string;
    }

    static async apenasNumeros(string) {
        if (typeof string == "string") {
            return string.replace(/\D/g,'');
        } 

        return "";
    }

    static async formataDinheiroEstrangeiro(valor) {
        if (typeof valor != "string") {
            valor += "";
        }

        if (isNaN(parseInt(valor))) {
            return "";
        }

        return parseFloat(valor.replace('.','').replace(',','.')).toFixed(2);
    }

    static async formataDinheiroBrasileiro(valor) {
        if (typeof valor != "string") {
            valor += "";
        }

        if (isNaN(parseInt(valor))) {
            return "";
        }

        return new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor);
    }

    static returnIfExists(item, item2) {
        if (item && item2) {
            return item2;
        } else {
            return '';
        }
    }

    static letrasMinusculas(palavra) {
        return palavra.toLowerCase()
    }

    static removeAcentos(entrada) {

        let com_acento = "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝŔÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿŕ"
        let sem_acento = "AAAAAAACEEEEIIIIDNOOOOOOUUUUYRsBaaaaaaaceeeeiiiionoooooouuuuybyr"
        let novastr = ""

        if (entrada) {
            for (let i = 0; i < entrada.length; i++) {
                let troca = false
                for (let a = 0; a < com_acento.length; a++) {
                    if (entrada.substr(i, 1) == com_acento.substr(a, 1)) {
                        novastr += sem_acento.substr(a, 1)
                        troca = true
                        break
                    }
                }
                if (troca == false) {
                    novastr += entrada.substr(i, 1)
                }
            }
            return novastr;
        } else {
            return entrada;
        }

    }

    static removerEspacosEntrePalavras(data) {
        return data.replace(/\s/g, '')
    }

    static completarPictures(valor) {
        return `http://ftptrade.ddns.net/lpc/api/pictures/${valor}.png`
    }

    static testaCPF(strCPF) {
        let soma
        let resto
        let i
        soma = 0
        if (strCPF == "00000000000") return false

        for (i = 1; i <= 9; i++) soma = soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i)
        resto = (soma * 10) % 11

        if ((resto == 10) || (resto == 11)) resto = 0
        if (resto != parseInt(strCPF.substring(9, 10))) return false

        soma = 0
        for (i = 1; i <= 10; i++) soma = soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i)
        resto = (soma * 10) % 11

        if ((resto == 10) || (resto == 11)) resto = 0
        if (resto != parseInt(strCPF.substring(10, 11))) return false
        return true
    }

    static encrypt(entrada) {
        try {
            let saida = ""
            let temp = ""
            temp = this.inverterString(entrada)
            temp.map(item => {
                saida = saida + `${String.fromCharCode(item.charCodeAt(0) + 120)}`
            })
            return saida
        } catch (e) {
            console.log(e.message)
        }
    }


    static decrypt(entrada) {
        try {
            let saida = ""
            let temp = ""
            temp = this.inverterString(entrada)
            temp.map(item => {
                saida = saida + `${String.fromCharCode(item.charCodeAt(0) - 120)}`
            })
            return saida
        } catch (e) {
            console.log(e.message)
        }
    }

    static inverterString(entrada) {
        return entrada.split('').reverse()
    }

    static async base64(texto) {
        const encoder = new TextEncoder();
        const data = encoder.encode(texto)
        const hash = await crypto.subtle.digest('SHA-256', data)
        return hash
    }
}