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
    $repasse = prepareInput($objData->repasse);
    $tipoEvento = prepareInput($objData->tipoEvento);
    $tipo = prepareInput($objData->tipo);
    $values = prepareInput($objData->values);
    $historico = prepareInput($objData->historico);
    $chave_evento = prepareInput($objData->chave_evento);
    $chave_taxa = prepareInput($objData->chave_taxa);
    $ContaDebito = prepareInput($objData->contaDebito);    
    
    $contas = new Contas();


    $result = $contas->insertLotesLancamentos($repasse, $tipoEvento, $tipo, $values, $historico, $chave_evento, $chave_taxa, $ContaDebito);

    } else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>