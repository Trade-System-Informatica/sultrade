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
    $Chave = prepareInput($objData->Chave);
    $Descricao = prepareInput($objData->Descricao);
    $Chave_Cliente = prepareInput($objData->Chave_Cliente);
    $chave_navio = prepareInput($objData->chave_navio);
    $Data_Abertura = prepareInput($objData->Data_Abertura);
    $Data_Chegada = prepareInput($objData->Data_Chegada);
    $chave_tipo_servico = prepareInput($objData->chave_tipo_servico);
    $viagem = prepareInput($objData->viagem);
    $porto = prepareInput($objData->porto);
    $Data_Saida = prepareInput($objData->Data_Saida);
    $Data_Encerramento = prepareInput($objData->Data_Encerramento);
    $Data_Faturamento = prepareInput($objData->Data_Faturamento);
    $centro_custo = prepareInput($objData->centro_custo);
    $ROE = prepareInput($objData->ROE);
    $Comentario_Voucher = prepareInput($objData->Comentario_Voucher);
    $encerradoPor = prepareInput($objData->encerradoPor);
    $faturadoPor = prepareInput($objData->faturadoPor);
    $Empresa = prepareInput($objData->Empresa);
    $eta = prepareInput($objData->eta);
    $atb = prepareInput($objData->atb);
    $etb = prepareInput($objData->etb);
    $governmentTaxes = prepareInput($objData->governmentTaxes);
    $bankCharges = prepareInput($objData->bankCharges);

    $os = new OS();

        $result = $os->updateOS($Chave, $Descricao, $Chave_Cliente, $chave_navio, $Data_Abertura, $Data_Chegada, $chave_tipo_servico, $viagem, $porto, $Data_Saida, $Data_Encerramento, $Data_Faturamento, $centro_custo, $ROE, $Comentario_Voucher, $encerradoPor, $faturadoPor, $Empresa, $eta, $atb, $etb, $governmentTaxes, $bankCharges);

} else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>