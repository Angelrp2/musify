<?php
/**
 * GET /api/songs/:id
 * Obtener detalle de una canción
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/JWT.php';
require_once __DIR__ . '/../../config/Response.php';

$songId = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($songId <= 0) {
    Response::badRequest('ID de canción inválido');
}

try {
    $db = Database::getInstance()->getConnection();
    
    // Obtener canción
    $stmt = $db->prepare('
        SELECT s.*, u.username, u.avatar_url
        FROM songs s
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.id = ?
    ');
    $stmt->execute([$songId]);
    $song = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$song) {
        Response::notFound('Canción no encontrada');
    }
    
    // Verificar si es pública o pertenece al usuario
    if (!$song['is_public']) {
        $token = JWT::getTokenFromHeader();
        if (!$token || !JWT::verify($token)) {
            Response::forbidden('No tienes permiso para ver esta canción');
        }
        
        $user = JWT::decode($token);
        if ($user['id'] != $song['user_id']) {
            Response::forbidden('No tienes permiso para ver esta canción');
        }
    }
    
    Response::success($song);
    
} catch (Exception $e) {
    Response::serverError('Error al obtener canción: ' . $e->getMessage());
}
