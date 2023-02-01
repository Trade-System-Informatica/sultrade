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
    $Lancto = prepareInput($objData->Lancto);
    $Tipo = prepareInput($objData->Tipo);
    $Pessoa = prepareInput($objData->Pessoa);
    $Conta_Contabil = prepareInput($objData->Conta_Contabil);
    $RepCodBar = prepareInput($objData->RepCodBar);
    $Centro_Custo = prepareInput($objData->Centro_Custo);
    $Historico = prepareInput($objData->Historico);
    $Conta_Desconto = prepareInput($objData->Conta_Desconto);
    $Parc_Ini = prepareInput($objData->Parc_Ini);
    $Parc_Fim = prepareInput($objData->Parc_Fim);
    $Valor = prepareInput($objData->Valor);
    $Saldo = prepareInput($objData->Saldo);
    $Vencimento = prepareInput($objData->Vencimento);
    $Vencimento_Original = prepareInput($objData->Vencimento_Original);
    $Conta_Provisao = prepareInput($objData->Conta_Provisao);
    $Empresa = prepareInput($objData->Empresa);
    $Docto = prepareInput($objData->Docto);
    $tipodocto = prepareInput($objData->tipodocto);
    $meioPagamento = prepareInput($objData->meioPagamento);

    $meioPagamentoNome = prepareInput($objData->meioPagamentoNome);

    $codigo_receita = prepareInput($objData->codigo_receita);
    $contribuinte = prepareInput($objData->contribuinte);
    $codigo_identificador_tributo = prepareInput($objData->codigo_identificador_tributo);
    $mes_compet_num_ref = prepareInput($objData->mes_compet_num_ref);
    $data_apuracao = prepareInput($objData->data_apuracao);
    $darfValor = prepareInput($objData->darfValor);
    $darfMulta = prepareInput($objData->darfMulta);
    $darfJuros = prepareInput($objData->darfJuros);
    $darfOutros = prepareInput($objData->darfOutros);
    $darfPagamento = prepareInput($objData->darfPagamento);
    $tipo_pix = prepareInput($objData->tipo_pix);

    
    $contas = new Contas();

    $result = $contas->updateContaFornecedor($Chave, $Lancto, $Tipo, $Pessoa, $Conta_Contabil, $RepCodBar, $Centro_Custo, $Historico, $Conta_Desconto, $Parc_Ini, $Parc_Fim, $Valor, $Saldo, $Vencimento, $Vencimento_Original, $Conta_Provisao, $Empresa, $Docto, $tipodocto, $meioPagamento, $meioPagamentoNome, $codigo_receita, $contribuinte, $codigo_identificador_tributo, $mes_compet_num_ref, $data_apuracao, $darfValor, $darfMulta, $darfJuros, $darfOutros, $darfPagamento, $tipo_pix);

} else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>