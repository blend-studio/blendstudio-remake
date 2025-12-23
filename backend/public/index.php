<?php
// backend/public/index.php

// 1. HEADERS CORS IMMEDIATI (Prima di ogni altra cosa)
// Accettiamo richieste dal frontend in sviluppo (localhost:5173).
// Usare l'Origin della richiesta solo se è presente nella whitelist,
// altrimenti ricadiamo su un valore di default per sicurezza.
$allowed_origins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173'
];
$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($requestOrigin, $allowed_origins, true)) {
    header("Access-Control-Allow-Origin: $requestOrigin");
} else {
    header("Access-Control-Allow-Origin: http://localhost:5173");
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT");
header("Content-Type: application/json; charset=UTF-8");

// Se è una richiesta OPTIONS (preflight), rispondiamo subito
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. CARICAMENTO DIPENDENZE E CONFIGURAZIONE
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../core/Router.php';

use Dotenv\Dotenv;
use Core\Router;

try {
    $dotenv = Dotenv::createImmutable(__DIR__ . '/..');
    $dotenv->load();
} catch (Exception $e) {
    // In produzione fallirebbe, in locale potrebbe mancare il .env
}

// 3. CONFIGURAZIONE SESSIONI
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
$appEnv = $_ENV['APP_ENV'] ?? 'local';
ini_set('session.cookie_samesite', $appEnv === 'local' ? 'Lax' : 'None');
ini_set('session.cookie_secure', $appEnv === 'local' ? 0 : 1);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// 4. ROUTING SYSTEM
$router = new Router();
// ... resto delle rotte ...

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