<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

include_once '../classes/Operadores.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if($objData != NULL){
    $token = prepareInput($objData->token);
    $Usuario = prepareInput($objData->Usuario);
    $Acessos = prepareInput($objData->Acessos);

    $operadores = new Operadores();

    //$result = $employees->checkToken($token);
    //if($result == 'true'){
    $result = $operadores->getPermissao($Usuario, $Acessos);
   // }
} else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>