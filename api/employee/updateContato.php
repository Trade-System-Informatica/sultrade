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
    $Tipo = prepareInput($objData->Tipo);
    $Campo1 = prepareInput($objData->Campo1);
    $Campo2 = prepareInput($objData->Campo2);
    $Chave_Pessoa = prepareInput($objData->Chave_Pessoa);

    $employees = new Employees();
    $pessoas = new Pessoas();

    //$result = $employees->checkToken($token);
    //if($result == 'true'){
        //$result = "'" . $id_seaport . "'";
        $result = $pessoas->updateContato($Chave, $Tipo, $Campo1, $Campo2, $Chave_Pessoa);
    //}
} else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>