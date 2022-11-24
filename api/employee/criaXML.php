<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

include_once '../classes/Contas.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if ($objData != NULL) {
    $chave = prepareInput($objData->chave);
    $xml = prepareInput($objData->xml);
    $url = prepareInput($objData->url);
    $soap = prepareInput($objData->soap);

    $file = fopen('../pictures/xml_' . $chave . ".xml", 'w');
    fwrite($file, $xml);
    fclose($file);

    $curl = curl_init($url);

    curl_setopt($curl, CURLOPT_HTTPHEADER, array("Content-Type: text/xml"));
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $xml);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

    $result = curl_exec($curl);

    if (curl_errno($curl)) {
        throw new Exception(curl_error($curl));
    }

    curl_close($curl);
} else {
    $result = "false";
}

echo (json_encode($result));
exit;
