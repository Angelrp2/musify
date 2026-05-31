<?php
/**
 * Musify - Punto de entrada principal
 * Router simple para la API REST
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../config/JWT.php';
require_once __DIR__ . '/../config/Response.php';

// Obtener método y ruta
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/public', '', $path);
$path = str_replace('/index.php', '', $path);

// Servir frontend para rutas no-API
if (!str_starts_with($path, '/api') && !in_array($path, ['/sitemap.xml', '/robots.txt'])) {
    readfile(__DIR__ . '/index.html');
    exit;
}

// Rutas de la API
$routes = [
    // Autenticación
    'POST /api/auth/register' => 'api/auth/register.php',
    'POST /api/auth/login' => 'api/auth/login.php',
    'POST /api/auth/logout' => 'api/auth/logout.php',
    'GET /api/auth/me' => 'api/auth/me.php',
    
    // Usuarios
    'GET /api/users' => 'api/users/list.php',
    'GET /api/users/:id' => 'api/users/show.php',
    'PUT /api/users/:id' => 'api/users/update.php',
    'DELETE /api/users/:id' => 'api/users/delete.php',
    
    // Canciones
    'GET /api/songs' => 'api/songs/list.php',
    'GET /api/songs/:id' => 'api/songs/show.php',
    'POST /api/songs' => 'api/songs/create.php',
    'PUT /api/songs/:id' => 'api/songs/update.php',
    'DELETE /api/songs/:id' => 'api/songs/delete.php',
    
    // Playlists
    'GET /api/playlists' => 'api/playlists/list.php',
    'POST /api/playlists' => 'api/playlists/create.php',
    'PUT /api/playlists/:id' => 'api/playlists/update.php',
    'DELETE /api/playlists/:id' => 'api/playlists/delete.php',
    
    // Favoritos
    'GET /api/favorites' => 'api/favorites/list.php',
    'POST /api/favorites/:songId' => 'api/favorites/add.php',
    'DELETE /api/favorites/:songId' => 'api/favorites/remove.php',
    
    // IA
    'POST /api/ai/generate-lyrics' => 'api/ai/generate-lyrics.php',
    'GET /api/ai/history' => 'api/ai/history.php',
];

// Buscar ruta coincidente
$routeFound = false;
foreach ($routes as $route => $file) {
    list($routeMethod, $routePath) = explode(' ', $route);
    
    if ($method !== $routeMethod) continue;
    
    // Convertir ruta con parámetros a regex
    $pattern = preg_replace('/:(\w+)/', '(?P<$1>[^/]+)', $routePath);
    $pattern = '#^' . $pattern . '$#';
    
    if (preg_match($pattern, $path, $matches)) {
        // Guardar parámetros en $_GET
        foreach ($matches as $key => $value) {
            if (!is_numeric($key)) {
                $_GET[$key] = $value;
            }
        }
        
        $filePath = __DIR__ . '/../' . $file;
        if (file_exists($filePath)) {
            require_once $filePath;
            $routeFound = true;
            break;
        }
    }
}

if (!$routeFound) {
    Response::notFound('Ruta no encontrada');
}
