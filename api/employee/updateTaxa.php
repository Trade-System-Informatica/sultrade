<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

include_once '../classes/Taxas.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if($objData != NULL){
    $token = prepareInput($objData->token);
    $chave = prepareInput($objData->chave);
    $descricao = prepareInput($objData->descricao);
    $valor = prepareInput($objData->valor);
    $variavel = prepareInput($objData->variavel);
    $Moeda = prepareInput($objData->Moeda);
    $Tipo = prepareInput($objData->Tipo);
    $Conta_Contabil = prepareInput($objData->Conta_Contabil);
    $historico_padrao = prepareInput($objData->historico_padrao);
    $formula_ate = prepareInput($objData->formula_ate);
    $sub_grupo = prepareInput($objData->sub_grupo);
    
    $data = prepareInput($objData->data);
    
    $taxas = new Taxas();
    //$result = $employees->checkToken($token);
    //if($result == 'true'){
        //$result = "'" . $id_seaport . "'";
    $result = $taxas->updateTaxa($chave, $descricao, $valor, $variavel, $Moeda, $Tipo, $Conta_Contabil, $historico_padrao, $formula_ate, $sub_grupo);
    //}else{
    //    $result = "false";
    //}
} else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>