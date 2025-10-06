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
    $nome = prepareInput($objData->nome);
    $porto = prepareInput($objData->porto);
    $cliente = prepareInput($objData->cliente);
    $templatesNovas = $objData->templatesNovas;
    $templatesDeletadas = $objData->templatesDeletadas;
    
    $os = new OS();

    //$result = $employees->checkToken($token);
    //if($result == 'true'){
        //$result = "'" . $id_seaport . "'";
        $result = $os->updateGrupoTemplate($chave, $nome, $templatesNovas, $templatesDeletadas, $porto, $cliente);
    //}
} else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>