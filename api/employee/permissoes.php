<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

include_once '../classes/Employees.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if($objData != NULL){
    $username = prepareInput($objData->username);

    $employees = new Employees();
    $result = $employees->checkPermissions($username);
} else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>