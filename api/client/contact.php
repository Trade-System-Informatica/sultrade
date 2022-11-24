<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

include_once '../classes/Employees.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if($objData != NULL){
    $id_employee = prepareInput($objData->id_employee);

    $employees = new Employees();
    $result = $employees->getEmployee($id_employee);
} else {
    $result = "false";
}

echo(json_encode($result));
exit;

?>