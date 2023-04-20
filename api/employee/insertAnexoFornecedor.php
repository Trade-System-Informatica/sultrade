<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

//application/x-httpd-php updateSeaport.php ( PHP script, ASCII text, with CRLF line terminators )
include_once '../classes/Pessoas.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if($objData != NULL){
    $token = prepareInput($objData->token);
    $fornecedor = prepareInput($objData->fornecedor);
    $evento = prepareInput($objData->evento);
    $vencimento = prepareInput($objData->vencimento);
    $envio = prepareInput($objData->envio);
    $files = $objData->files;
    
    if (!is_array($files)) {
        exit;
    }
    
    $pessoas = new Pessoas();
    foreach ($files as $file) {
        
        $name = saveFornAnexo($file->{"file"}, "", $file->{"format"}, $file->{"ext"}, $os."_".$file->{"key"}."_$fornecedor");    
        $result = $pessoas->insertAnexoFornecedor($fornecedor, $evento, $vencimento, $envio, $name);
    }
    
} else {
    $result = "false";
}

echo json_decode($result);
exit;

?>