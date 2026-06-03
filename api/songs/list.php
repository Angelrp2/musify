<?php
/**
 * GET /api/songs
 * Listar canciones (públicas o del usuario autenticado)
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/JWT.php';
require_once __DIR__ . '/../../config/Response.php';

try {
    $db = Database::getInstance()->getConnection();
    
    // Parámetros de paginación y filtrado
    $page = $_GET['page'] ?? 1;
    $limit = $_GET['limit'] ?? ITEMS_PER_PAGE;
    $genre = $_GET['genre'] ?? null;
    $search = $_GET['search'] ?? null;
    $offset = ($page - 1) * $limit;
    
    // Intentar obtener usuario autenticado
    $currentUserId = null;
    try {
        $payload = JWT::verify();
        $currentUserId = $payload['id'];
    } catch (Exception $e) {
        // Usuario no autenticado, solo ver públicas
    }

    $mine = !empty($_GET['mine']) && $_GET['mine'] == '1';

    // mine=1 sin sesión → devolver vacío
    if ($mine && !$currentUserId) {
        Response::success([
            'data' => [],
            'pagination' => ['page' => 1, 'limit' => (int)$limit, 'total' => 0, 'pages' => 0]
        ]);
    }

    // Construir query
    $where = ['(s.is_public = 1'];
    $params = [];

    if ($mine && $currentUserId) {
        $where[0] = '(s.user_id = ?';
        $params[] = $currentUserId;
    } elseif ($currentUserId) {
        $where[0] = '(s.is_public = 1 OR s.user_id = ?';
        $params[] = $currentUserId;
    }
    
    if ($genre) {
        $where[] = 's.genre = ?';
        $params[] = $genre;
    }
    
    if ($search) {
        $where[] = '(s.title LIKE ? OR u.username LIKE ?)';
        $params[] = "%$search%";
        $params[] = "%$search%";
    }
    
    $whereClause = ')' . (count($where) > 1 ? ' AND ' . implode(' AND ', array_slice($where, 1)) : '');
    $where[0] .= $whereClause;
    
    // Contar total
    $countSql = 'SELECT COUNT(*) as total FROM songs s JOIN users u ON s.user_id = u.id WHERE ' . $where[0];
    $countStmt = $db->prepare($countSql);
    $countStmt->execute($params);
    $total = $countStmt->fetch()['total'];
    
    // Obtener canciones
    $sql = '
        SELECT 
            s.id, s.title, s.description, s.genre, s.mood, s.duration_seconds,
            s.cover_image_url, s.created_at, s.is_public,
            u.id as user_id, u.username, u.avatar_url
        FROM songs s
        JOIN users u ON s.user_id = u.id
        WHERE ' . $where[0] . '
        ORDER BY s.created_at DESC
        LIMIT ? OFFSET ?
    ';
    
    $params[] = $limit;
    $params[] = $offset;
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $songs = $stmt->fetchAll();
    
    Response::success([
        'data' => $songs,
        'pagination' => [
            'page' => (int)$page,
            'limit' => (int)$limit,
            'total' => (int)$total,
            'pages' => ceil($total / $limit)
        ]
    ]);
    
} catch (Exception $e) {
    Response::serverError('Error al obtener canciones: ' . $e->getMessage());
}
