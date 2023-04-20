<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

include_once '../libraries/utils.php';
include_once '../classes/Operadores.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if ($objData != NULL) {
    $lancamentos = $objData->lancamentos;
    $empresa = prepareInput($objData->empresa);
    
    $operadores = new Operadores();
    $cnpj = $operadores->getControleDados($empresa);
    $cnpj = $cnpj[0]["CNPJ"];
    
    $content = "|0000|$cnpj|\n";

    foreach ($lancamentos as $lancto) {
        $valor = $lancto->{"Valor"};
        $valor = str_replace(".",",",$valor);

        $content .= "|0451|".$lancto->{"ContaDebito"}."|".$lancto->{"ContaCredito"}."|".$valor."|".$lancto->{"Historico_Padrao"}."|".$lancto->{"Historico"}."|\n";
    }
/*
    $fp = fopen("../documents/exports/export.txt","wb");
    fwrite($fp,$content);
    fclose($fp);*/

} else {
}

echo ($content);
exit;
