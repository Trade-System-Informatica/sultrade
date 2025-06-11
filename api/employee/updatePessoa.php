<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

//application/x-httpd-php updateSeaport.php ( PHP script, ASCII text, with CRLF line terminators )
include_once '../classes/Pessoas.php';
include_once '../classes/Employees.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if($objData != NULL){
    $token = prepareInput($objData->token);
    $Chave = prepareInput($objData->Chave);
    $Nome = prepareInput($objData->Nome);
    $Nome_Fantasia = prepareInput($objData->Nome_Fantasia);
    $Cnpj_Cpf = prepareInput($objData->Cnpj_Cpf);
    $Rg_Ie = prepareInput($objData->Rg_Ie);
    $Inscricao_Municipal = prepareInput($objData->Inscricao_Municipal);
    $Nascimento_Abertura = prepareInput($objData->Nascimento_Abertura);
    $Inclusao = prepareInput($objData->Inclusao);
    $Categoria = prepareInput($objData->Categoria);
    $Conta_Contabil = prepareInput($objData->Conta_Contabil);
    $Conta_Provisao = prepareInput($objData->Conta_Provisao);
    $Conta_Faturar = prepareInput($objData->Conta_Faturar);
    $Indicado = prepareInput($objData->Indicado);
    $Balance = prepareInput($objData->Balance);
    $SubCategoria = prepareInput($objData->SubCategoria);


    $employees = new Employees();
    $pessoas = new Pessoas();

    //$result = $employees->checkToken($token);
    //if($result == 'true'){
        //$result = "'" . $id_seaport . "'";
        $result = $pessoas->updatePessoa($Chave, $Nome, $Nome_Fantasia, $Cnpj_Cpf, $Rg_Ie, $Inscricao_Municipal, $Nascimento_Abertura, $Inclusao, $Categoria, $Conta_Contabil, $Conta_Provisao, $Conta_Faturar, $Balance, $Indicado, $SubCategoria);
    //}
} else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>