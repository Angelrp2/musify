<?php
/**
 * POST /api/auth/login
 * Autenticar usuario
 */

$data = json_decode(file_get_contents('php://input'), true);

// Validaciones
if (empty($data['email']) || empty($data['password'])) {
    Response::badRequest('Email y contraseña requeridos');
}

try {
    $db = Database::getInstance()->getConnection();
    
    // Buscar usuario
    $stmt = $db->prepare('SELECT id, username, email, password_hash, role FROM users WHERE email = ?');
    $stmt->execute([$data['email']]);
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($data['password'], $user['password_hash'])) {
        Response::unauthorized('Email o contraseña incorrectos');
    }
    
    // Generar JWT
    $token = JWT::encode([
        'id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'role' => $user['role']
    ]);
    
    Response::success([
        'id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'role' => $user['role'],
        'token' => $token
    ], 'Login exitoso');
    
} catch (Exception $e) {
    Response::serverError('Error al autenticar: ' . $e->getMessage());
}
