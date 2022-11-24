<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

//application/x-httpd-php updateSeaport.php ( PHP script, ASCII text, with CRLF line terminators )
include_once '../classes/Contas.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if($objData != NULL){
    $token = prepareInput($objData->token);
    $chave = prepareInput($objData->chave);
    $id_transacao = prepareInput($objData->id_transacao);
    $lote = prepareInput($objData->lote);    
    $status = prepareInput($objData->status);    
    
    $contas = new Contas();


    $result = $contas->updateTransacao($chave, $id_transacao, $lote, $status);

    } else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>