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
    $chave_conta = prepareInput($objData->chave_conta);
    $data = prepareInput($objData->data);
    $conta_credito = prepareInput($objData->conta_credito);
    $conta_debito = prepareInput($objData->conta_debito);
    $tipo_documento = prepareInput($objData->tipo_documento);
    $centro_custo = prepareInput($objData->centro_custo);
    $historico_padrao = prepareInput($objData->historico_padrao);
    $historico = prepareInput($objData->historico);
    $pessoa = prepareInput($objData->pessoa);
    $valor = prepareInput($objData->valor);
    $chavePr = prepareInput($objData->chavePr);    
    $usuario_inclusao = prepareInput($objData->usuario_inclusao);    
    $usuario_alteracao = prepareInput($objData->usuario_alteracao);    
    $data_inclusao = prepareInput($objData->data_inclusao);    
    $data_alteracao = prepareInput($objData->data_alteracao);    
    $extras = $objData->extras;    
    
    $contas = new Contas();


    $result = $contas->contabilizaContasAberto($chave_conta, $data, $conta_credito, $conta_debito, $tipo_documento, $centro_custo, $historico_padrao, $historico, $pessoa, $valor, $chavePr, $usuario_inclusao, $usuario_alteracao, $data_inclusao, $data_alteracao, $extras);

    } else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>