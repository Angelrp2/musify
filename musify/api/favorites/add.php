<?php
/**
 * POST /api/favorites/:id
 * Agregar canción a favoritos
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/JWT.php';
require_once __DIR__ . '/../../config/Response.php';

$songId = isset($_GET['id']) ? intval($_GET['id']) : 0;

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
    
    // Verificar que la canción existe
    $stmt = $db->prepare('SELECT id FROM songs WHERE id = ?');
    $stmt->execute([$songId]);
    if (!$stmt->fetch()) {
        Response::notFound('Canción no encontrada');
    }
    
    // Verificar si ya está en favoritos
    $stmt = $db->prepare('SELECT id FROM favorites WHERE user_id = ? AND song_id = ?');
    $stmt->execute([$user['id'], $songId]);
    if ($stmt->fetch()) {
        Response::conflict('La canción ya está en favoritos');
    }
    
    // Agregar a favoritos
    $stmt = $db->prepare('INSERT INTO favorites (user_id, song_id) VALUES (?, ?)');
    $stmt->execute([$user['id'], $songId]);
    
    Response::created(null, 'Canción agregada a favoritos');
    
} catch (Exception $e) {
    Response::serverError('Error al agregar a favoritos: ' . $e->getMessage());
}
