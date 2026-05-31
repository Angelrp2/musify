<?php
/**
 * GET /api/favorites
 * Obtener canciones favoritas del usuario
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/JWT.php';
require_once __DIR__ . '/../../config/Response.php';

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
    
    // Obtener favoritos
    $stmt = $db->prepare('
        SELECT s.* FROM songs s
        INNER JOIN favorites f ON s.id = f.song_id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC
    ');
    $stmt->execute([$user['id']]);
    $favorites = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    Response::success([
        'count' => count($favorites),
        'songs' => $favorites
    ]);
    
} catch (Exception $e) {
    Response::serverError('Error al obtener favoritos: ' . $e->getMessage());
}
