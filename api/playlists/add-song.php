<?php
/**
 * POST /api/playlists/:id/songs
 * Agregar canción a playlist
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/JWT.php';
require_once __DIR__ . '/../../config/Response.php';

$playlistId = isset($_GET['id']) ? intval($_GET['id']) : 0;
$data = json_decode(file_get_contents('php://input'), true);

if ($playlistId <= 0) {
    Response::badRequest('ID de playlist inválido');
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

// Validar song_id
if (empty($data['song_id'])) {
    Response::badRequest('song_id es requerido');
}

try {
    $db = Database::getInstance()->getConnection();
    
    // Verificar que la playlist existe y pertenece al usuario
    $stmt = $db->prepare('SELECT user_id FROM playlists WHERE id = ?');
    $stmt->execute([$playlistId]);
    $playlist = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$playlist) {
        Response::notFound('Playlist no encontrada');
    }
    
    if ($playlist['user_id'] != $user['id'] && $user['role'] != 'admin') {
        Response::forbidden('No tienes permiso para editar esta playlist');
    }
    
    // Verificar que la canción existe
    $stmt = $db->prepare('SELECT id FROM songs WHERE id = ?');
    $stmt->execute([$data['song_id']]);
    if (!$stmt->fetch()) {
        Response::notFound('Canción no encontrada');
    }
    
    // Verificar si ya está en la playlist
    $stmt = $db->prepare('SELECT id FROM playlist_songs WHERE playlist_id = ? AND song_id = ?');
    $stmt->execute([$playlistId, $data['song_id']]);
    if ($stmt->fetch()) {
        Response::conflict('La canción ya está en esta playlist');
    }
    
    // Obtener siguiente posición
    $stmt = $db->prepare('SELECT MAX(position) as max_position FROM playlist_songs WHERE playlist_id = ?');
    $stmt->execute([$playlistId]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $position = ($result['max_position'] ?? 0) + 1;
    
    // Agregar canción a playlist
    $stmt = $db->prepare('
        INSERT INTO playlist_songs (playlist_id, song_id, position)
        VALUES (?, ?, ?)
    ');
    $stmt->execute([$playlistId, $data['song_id'], $position]);
    
    Response::created(null, 'Canción agregada a la playlist');
    
} catch (Exception $e) {
    Response::serverError('Error al agregar canción a playlist: ' . $e->getMessage());
}
