<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

include_once '../classes/OS.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if($objData != NULL){
    
    
    $documento = prepareInput($objData->documento);
    $format = prepareInput($objData->format);
    $ext = prepareInput($objData->ext);
    
    $chave_os = prepareInput($objData->chave_os);
    $chave_osi = prepareInput($objData->chave_osi);
    $descricao = prepareInput($objData->descricao);
    $tipo = prepareInput($objData->tipo);

    $os = new OS();
    
    
    $nome = $os->insertDocumento($chave_os, $chave_osi, $descricao, $tipo, $ext);
    
    saveDocs($documento, $nome, $format, $ext);

    $result = $os->getUltimoDocumento($chave_os);

    
    
    
} else {
    $result = "false";
}


echo(json_encode($result));
exit;

?>