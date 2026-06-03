<?php
/**
 * Clase para manejar respuestas API
 */

class Response {
    
    public static function success($data = null, $message = 'Éxito', $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit;
    }
    
    public static function error($message = 'Error', $statusCode = 400, $errors = null) {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        
        $response = [
            'success' => false,
            'message' => $message,
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        if ($errors) {
            $response['errors'] = $errors;
        }
        
        echo json_encode($response);
        exit;
    }
    
    public static function created($data, $message = 'Creado exitosamente') {
        self::success($data, $message, 201);
    }
    
    public static function badRequest($message = 'Solicitud inválida', $errors = null) {
        self::error($message, 400, $errors);
    }
    
    public static function unauthorized($message = 'No autorizado') {
        self::error($message, 401);
    }
    
    public static function forbidden($message = 'Acceso denegado') {
        self::error($message, 403);
    }
    
    public static function notFound($message = 'No encontrado') {
        self::error($message, 404);
    }
    
    public static function conflict($message = 'Conflicto') {
        self::error($message, 409);
    }
    
    public static function serverError($message = 'Error interno del servidor') {
        self::error($message, 500);
    }
}
