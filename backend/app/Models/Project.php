<?php
namespace App\Models;

use Core\Database;
use PDO;

class Project {

    /**
     * Recupera tutti i progetti ordinati per data
     */
    public function getAll() {
        $pdo = Database::getInstance();
        $stmt = $pdo->query("SELECT * FROM projects ORDER BY project_date DESC");
        return $stmt->fetchAll();
    }

    /**
     * Recupera un singolo progetto tramite ID
     */
    public function getById($id) {
        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT * FROM projects WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    /**
     * Recupera un progetto tramite Slug (per URL belli tipo /project/nome-progetto)
     */
    public function getBySlug($slug) {
        $pdo = Database::getInstance();
        $stmt = $pdo->prepare("SELECT * FROM projects WHERE slug = :slug LIMIT 1");
        $stmt->execute([':slug' => $slug]);
        return $stmt->fetch();
    }
    
    /**
     * Crea un nuovo progetto (Utile per quando faremo l'Admin Panel)
     */
    public function create($data) {
        $pdo = Database::getInstance();
        $sql = "INSERT INTO projects (title, slug, client, services, description, cover_image, gallery_images, layout_type, project_date) 
                VALUES (:title, :slug, :client, :services, :description, :cover_image, :gallery_images, :layout_type, :project_date)";
        
        $stmt = $pdo->prepare($sql);
        
        // Assicuriamoci che gallery_images sia una stringa JSON valida
        $galleryJSON = is_array($data['gallery_images']) ? json_encode($data['gallery_images']) : $data['gallery_images'];

        return $stmt->execute([
            ':title' => $data['title'],
            ':slug' => $data['slug'],
            ':client' => $data['client'],
            ':services' => $data['services'],
            ':description' => $data['description'],
            ':cover_image' => $data['cover_image'],
            ':gallery_images' => $galleryJSON,
            ':layout_type' => $data['layout_type'] ?? 'default',
            ':project_date' => $data['project_date'] ?? date('Y-m-d')
        ]);
    }
}