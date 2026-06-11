<?php
header('Content-Type: application/json');

// Validar método
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit;
}

// Obtener parámetro de búsqueda
$query = isset($_GET['q']) ? trim($_GET['q']) : '';

if (!$query) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Parámetro q requerido']);
    exit;
}

// Consultar MusicBrainz API
$url = 'https://musicbrainz.org/ws/2/recording?query=' . urlencode($query) . '&fmt=json&limit=10';

try {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 5,
        CURLOPT_USERAGENT => 'Musify/1.0'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        throw new Exception('MusicBrainz API error: ' . $httpCode);
    }
    
    $data = json_decode($response, true);
    
    if (!isset($data['recordings'])) {
        echo json_encode(['success' => true, 'data' => []]);
        exit;
    }
    
    // Procesar resultados
    $results = [];
    foreach ($data['recordings'] as $recording) {
        $results[] = [
            'id' => $recording['id'] ?? '',
            'title' => $recording['title'] ?? 'Unknown',
            'artist' => isset($recording['artist-credit'][0]['name']) ? $recording['artist-credit'][0]['name'] : 'Unknown',
            'date' => $recording['first-release-date'] ?? ''
        ];
    }
    
    echo json_encode(['success' => true, 'data' => $results]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
