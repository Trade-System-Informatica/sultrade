<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type: application/x-www-form-urlencoded");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

//Load Composer's autoloader
require_once '../libraries/PHPMailer.php';
require_once '../libraries/Exception.php';
require_once '../libraries/SMTP.php';
require_once '../libraries/POP3.php';
require_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);
$emails = $objData->emails;
$mensagem = $objData->mensagem;

$return = ['successes' => [], 'failures' => [], 'warnings' => []];

//Create an instance; passing `true` enables exceptions
$mail = new PHPMailer;

for ($i=0; $i<count($emails); $i++) {
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

    $mail->Host       = 'smtp.tradesystem.com.br';                     //Set the SMTP server to send through
    $mail->SMTPAuth   = true;                                   //Enable SMTP authentication
    $mail->Username   = 'no-reply@tradesystem.com.br';                     //SMTP username
    $mail->Password   = 'Trade@6760@no-reply';                               //SMTP password
    //$mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;            //Enable implicit TLS encryption
    $mail->Port  = 587;   

    //Recipients
    $mail->setFrom('no-reply@tradesystem.com.br', 'Sultrade');

        $mail->addAddress($emails[$i]);     //Add a recipient
        $mail->addCC('no-reply@tradesystem.com.br');
        $mail->addBCC('no-reply@tradesystem.com.br');
        
        //Content
        $mail->isHTML(true);                                  //Set email format to HTML
        $mail->Subject = 'SOA - Statement of Account';
        $mail->Body    = $mensagem;
        
        if (!PHPMailer::validateAddress($emails[$i])){ 
            array_push($return['failures'], $emails[$i]);
         } else {
            $mail->send();
            array_push($return['successes'], $emails[$i]);
        }
    } catch (Exception $e) {
        array_push($return['warnings'], "Message could not be sent. Mailer Error: {$mail->ErrorInfo}");
    }
}

echo(json_encode($return));
exit;
?>