<?php
namespace App\Models;

use Core\Database;
use \PDO;

class User {

    /**
     * Trova un utente tramite email
     */
    public function findByEmail($email) {
        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
        $stmt->execute([':email' => $email]);
        return $stmt->fetch();
    }

    /**
     * Trova un utente tramite ID (utile per la sessione)
     */
    public function findById($id) {
        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT id, email, created_at FROM users WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    /**
     * Crea un nuovo utente (con password hashata)
     * Utile se vuoi creare un comando per aggiungere admin da codice
     */
    public function create($email, $password) {
        $pdo = Database::getInstance();
        
        // Criptiamo la password prima di salvarla!
        $hash = password_hash($password, PASSWORD_DEFAULT);
        
        $sql = "INSERT INTO users (email, password_hash) VALUES (:email, :hash)";
        $stmt = $pdo->prepare($sql);
        
        try {
            return $stmt->execute([
                ':email' => $email,
                ':hash' => $hash
            ]);
        } catch (\PDOException $e) {
            return false; // Probabilmente email duplicata
        }
    }
}