<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

include_once '../classes/Pessoas.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if($objData != NULL){
    $documento = prepareInput($objData->documento);
    $format = prepareInput($objData->format);
    $ext = prepareInput($objData->ext);
    $nome = prepareInput($objData->nome);
    
    $documento2 = prepareInput($objData->documento2);
    $format2 = prepareInput($objData->format2);
    $ext2 = prepareInput($objData->ext2);
    $nome2 = prepareInput($objData->nome2);

    $values = prepareInput($objData->values);
    $portos = $objData->portos;

    $pessoas = new Pessoas();

    //$result = $pessoas->insertAnexo($values, $portos); função nao existe!
	$result = $pessoas->insertTarifa($values,$portos);
    
	savePicture($documento, $nome, $format, $ext);
    savePicture($documento2, $nome2, $format2, $ext2); 
    
} else {
    $result = "false";
}


echo(json_encode($result));
exit;

?>