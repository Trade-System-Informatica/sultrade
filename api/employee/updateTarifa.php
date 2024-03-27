<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

//application/x-httpd-php updateSeaport.php ( PHP script, ASCII text, with CRLF line terminators )
include_once '../classes/Pessoas.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if($objData != NULL){
    $token = prepareInput($objData->token);
    $chave = prepareInput($objData->chave);
    $fornecedor = prepareInput($objData->fornecedor);
    $portos = $objData->portos;
    $servico = prepareInput($objData->servico);
    $observacao = prepareInput($objData->observacao);
    $vencimento = prepareInput($objData->vencimento);
    $preferencial = prepareInput($objData->preferencial);
    $portosDeletados = prepareInput($objData->portosDeletados);
    

    $pessoas = new Pessoas();

    $result = $pessoas->updateTarifa($chave, $fornecedor, $portos, $servico, $vencimento, $preferencial, $portosDeletados, $observacao);
    
} else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>