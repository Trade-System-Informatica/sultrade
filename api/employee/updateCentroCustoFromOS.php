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
    $OSCodigo = prepareInput($objData->OSCodigo);
    $Descricao = prepareInput($objData->Descricao);
    $Cliente = prepareInput($objData->Cliente);
    
    $os = new OS();

    //$result = $employees->checkToken($token);
    //if($result == 'true'){
        //$result = "'" . $id_seaport . "'";
        $result = $os->updateCentroCustoFromOS($Descricao, $Cliente, $OSCodigo);
    //}
} else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>