<?php
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
    $gruposNovos = $objData->gruposNovos;
    $gruposDeletados = $objData->gruposDeletados;
    
    $os = new OS();

    //$result = $employees->checkToken($token);
    //if($result == 'true'){
        //$result = "'" . $id_seaport . "'";
        $result = $os->updateEventoTemplate($chave, $data, $fornecedor, $taxa, $descricao, $ordem, $tipo_sub, $Fornecedor_Custeio, $remarks, $Moeda, $valor, $valor1, $repasse, $gruposNovos, $gruposDeletados);
    //}
} else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>