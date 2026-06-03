<?php
/**
 * POST /api/auth/logout
 * Cerrar sesión
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/JWT.php';
require_once __DIR__ . '/../../config/Response.php';

// Validar autenticación
$token = JWT::getTokenFromHeader();
if (!$token || !JWT::verify($token)) {
    Response::unauthorized('Token inválido o expirado');
}

// En JWT stateless, el logout es simplemente eliminar el token del cliente
// No necesitamos hacer nada en el servidor
Response::success(null, 'Sesión cerrada exitosamente');
