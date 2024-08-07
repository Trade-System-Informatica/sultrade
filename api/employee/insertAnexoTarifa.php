<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

include_once '../classes/Pessoas.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if($objData != NULL){
    $token = prepareInput($objData->token);
    $documento = prepareInput($objData->documento);
    $format = prepareInput($objData->format);
    $ext = prepareInput($objData->ext);
    $nome = prepareInput($objData->nome);
    $keyTarifa = prepareInput($objData->chave_tarifa);
    

    $pessoas = new Pessoas();
    $valuesAnexoTarifa = "'', $keyTarifa";
    $result = $pessoas->insertTarifasAnexos($valuesAnexoTarifa);
    $keyAnexosTarifas = intval($pessoas->getAnexosTarifasLen()[0]['chave']);

    $fullname = $nome.'_AN-'.$keyAnexosTarifas.'.'.$ext;

    $resultAnexosTarifas = $pessoas->updateTarifasAnexos($fullname, $keyAnexosTarifas);
    
    savePicture($documento, $nome, $format, $ext, $keyAnexosTarifas);    
    
} else {
    $result = "false";
}


echo(json_encode($result));
exit;

?>