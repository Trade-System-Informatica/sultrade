<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

//application/x-httpd-php updateSeaport.php ( PHP script, ASCII text, with CRLF line terminators )
include_once '../classes/Operadores.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if($objData != NULL){
    $token = prepareInput($objData->token);
    $Empresa = prepareInput($objData->Empresa);
    $conta_desconto = prepareInput($objData->conta_desconto);
    $conta_retencao_inss = prepareInput($objData->conta_retencao_inss);
    $conta_retencao_ir = prepareInput($objData->conta_retencao_ir);
    $conta_retencao_iss = prepareInput($objData->conta_retencao_iss);
    $conta_retencao_pis = prepareInput($objData->conta_retencao_pis);
    $conta_retencao_cofins = prepareInput($objData->conta_retencao_cofins);
    $conta_retencao_csll = prepareInput($objData->conta_retencao_csll);
    $bank_charges = prepareInput($objData->bank_charges);
    
    $operadores = new Operadores();

    $result = $operadores->updateParametros($Empresa, $conta_desconto, $conta_retencao_inss, $conta_retencao_ir, $conta_retencao_iss, $conta_retencao_pis, $conta_retencao_cofins, $conta_retencao_csll, $bank_charges);

} else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>