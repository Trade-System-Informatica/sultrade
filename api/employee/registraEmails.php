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
    $email_enviado = prepareInput($objData->email_enviado);
    $data_email = prepareInput($objData->data_email);
    $chave = prepareInput($objData->chave);
    $os = new OS();

    $result = $os->registraEmails($email_enviado, $data_email, $chave);

} else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>