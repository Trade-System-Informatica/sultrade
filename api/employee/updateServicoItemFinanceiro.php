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
    $Moeda = prepareInput($objData->Moeda);
    $valor = prepareInput($objData->valor);
    $valor1 = prepareInput($objData->valor1);
    $repasse = prepareInput($objData->repasse);
    $emissao = prepareInput($objData->emissao);
    $documento = prepareInput($objData->documento);
    $tipo_documento = prepareInput($objData->tipo_documento);
    $vencimento = prepareInput($objData->vencimento);
    $desconto_valor = prepareInput($objData->desconto_valor);
    $desconto_cpl = prepareInput($objData->desconto_cpl);
    $desconto_conta = prepareInput($objData->desconto_conta);
    $retencao_inss_valor = prepareInput($objData->retencao_inss_valor);
    $retencao_inss_cpl = prepareInput($objData->retencao_inss_cpl);
    $retencao_inss_conta = prepareInput($objData->retencao_inss_conta);
    $retencao_ir_valor = prepareInput($objData->retencao_ir_valor);
    $retencao_ir_cpl = prepareInput($objData->retencao_ir_cpl);
    $retencao_ir_conta = prepareInput($objData->retencao_ir_conta);
    $retencao_iss_valor = prepareInput($objData->retencao_iss_valor);
    $retencao_iss_cpl = prepareInput($objData->retencao_iss_cpl);
    $retencao_iss_conta = prepareInput($objData->retencao_iss_conta);
    $retencao_pis_valor = prepareInput($objData->retencao_pis_valor);
    $retencao_pis_cpl = prepareInput($objData->retencao_pis_cpl);
    $retencao_pis_conta = prepareInput($objData->retencao_pis_conta);
    $retencao_cofins_valor = prepareInput($objData->retencao_cofins_valor);
    $retencao_cofins_cpl = prepareInput($objData->retencao_cofins_cpl);
    $retencao_cofins_conta = prepareInput($objData->retencao_cofins_conta);
    $retencao_csll_valor = prepareInput($objData->retencao_csll_valor);
    $retencao_csll_cpl = prepareInput($objData->retencao_csll_cpl);
    $retencao_csll_conta = prepareInput($objData->retencao_csll_conta);
    $complemento = prepareInput($objData->complemento);

    $os = new OS();

        $result = $os->updateServicoItemFinanceiro($chave, $Moeda, $valor, $valor1, $repasse, $emissao, $vencimento, $documento, $tipo_documento, $desconto_valor, $desconto_cpl, $desconto_conta, $retencao_inss_valor, $retencao_inss_cpl, $retencao_inss_conta, $retencao_ir_valor, $retencao_ir_cpl, $retencao_ir_conta, $retencao_iss_valor, $retencao_iss_cpl, $retencao_iss_conta, $retencao_pis_valor, $retencao_pis_cpl, $retencao_pis_conta, $retencao_cofins_valor, $retencao_cofins_cpl, $retencao_cofins_conta, $retencao_csll_valor, $retencao_csll_cpl, $retencao_csll_conta, $complemento);
} else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>