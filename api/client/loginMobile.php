<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

include_once '../classes/Clients.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if($objData != NULL){
    $username = prepareInput($objData->username);
    $password = prepareInput($objData->password);

    $clients = new Clients();
    $result = $clients->approveLoginMobile($username, $password);
    if($result != "false"){

    }
} else {
    $result = "false";
}

echo(json_encode($result));
exit;
/*UY3pHiqPgFNPPYeyfvfP4w*/
?>
