<?php
namespace App\Controllers;

use App\Models\Message;
use Core\Mailer;
use Exception;

class ContactController {

    public function submit() {
        $inputJSON = file_get_contents('php://input');
        $input = json_decode($inputJSON, true);

        if (!isset($input['email']) || !isset($input['message'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Dati mancanti"]);
            return;
        }

        // 1. Salva nel DB
        $messageModel = new Message();
        try {
            $messageModel->create($input);

            // 2. Prepara la mail di notifica per l'Admin
            $adminEmail = $_ENV['SMTP_USER']; // O un'altra mail admin definita nel .env
            $subject = "Nuovo contatto da Blend Studio: " . $input['name'];
            $body = "
                <h3>Hai ricevuto un nuovo messaggio</h3>
                <p><strong>Nome:</strong> {$input['name']}</p>
                <p><strong>Email:</strong> {$input['email']}</p>
                <p><strong>Telefono:</strong> " . ($input['phone'] ?? 'N/A') . "</p>
                <p><strong>Messaggio:</strong><br>{$input['message']}</p>
            ";

            // 3. Invia la mail
            $mailSent = Mailer::send($adminEmail, $subject, $body);

            echo json_encode([
                "status" => "success", 
                "message" => "Messaggio ricevuto", 
                "mail_sent" => $mailSent
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Errore server"]);
        }
    }
}