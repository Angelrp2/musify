<?php
/**
 * GET /api/auth/me
 * Obtener perfil del usuario autenticado
 */

try {
    $payload = JWT::verify();
    
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare('SELECT id, username, email, bio, avatar_url, role, is_public, created_at FROM users WHERE id = ?');
    $stmt->execute([$payload['id']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        Response::notFound('Usuario no encontrado');
    }
    
    Response::success($user);
    
} catch (Exception $e) {
    Response::unauthorized('No autorizado: ' . $e->getMessage());
}
