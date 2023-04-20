<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

include_once '../classes/Contas.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if($objData != NULL){
    $token = prepareInput($objData->token);
    $chave_conta_aberto = prepareInput($objData->chave_conta_aberto);
    $chave_conta = prepareInput($objData->chave_conta);
    $complemento = prepareInput($objData->complemento);
    $valor = prepareInput($objData->valor);
    $tipo = prepareInput($objData->tipo);


    $contas = new Contas();


    $result = $contas->insertContaDescontos($chave_conta_aberto, $chave_conta, $complemento, $valor, $tipo);

} else {
    $result = "false";
}

echo(json_encode($result));
exit;
?>