<?php
namespace App\Controllers;

use App\Models\User;

// Assicuriamoci di includere il model se l'autoload non è ancora perfetto
require_once __DIR__ . '/../Models/User.php';

class UserController {

    /**
     * Esegue il Login
     * POST /api/login
     */
    public function login() {
        $inputJSON = file_get_contents('php://input');
        $input = json_decode($inputJSON, true);

        if (!isset($input['email']) || !isset($input['password'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Dati mancanti"]);
            return;
        }

        $userModel = new User();
        $user = $userModel->findByEmail($input['email']);

        // Verifica se l'utente esiste e se la password corrisponde all'hash
        if ($user && password_verify($input['password'], $user['password_hash'])) {
            
            // Login successo: avviamo la sessione
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_email'] = $user['email'];

            echo json_encode([
                "status" => "success", 
                "message" => "Login effettuato",
                "user" => [
                    "id" => $user['id'],
                    "email" => $user['email']
                ]
            ]);
        } else {
            http_response_code(401); // Unauthorized
            echo json_encode(["status" => "error", "message" => "Credenziali non valide"]);
        }
    }

    /**
     * Verifica se l'utente è loggato (da chiamare al caricamento di React)
     * GET /api/check-auth
     */
    public function checkAuth() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (isset($_SESSION['user_id'])) {
            echo json_encode([
                "status" => "authenticated",
                "user" => [
                    "id" => $_SESSION['user_id'],
                    "email" => $_SESSION['user_email']
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["status" => "guest", "message" => "Non autenticato"]);
        }
    }

    /**
     * Esegue il Logout
     * POST /api/logout
     */
    public function logout() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        session_destroy();
        
        echo json_encode(["status" => "success", "message" => "Logout effettuato"]);
    }
}