<?php
/**
 * POST /api/playlists
 * Crear nueva playlist
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

// Validaciones
$errors = [];
if (empty($data['title']) || strlen($data['title']) < 3) {
    $errors['title'] = 'El título debe tener al menos 3 caracteres';
}

if (!empty($errors)) {
    Response::badRequest('Validación fallida', $errors);
}

try {
    $db = Database::getInstance()->getConnection();
    
    $title = trim($data['title']);
    $description = isset($data['description']) ? trim($data['description']) : '';
    $is_public = isset($data['is_public']) ? intval($data['is_public']) : 0;
    
    $stmt = $db->prepare('
        INSERT INTO playlists (user_id, title, description, is_public)
        VALUES (?, ?, ?, ?)
    ');
    
    $stmt->execute([
        $user['id'],
        $title,
        $description,
        $is_public
    ]);
    
    $playlistId = $db->lastInsertId();
    
    $stmt = $db->prepare('SELECT * FROM playlists WHERE id = ?');
    $stmt->execute([$playlistId]);
    $playlist = $stmt->fetch(PDO::FETCH_ASSOC);
    
    Response::created($playlist, 'Playlist creada exitosamente');
    
} catch (Exception $e) {
    Response::serverError('Error al crear playlist: ' . $e->getMessage());
}
