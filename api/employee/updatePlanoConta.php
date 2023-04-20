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
    $Chave = prepareInput($objData->Chave);
    $Codigo = prepareInput($objData->Codigo);
    $Nivel = prepareInput($objData->Nivel);
    $Indicador = prepareInput($objData->Indicador);
    $Descricao = prepareInput($objData->Descricao);
    $Conta_Inativa = prepareInput($objData->Conta_Inativa);
    $grupo = prepareInput($objData->grupo);
    
    $contas = new Contas();

    //$result = $employees->checkToken($token);
    //if($result == 'true'){
        //$result = "'" . $id_seaport . "'";
        $result = $contas->updatePlanoConta($Chave, $Codigo, $Nivel, $Indicador, $Descricao, $Conta_Inativa, $grupo);
    //}
} else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>