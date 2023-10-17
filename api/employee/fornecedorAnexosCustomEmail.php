<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

//application/x-httpd-php updateSeaport.php ( PHP script, ASCII text, with CRLF line terminators )
require_once '../libraries/PHPMailer.php';
require_once '../libraries/Exception.php';
require_once '../libraries/SMTP.php';
require_once '../libraries/POP3.php';
include_once '../classes/Pessoas.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

$pessoas = new Pessoas();
$email = prepareInput($objData->email);
$assunto = prepareInput($objData->assunto);
$corpo = prepareInput($objData->corpo);
$anexos = $objData->anexos;
$anexosNomes = $objData->anexosNomes;
$mail = new PHPMailer;
$mail->CharSet = "UTF-8";

$return = ['successes' => [], 'failures' => [], 'warnings' => []];

try {
    //Server settings
    //$mail->SMTPDebug = SMTP::DEBUG_CONNECTION;                      //Enable verbose debug output
    $mail->isSMTP();       //Send using SMTP
    $mail->SMTPOptions = [
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        ]
    ];

    $mail->Host       = 'mail.vetorial.com';                     //Set the SMTP server to send through
    $mail->SMTPAuth   = true;                                   //Enable SMTP authentication
    $mail->Username   = 'soa@sultradeagency.com';                     //SMTP username
    $mail->Password   = 'Trade@2023#';                               //SMTP password
    $mail->SMTPSecure = 'ssl'; //PHPMailer::ENCRYPTION_SMTPS;            //Enable implicit TLS encryption
    $mail->Port  = 465;

    //Recipients
    $mail->setFrom('soa@sultradeagency.com', 'Sultrade Agency');

    $mail->addAddress($email);     //Add a recipient
    $mail->addAddress("sultrade@sultradeagency.com");     //Add a recipient
    $mail->addCC('soa@sultradeagency.com');
    $mail->addBCC('soa@sultradeagency.com');

    //Content
    $mail->isHTML(true);                                  //Set email format to HTML
    $mail->Subject = $assunto;
    $mail->Body    = "<div style='width: 100%; display: flex; justify-content: center; align-items: center;'><img src='https://i.ibb.co/G5Z8qmT/logo.png' alt='logo' border='0'></div><div>
            <pre>$corpo</pre>
            </div>";


    for ($i = 0; $i < count($anexos); $i++) {
        $anexo = explode(",", $anexos[$i])[1];
        $anexoNome = $anexosNomes[$i];
        $type = str_replace("data:","",explode(";", $anexos[$i])[0]);

        $mail->AddStringAttachment(base64_decode($anexo), $anexoNome, "base64", $type);
    }

    if (!PHPMailer::validateAddress($email)) {
        array_push($return['failures'], $email);
    } else {
        $mail->send();
        array_push($return['successes'], $email);
    }
} catch (Exception $e) {
    array_push($return['warnings'], "Message could not be sent. Mailer Error: {$mail->ErrorInfo}");
}


echo (json_encode($result));
exit;
