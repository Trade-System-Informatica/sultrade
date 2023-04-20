<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

include_once '../libraries/utils.php';
include_once '../classes/Pessoas.php';
include_once '../classes/Contas.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);
$pathToCertificate = '/var/www/html/sultrade/sultrade_cert.crt';
$pathToKey = '/var/www/html/sultrade/sultrade_cert.key';

if ($objData != NULL) {
    $url = prepareInput($objData->url);
    $indicadorFloat = prepareInput($objData->indicadorFloat);
    $numeroRequisicao = prepareInput($objData->numeroRequisicao);
    $empresa = prepareInput($objData->empresa);
    $chave_conta = prepareInput($objData->chave_conta);
    $operador = prepareInput($objData->operador);

    $contas = new Contas();
    $informacoesBancarias = $contas->getInformacoesBancarias($empresa, 1);

    $body = [
        "indicadorFloat" => $indicadorFloat,
        "numeroRequisicao" => intval($numeroRequisicao)
    ];

    $url .= "?gw-dev-app-key=" . $informacoesBancarias[0]["chave_api"];

    $basic = $informacoesBancarias[0]["basic"];

    $bearer = $contas->getBearer($basic);
    $bearer = json_decode($bearer);
    $bearer = $bearer->{'access_token'};

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
    curl_close($ch);

    $contas->updateTransacaoLiberada($chave_conta, $operador);

} else {
}

echo ($return);
exit;
