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
    $base64 = prepareInput($objData->base64);
    $name = prepareInput($objData->name);
    $os = prepareInput($objData->os);
    
    $OS = new OS();
        
    saveInvoice($base64, $name); 
    $result = $OS->salvaInvoice($os, 55, $name, "$name.pdf");
} else {
    $result = "false";
}

echo json_decode(true);
exit;

?>