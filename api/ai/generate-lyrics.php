<?php
/**
 * POST /api/ai/generate-lyrics
 * Genera letras con Ollama (requiere rol premium, editor o admin)
 */
require_once __DIR__ . '/../../config/Auth.php';

try {
    // Verificar JWT obligatorio
    $payload = JWT::verify();
    if (!$payload) {
        Response::unauthorized('Debes iniciar sesión para usar la generación con IA');
    }

    // Verificar rol mínimo: premium
    Auth::requireRole('premium', $payload);

    $input = json_decode(file_get_contents('php://input'), true);
    $prompt = trim($input['prompt'] ?? '');
    $genre  = trim($input['genre']  ?? 'Pop');
    $mood   = trim($input['mood']   ?? 'alegre');

    if (strlen($prompt) < 5) {
        Response::error('El prompt debe tener al menos 5 caracteres', 400);
    }

    $ollamaUrl   = getenv('OLLAMA_URL')   ?: (defined('OLLAMA_API')   ? OLLAMA_API   : 'http://localhost:11434');
    $ollamaModel = getenv('OLLAMA_MODEL') ?: (defined('OLLAMA_MODEL') ? OLLAMA_MODEL : 'llama3.2');

    $systemPrompt = "Eres un compositor de canciones profesional en español. Genera únicamente la letra de la canción, sin explicaciones adicionales. La letra debe tener: introducción, verso, coro y puente.";
    $userPrompt   = "Crea una canción de género {$genre} con mood {$mood} sobre el tema: {$prompt}";

    $ch = curl_init("{$ollamaUrl}/api/generate");
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 60,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS     => json_encode([
            'model'  => $ollamaModel,
            'prompt' => "{$systemPrompt}\n\n{$userPrompt}",
            'stream' => false,
        ]),
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError || $httpCode !== 200) {
        // Fallback: letra placeholder si Ollama no está disponible
        $lyrics = "♪ {$prompt} ♪\n\n[Verso 1]\nEsta canción fue creada con pasión\nbajo el cielo de la inspiración\ncada nota es una emoción\nque nace del corazón.\n\n[Coro]\nVivir, sentir, crear con IA\nel futuro ya llegó hoy\nMusify es mi camino\nhacia donde voy.\n\n[Puente]\n(Generación offline — Ollama no disponible)";

        // Guardar en historial aunque sea el fallback
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare('INSERT INTO ai_lyric_ideas (user_id, prompt, generated_lyrics, model, status) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([$payload['id'], $prompt, $lyrics, 'fallback', 'completed']);

        Response::success(['lyrics' => $lyrics, 'model' => 'fallback', 'note' => 'Ollama no disponible — letra de ejemplo generada']);
        return;
    }

    $result = json_decode($response, true);
    $lyrics = $result['response'] ?? 'No se pudo generar la letra';

    // Guardar en historial
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare('INSERT INTO ai_lyric_ideas (user_id, prompt, generated_lyrics, model, status) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$payload['id'], $prompt, $lyrics, $ollamaModel, 'completed']);

    Response::success(['lyrics' => $lyrics, 'model' => $ollamaModel]);

} catch (Exception $e) {
    Response::serverError($e->getMessage());
}
