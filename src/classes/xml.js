import axios from 'axios';
import moment from 'moment'
import loader from './loader';
import * as js2xmlparser from "js2xmlparser";
import Util from './util';
import { apiEmployee } from '../services/apiamrg';
import { URL_SIGISS, URL_SOAPACTION, URL_SIGISS_CANCELAMENTO, URL_SOAPACTION_CANCELAMENTO } from '../config';
import { parseString } from 'xml2js';
import { inheritTransformationMetadata } from '@nestjs/mapped-types';


export default class Xml {
    static async formataXml(xml, nome) {
        let final = xml.replaceAll("\n", " ");

        final = final.split(">");

        final = final.map((e) => e.trim()).join('>');

        const blob = new Blob([final], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `${nome}.xml`;
        link.href = url;
        link.click();

        return final;
    }


    static async criaXml(chave) {
        let info = await loader.getBody(`getNotaFiscal.php`, { chave });
        info = info[0];

        let tomador_cnpj = await Util.apenasNumeros(info.tomador_cnpj);
        let tomador_tipo = tomador_cnpj.length == 11 ? 2 : 3

        if (tomador_tipo == 3) {
            if (info.tomador_cod_cidade != "4315602") {
                tomador_tipo = 4;
            }
        }

        let { tomador_cod_cidade } = info
        if (info.uf == "EX") {
            tomador_tipo = 5;
            tomador_cnpj = "";
            tomador_cod_cidade = "";
            info.tomador_cep = 99999999;

        }

        let { tomador_im } = info;

        if (tomador_im == "ISENTO") {
            tomador_im = ""
        }

        let data = moment();
        if (data.isBefore(moment(info.emissao))) {
            data = moment(info.emissao);
        }

        const json = {
            ccm: info.im,
            cnpj: await Util.apenasNumeros(info.cnpj),
            senha: info.senha,
            crc: info.crc ? info.crc : "",
            crc_estado: info.crc_estado ? info.crc_estado : "",
            aliquota_simples: (info.aliquota_simples != "" && info.aliquota_simples != 0 && info.aliquota_simples != "0.00" ? info.aliquota_simples : ""),
            id_sis_legado: info.id_sis_legado,
            servico: info.servico,
            situacao: 'tp',
            valor: info.valor ? await Util.formataDinheiroBrasileiro(info.valor) : "",
            base: info.base ? await Util.formataDinheiroBrasileiro(info.base) : "",
            descricaoNF: info.descricaoNF,
            dia_emissao: moment().format('DD'),
            mes_emissao: moment().format('MM'),
            ano_emissao: moment().format('YYYY'),
            vencimento_dia: info.vencimento != "" ? moment().format('DD') : "",
            vencimento_mes: info.vencimento != "" ? moment().format('MM') : "",
            vencimento_ano: info.vencimento != "" ? moment().format('YYYY') : "",
            ISSRetido: info.issRetido && info.issRetido != "" ? info.issRetido : "",
            ValorIss: parseFloat(info.ValorIss) > 0 ? await Util.formataDinheiroBrasileiro(info.ValorIss) : "",
            tomador_tipo: tomador_tipo,
            tomador_cnpj: tomador_cnpj,
            tomador_email: info.tomador_email,
            tomador_im: tomador_cod_cidade == 8041 ? info.tomador_im ? info.tomador_im : "" : "",
            tomador_razao: info.tomador_razao,
            tomador_fantasia: info.tomador_fantasia,
            tomador_endereco: info.tomador_endereco,
            tomador_numero: info.tomador_numero,
            tomador_complemento: info.tomador_complemento,
            tomador_bairro: info.tomador_bairro,
            tomador_CEP: await Util.apenasNumeros(info.tomador_CEP),
            tomador_cod_cidade: info.tomador_cod_cidade,
            tomador_fone: info.tomador_fone ? await Util.apenasNumeros(info.tomador_fone.split('@.@')[0]) : "",
        }

        let xml = js2xmlparser.parse("tcDescricaoRps", json).replace("<?xml version='1.0'?>", "")

        xml = xml.replaceAll(">null<", "><");

        xml = `<?xml version=\"1.0\" encoding=\"utf-8\"?>
<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">
<soap:Body>
<GerarNota xmlns=\"http://tempuri.org/\">
${xml}
</GerarNota>
</soap:Body>
</soap:Envelope>`

        const envio = await this.formataXml(xml, "envio");


        const retornoXml = await apiEmployee.post(`criaXML.php`, { xml: envio, chave, url: URL_SIGISS, soap: URL_SOAPACTION }).then(async res => { return (res.data) }, async err => console.log(err))
        console.log(json)
        console.log(xml)
        console.log({ xml: envio, chave, url: URL_SIGISS, soap: URL_SOAPACTION });
        console.log(retornoXml);

        const blob = new Blob([retornoXml], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = "retorno.xml";
        link.href = url;
        link.click();

        let retornoJson = "";
        let notaNumero = "";
        let autenticidade = "";
        let linkImpressao = "";

        parseString(retornoXml, function (err, result) {
            try {
                if (result["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0]["ns1:GerarNotaResponse"][0]["DescricaoErros"][0]["item"][0]["DescricaoErro"][0]["_"]) {
                    retornoJson = result["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0]["ns1:GerarNotaResponse"][0]["DescricaoErros"][0]["item"][0]["DescricaoErro"][0]["_"];
                }
            } catch (err) { }

            try {
                if (result["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0]["ns1:GerarNotaResponse"][0]["DescricaoErros"][0]["item"][0]["DescricaoProcesso"][0]["_"]) {
                    autenticidade = result["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0]["ns1:GerarNotaResponse"][0]["RetornoNota"][0]["autenticidade"][0]["_"]
                    notaNumero = result["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0]["ns1:GerarNotaResponse"][0]["RetornoNota"][0]["Nota"][0]["_"]
                    retornoJson = result["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0]["ns1:GerarNotaResponse"][0]["DescricaoErros"][0]["item"][0]["DescricaoProcesso"][0]["_"];
                    linkImpressao = result["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0]["ns1:GerarNotaResponse"][0]["RetornoNota"][0]["LinkImpressao"][0]["_"];
                }
            } catch (err) {
                console.log("Erro inesperado")
            }
        });

        return ({ msg: retornoJson, numero: notaNumero, autenticidade, linkImpressao });
    }

    static async cancelaXml(chave, motivo) {
        let info = await loader.getBody(`getNotaFiscal.php`, { chave });
        info = info[0];

        if (info.nota) {
            if (info.uf == "EX") {
                info.tomador_cep = 99999999;
            }

            let data = moment();
            if (data.isBefore(moment(info.emissao))) {
                data = moment(info.emissao);
            }

            const json = {
                ccm: info.im,
                senha: info.senha,
                cnpj: await Util.apenasNumeros(info.cnpj),
                crc: info.crc ? info.crc : "",
                crc_estado: info.crc_estado ? info.crc_estado : "",
                aliquota_simples: (info.aliquota_simples != "" && info.aliquota_simples != 0 && info.aliquota_simples != "0.00" ? info.aliquota_simples : ""),
            }

            let xml = js2xmlparser.parse("tcDescricaoRps", json).replace("<?xml version='1.0'?>", "").replace("</tcDescricaoRps>", `</tcDadosPrestador>
        <tcDescricaoCancelaNota>
            <nota>${info.nota}</nota>
            <motivo>${motivo}</motivo>
        </tcDescricaoCancelaNota>`);

            xml = xml.replaceAll(">null<", "><").replace("<tcDescricaoRps>", "<tcDadosPrestador>");

            xml = `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http:// www.w3.org/ 2001/ XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
            <soap:Body>
                <CancelarNota xmlns="http://tempuri.org/">
${xml}
</CancelarNota>
</soap:Body>
</soap:Envelope>`;

            const envio = await this.formataXml(xml, "cancelamento");

            const retornoXml = await apiEmployee.post(`criaXML.php`, { xml: envio, chave, url: URL_SIGISS_CANCELAMENTO, soap: URL_SOAPACTION_CANCELAMENTO }).then(async res => { return (res.data) }, async err => console.log(err))
            console.log(json)
            console.log(xml)
            console.log({ xml: envio, chave, url: URL_SIGISS_CANCELAMENTO, soap: URL_SOAPACTION_CANCELAMENTO });
            console.log(retornoXml);

            const blob = new Blob([retornoXml], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.download = "retorno.xml";
            link.href = url;
            link.click();

            let retornoJson = "";
            let notaNumero = "";
            let autenticidade = "";
            let linkImpressao = "";

            parseString(retornoXml, function (err, result) {
                try {
                    if (result["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0]["ns1:GerarNotaResponse"][0]["DescricaoErros"][0]["item"][0]["DescricaoErro"][0]["_"]) {
                        retornoJson = result["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0]["ns1:GerarNotaResponse"][0]["DescricaoErros"][0]["item"][0]["DescricaoErro"][0]["_"];
                    }
                } catch (err) { }

                try {
                    if (result["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0]["ns1:GerarNotaResponse"][0]["DescricaoErros"][0]["item"][0]["DescricaoProcesso"][0]["_"]) {
                        autenticidade = result["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0]["ns1:GerarNotaResponse"][0]["RetornoNota"][0]["autenticidade"][0]["_"]
                        notaNumero = result["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0]["ns1:GerarNotaResponse"][0]["RetornoNota"][0]["Nota"][0]["_"]
                        retornoJson = result["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0]["ns1:GerarNotaResponse"][0]["DescricaoErros"][0]["item"][0]["DescricaoProcesso"][0]["_"];
                        linkImpressao = result["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0]["ns1:GerarNotaResponse"][0]["RetornoNota"][0]["LinkImpressao"][0]["_"];
                    }
                } catch (err) {
                    console.log("Erro inesperado")
                }
            });

            return ({ msg: retornoJson, numero: notaNumero, autenticidade, linkImpressao });
        }
        return;
    }
} 