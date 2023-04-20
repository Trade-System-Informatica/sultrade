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
    $protocolonfe = prepareInput($objData->protocolonfe);
    $chavenfe = prepareInput($objData->chavenfe);
    $urlqrcode = prepareInput($objData->urlqrcode);
    $serie = prepareInput($objData->serie);
    
    $contas = new Contas();


    $result = $contas->updateFaturaNotaEnviada($Chave, $protocolonfe, $chavenfe, $urlqrcode, $serie);

    } else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>