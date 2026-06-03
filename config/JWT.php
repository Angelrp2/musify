<?php
/**
 * Clase para manejar JWT (JSON Web Tokens)
 */

class JWT {
    
    public static function encode($payload) {
        $header = [
            'alg' => 'HS256',
            'typ' => 'JWT'
        ];
        
        $payload['iat'] = time();
        $payload['exp'] = time() + JWT_EXPIRATION;
        
        $header_encoded = self::base64url_encode(json_encode($header));
        $payload_encoded = self::base64url_encode(json_encode($payload));
        
        $signature = hash_hmac(
            'sha256',
            "$header_encoded.$payload_encoded",
            JWT_SECRET,
            true
        );
        $signature_encoded = self::base64url_encode($signature);
        
        return "$header_encoded.$payload_encoded.$signature_encoded";
    }
    
    public static function decode($token) {
        $parts = explode('.', $token);
        
        if (count($parts) !== 3) {
            throw new Exception('Token inválido');
        }
        
        list($header_encoded, $payload_encoded, $signature_encoded) = $parts;
        
        // Verificar firma
        $signature = hash_hmac(
            'sha256',
            "$header_encoded.$payload_encoded",
            JWT_SECRET,
            true
        );
        $signature_expected = self::base64url_encode($signature);
        
        if (!hash_equals($signature_encoded, $signature_expected)) {
            throw new Exception('Firma de token inválida');
        }
        
        // Decodificar payload
        $payload = json_decode(self::base64url_decode($payload_encoded), true);
        
        // Verificar expiración
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            throw new Exception('Token expirado');
        }
        
        return $payload;
    }
    
    public static function getTokenFromHeader() {
        $auth_header = '';

        if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
            $auth_header = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $auth_header = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        } else {
            $headers = function_exists('getallheaders') ? getallheaders() : [];
            $auth_header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        }

        if (preg_match('/Bearer\s+(.+)/i', $auth_header, $matches)) {
            return trim($matches[1]);
        }

        return null;
    }
    
    public static function verify() {
        $token = self::getTokenFromHeader();
        
        if (!$token) {
            throw new Exception('Token no proporcionado');
        }
        
        return self::decode($token);
    }
    
    private static function base64url_encode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    private static function base64url_decode($data) {
        return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 4 - strlen($data) % 4));
    }
}
