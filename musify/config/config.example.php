<?php
/**
 * Configuración principal de Musify — PLANTILLA
 * Copia este archivo a config.php y rellena los valores reales.
 * NUNCA subas config.php a git.
 */

// Base de datos
define('DB_PATH', __DIR__ . '/../database/musify.db');
define('DB_TYPE', 'sqlite');

// Aplicación
define('APP_NAME', 'Musify');
define('APP_VERSION', '1.0.0');
define('APP_ENV', 'development'); // development | production

// URLs
define('BASE_URL', 'http://localhost:8000');
define('API_URL', BASE_URL . '/api');

// Seguridad — CAMBIA este valor antes de poner en producción
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'CHANGE_ME_IN_PRODUCTION');
define('JWT_EXPIRATION', 86400 * 7); // 7 días

// CORS
define('ALLOWED_ORIGINS', [
    'http://localhost:8000',
    'http://localhost:3000',
    'http://127.0.0.1:8000'
]);

// Archivos
define('UPLOAD_DIR', __DIR__ . '/../public/uploads/');
define('MAX_FILE_SIZE', 50 * 1024 * 1024); // 50MB
define('ALLOWED_AUDIO_TYPES', ['audio/mpeg', 'audio/wav', 'audio/ogg']);
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/webp']);

// APIs externas
define('MUSICBRAINZ_API', 'https://musicbrainz.org/ws/2');
define('SPOTIFY_CLIENT_ID',     getenv('SPOTIFY_CLIENT_ID')     ?: '');
define('SPOTIFY_CLIENT_SECRET', getenv('SPOTIFY_CLIENT_SECRET') ?: '');

// IA local (Ollama)
define('OLLAMA_API',   'http://localhost:11434');
define('OLLAMA_MODEL', 'llama2:3b');

// Logging
define('LOG_DIR',   __DIR__ . '/../logs/');
define('LOG_LEVEL', 'debug'); // debug | info | warning | error

// Paginación
define('ITEMS_PER_PAGE', 20);

// Inicializar directorios
if (!is_dir(UPLOAD_DIR)) mkdir(UPLOAD_DIR, 0755, true);
if (!is_dir(LOG_DIR))    mkdir(LOG_DIR,    0755, true);

// Errores
if (APP_ENV === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(E_ALL);
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
    ini_set('error_log', LOG_DIR . 'php_errors.log');
}

// Seguridad HTTP
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// CORS headers
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, ALLOWED_ORIGINS)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Credentials: true');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

date_default_timezone_set('Europe/Madrid');
