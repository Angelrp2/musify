<?php
/**
 * Middleware de autenticación y autorización por roles
 */
class Auth {
    private static array $hierarchy = [
        'user'    => 1,
        'premium' => 2,
        'editor'  => 3,
        'admin'   => 4,
    ];

    public static function requireRole(string $requiredRole, array $userPayload): void {
        $userLevel     = self::$hierarchy[$userPayload['role'] ?? 'user'] ?? 1;
        $requiredLevel = self::$hierarchy[$requiredRole] ?? 1;

        if ($userLevel < $requiredLevel) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'No tienes permisos suficientes para esta acción',
                'required_role' => $requiredRole,
                'your_role'     => $userPayload['role'] ?? 'user',
            ]);
            exit;
        }
    }

    public static function canGenerateAI(array $userPayload): bool {
        return in_array($userPayload['role'] ?? 'user', ['premium', 'editor', 'admin']);
    }

    public static function isAdmin(array $userPayload): bool {
        return ($userPayload['role'] ?? '') === 'admin';
    }

    public static function canEdit(array $userPayload, int $resourceOwnerId): bool {
        if (self::isAdmin($userPayload)) return true;
        $role = $userPayload['role'] ?? 'user';
        if ($role === 'editor') return true;
        return (int)($userPayload['id'] ?? 0) === $resourceOwnerId;
    }
}
