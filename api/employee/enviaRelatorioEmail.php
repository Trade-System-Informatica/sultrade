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
include_once '../classes/Pessoas.php';
include_once '../libraries/utils.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);

$emails = $objData->emails;
$mensagem = $objData->mensagem;
$nomeCliente = prepareInput($objData->nomeCliente);
$balance = prepareInput($objData->balance);
$clientId = $objData->clientId;
$salvar = $objData->salvar;
$pessoas = new Pessoas();
$contatos = $pessoas->getContatoEmail($clientId);

if (sizeof($contatos)==0){
    foreach ($emails as $email) {
        $values = "'ER','$email', '', $clientId";
        $result = $pessoas->insertContato($values);
    }
}else{
    foreach ($contatos as $contato) {
        if (isset($contato['Tipo']) && $contato['Tipo'] == 'EM' || $contato['Tipo'] == 'ER') {
            foreach ($emails as $email) {
                if ($email == $contato['Campo1']){
                    $salvar = false;
                }else{
                    $values = "'ER','$email', '', $clientId";
                    $result = $pessoas->insertContato($values);
                }
            }
        }
    }
}

$currentDate = date('M jS\, Y');

$return = ['successes' => [], 'failures' => [], 'warnings' => []];

//Create an instance; passing `true` enables exceptions
$mail = new PHPMailer;
$mail->CharSet = "UTF-8";

if ($emails[0]) {
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

        foreach ($emails as $email) {
            $mail->addAddress($email);     //Add a recipient

            if (!PHPMailer::validateAddress($email)) {
                array_push($return['failures'], $email);
            } else {
                array_push($return['successes'], $email);
            }
        }
        $mail->addAddress('disbursements@sultradeagency.com');
        $mail->addCC('soa@sultradeagency.com');
        $mail->addBCC('soa@sultradeagency.com');

        //Content
        $mail->isHTML(true);                                  //Set email format to HTML
        $mail->Subject = "SOA - ".strtoupper($nomeCliente)." - UPDATED ".$currentDate." - $balance";
        $mail->Body    = "
        <span>TO: <b>".strtoupper($nomeCliente)."</b></span><br/>
        <span>FROM: <b>SULTRADE SHIPPING AGENCY</b></span><br/><br/>

        <span>Dear ladies and Gentlemen,</span><br/><br/>

        <span>Good Day!</span><br/><br/>

        <span>We would like to present an attached SOA (Statement of Account) regarding vessels sailed and FDAs already submitted to your company referent to services provided by Sultrade.</span><br/><br/>
        
        <span>Be so kind to inform by return the remittance prospects in order to schedule it internally.</span><br/><br/>

        <span>Remaining at your orders in case of any discrepancy on the attached file</span><br/><br/>

        <span>Looking forward to your kindly and soonest reply.</span><br/><br/>

        <span>Our kind regards,<span><br/>
        <span>Sultrade Shipping Agency</span><br/>
        <span>Accounting Dept.</span><br/>
        <span>Phone: +55 53 32353500</span><br/>
        <span>E-mail: soa@sultrade-ag.com.br</span>
        ";

        $anexo = explode(",", $mensagem)[1];
        $type = str_replace("data:", "", explode(";", $mensagem)[0]);

        $mail->AddStringAttachment(base64_decode($anexo), "SOA - ".strtoupper($nomeCliente).".pdf", "base64", $type);
        $mail->send();
    } catch (Exception $e) {
        array_push($return['warnings'], "Message could not be sent. Mailer Error: {$mail->ErrorInfo}");
    }
}


echo (json_encode($return));
exit;
