<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

//include_once '../classes/Employees.php';
include_once '../classes/Pessoas.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if($objData != NULL){
    $token = prepareInput($objData->token);
    $chave = prepareInput($objData->chave);

//    $employees = new Employees();
    $pessoas = new Pessoas();

   // $result = $employees->checkToken($token);

    //if($result == 'true'){
    $result = $pessoas->deleteGrupoCliente($chave);
    //} else {
       //return 'false';
    //}
    
} else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>