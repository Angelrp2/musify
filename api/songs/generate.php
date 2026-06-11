<?php
/**
 * POST /api/songs/generate
 * Genera una canción completa (letra + audio) con IA
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/JWT.php';
require_once __DIR__ . '/../../config/Response.php';
require_once __DIR__ . '/../services/GeminiService.php';
require_once __DIR__ . '/../services/LyriaService.php';
require_once __DIR__ . '/../services/TTSService.php';
require_once __DIR__ . '/../services/AudioMixerService.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['prompt']) || !isset($input['genre']) || !isset($input['mood'])) {
        Response::error('Parámetros requeridos: prompt, genre, mood', 400);
    }

    $payload = JWT::verify();
    $userId  = $payload['id'];

    $prompt = $input['prompt'];
    $genre  = $input['genre'] ?? 'pop';
    $mood   = $input['mood']  ?? 'upbeat';

    $db = Database::getInstance();

    $apiKey = GEMINI_API_KEY;
    if (!$apiKey) {
        Response::error('API key no configurada', 500);
    }

    $gemini = new GeminiService($apiKey);
    $lyria  = new LyriaService($apiKey);
    $tts    = new TTSService($apiKey);
    $mixer  = new AudioMixerService('/uploads');

    $lyrics    = $gemini->generateLyrics($prompt, $genre, $mood);
    $musicData = $lyria->generateMusic($lyrics, $genre, $mood);
    $musicFile = '/uploads/music_' . uniqid() . '.mp3';
    file_put_contents($musicFile, $musicData);

    $voiceData = $tts->synthesizeText($lyrics);
    $voiceFile = '/uploads/voice_' . uniqid() . '.mp3';
    file_put_contents($voiceFile, $voiceData);

    $mixedFile = $mixer->mixAudio($voiceFile, $musicFile);
    $duration  = $mixer->getAudioDuration($mixedFile);

    $pdo = $db->getConnection();
    $stmt = $pdo->prepare('
        INSERT INTO songs (user_id, title, description, lyrics, audio_url, genre, mood, duration_seconds, is_public)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');
    $stmt->execute([
        $userId,
        $prompt,
        'Generada con IA',
        $lyrics,
        $mixedFile,
        $genre,
        $mood,
        intval($duration),
        0
    ]);

    $mixer->deleteFile($musicFile);
    $mixer->deleteFile($voiceFile);

    Response::success([
        'song' => [
            'id'               => $pdo->lastInsertId(),
            'title'            => $prompt,
            'lyrics'           => $lyrics,
            'audio_url'        => $mixedFile,
            'genre'            => $genre,
            'mood'             => $mood,
            'duration_seconds' => intval($duration)
        ]
    ]);

} catch (Exception $e) {
    Response::serverError('Error generando canción: ' . $e->getMessage());
}
