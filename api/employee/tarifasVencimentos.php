<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

//application/x-httpd-php updateSeaport.php ( PHP script, ASCII text, with CRLF line terminators )
include_once '../classes/Pessoas.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
    
$pessoas = new Pessoas();

$result = $pessoas->anexosVencimentos();    


echo(json_encode($result));
exit;
