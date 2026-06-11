<?php
/**
 * Configuración principal de Musify
 * TFG DAW - Plataforma de creación musical con IA
 */

// Configuración de base de datos
define('DB_PATH', __DIR__ . '/../database/musify.db');
define('DB_TYPE', 'sqlite');

// Configuración de la aplicación
define('APP_NAME', 'Musify');
define('APP_VERSION', '1.0.0');
define('APP_ENV', 'development'); // development o production

// URLs
define('BASE_URL', 'http://localhost:8000');
define('API_URL', BASE_URL . '/api');

// Cargar .env si existe
$_envFile = __DIR__ . '/../.env';
if (file_exists($_envFile)) {
    foreach (file($_envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $_line) {
        if ($_line[0] !== '#' && strpos($_line, '=') !== false) putenv(trim($_line));
    }
}
unset($_envFile, $_line);

// Seguridad
$_jwtSecret = getenv('JWT_SECRET');
if (!$_jwtSecret) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'JWT_SECRET no configurado']);
    exit;
}
define('JWT_SECRET', $_jwtSecret);
unset($_jwtSecret);
define('JWT_EXPIRATION', 86400 * 7); // 7 días

// CORS
define('ALLOWED_ORIGINS', [
    'http://localhost:8000',
    'http://localhost:3000',
    'http://127.0.0.1:8000'
]);

// Configuración de archivos
define('UPLOAD_DIR', __DIR__ . '/../public/uploads/');
define('MAX_FILE_SIZE', 50 * 1024 * 1024); // 50MB
define('ALLOWED_AUDIO_TYPES', ['audio/mpeg', 'audio/wav', 'audio/ogg']);
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/webp']);

// APIs externas
define('GEMINI_API_KEY', getenv('GEMINI_API_KEY') ?: '');
define('MUSICBRAINZ_API', 'https://musicbrainz.org/ws/2');
define('SPOTIFY_CLIENT_ID', getenv('SPOTIFY_CLIENT_ID') ?: '');
define('SPOTIFY_CLIENT_SECRET', getenv('SPOTIFY_CLIENT_SECRET') ?: '');

// Ollama (IA local)
define('OLLAMA_API', 'http://localhost:11434');
define('OLLAMA_MODEL', 'llama2:3b');

// Logging
define('LOG_DIR', __DIR__ . '/../logs/');
define('LOG_LEVEL', 'debug'); // debug, info, warning, error

// Paginación
define('ITEMS_PER_PAGE', 20);

// Inicializar directorios necesarios
if (!is_dir(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}
if (!is_dir(LOG_DIR)) {
    mkdir(LOG_DIR, 0755, true);
}

// Configuración de errores
if (APP_ENV === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(E_ALL);
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
    ini_set('error_log', LOG_DIR . 'php_errors.log');
}

// Headers de seguridad
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Strict-Transport-Security: max-age=31536000; includeSubDomains');

// CORS headers
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, ALLOWED_ORIGINS)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Credentials: true');
}

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Timezone
date_default_timezone_set('Europe/Madrid');
