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
        return array.map((key) => ({label: key[label], value: key[value]}));
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
                returnObj[k] = typeof states[k] == "string" ? states[k].replaceAll("'","\'").replaceAll('"','\"').trim() : states[k];
            }
        });

        return returnObj;
    }

    static toFixed(num, precision) {
        return parseFloat((+(Math.round(+(num + 'e' + precision)) + 'e' + -precision)).toFixed(precision));
    }

    static async testExcell() {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet([]);
        console.log("QWE");

        XLSX.utils.book_append_sheet(workbook, worksheet, "FATURAMENTOS");
        const firstHeader = [
            "NAVIO: MINDORO STAR",
            "",
            "",
            "",
            "ROE: 5"
        ]

        const smallHeaders = [
            "Evento",
            "Conta",
            "Valor à Cobrar",
            "Valor Pago",
            "Valor Líquido"
        ];

        let bigHeader = [
            "",
            "",
            "FATURAMENTO SUL TRADE AGENCIAMENTOS MARITIMOS LTDA",
            "",
            ""
        ];

        XLSX.utils.sheet_add_aoa(worksheet, [firstHeader, bigHeader, smallHeaders]);
        console.log("ASD3");

        let content = [{
            "evento": "IMMIGRATION CLEARANCE AT FIRST AIRPORT - 03SUPTD",
            "conta": "",
            "valor_a_cobrar": 756.24,
            "valor_pago": 0,
            "valor_liquido": 756.24
        }, {
            "evento": "CUSTOMS/IMMIGRATIONCLEARANCE IN PORT - 03SUPTD",
            "conta": "",
            "valor_a_cobrar": 1436.86,
            "valor_pago": 0,
            "valor_liquido": 1436.86,
        }, {
            "evento": "SPECIAL SANITARY AUTHORITY CLEARANCE (COVID-19) - 03SUPTD",
            "conta": "",
            "valor_a_cobrar": 378.12,
            "valor_pago": 0,
            "valor_liquido": 378.12,
        }, {
            "evento": "CAR HIRE TO ANTICIPATE CLEARANCE WITH AUTHORITIES",
            "conta": "",
            "valor_a_cobrar": 0,
            "valor_pago": 0,
            "valor_liquido": 0,
        }, {
            "evento": "03SUPTD - CAR TRANSPORTATION SSA AIRPORT X HOTEL",
            "conta": "",
            "valor_a_cobrar": 0,
            "valor_pago": 0,
            "valor_liquido": 0,
        }, {
            "evento": "03SUPTD - CAR TRANSPORTATION HOTEL X VESSEL ON ARP/ 03",
            "conta": "",
            "valor_a_cobrar": 756.24,
            "valor_pago": 0,
            "valor_liquido": 756.24,
        }, {
            "evento": "IMMIGRATION/SANITARY CLEARANCE FOR DISEMBARK CREW AT ANCHORAGE AREA",
            "conta": "",
            "valor_a_cobrar": 0,
            "valor_pago": 0,
            "valor_liquido": 0,
        }, {
            "evento": "CAR HIRE TO TRANSFER MR. CLENTON BELONGS - BOAT STATION X OFFICE",
            "conta": "",
            "valor_a_cobrar": 0,
            "valor_pago": 0,
            "valor_liquido": 0,
        }, {
            "evento": "COORDINATION FEE ON HUSBANDRY SERVICES",
            "conta": "",
            "valor_a_cobrar": 1512.48,
            "valor_pago": 0,
            "valor_liquido": 1512.48,
        }, {
            "evento": "01 OFF/S - HOTEL AND MEALS",
            "conta": "",
            "valor_a_cobrar": 4285.36,
            "valor_pago": 0,
            "valor_liquido": 4285.36,
        }];

        XLSX.utils.sheet_add_json(worksheet, content, {
            skipHeader: true,
            origin: -1
        })
        console.log("ASD2");

        // let footer = {
        //     titulo: "VALOR DA NF A SER EMITIDA",
        //     blank: "",
        //     valor_a_cobrar: 9125.3,
        //     valor_pago: 0,
        //     valor_liquido: 9125.3
        // };

        // XLSX.utils.sheet_add_json(worksheet, footer, {
        //     skipHeader: true,
        //     origin: -1
        // });
        console.log("ASD");

        const url = await XLSX.write(workbook, {
            type: "buffer",
            cellStyles: true
        });
        console.log(url);
    }

}
