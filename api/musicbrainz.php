<?php
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Metodo no permitido']);
    exit;
}

$query = trim($_GET['q'] ?? '');
if (!$query) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Parametro q requerido']);
    exit;
}

$url = 'https://musicbrainz.org/ws/2/artist?query=' . urlencode($query) . '&fmt=json&limit=8';
$context = stream_context_create([
    'http' => [
        'method'  => 'GET',
        'timeout' => 8,
        'header'  => "User-Agent: Musify-TFG/1.0 ( angelripo5@gmail.com )\r\n",
        'ignore_errors' => true,
    ],
    'ssl' => [
        'verify_peer'      => false,
        'verify_peer_name' => false,
    ],
]);

$response = @file_get_contents($url, false, $context);
if ($response === false) {
    echo json_encode(['success' => false, 'message' => 'No se pudo conectar con MusicBrainz']);
    exit;
}

$data = json_decode($response, true);
$artists = $data['artists'] ?? [];

if (empty($artists)) {
    echo json_encode(['success' => true, 'data' => []]);
    exit;
}

$results = array_map(fn($a) => [
    'id'          => $a['id']      ?? '',
    'name'        => $a['name']    ?? 'Desconocido',
    'country'     => $a['country'] ?? '',
    'type'        => $a['type']    ?? '',
    'life-span'   => $a['life-span'] ?? [],
], $artists);

echo json_encode(['success' => true, 'data' => $results]);
