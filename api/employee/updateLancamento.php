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
    $Data = prepareInput($objData->Data);
    $ContaDebito = prepareInput($objData->ContaDebito);
    $ContaCredito = prepareInput($objData->ContaCredito);
    $TipoDocto = prepareInput($objData->TipoDocto);
    $CentroControle = prepareInput($objData->CentroControle);
    $Historico_Padrao = prepareInput($objData->Historico_Padrao);
    $Historico = prepareInput($objData->Historico);
    $Pessoa = prepareInput($objData->Pessoa);
    $Valor = prepareInput($objData->Valor);
    $ChavePr = prepareInput($objData->ChavePr);
    $Usuario_Alteracao = prepareInput($objData->Usuario_Alteracao);
    $Data_Alteracao = prepareInput($objData->Data_Alteracao);
    $Conciliado = prepareInput($objData->Conciliado);
    $atualizado = prepareInput($objData->atualizado);
        
    
    $contas = new Contas();


    $result = $contas->updateLancamento($Chave, $Data, $ContaDebito, $ContaCredito, $TipoDocto, $CentroControle, $Historico_Padrao, $Historico, $Pessoa, $Valor, $ChavePr, $Usuario_Alteracao, $Data_Alteracao, $Conciliado, $atualizado);

    } else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>