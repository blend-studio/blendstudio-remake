<?php
// backend/public/index.php

// 1. CARICAMENTO DIPENDENZE E CONFIGURAZIONE
require_once __DIR__ . '/../vendor/autoload.php';

// Carichiamo il Router manualmente (se non è sotto namespace App)
require_once __DIR__ . '/../core/Router.php';

use Dotenv\Dotenv;
use Core\Router;


// Carica variabili d'ambiente (.env)
$dotenv = Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

// 2. CONFIGURAZIONE SESSIONI PHP
// Importante per evitare problemi con i cookie tra React e PHP
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
// Se sei in locale (HTTP) usa 'Lax', se sei in HTTPS usa 'None'
ini_set('session.cookie_samesite', $_ENV['APP_ENV'] === 'local' ? 'Lax' : 'None');
ini_set('session.cookie_secure', $_ENV['APP_ENV'] === 'local' ? 0 : 1); // 1 solo su HTTPS

// Avviamo la sessione qui per averla disponibile ovunque
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// 3. HEADERS & CORS (Cross-Origin Resource Sharing)
// Definisci l'URL del frontend React (leggilo dal .env o mettilo fisso)
$frontendOrigin = $_ENV['FRONTEND_URL'] ?? 'http://localhost:5173';

header("Access-Control-Allow-Origin: $frontendOrigin");
header("Access-Control-Allow-Credentials: true"); // Fondamentale per il Login (Cookie)
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT");
header("Content-Type: application/json; charset=UTF-8");

// Gestione preflight request (OPTIONS)
// Quando React chiede "posso contattarti?", PHP deve rispondere subito "Sì"
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 4. ROUTING SYSTEM
$router = new Router();

// --- DEFINIZIONE DELLE ROTTE ---

// A. Area Contatti
// POST api/contact -> ContactController::submit
$router->add('POST', 'api/contact', 'ContactController', 'submit');

// B. Area Autenticazione (Admin)
// POST api/login -> UserController::login
$router->add('POST', 'api/login', 'UserController', 'login');

// POST api/logout -> UserController::logout
$router->add('POST', 'api/logout', 'UserController', 'logout');

// GET api/check-auth -> UserController::checkAuth (Per vedere se siamo loggati al refresh)
$router->add('GET', 'api/check-auth', 'UserController', 'checkAuth');

// ... dopo le rotte di login ...

// Rotte Progetti
$router->add('GET', 'api/projects', 'ProjectController', 'index');
$router->add('GET', 'api/project', 'ProjectController', 'show'); // Gestisce sia ?id=1 che ?slug=nome


// C. Area Progetti (CRUD) - DA IMPLEMENTARE PROSSIMAMENTE
// $router->add('GET', 'api/projects', 'ProjectController', 'index');
// $router->add('POST', 'api/projects', 'ProjectController', 'create');

// --- ESECUZIONE ---

// Recuperiamo l'URL richiesto. 
// Se usi il server integrato PHP (php -S) o .htaccess, l'URL pulito arriva in modi diversi.
// Questo metodo copre entrambi i casi.
$url = $_GET['url'] ?? parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Rimuoviamo lo slash iniziale se presente (es. /api/contact -> api/contact)
$url = ltrim($url, '/');

// Avvia il router
$router->dispatch($url, $_SERVER['REQUEST_METHOD']);