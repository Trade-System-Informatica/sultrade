<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

include_once '../classes/Paises.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if($objData != NULL){
    $token = prepareInput($objData->token);

    $pessoas = new Paises();

    //$operadores = $operadores->checkToken($token);
    //if($result == 'true'){
        $result = $pessoas->getPaises();
		//$result = 'Entrou aqui';
        //}
    } else {
        $result = "false";
    }
    
echo(json_encode($result));
exit;

?>