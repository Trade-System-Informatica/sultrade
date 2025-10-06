<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/json");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

include_once '../classes/Employees.php';
include_once '../classes/Contas.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if($objData != NULL){
    $token = prepareInput($objData->token);
    $all = isset($objData->all) ? $objData->all : false;
    $chaves = isset($objData->chaves) ? $objData->chaves : [];
    $centro_custo = isset($objData->centro_custo) ? prepareInput($objData->centro_custo) : false;
    $situacao = isset($objData->situacao) ? prepareInput($objData->situacao) : 'T';
    $grupo = isset($objData->grupo) ? prepareInput($objData->grupo) : false;
    $faturada_ha_dias = isset($objData->faturada_ha_dias) ? intval($objData->faturada_ha_dias) : null;

    $employees = new Employees();
    $tokenValid = $employees->checkToken($token);
    
    if($tokenValid == 'true'){
        $contas = new Contas();
        $result = $contas->relatorioContasReceber($all, $chaves, $centro_custo, $situacao, $grupo, $faturada_ha_dias);
    } else {
        $result = array("error" => "Token inválido");
    }
} else {
    $result = array("error" => "Dados não fornecidos");
}

echo json_encode($result);
exit;
?>
