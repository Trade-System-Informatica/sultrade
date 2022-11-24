<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

include_once '../classes/Clients.php';
include_once '../libraries/utils.php';
include_once '../classes/ClientToken.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if($objData != NULL){
    $username = prepareInput($objData->username);
    $password = prepareInput($objData->password);
    $tokenExpo = prepareInput($objData->tokenExpo);

    $clients = new Clients();
    $clientToken = new ClientToken();
    $result = $clients->approveLoginExpo($username, $password);
    $cliente = $result;
    if($result != "false"){
        $retorno = $clientToken->getClientToken($tokenExpo);
        if(!$retorno){
            $valores = "'" . $tokenExpo . "', " . $result;
            $result = $clientToken->insertClientToken($valores);
        }
       
    }
} else {
    $result = "false";
}

echo(json_encode($cliente));
exit;
/*UY3pHiqPgFNPPYeyfvfP4w*/
?>