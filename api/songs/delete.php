<?php
/**
 * DELETE /api/songs/:id
 * Eliminar canción
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
    
    // Verificar que la canción existe y pertenece al usuario
    $stmt = $db->prepare('SELECT user_id, audio_url, cover_image_url FROM songs WHERE id = ?');
    $stmt->execute([$songId]);
    $song = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$song) {
        Response::notFound('Canción no encontrada');
    }
    
    if ($song['user_id'] != $user['id'] && $user['role'] != 'admin' && $user['role'] != 'editor') {
        Response::forbidden('No tienes permiso para eliminar esta canción');
    }
    
    // Eliminar archivos asociados si existen
    if (!empty($song['audio_url']) && file_exists($song['audio_url'])) {
        unlink($song['audio_url']);
    }
    if (!empty($song['cover_image_url']) && file_exists($song['cover_image_url'])) {
        unlink($song['cover_image_url']);
    }
    
    // Eliminar canción de playlists
    $stmt = $db->prepare('DELETE FROM playlist_songs WHERE song_id = ?');
    $stmt->execute([$songId]);
    
    // Eliminar canción de favoritos
    $stmt = $db->prepare('DELETE FROM favorites WHERE song_id = ?');
    $stmt->execute([$songId]);
    
    // Eliminar canción
    $stmt = $db->prepare('DELETE FROM songs WHERE id = ?');
    $stmt->execute([$songId]);
    
    Response::success(null, 'Canción eliminada exitosamente');
    
} catch (Exception $e) {
    Response::serverError('Error al eliminar canción: ' . $e->getMessage());
}
