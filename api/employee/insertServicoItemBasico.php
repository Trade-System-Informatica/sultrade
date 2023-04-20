<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

include_once '../classes/OS.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if($objData != NULL){
    $token = prepareInput($objData->token);
    $values = prepareInput($objData->values);
    $codigo = prepareInput($objData->codigo);
    $tipo = prepareInput($objData->tipo);
    $chave_os = prepareInput($objData->chave_os);
    $ordem = prepareInput($objData->ordem);

    //$employees = new Employees();
    $os = new OS();

    //$result = $employees->checkToken($token);
    //if($result == 'true'){
    $result = $os->insertServicoItemBasico($values, $codigo, $tipo, $chave_os, $ordem);
    //}
} else {
    $result = "false";
}

echo(json_encode($result));
exit;
?>