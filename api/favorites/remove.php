<?php
/**
 * DELETE /api/favorites/:id
 * Eliminar canción de favoritos
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
    
    // Eliminar de favoritos
    $stmt = $db->prepare('DELETE FROM favorites WHERE user_id = ? AND song_id = ?');
    $stmt->execute([$user['id'], $songId]);
    
    if ($stmt->rowCount() === 0) {
        Response::notFound('Canción no encontrada en favoritos');
    }
    
    Response::success(null, 'Canción eliminada de favoritos');
    
} catch (Exception $e) {
    Response::serverError('Error al eliminar de favoritos: ' . $e->getMessage());
}
