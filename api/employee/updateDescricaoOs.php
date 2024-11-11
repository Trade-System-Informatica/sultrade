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
    $chave = prepareInput($objData->chave);
    $descricao = prepareInput($objData->descricao);
    
    $os = new OS();

    $result = $os->updateDescricaoOs($chave, $descricao);
} else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>