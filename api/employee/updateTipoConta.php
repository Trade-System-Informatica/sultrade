<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

//application/x-httpd-php updateSeaport.php ( PHP script, ASCII text, with CRLF line terminators )
include_once '../classes/Operadores.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if($objData != NULL){
    $codigo = prepareInput($objData->codigo);
    $tipoConta = prepareInput($objData->tipoConta);
    
    $operadores = new Operadores();

    $result = $operadores->updateTipoConta($codigo, $tipoConta);

} else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>