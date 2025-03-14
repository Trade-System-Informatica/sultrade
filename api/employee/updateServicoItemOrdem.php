<?php
error_reporting(0);
ini_set("display_errors", 0 );
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

//application/x-httpd-php updateSeaport.php ( PHP script, ASCII text, with CRLF line terminators )
include_once '../classes/OS.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);


if($objData != NULL){
    $token = prepareInput($objData->token);
    $chave = prepareInput($objData->chave);
    $ordem = prepareInput($objData->ordem);
    
    $os = new OS();

    $result = $os->updateServicoItemOrdem($chave, $ordem);
} else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>