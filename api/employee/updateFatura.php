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
    $Emissao = prepareInput($objData->Emissao);
    $Vencto = prepareInput($objData->Vencto);
    $Praca_Pagto = prepareInput($objData->Praca_Pagto);
    $Cliente = prepareInput($objData->Cliente);
    $Valor = prepareInput($objData->Valor);
    $Obs = prepareInput($objData->Obs);
    $Cobranca = prepareInput($objData->Cobranca);
    $discriminacaoservico = prepareInput($objData->discriminacaoservico);
    $atividade = prepareInput($objData->atividade);
    
    $contas = new Contas();


    $result = $contas->updateFatura($Chave, $Emissao, $Vencto, $Praca_Pagto, $Cliente, $Valor, $Obs, $Cobranca, $discriminacaoservico, $atividade);

    } else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>