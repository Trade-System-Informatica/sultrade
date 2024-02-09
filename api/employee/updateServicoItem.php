<?php
error_reporting(0);
ini_set("display_errors", 0 );
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

//application/x-httpd-php updateSeaport.php ( PHP script, ASCII text, with CRLF line terminators )
include_once '../classes/OS.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);


if($objData != NULL){
    $token = prepareInput($objData->token);
    $chave = prepareInput($objData->chave);
    $chave_os = prepareInput($objData->chave_os);
    $data = prepareInput($objData->data);
    $fornecedor = prepareInput($objData->fornecedor);
    $taxa = prepareInput($objData->taxa);
    $descricao = prepareInput($objData->descricao);
    $ordem = prepareInput($objData->ordem);
    $tipo_sub = prepareInput($objData->tipo_sub);
    $Fornecedor_Custeio = prepareInput($objData->Fornecedor_Custeio);
    $remarks = prepareInput($objData->remarks);
    $Moeda = prepareInput($objData->Moeda);
    $valor = prepareInput($objData->valor);
    $valor1 = prepareInput($objData->valor1);
    $repasse = prepareInput($objData->repasse);
    
    $os = new OS();

    $delInvoice = $os->updateOsInvoice($chave, $chave_os, $Fornecedor_Custeio);

    //$result = $employees->checkToken($token);
    //if($result == 'true'){
        //$result = "'" . $id_seaport . "'";
        $result = $os->updateServicoItem($chave, $chave_os, $data, $fornecedor, $taxa, $descricao, $ordem, $tipo_sub, $Fornecedor_Custeio, $remarks, $Moeda, $valor, $valor1, $repasse);
    //}
} else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>