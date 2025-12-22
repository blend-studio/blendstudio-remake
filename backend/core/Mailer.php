<?php
namespace Core;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class Mailer {
    public static function send($toEmail, $subject, $bodyHtml) {
        $mail = new PHPMailer(true);

        try {
            // Configurazione Server
            $mail->isSMTP();
            $mail->Host       = $_ENV['SMTP_HOST'];
            $mail->SMTPAuth   = true;
            $mail->Username   = $_ENV['SMTP_USER'];
            $mail->Password   = $_ENV['SMTP_PASS'];
            $mail->SMTPSecure = $_ENV['SMTP_SECURE']; // 'tls' o 'ssl'
            $mail->Port       = $_ENV['SMTP_PORT'];

            // Mittente e Destinatario
            $mail->setFrom($_ENV['SMTP_FROM_EMAIL'], $_ENV['SMTP_FROM_NAME']);
            
            // Se $toEmail è l'admin (noi stessi) o un cliente
            $mail->addAddress($toEmail); 

            // Contenuto
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $bodyHtml;
            $mail->AltBody = strip_tags($bodyHtml); // Versione testo semplice

            $mail->send();
            return true;
        } catch (Exception $e) {
            // Log dell'errore (in produzione usa un file di log, non echo)
            error_log("Errore Mailer: {$mail->ErrorInfo}");
            return false;
        }
    }
}