<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

include_once '../classes/Feed.php';
include_once '../classes/Clients.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if($objData != NULL){
    $token = prepareInput($objData->token);
    $id_ship = prepareInput($objData->id_ship);

    $clients = new Clients();
    $feed = new Feed();

    $result = $clients->checkToken($token);
    //if($result == 'true'){
        $result = $feed->getFeed($id_ship);
    //}
} else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>