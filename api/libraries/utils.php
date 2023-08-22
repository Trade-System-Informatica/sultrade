<?php
function prepareInput($input){
    $input = stripslashes($input);
    $input = trim($input);
    return $input;
}

function removerCaracteresEspeciais($string) {
    $caracteresEspeciais = ["$", "@", "!", "?", ".", ",", "#", "%", "&", "*", "(", ")", "/", "\\", "|", "`", "´", "'", '"', "[", "]", "{", "}", "ª", "º", "°", "<", ">", "^", "~", "+", "-", "=", "_", "§"];
    $return = $string;

    foreach($caracteresEspeciais as $caracterEspecial) {
        $return = str_replace($caracterEspecial, "", $return);
    }

    return $return;
}

function generateRandonToken($size=50, $lower=true, $symbol=false){
    $low = 'abcdefghijklmnopqrstuvwxyz';
    $up = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $num = '1234567890';
    $symb = '!@#$%*-';
    $code = '';
    $text = '';
    $text .= $up; 
    $text .= $num;
    if ($lower){
        $text .= $low;
    }
    if ($symbol){
        $text .= $symb;
    } 
    $len = strlen($text);
    for ($n = 1; $n <= $size; $n++) {
        $rand = mt_rand(1, $len);
        $code .= $text[$rand-1];
    }
    return $code;
}

function savePicture($picture ,$name, $format, $ext){
    if($name == null){
        $name = date('m-d-Y-H-i-s', time());
        $name = str_replace("-","",$name);
        $name = $name;
    } 

    $link = $name.'.'.$ext;
    $link = "documents/pictures/" . $link;

    $img = $picture;
    $img = str_replace('data:'.$format.';base64,', '', $img);
    $img = str_replace(' ', '+', $img);
    $data = base64_decode($img);

    if (file_exists("../../../$link")) {
        unlink("../../../$link");
    }
    
    file_put_contents('../../../'.$link, $data);

    return "../$link";
}

function saveDocs($picture, $name, $format, $ext)
{
    if ($name == null) {
        $name = date('m-d-Y-H-i-s', time());
        $name = str_replace("-", "", $name);
        $name = $name;
    }

    $link = $name . '.' . $ext;
    $link = "documents/docs/" . $link;

    $img = $picture;
    $img = str_replace('data:' . $format . ';base64,', '', $img);
    $img = str_replace(' ', '+', $img);
    $data = base64_decode($img);

    if (file_exists("../../../$link")) {
        unlink("../../../$link");
    }

    file_put_contents('../../../' . $link, $data);

    return "../$link";
}

function saveFornAnexo($doc, $name, $format, $ext, $key) {
    if($name == null){
        $name = date('m-d-Y-H-i-s', time());
        $name = str_replace("-","",$name);
        $name = $name . "-$key";
    } 

    $link = $name.'.'.$ext;
    $fullName = $link;
    $link = "documents/fornDocs/" . $link;

    $img = $doc;
    $img = str_replace('data:'.$format.';base64,', '', $img);
    $img = str_replace(' ', '+', $img);
    $data = base64_decode($img);

    file_put_contents('../../../'.$link, $data);

    return $fullName;
}

function savePDF($picture, $name = null){
    if($name == null){
        $name = date('m-d-Y-H-i-s', time());
        $name = str_replace("-","",$name);
    } 

    $link = $name;
    $link = "documents/docs/" . $link;

    $img = $picture;
    $img = str_replace('data:application/pdf;base64,', '', $img);
    $img = str_replace(' ', '+', $img);
    $data = base64_decode($img);

    file_put_contents('../../../'.$link, $data);

    return $name;
}

function saveInvoice($picture, $name)
{
    $link = $name;
    $link = "documents/invoices/" . $link;

    $img = $picture;
    $img = str_replace('data:application/pdf;base64,', '', $img);
    $img = str_replace(' ', '+', $img);
    $data = base64_decode($img);

    file_put_contents('../../../' . $link.'.pdf', $data);

    return $name;
}


function deletePicture ($name){
    unlink('../pictures/'.$name.'.png');
}
