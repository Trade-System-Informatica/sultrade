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
    $old_Centro_Custo = prepareInput($objData->old_Centro_Custo);
    $Lancto = prepareInput($objData->Lancto);
    $Pessoa = prepareInput($objData->Pessoa);
    $Centro_Custo = prepareInput($objData->Centro_Custo);
    $Valor = prepareInput($objData->Valor);
    $Saldo = prepareInput($objData->Saldo);
    $Empresa = prepareInput($objData->Empresa);
    $valuesRet = prepareInput($objData->valuesRet);

    
    $contas = new Contas();

    $result = $contas->updateContaOS($old_Centro_Custo, $Lancto, $Pessoa, $Centro_Custo, $Valor, $Saldo, $Empresa, $valuesRet);

} else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>