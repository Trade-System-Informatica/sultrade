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
require_once '../libraries/fpdf.php';

$data = file_get_contents("php://input");
$objData = json_decode($data);
$os = prepareInput($objData->os);
$navio = prepareInput($objData->navio);
$cliente = prepareInput($objData->cliente);
$servico = prepareInput($objData->servico);
$operador = prepareInput($objData->operador);
$porto = prepareInput($objData->porto);
$eta = prepareInput($objData->eta);
$etb = prepareInput($objData->etb);
$data_saida = prepareInput($objData->data_saida);

if ($os) {

    $pdf = new FPDF();
    $pdf->AddPage();
    $pdf->SetFont('arial', '', 16);
    $pdf->Cell(40, 10, "NAVIO: ".iconv('UTF-8', 'windows-1252', $navio));
    $pdf->Ln(10);
    $pdf->Cell(40, 10, "PO: ".iconv('UTF-8', 'windows-1252', $os));
    $pdf->Ln(20);
    $pdf->Cell(40, 10, "CLIENTE: ".iconv('UTF-8', 'windows-1252', $cliente));
    $pdf->Ln(10);
    $pdf->Cell(40, 10, "SERVICO: ".iconv('UTF-8', 'windows-1252', $servico));
    $pdf->Ln(10);
    $pdf->Cell(40, 10, "PORTO: ".iconv('UTF-8', 'windows-1252', $porto));
    $pdf->Ln(10);
    $pdf->Cell(40, 10, "OPERADOR: ".iconv('UTF-8', 'windows-1252', $operador));
    $pdf->Ln(20);
    $pdf->Cell(40, 10, "E.T.A.: ".iconv('UTF-8', 'windows-1252', $eta));
    $pdf->Ln(20);
    $pdf->Cell(40, 10, "E.T.B.: ".iconv('UTF-8', 'windows-1252', $etb));
    $pdf->Ln(20);
    $pdf->Cell(40, 10, "E.T.S.: ".iconv('UTF-8', 'windows-1252', $data_saida));
    $pdf->Ln(20);
    $pdf->Cell(40, 10, 'DATA DO FATURAMENTO: _____/_____/__________');
    $pdf->Ln(20);
    $pdf->Cell(40, 10, 'ASSINATURA: ________________________________');
    $pdfdoc = $pdf->Output('S', '');


    //Create an instance; passing `true` enables exceptions
    $mail = new PHPMailer;
    $mail->CharSet="UTF-8";
    //for ($i=0; $i<count($emails); $i++) {
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

        $mail->addAddress('dev2@tradesystem.com.br');     //Add a recipient
        
        //$mail->addAddress('operations@sultradeagency.com');     //Add a recipient
        //$mail->addAddress('accounts@sultradeagency.com');     //Add a recipient
        $mail->addCC('no-reply@tradesystem.com.br');
        $mail->addBCC('no-reply@tradesystem.com.br');

        //Content
        $mail->isHTML(true);                                  //Set email format to HTML
        $mail->Subject = "Abertura de OS: $os $navio - $porto";
        $mail->Body    = " ";
        $mail->addStringAttachment($pdfdoc, "OS_$os.pdf");

        $mail->send();
    } catch (Exception $e) {
        array_push($return['warnings'], "Message could not be sent. Mailer Error: {$mail->ErrorInfo}");
        //}
    }
}

echo ((true));
exit;
