<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

include_once '../libraries/utils.php';
include_once '../classes/Pessoas.php';
include_once '../classes/Contas.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);
$pathToCertificate = '/var/www/html/documentos/certificates/sultrade_cert.crt';
$pathToKey = '/var/www/html/documentos/certificates/sultrade_cert.key';

if ($objData != NULL) {
    $url = prepareInput($objData->url);
    $pessoa = prepareInput($objData->pessoa);
    $conta = $objData->conta;
    $codigo = prepareInput($objData->codigo);
    $empresa = prepareInput($objData->empresa);
    $dadosComplementares = $objData->dadosComplementares;
    $lote = prepareInput($objData->lote);
    $operador = prepareInput($objData->operador);

    $data = date("Y-m-d H:i:s");
    $contaChave = $conta->{"Chave"};
    $statusId = 2;
    $status = "";

    $pessoas = new Pessoas();
    $contatos = $pessoas->getContatos($pessoa);

    $contas = new Contas();
    $informacoesBancarias = $contas->getInformacoesBancarias($empresa, 1);

    $codigosBB = $contas->getCodigosBB();

    /*$body = [];
    $body["numeroRequisicao"] = intval($codigo);
    //$body["numeroContratoPagamento"] = intval($informacoesBancarias[0]["codigo_contrato"]);
    $body["agenciaDebito"] = intval($informacoesBancarias[0]["agencia"]);
    $body["contaCorrenteDebito"] = intval($informacoesBancarias[0]["conta"]);
    $body["digitoVerificadorContaCorrente"] = $informacoesBancarias[0]["digito_conta"];
    $body["tipoPagamento"] = intval($conta->{"tipoPagamento"});
    $body["listaTransferencias"] = [];

    $body["listaTransferencias"]["numeroCOMPE"] = intval($conta->{"compe"});
    $body["listaTransferencias"]["numeroISP"] = intval($conta->{"ispb"});
    $body["listaTransferencias"]["valorTransferencia"] = floatval($conta->{"Valor"});
    $body["listaTransferencias"]["codigoFinalidadeTED"] = 10;

    $body["listaTransferencias"]["agenciaCredito"] = intval($contato["Campo1"]);
    $body["listaTransferencias"]["contaCorrenteCredito"] = intval($contato["Campo1"]);
    $body["listaTransferencias"]["digitoVerificadorContaCorrente"] = $contato["Campo2"];
    $body["listaTransferencias"]["dataTransferencia"] = date_format($dataTransferencia, 'dmY');*/

    $agencia = "";
    $contaPost = "";
    $digitoVerificadorConta = "";
    $tipoConta = "";
    $email = "";
    $telefone = "";
    $dddTelefone = "";
    $identificacaoAleatoria = "";
    $cpf = "";
    $cnpj = "";

    foreach ($contatos as $contato) {
        if ($contato["Tipo"] == "AG" && $dadosComplementares->{"tipo_pix"} == 5) {
            $agencia = intval($contato["Campo1"]);
        }
        if ($contato["Tipo"] == "CC" && $dadosComplementares->{"tipo_pix"} == 5) {
            $contaPost = substr($contato["Campo1"], 0, strlen($contaCorrenteCredito) - 1);
            $digitoVerificadorConta = substr($contato["Campo1"], -1);
            $tipoConta = 1;
        }

        if ($contato["Tipo"] == "PX" && $dadosComplementares->{"tipo_pix"} == 2) {
            $email = $contato["Campo1"];
        }
        if ($contato["Tipo"] == "PX" && $dadosComplementares->{"tipo_pix"} == 1) {
            $telefoneInteiro = removerCaracteresEspeciais($contato["Campo1"]);

            if (substr($telefoneInteiro, 0, 2) == "55") {
                $telefoneInteiro = substr($telefoneInteiro, 2);
            }

            $telefone = substr($telefoneInteiro, 0, 2);
            $dddTelefone = substr($telefoneInteiro, 2);
        }
        
        if ($contato["Tipo"] == "PX" && $dadosComplementares->{"tipo_pix"} == 4) {
            $identificacaoAleatoria = $contato["Campo1"];
        }
    }


    if (strlen($conta->{"pessoaCPF"}) == 11 && $dadosComplementares->{"tipo_pix"} == 3) {
        $cpf = intval($conta->{"pessoaCPF"});
        $cnpj = "";
    } else if (strlen($conta->{"pessoaCPF"}) == 14 && $dadosComplementares->{"tipo_pix"} == 3) {
        $cnpj = intval($conta->{"pessoaCPF"});
        $cpf = "";
    }

    $dataPost = date_create($conta->{"Vencimento"});

    $body = [
        "numeroRequisicao" => intval($codigo),
        "numeroContratoPagamento" => intval($informacoesBancarias[0]["codigo_contrato"]),
        "agenciaDebito" => intval($informacoesBancarias[0]["agencia"]),
        "contaCorrenteDebito" => intval($informacoesBancarias[0]["conta"]),
        "digitoVerificadorContaCorrente" => $informacoesBancarias[0]["digito_conta"],
        "tipoPagamento" => intval($conta->{"tipoPagamento"}),
        "listaTransferencias" => [[
            "data" => intval(date_format($dataPost, 'dmY')),
            "valor" => floatval($conta->{"Valor"}),
            "formaIdentificacao" => $dadosComplementares->{"tipo_pix"},
            "dddTelefone" => $dddTelefone,
            "telefone" => $telefone,
            "email" => $email,
            "cpf" => $cpf,
            "cnpj" => $cnpj,
            "identificacaoAleatoria" => $identificacaoAleatoria,
            "numeroCOMPE" => "",
            "numeroISP" => "",
            "agencia" => $agencia,
            "conta" => $contaPost,
            "digitoVerificadorConta" => $digitoVerificadorConta
        ]]
    ];

    //validacao
    if (!$body["listaTransferencias"][0]["agencia"] && $dadosComplementares->{"tipo_pix"} == 5) {
        $statusId = 0;
        $status = "Nenhuma agência encontrada";
    }

    if (!$body["listaTransferencias"][0]["conta"] && $dadosComplementares->{"tipo_pix"} == 5) {
        $statusId = 0;
        $status = "Nenhuma conta corrente encontrada";
    }

    if (!$body["listaTransferencias"][0]["digitoVerificadorConta"] && $body["listaTransferencias"][0]["digitoVerificadorConta"] !== 0 && $body["listaTransferencias"][0]["digitoVerificador"] !== '0' && $dadosComplementares->{"tipo_pix"} == 5) {
        $statusId = 0;
        $status = "Nenhum digito de verificação para a conta encontrada";
    }

    if (!$body["listaTransferencias"][0]["cpf"] && !$body["listaTransferencias"][0]["cnpj"] && $dadosComplementares->{"tipo_pix"} == 3) {
        $statusId = 0;
        $status = "Nenhum CPF/CNPJ válido";
    }

    if (!$body["listaTransferencias"][0]["dddTelefone"] && !$body["listaTransferencias"][0]["telefone"] && $dadosComplementares->{"tipo_pix"} == 1) {
        $statusId = 0;
        $status = "Nenhum Telefone encontrado";
    }

    if (!$body["listaTransferencias"][0]["email"] && $dadosComplementares->{"tipo_pix"} == 2) {
        $statusId = 0;
        $status = "Nenhum Telefone encontrado";
    }
    //    

    if ($statusId != 0) {
        $url .= "?gw-dev-app-key=" . $informacoesBancarias[0]["chave_api"];

        //$url = "https://api.sandbox.bb.com.br/pagamentos-lote/v1/lotes-transferencias?gw-dev-app-key=d27bc7790affabc01368e17df0050056b9a1a5bf";

        $basic = $informacoesBancarias[0]["basic"];

        $bearer = $contas->getBearer($basic);
        $bearer = json_decode($bearer);
        $bearer = $bearer->{'access_token'};

        //$bearer = "Q0ywezrWTt32dsEtrSDUyedH-xOWkkHgmgFGYaDb5OFP5poUMoEs31SEz0UNyl5_DjDIkGE4YPilINTVk_IAPg.SNOODKBEVjy8jWscYo5iU1xiB8nk5PYdqnuc18h9a5LadW9wZAUOEtOkVasMIjmsSbG12Ajvo9KmTv3FQG5j7NcQwQ6OHFJxVRvgmTtb1JnGZ1Ng3UF8YyE_kQ6vNjfO4OieoqvLhLPk0Aw4KFqEcG9ORkVtnFEuJdNU3qYtq9vRLh_vE4qSnWuhn1_e1tMJNEFVWXcS8TZdjxsX6PmEUz0r8YhgHX3S7Fr1gpNa95PU6zxyBqd60flmnsrHWJ6MQzekwj-zg6ratIec7sutPYjVditiZiVDxVhAmbKP6CMQtEgtVCzvlzY7bY82AxPNBdBTmXr9uIf5I1HM6nDjfB0jlzhpnjQEJeE15EwGIyXGoNq3JMr4dV2wP6J1j8SKNO9gS1lyO7MAEoxhIUGjYmcU-Ec26IPowaUCsTKcHUO3Svn90TR9Y04XQtV8rq7-MNV-dM1As2B-MMjdLnymf4FeYRotQvTK4T2ggV5HoGCnbUhBRN2MgtbATO_bFMNsE8UCn1l55gLm60bHwh8qTIJDXZzOS7DkMZ5w18URqgjLkAheNaVfys0FVoK-SD9rP5piefoPlPDxWevd1CA52Q1bwexihLiWmlphDX55jMfv0Os6jqxVLrqXQYRsIv7i1XVO_6bDO9lajZsRS8G24ZW_MdlA_dCYTaWIQBPE_0jwyi4nDli-TN15Tivu6C33gAwhu5hgYYnY6NpPa1xyg1v91sO2R8Thf-WtOoUXLqVkXLfRz5d0XAVKo1TezHQ67RYOdLm_qjvz7am4MbHbNKU7iRg-yAZqPZBrJIYpxYEEXa6iG_GA6T1lAB1nAK8jo31mUeh7HNismapZqlB6-_eK2FXmhO0_R-OhiHfbrcbbU4Iqm7zOnEIL2y2UpMk2NwZhC_ZsB6v5wPzt7V0wYhsynKc1wucQUmwXAeyPodLGIQ2jNTVHPHPkGz0t3k88GzKcpzXC5xBSbBcB7I-h0mgVJAa5_tRQwnYdO_8_QSs1w6zz3nltA3xOc1Uqa3ChOqzjXywnL3KLS-KluAl_JFUf-Qn1T4PSooe_PIViw9uOThWrY0rmWynAlktGCupCZozV8DtrwzZ3OKnx0UqGC_i034kLxwgbp8rI6A5C5t7_0simg3kgZV0-kKRqXVROIPoL0uP2xfRPxR487eZmc4zR91IbVRUUaJ30l4u0r4Gwv3HBd3l2Wwbd-cvX3Qk1BkTPNwu1os7rTVlGEW5UVfVNcjp1UHHsDIIxQlPnCKnCdqf298xJWATQaEUuujNgAK7bbSVlmvTvrBkgXx_f4BSU5NrDTzoOGhxWDn5XXmzDQK5ML9IYDhgfcFI9BL1yk_7zrdTk3_hHPWMBnX3gmu5THdJnW1GWSmKd7zx6EycAa_qoL3hMU5cBC0ByC9-Z9U1yOnVQcewMgjFCU-cIqc24F8xPRHmgul4VmEtVYPt4ohyKa1rSoleqPWRCZYZXPJm8CrduyvNLzxwEKeWP8HiiHIprWtKiV6o9ZEJlhlf5tYokX_0WL-Hz_-CPm8y4ypqNvtahly3EEwJhhFuWnJbtUktovz8-fXSPqsE51BjCFKyR1YnYqA6JFGCYEUp7b93qaxDCDOQRHijPlCPHCn_jJFqHtkugEbh1ND8Vb3i1QEQeVDumDOslH0UJRUbzWioJIgK8j3x2ECiWFALMW8ePbPHJOlbEv_UKfunGexKcPDagxYhFKi8PuW8TH4fsPQnYcwB-thyCuu06bW_MQE4GnEYTxjvailluA2a_VcNppMJTAQarQnC3HYQxpRQoRzIhLudQCHRY3m1Pjb9ozQ.BSsurBZGnXnbVMa7VPvmIdknwxBkoJw6k4IonQeSPwMGbGxxf0fgcFUR8-YHwvFQDZTt0U-Np1ktnlY0lH1e_Q";

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json', "Authorization: Bearer $bearer"));
        curl_setopt($ch, CURLOPT_SSLCERT, $pathToCertificate);
        curl_setopt($ch, CURLOPT_SSLKEY, $pathToKey);
        curl_setopt($ch, CURLOPT_SSLKEYPASSWD, "12345678");
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));


        $return = curl_exec($ch);
        $returnJSON = json_decode($return);

        if ($returnJSON->{"statusCode"} >= 400 && $returnJSON->{"statusCode"} < 500) {
            $statusId = 0;
            $status = "Erro no sistema";
        } else if ($returnJSON->{"statusCode"} >= 500) {
            $statusId = 0;

            $status = "Erro no servidor";
        } else if ($returnJSON->{"erros"}) {
            $statusId = 0;

            $status = $returnJSON->{"erros"}[0]->{"mensagem"};
        } else if ($returnJSON->{"listaTransferencias"}[0]->{"erros"}[0]) {
            $statusId = 0;

            for ($i = 0; $i < count($codigosBB); $i++) {
                if ($returnJSON->{"listaTransferencias"}[0]->{"erros"}[0] == $codigosBB[$i]["codigo"] && $codigosBB[$i]["tipo"] == "erro") {
                    $status = $codigosBB[$i]["mensagem"];
                }
            }
        } else {
            $status = "Requisição enviada com Numero de Requisição: $codigo";
        }

        if (!$return) {
            $return = curl_error($ch);
        }
        curl_close($ch);
    }

    $values = "'$data', '$lote', '$codigo', '$contaChave', '$status', '$statusId', '$operador'";

    $contas->insertTransacao($values, "PIX");
} else {
}

echo ($return);
exit;
