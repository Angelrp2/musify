<?php
/**
 * POST /api/songs
 * Crear nueva canción
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/JWT.php';
require_once __DIR__ . '/../../config/Response.php';

$data = json_decode(file_get_contents('php://input'), true);

// Validar autenticación
$token = JWT::getTokenFromHeader();
if (!$token || !JWT::verify($token)) {
    Response::unauthorized('Token inválido o expirado');
}

$user = JWT::decode($token);
if (!$user) {
    Response::unauthorized('No autorizado');
}

if ($user['role'] === 'guest') {
    Response::forbidden('El rol guest no tiene permiso para crear canciones');
}

// Validaciones
$errors = [];
if (empty($data['title']) || strlen($data['title']) < 3) {
    $errors['title'] = 'El título debe tener al menos 3 caracteres';
}
if (empty($data['description'])) {
    $errors['description'] = 'La descripción es requerida';
}
if (empty($data['genre'])) {
    $errors['genre'] = 'El género es requerido';
}

if (!empty($errors)) {
    Response::badRequest('Validación fallida', $errors);
}

try {
    $db = Database::getInstance()->getConnection();
    
    // Preparar datos
    $s = fn($v) => htmlspecialchars(trim((string)$v), ENT_QUOTES, 'UTF-8');
    $title = $s($data['title']);
    $description = $s($data['description']);
    $lyrics = isset($data['lyrics']) ? $s($data['lyrics']) : '';
    $genre = $s($data['genre']);
    $mood = isset($data['mood']) ? $s($data['mood']) : 'Neutral';
    $audio_url = isset($data['audio_url']) ? trim($data['audio_url']) : '';
    $cover_image_url = isset($data['cover_image_url']) ? trim($data['cover_image_url']) : '';
    $duration_seconds = isset($data['duration_seconds']) ? intval($data['duration_seconds']) : 0;
    $is_public = isset($data['is_public']) ? intval($data['is_public']) : 0;
    
    // Insertar canción
    $stmt = $db->prepare('
        INSERT INTO songs (user_id, title, description, lyrics, genre, mood, audio_url, cover_image_url, duration_seconds, is_public)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');
    
    $stmt->execute([
        $user['id'],
        $title,
        $description,
        $lyrics,
        $genre,
        $mood,
        $audio_url,
        $cover_image_url,
        $duration_seconds,
        $is_public
    ]);
    
    $songId = $db->lastInsertId();
    
    // Obtener canción creada
    $stmt = $db->prepare('SELECT * FROM songs WHERE id = ?');
    $stmt->execute([$songId]);
    $song = $stmt->fetch(PDO::FETCH_ASSOC);
    
    Response::created($song, 'Canción creada exitosamente');
    
} catch (Exception $e) {
    Response::serverError('Error al crear canción: ' . $e->getMessage());
}
