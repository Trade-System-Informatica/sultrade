<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING );

include_once '../classes/OS.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if($objData != NULL){
    $token = prepareInput($objData->token);
    $values = prepareInput($objData->values);
    $codigo = prepareInput($objData->codigo);
    $sequencial = prepareInput($objData->sequencial);
    $tipo = prepareInput($objData->tipo);
    $navio = prepareInput($objData->navio);
    $tipoServico = prepareInput($objData->tipoServico);
    $cliente = prepareInput($objData->cliente);
    $porto = prepareInput($objData->porto);

    //$employees = new Employees();
    $os = new OS();

    //$result = $employees->checkToken($token);
    //if($result == 'true'){
    $result = $os->insertOsOrcamento($values, $codigo, $tipo, $sequencial, $navio, $tipoServico, $cliente, $porto);
    //}
} else {
    $result = "false";
}

echo(json_encode($result));
exit;
?>