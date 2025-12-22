<?php
namespace Core;

class Router {
    private $routes = [];

    public function add($method, $path, $controller, $action) {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'controller' => $controller,
            'action' => $action
        ];
    }

    public function dispatch($requestUri, $requestMethod) {
        // Puliamo l'URL (rimuoviamo query string tipo ?id=1)
        $path = parse_url($requestUri, PHP_URL_PATH);
        
        // Nel tuo caso specifico, se usi 'php -S', l'URL è pulito.
        // Se usi Apache/Nginx con rewrite, potresti ricevere 'index.php' o parametri.
        // Gestiamo il parametro ?url che abbiamo impostato prima o la REQUEST_URI diretta.
        
        $urlParam = $_GET['url'] ?? $path;
        // Normalizziamo rimuovendo lo slash iniziale se presente in eccesso
        $urlParam = trim($urlParam, '/'); 

        foreach ($this->routes as $route) {
            // Controlla Metodo e Percorso
            if ($route['method'] === $requestMethod && $route['path'] === $urlParam) {
                
                // Autoloader will handle this now
                $controllerName = "App\\Controllers\\" . $route['controller'];
                $controller = new $controllerName();
                $actionName = $route['action'];
                
                $controller->$actionName();
                return;
            }
        }

        // 404 Not Found
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Endpoint non trovato"]);
    }
}