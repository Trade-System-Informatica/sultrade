<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

include_once '../classes/OS.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if($objData != NULL){
    $chave = prepareInput($objData->chave);
    $ordem = prepareInput($objData->ordem);
    
    $os = new OS();

    $result = $os->updateGrupoTemplateOrdem($chave, $ordem);
} else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>