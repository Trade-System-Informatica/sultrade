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

    $values = prepareInput($objData->values);
    $portos = $objData->portos;

    $pessoas = new Pessoas();
    
	$result = $pessoas->insertTarifa($values, $portos);

    if ($nome != NULL && $nome != ""){
        $keyTarifa = intval($pessoas->getTarifasLen()[0]['chave']);

        $valuesAnexoTarifa = "'', $keyTarifa";
        $resultAnexosTarifas = $pessoas->insertTarifasAnexos($valuesAnexoTarifa);
        $keyAnexosTarifas = intval($pessoas->getAnexosTarifasLen()[0]['chave']);

        $fullname = $nome.'_AN-'.$keyAnexosTarifas.'.'.$ext;

        $resultAnexosTarifas = $pessoas->updateTarifasAnexos($fullname, $keyAnexosTarifas);
    }
    //$result = $pessoas->insertAnexo($values, $portos); função nao existe!
    
	savePicture($documento, $nome, $format, $ext, $keyAnexosTarifas);
    
} else {
    $result = "false";
}


echo(json_encode($result));
exit;

?>