<?php
/**
 * PUT /api/songs/:id
 * Actualizar canción
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/JWT.php';
require_once __DIR__ . '/../../config/Response.php';

$songId = isset($_GET['id']) ? intval($_GET['id']) : 0;
$data = json_decode(file_get_contents('php://input'), true);

if ($songId <= 0) {
    Response::badRequest('ID de canción inválido');
}

// Validar autenticación
$token = JWT::getTokenFromHeader();
if (!$token || !JWT::verify($token)) {
    Response::unauthorized('Token inválido o expirado');
}

$user = JWT::decode($token);
if (!$user) {
    Response::unauthorized('No autorizado');
}

try {
    $db = Database::getInstance()->getConnection();
    
    // Verificar que la canción existe y pertenece al usuario
    $stmt = $db->prepare('SELECT user_id FROM songs WHERE id = ?');
    $stmt->execute([$songId]);
    $song = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$song) {
        Response::notFound('Canción no encontrada');
    }
    
    if ($song['user_id'] != $user['id'] && $user['role'] != 'admin' && $user['role'] != 'editor') {
        Response::forbidden('No tienes permiso para editar esta canción');
    }
    
    // Preparar campos a actualizar
    $updates = [];
    $params = [];
    
    $s = fn($v) => htmlspecialchars(trim((string)$v), ENT_QUOTES, 'UTF-8');
    if (isset($data['title'])) {
        $updates[] = 'title = ?';
        $params[] = $s($data['title']);
    }
    if (isset($data['description'])) {
        $updates[] = 'description = ?';
        $params[] = $s($data['description']);
    }
    if (isset($data['lyrics'])) {
        $updates[] = 'lyrics = ?';
        $params[] = $s($data['lyrics']);
    }
    if (isset($data['genre'])) {
        $updates[] = 'genre = ?';
        $params[] = $s($data['genre']);
    }
    if (isset($data['mood'])) {
        $updates[] = 'mood = ?';
        $params[] = $s($data['mood']);
    }
    if (isset($data['is_public'])) {
        $updates[] = 'is_public = ?';
        $params[] = intval($data['is_public']);
    }
    
    if (empty($updates)) {
        Response::badRequest('No hay campos para actualizar');
    }
    
    $updates[] = 'updated_at = CURRENT_TIMESTAMP';
    $params[] = $songId;
    
    $query = 'UPDATE songs SET ' . implode(', ', $updates) . ' WHERE id = ?';
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    
    // Obtener canción actualizada
    $stmt = $db->prepare('SELECT * FROM songs WHERE id = ?');
    $stmt->execute([$songId]);
    $updatedSong = $stmt->fetch(PDO::FETCH_ASSOC);
    
    Response::success($updatedSong, 'Canción actualizada exitosamente');
    
} catch (Exception $e) {
    Response::serverError('Error al actualizar canción: ' . $e->getMessage());
}
