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
$chaves = $objData->chaves;
$corpo = "Prezados,

Gentileza notar que detectamos em nosso banco de dados que o tarifário/tabela de preços fornecido está preste a vencer. 
Gentileza encaminhar tarifas atualizadas para nova vigência ou confirmar a prorrogação da vigência.

Atenciosamente,
Sultrade Shipping Agency
Phone: +55 (53) 32353500
E-mail: sultrade@sultradeagency.com
Visit us: www.sultradeagency.com";
$mail = new PHPMailer;
$mail->CharSet = "UTF-8";

foreach ($chaves as $chave) {
    $item = $pessoas->getFornecedoresAnexosInfo($chave);
    $item = $item[0];
    $assunto = "Vencimento do tarifário/tabela de preços - ".$item["nome"];

    $return = ['successes' => [], 'failures' => [], 'warnings' => []];

    try {
        //Server settings
        //$mail->SMTPDebug = SMTP::DEBUG_CONNECTION;                      //Enable verbose debug output
        $mail->isSMTP();       //Send using SMTP
        $mail->Host       = 'Smtp.office365.com';                     //Set the SMTP server to send through
        $mail->SMTPAuth   = true;                                   //Enable SMTP authentication
        $mail->Username   = 'soa@sultradeagency.com';                     //SMTP username
        $mail->Password   = 'C&773531409775un';                               //SMTP password
        $mail->SMTPSecure = 'tls'; //PHPMailer::ENCRYPTION_SMTPS;            //Enable implicit TLS encryption
        $mail->Port  = 587;

        //Recipients
        $mail->setFrom('soa@sultradeagency.com', 'Sultrade Agency');

        $mail->addAddress($item["email"]);     //Add a recipient
        $mail->addAddress("sultrade@sultradeagency.com");     //Add a recipient
        $mail->addCC('soa@sultradeagency.com');
        $mail->addBCC('soa@sultradeagency.com');

        //Content
        $mail->isHTML(true);                                  //Set email format to HTML
        $mail->Subject = $assunto;
        $mail->Body    = "<div>
                <pre>" . $corpo . "</pre>
                </div><div style='width: 100%; display: flex; align-items: center;'><img src='https://i.ibb.co/G5Z8qmT/logo.png' alt='logo' border='0'></div>";
                
        if (!PHPMailer::validateAddress($item["email"])) {
            array_push($return['failures'], $item["email"]);
        } else {
            $mail->send();
            array_push($return['successes'], $item["email"]);
            $pessoas->anexosEnviados($chave);
        }
    } catch (Exception $e) {
        array_push($return['warnings'], "Message could not be sent. Mailer Error: {$mail->ErrorInfo}");
    }
}

echo (json_encode($result));
exit;
