<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

include_once '../classes/Portos.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if($objData != NULL){
    $token = prepareInput($objData->token);
    $Chave = prepareInput($objData->Chave);
    $Descricao = prepareInput($objData->Descricao);
    $Codigo = prepareInput($objData->Codigo);
    
    $data = prepareInput($objData->data);
    
    $portos = new Portos();
    //$result = $employees->checkToken($token);
    //if($result == 'true'){
        //$result = "'" . $id_seaport . "'";
    $result = $portos->updatePorto($Chave, $Codigo, $Descricao);
    //}else{
    //    $result = "false";
    //}
} else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>