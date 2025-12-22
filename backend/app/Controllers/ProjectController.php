<?php
namespace App\Controllers;

use App\Models\Project;

// Includiamo il model se l'autoload non è configurato perfettamente
require_once __DIR__ . '/../Models/Project.php';

class ProjectController {

    /**
     * API: GET /api/projects
     * Restituisce la lista di tutti i progetti
     */
    public function index() {
        $projectModel = new Project();
        $projects = $projectModel->getAll();

        // Decodifichiamo il JSON delle immagini per facilitare il frontend
        foreach ($projects as &$project) {
            $project['gallery_images'] = json_decode($project['gallery_images']);
        }

        echo json_encode([
            "status" => "success", 
            "data" => $projects
        ]);
    }

    /**
     * API: GET /api/project?id=1  oppure  ?slug=nome-progetto
     * Restituisce i dettagli di un singolo progetto
     */
    public function show() {
        $projectModel = new Project();
        $project = null;

        // Supportiamo sia la ricerca per ID che per Slug
        if (isset($_GET['id'])) {
            $project = $projectModel->getById($_GET['id']);
        } elseif (isset($_GET['slug'])) {
            $project = $projectModel->getBySlug($_GET['slug']);
        } else {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ID o Slug mancante"]);
            return;
        }

        if ($project) {
            // Decodifica JSON immagini
            $project['gallery_images'] = json_decode($project['gallery_images']);
            
            echo json_encode([
                "status" => "success", 
                "data" => $project
            ]);
        } else {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Progetto non trovato"]);
        }
    }
}