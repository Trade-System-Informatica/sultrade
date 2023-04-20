<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

//application/x-httpd-php updateSeaport.php ( PHP script, ASCII text, with CRLF line terminators )
include_once '../classes/Pessoas.php';
include_once '../classes/Employees.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if($objData != NULL){
    $token = prepareInput($objData->token);
    $chave = prepareInput($objData->chave);
    $operador = prepareInput($objData->operador);
    $evento = prepareInput($objData->evento);
    $validado = prepareInput($objData->validado);
    $validadoData = prepareInput($objData->validadoData);

    $pessoas = new Pessoas();

    //$result = $employees->checkToken($token);
    //if($result == 'true'){
        //$result = "'" . $id_seaport . "'";
        $result = $pessoas->updateAnexo($chave, $operador, $evento, $validado, $validadoData);
    //}
} else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>