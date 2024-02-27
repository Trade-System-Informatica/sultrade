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
    $offset = prepareInput($objData->offset);
    $empresa = prepareInput($objData->empresa);

    $os = new OS();

    //$operadores = $operadores->checkToken($token);
    //if($result == 'true'){
        $result = $os->getEventosTemplates($offset, $empresa);
		//$result = 'Entrou aqui';
        //}
    } else {
        $result = "false";
    }
    
echo(json_encode($result));
exit;

?>