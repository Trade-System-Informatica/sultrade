<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

include_once '../classes/OS.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

if($objData != NULL){
    
    
    $documento = prepareInput($objData->documento);
    $format = prepareInput($objData->format);
    $ext = prepareInput($objData->ext);
    
    $chave = prepareInput($objData->chave);
    $descricao = prepareInput($objData->descricao);
    $tipo = prepareInput($objData->tipo);
    $caminho = prepareInput($objData->caminho);

    $os = new OS();

    
    $caminhoNovo = '';
    $caminhoQuebrado = explode('.', $caminho);
    for ($i = 0; $i < count($caminhoQuebrado)-1; $i ++) {
        $caminhoNovo .= $caminhoQuebrado[$i];
    }
    
    $caminhoCompleto = $caminhoNovo.'.'.$ext;  
    
    
    $result = $os->trocaDocumento($chave, $descricao, $tipo, $ext, $caminhoCompleto);

    unlink('../pictures/'.$caminho);
    savePicture($documento, $caminhoNovo, $format, $ext);
    
    
    
} else {
    $result = "false";
}


echo('true');
exit;

?>