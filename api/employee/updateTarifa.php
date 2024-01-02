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
    $anexo = prepareInput($objData->anexo);
    $anexo2 = prepareInput($objData->anexo2);
    $portos = $objData->portos;
    $servico = prepareInput($objData->servico);
    $vencimento = prepareInput($objData->vencimento);
    $preferencial = prepareInput($objData->preferencial);
    $portosDeletados = prepareInput($objData->portosDeletados);
    
    $documento = prepareInput($objData->documento);
    $format = prepareInput($objData->format);
    $ext = prepareInput($objData->ext);
    $nome = prepareInput($objData->nome);

    $documento2 = prepareInput($objData->documento2);
    $format2 = prepareInput($objData->format2);
    $ext2 = prepareInput($objData->ext2);
    $nome2 = prepareInput($objData->nome2);

    $pessoas = new Pessoas();

    $result = $pessoas->updateTarifa($chave, $fornecedor, $anexo, $portos, $servico, $vencimento, $preferencial, $anexo2, $portosDeletados);
    
    if ($ext) {
        $result = savePicture($documento, $nome, $format, $ext);    
    }
    if ($ext2) {
        $result = savePicture($documento2, $nome2, $format2, $ext2);    
    }
    
} else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>