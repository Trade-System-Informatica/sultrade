<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

include_once '../classes/Navios.php';
include_once '../classes/Operadores.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if($objData != NULL){
    $token = prepareInput($objData->token);

    $operadores = new Operadores();
    $navios = new Navios();

    //if($result == 'true'){
        $result = $navios->getNavios();
   //}
} else {
    $result = "false";
}

echo json_encode($result);
//echo(json_encode($result));
exit;

?>