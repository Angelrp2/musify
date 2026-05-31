<?php

require_once '../../config/config.php';
require_once '../../config/Database.php';
require_once '../../config/Response.php';
require_once '../services/GeminiService.php';
require_once '../services/LyriaService.php';
require_once '../services/TTSService.php';
require_once '../services/AudioMixerService.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['prompt']) || !isset($input['genre']) || !isset($input['mood'])) {
        Response::error('Parámetros requeridos: prompt, genre, mood', 400);
    }

    $userId = $_SERVER['HTTP_AUTHORIZATION'] ?? null;
    if (!$userId) {
        Response::error('No autorizado', 401);
    }

    $prompt = $input['prompt'];
    $genre = $input['genre'] ?? 'pop';
    $mood = $input['mood'] ?? 'upbeat';

    $db = Database::getInstance();
    
    $apiKey = getenv('GEMINI_API_KEY');
    if (!$apiKey) {
        Response::error('API key no configurada', 500);
    }

    $gemini = new GeminiService($apiKey);
    $lyria = new LyriaService($apiKey);
    $tts = new TTSService($apiKey);
    $mixer = new AudioMixerService('/uploads');

    $lyrics = $gemini->generateLyrics($prompt, $genre, $mood);
    
    $musicData = $lyria->generateMusic($lyrics, $genre, $mood);
    $musicFile = '/uploads/music_' . uniqid() . '.mp3';
    file_put_contents($musicFile, $musicData);

    $voiceData = $tts->synthesizeText($lyrics);
    $voiceFile = '/uploads/voice_' . uniqid() . '.mp3';
    file_put_contents($voiceFile, $voiceData);

    $mixedFile = $mixer->mixAudio($voiceFile, $musicFile);
    
    $stmt = $db->prepare('
        INSERT INTO songs (user_id, title, description, lyrics, audio_url, genre, mood, duration_seconds, is_public)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');
    
    $duration = $mixer->getAudioDuration($mixedFile);
    
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
            'id' => $db->lastInsertId(),
            'title' => $prompt,
            'lyrics' => $lyrics,
            'audio_url' => $mixedFile,
            'genre' => $genre,
            'mood' => $mood,
            'duration_seconds' => intval($duration)
        ]
    ]);

} catch (Exception $e) {
    Response::error('Error generando canción: ' . $e->getMessage(), 500);
}
?>
