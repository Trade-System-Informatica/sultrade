import moment from 'moment'
import { CAMINHO_DOCS, CAMINHO_DOCUMENTOS } from '../config'
import XLSX from "xlsx-js-style";

export default class Util {

    static completarZerosEsquerda(str, length) {
        const resto = length - String(str).length
        return '0'.repeat(resto > 0 ? resto : '0') + str
    }

    static formataData(data) {
        return moment(data).format('yyyy-MM-DD')
    }

    static formataDataBr(data) {
        return moment(data, 'yyyy-MM-DD').format('DD/MM/yyyy')
    }

    static verificaDatas(data1, data2){
        const date1 = moment(data1, "yyyy-MM-DD").format("YYYYMMDD");
        const date2 = moment(data2, "DD/MM/yyyy").format("YYYYMMDD");
        console.log(date1, date2)
        if (date2 == 'Invalid date'){
            console.log('data invalida')
            return false
        }else{
            console.log('passou na primeira validação de data')
            if (data2[2]== '/' && data2[5] == '/'){
                console.log('passou na validacao das barras')
                if (date2 > date1) {
                    console.log('aplica')
                    return true;
                }else{
                    console.log('nao aplica')
                    return false;
                }
            }
        }
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
            return string.replace(/\D/g, '');
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

        return parseFloat(valor.replace('.', '').replace(',', '.')).toFixed(2);
    }

    static formataDinheiroBrasileiro(valor) {
        if (typeof valor != "string") {
            valor += "";
        }

        if (isNaN(parseInt(valor))) {
            return "";
        }

        const valorFormatado = new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor);

        return valorFormatado;
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
        return `${CAMINHO_DOCUMENTOS}/pictures/${valor}.png`
    }

    static completarDocuments(valor) {
        return `${CAMINHO_DOCUMENTOS}/${valor}`
        //return `http://192.168.15.122/documents/${valor}`
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

    static async constroiJsonBB(data) {
        if (typeof data == "string") {
            const start = data.indexOf(",\"texto\":");
            const end = data.indexOf("}],\"l")

            if (start != -1 && end != -1) {
                return JSON.parse(data.replaceAll(data.slice(start, end), ""));
            } else {

                return JSON.parse(data);
            }
        } else {
            return data;
        }
    }

    static async turnToOption(array, label, value) {
        return array.map((key) => ({ label: key[label], value: key[value] }));
    }

    static formataCPF(input) {
        input = `${input}`;

        if (input.length <= 11) {
            for (; input.length < 11;) {
                input = `0${input}`;
            }

            return `${input.substring(0, 3)}.${input.substring(3, 6)}.${input.substring(6, 9)}-${input.substring(9)}`;
        } else {
            for (; input.length < 14;) {
                input = `0${input}`;
            }

            return `${input.substring(0, 2)}.${input.substring(2, 5)}.${input.substring(5, 8)}/${input.substring(8, 12)}-${input.substring(12)}`;
        }
    }

    static formataData(input) {
        input = `${input}`

        for (; input.length < 8;) {
            input = `0${input}`;
        }

        return `${input.substring(0, 2)}/${input.substring(2, 4)}/${input.substring(4)}`;
    }

    static cleanStates(states, exceptions = null) {
        const keys = Object.keys(states);

        let returnObj = {};

        keys.map((k) => {
            if (exceptions && exceptions[0] && exceptions.includes(k)) {
                returnObj[k] = states[k];
            } else {
                returnObj[k] = typeof states[k] == "string" ? states[k].replaceAll("'", "\'").replaceAll('"', '\"').trim() : states[k];
            }
        });

        return returnObj;
    }

    static toFixed(num, precision) {
        if (isNaN(parseInt(num))) {
            return 0;
        }

        return parseFloat((+(Math.round(+(num + 'e' + precision)) + 'e' + -precision)).toFixed(precision));
    }

    static formatForLogs(value, type = 'text', falseReturn = '', trueReturn = '', options = [], optionKeyValue = 'value', optionLabelValue = 'label') {
        if (type == 'money') {
            if (typeof value == "string") {
                return value.replaceAll('.', '').replaceAll(',', '.') ? new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value.replaceAll('.', '').replaceAll(',', '.')) : falseReturn;
            } else {
                return value;
            }
        } else if (type == 'date') {
            return value && moment(value).isValid() ? moment(value).format("DD/MM/YYYY") : falseReturn;
        } else if (type == 'datetime') {
            return value && moment(value).isValid() ? moment(value).format("DD/MM/YYYY HH:mm") : falseReturn;
        } else if (type == 'bool') {
            if (value) {
                return trueReturn ? trueReturn : "Sim";
            } else {
                return falseReturn ? falseReturn : "Não";
            }
        } else if (type == 'options') {
            if (options && options[0]) {
                const trueValue = options.find((opt) => opt && opt[optionKeyValue]);

                return trueValue && trueValue[optionLabelValue] ? trueValue[optionLabelValue] : falseReturn;
            } else {
                return value;
            }
        } else {
            return value;
        }
    }

}
