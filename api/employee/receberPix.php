<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

include_once '../libraries/utils.php';
include_once '../classes/Contas.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if ($objData != NULL) {
    $url = prepareInput($objData->url);
    $pessoa = prepareInput($objData->pessoa);
    $conta = $objData->conta;
    $empresa = prepareInput($objData->empresa);
    $lote = prepareInput($objData->lote);

    $codigo = password_hash("Trade@6760", PASSWORD_DEFAULT);
    $codigo = removerCaracteresEspeciais($codigo);
    $codigo = substr($codigo, 0, 32);

    $body = [];



    if (strlen($conta->{"pessoaCPF"}) == 11) {
        $pessoaCPF = $conta->{"pessoaCPF"};
        $pessoaCNPJ = "";
    } else if (strlen($conta->{"pessoaCPF"}) == 14) {
        $pessoaCNPJ = $conta->{"pessoaCPF"};
        $pessoaCPF = "";
    }

    $contas = new Contas();

    $informacoesBancarias = $contas->getInformacoesBancarias($empresa, 0);
    $url .= "?gw-dev-app-key=" . $informacoesBancarias[0]["chave_api"];

    $url = "https://api.hm.bb.com.br/pix/v1/cob/?gw-dev-app-key=" . $informacoesBancarias[0]["chave_api"];

    $basic = $informacoesBancarias[0]["basic"];

    $bearer = $contas->getBearerSandbox($basic);
    $bearer = json_decode($bearer);
    $bearer = $bearer->{'access_token'};

    $body = [
        "chave" => $informacoesBancarias[0]["chave_pix"],
        "solicitacaoPagador" => $conta->{"Historico"},
        "valor" => [
            "original" => $conta->{"Saldo"}
        ],
        "devedor" => [
            "nome" => $conta->{"pessoaNome"},
            "cpf" => $pessoaCPF,
            "cnpj" => $pessoaCNPJ
        ]
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json', "Authorization: Bearer $bearer"));
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
    curl_setopt($ch, CURLOPT_POSTFIELDS, [
        "chave" => $informacoesBancarias[0]["chave_pix"],
        "solicitacaoPagador" => $conta->{"Historico"},
        "valor" => [
            "original" => $conta->{"Saldo"}
        ],
        "devedor" => [
            "nome" => $conta->{"pessoaNome"},
            "cpf" => $pessoaCPF,
            "cnpj" => $pessoaCNPJ
        ]
    ]);

    $return = curl_exec($ch);

    if (!$return) {
        $return = curl_error($ch);
    }
    curl_close($ch);

    $status = "Enviado com sucesso";
    $statusId = 2;
    $data = date("Y-m-d H:i:s");
    $contaChave = $conta->{'Chave'};

    if ($return[14] == '4' || $return[14] == '5') {
        $status = "Erro no envio";
        $statusId = 0;
    }

    //$values = "'$data', '$lote', '$codigo', '$contaChave', '$status', '$statusId'";

    //$contas->insertTransacao($values, "PIX");


} else {
}


echo json_encode([
    "chave" => $informacoesBancarias[0]["chave_pix"],
    "solicitacaoPagador" => $conta->{"Historico"},
    "valor" => [
        "original" => $conta->{"Saldo"}
    ],
    "devedor" => [
        "nome" => $conta->{"pessoaNome"},
        "cpf" => $pessoaCPF,
        "cnpj" => $pessoaCNPJ
    ]
]);
echo $bearer;
exit;
