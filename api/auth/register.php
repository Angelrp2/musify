<?php
/**
 * POST /api/auth/register
 * Registrar nuevo usuario
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/JWT.php';
require_once __DIR__ . '/../../config/Response.php';

$data = json_decode(file_get_contents('php://input'), true);

// Validaciones
$errors = [];
if (empty($data['username']) || strlen($data['username']) < 3) {
    $errors['username'] = 'Username debe tener al menos 3 caracteres';
}
if (empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Email inválido';
}
if (empty($data['password']) || strlen($data['password']) < 6) {
    $errors['password'] = 'Contraseña debe tener al menos 6 caracteres';
}

if (!empty($errors)) {
    Response::badRequest('Validación fallida', $errors);
}

try {
    $db = Database::getInstance()->getConnection();
    
    // Verificar si usuario ya existe
    $stmt = $db->prepare('SELECT id FROM users WHERE email = ? OR username = ?');
    $stmt->execute([$data['email'], $data['username']]);
    
    if ($stmt->fetch()) {
        Response::conflict('Usuario o email ya existe');
    }
    
    // Crear usuario
    $s = fn($v) => htmlspecialchars(trim((string)$v), ENT_QUOTES, 'UTF-8');
    $data['username'] = $s($data['username']);
    $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT);
    
    $stmt = $db->prepare('
        INSERT INTO users (username, email, password_hash, role)
        VALUES (?, ?, ?, ?)
    ');
    $stmt->execute([
        $data['username'],
        $data['email'],
        $passwordHash,
        'user'
    ]);
    
    $userId = $db->lastInsertId();
    
    // Generar JWT
    $token = JWT::encode([
        'id' => $userId,
        'username' => $data['username'],
        'email' => $data['email'],
        'role' => 'user'
    ]);
    
    Response::created([
        'id' => $userId,
        'username' => $data['username'],
        'email' => $data['email'],
        'token' => $token
    ], 'Usuario registrado exitosamente');
    
} catch (Exception $e) {
    Response::serverError('Error al registrar usuario: ' . $e->getMessage());
}
