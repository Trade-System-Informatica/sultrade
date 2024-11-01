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
$mail = new PHPMailer(true);
$mail->CharSet = "UTF-8";

foreach ($chaves as $chave) {
    $item = $pessoas->getFornecedoresAnexosInfo($chave);
    $item = $item[0];
    $assunto = "Vencimento do tarifário/tabela de preços - ".$item["nome"];

    $return = ['successes' => [], 'failures' => [], 'warnings' => []];

    try {
        $mail->isSMTP();
        $mail->SMTPOptions = [
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            ]
        ];  
        $mail->Host       = 'smtp.tradesystem.com.br';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'no-reply@tradesystem.com.br';
        $mail->Password   = 'Trade@1697';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port  = 587;

        //Recipients
        $mail->setFrom('no-reply@tradesystem.com.br', 'Sultrade Agency');

        $mail->addAddress($item["email"]);     //Add a recipient
        $mail->addAddress("sultrade@sultradeagency.com");     //Add a recipient
        $mail->addCC('soa@sultradeagency.com');
        $mail->addBCC('soa@sultradeagency.com');
        $mail->addReplyTo('soa@sultradeagency.com', 'Sultrade Agency');

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
