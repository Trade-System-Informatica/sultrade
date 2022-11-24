<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

include_once '../classes/Ships.php';
include_once '../classes/Clients.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

$name_user = prepareInput($objData->name_user);


    $clients = new Clients();
    $ships = new Ships();

    //if($result == 'true'){
        $result = $ships->getShipsMobile($name_user);
    //}

echo(json_encode($result));
exit;

?>