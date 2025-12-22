<?php
namespace App\Models;

// Usiamo "use" per dire a PHP che stiamo usando classi globali
use Core\Database; 
use \PDO;

class Message {
    
    /**
     * Salva un nuovo messaggio nel database
     * @param array $data Array contenente name, email, phone, message
     * @return bool True se salvato, False se errore
     */
    public function create($data) {
        // Ottieni l'istanza del DB (notare la \ davanti a Database perché è globale)
        $pdo = Database::getInstance();
        
        $sql = "INSERT INTO messages (name, email, phone, message) VALUES (:name, :email, :phone, :message)";
        
        $stmt = $pdo->prepare($sql);
        
        // Eseguiamo la query associando i valori
        return $stmt->execute([
            ':name'    => $data['name'],
            ':email'   => $data['email'],
            // Usiamo l'operatore null coalescing (??) nel caso il telefono non ci sia
            ':phone'   => $data['phone'] ?? null, 
            ':message' => $data['message']
        ]);
    }

    /**
     * Recupera tutti i messaggi (per l'area admin futura)
     */
    public function getAll() {
        $pdo = Database::getInstance();
        // Ordiniamo dal più recente
        $stmt = $pdo->query("SELECT * FROM messages ORDER BY created_at DESC");
        return $stmt->fetchAll();
    }
    
    /**
     * Segna un messaggio come letto (per l'area admin)
     */
    public function markAsRead($id) {
        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("UPDATE messages SET is_read = 1 WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }
}