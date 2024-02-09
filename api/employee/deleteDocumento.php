<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

//include_once '../classes/Employees.php';
include_once '../classes/OS.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if($objData != NULL){
    $token = prepareInput($objData->token);
    $chave = prepareInput($objData->chave);
    $nome = prepareInput($objData->nome);
    $os = new OS();
 
    $tipo = $os->getTipoDocumento($chave);
    if ($tipo[0]['tipo_docto'] == 55){
        unlink('../../../documents/invoices/'.$nome);
    } else{
        unlink('../pictures/'.$nome);
    }

    $result = $os->deleteDocumento($chave);
    
    
} else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>