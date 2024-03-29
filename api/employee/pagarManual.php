<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

//application/x-httpd-php updateSeaport.php ( PHP script, ASCII text, with CRLF line terminators )
include_once '../classes/Contas.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if($objData != NULL){
    $token = prepareInput($objData->token);
    $values = prepareInput($objData->values);
    $chave = prepareInput($objData->chave);
    $valor = prepareInput($objData->valor);
    $saldo = prepareInput($objData->saldo);
    $data_pagto = prepareInput($objData->data_pagto);
    
    $contas = new Contas();


    $result = $contas->pagarManual($values, $chave, $valor, $saldo, $data_pagto);

    } else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>