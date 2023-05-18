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
    $Centro_Custo = prepareInput($objData->Centro_Custo);
    $Conta_Desconto = prepareInput($objData->Conta_Desconto);
    $Historico = prepareInput($objData->Historico);
    $Parc_Ini = prepareInput($objData->Parc_Ini);
    $Parc_Fim = prepareInput($objData->Parc_Fim);
    $RepCodBar = prepareInput($objData->RepCodBar);
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

    $os_manual = prepareInput($objData->os_manual);
    $navio_manual = prepareInput($objData->navio_manual);
    $porto_manual = prepareInput($objData->porto_manual);
    $roe_manual = prepareInput($objData->roe_manual);
    $bank_charges_manual = prepareInput($objData->bank_charges_manual);
    $discount_manual = prepareInput($objData->discount_manual);
    $received_manual = prepareInput($objData->received_manual);
    
    
    $contas = new Contas();


    $result = $contas->updateContaCliente($Chave, $Lancto, $Tipo, $Pessoa, $Conta_Contabil, $Centro_Custo, $Conta_Bloqueto, $Historico, $Parc_Ini, $Parc_Fim, $RepCodBar, $Valor, $Saldo, $Vencimento, $Vencimento_Original, $Conta_Provisao, $Empresa, $Docto, $tipodocto, $meioPagamento, $meioPagamentoNome, $codigo_receita, $contribuinte, $codigo_identificador_tributo, $mes_compet_num_ref, $data_apuracao, $darfValor, $darfMulta, $darfJuros, $darfOutros, $darfPagamento, $tipo_pix, $os_manual, $navio_manual,$porto_manual, $roe_manual, $bank_charges_manual, $discount_manual, $received_manual);

    } else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>