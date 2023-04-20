<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

//include_once '../classes/Employees.php';
include_once '../classes/Operadores.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if($objData != NULL){
    $token = prepareInput($objData->token);
    $dataInicio = prepareInput($objData->dataInicio);
    $dataFim = prepareInput($objData->dataFim);
    $tabela = prepareInput($objData->tabela);

//    $employees = new Employees();
    $operadores = new Operadores();

   // $result = $employees->checkToken($token);

    //if($result == 'true'){
    $result = $operadores->deleteLogs($dataInicio, $dataFim, $tabela);
    //} else {
       //return 'false';
    //}
    
} else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>