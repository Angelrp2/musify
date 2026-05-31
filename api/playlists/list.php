<?php
/**
 * GET /api/playlists
 * Obtener playlists del usuario
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
    
    $stmt = $db->prepare('
        SELECT p.*, COUNT(ps.id) as song_count
        FROM playlists p
        LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
        WHERE p.user_id = ?
        GROUP BY p.id
        ORDER BY p.created_at DESC
    ');
    $stmt->execute([$user['id']]);
    $playlists = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    Response::success([
        'count' => count($playlists),
        'playlists' => $playlists
    ]);
    
} catch (Exception $e) {
    Response::serverError('Error al obtener playlists: ' . $e->getMessage());
}
