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
$urlFaturamento = "../documents/docs/instrucao_fat.pdf";

$emails = $objData->emails;
$remarks = $objData->remarks;
$os = $objData->os;
$navio = $objData->navio;
$porto = $objData->porto;
$anexos = $objData->anexos;
$anexosNomes = $objData->anexosNomes;
$fornecedor = prepareInput($objData->fornecedor);
$corpo = prepareInput($objData->corpo);
$assunto = prepareInput($objData->assunto);
$mensagemPadrao = "Para melhor identificacao dos processos internos de pagamento, solicitamos que toda prestacao de servico e/ou venda tenha destacada na nota fiscal numero da ordem de servico, nome do navio e porto (Neste caso: ".$os." - ".$navio." - PORTO: ".$porto.")";
$return = ['successes' => [], 'failures' => [], 'warnings' => []];

if ($corpo) {
    $body = "<div style='width: 100%; display: flex; justify-content: center; align-items: center;'><img src='https://i.ibb.co/G5Z8qmT/logo.png' alt='logo' border='0'></div>
        <br><div style='font-size: 1.1em'><pre>".$corpo."</pre></div>";
} else {
    $body = "<div style='width: 100%; display: flex; justify-content: center; align-items: center;'><img src='https://i.ibb.co/G5Z8qmT/logo.png' alt='logo' border='0'></div>
        <br><div style='font-size: 1.1em'><b>".str_replace( "\n", "<br>", $remarks)."</b>$os<br><br>".$mensagemPadrao.",
    <br><br>Permanecemos a disposicao.<br><br>Saudacoes,</div>";
}

$body .= "<br/><br/><br/><span><a href='http://ftptrade.ddns.net:2243/anexos/$os/$fornecedor'>Enviar documentos</a></span>";

if (!is_array($emails) || !is_array($anexos) && $anexos != null) {
    echo $return;
    exit;
}

if ($assunto) {
    $subject = $assunto;
} else {
    $subject = 'Apontamento de OS '.$os;
}


if ($obs) {
    $obs = "<br/><br/>$os";
}
//Create an instance; passing `true` enables exceptions
$mail = new PHPMailer;
$mail->CharSet="UTF-8";

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
    $mail->Port       = 587;   

    //Recipients
    $mail->setFrom('no-reply@tradesystem.com.br', 'Sultrade');

        $mail->addAddress($emails[$i]);     //Add a recipient
        //$mail->addAddress("sultrade@sultradeagency.com");     //Add a recipient
        $mail->addCC('no-reply@tradesystem.com.br');
        $mail->addBCC('no-reply@tradesystem.com.br');
        
        for ($e = 0; $e < count($anexos); $e++) {
            $anexo = explode(",", $anexos[$e])[1];
            $anexoNome = $anexosNomes[$e];
            $type = str_replace("data:","",explode(";", $anexos[$e])[0]);
    
            $mail->AddStringAttachment(base64_decode($anexo), $anexoNome, "base64", $type);
        }
        $mail->addStringAttachment(file_get_contents($urlFaturamento), 'Instrução de Faturamento.pdf');
        //Content
        $mail->isHTML(true);                                  //Set email format to HTML
        $mail->Subject = $subject;
        $mail->Body    = $body;
        $mail->AltBody = $remarks."\n\n".$mensagemPadrao.",
        \n\nPermanecemos a disposição.\n\nSaudações,";
        
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