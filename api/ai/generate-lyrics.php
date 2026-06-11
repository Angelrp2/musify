<?php
/**
 * POST /api/ai/generate-lyrics
 * Genera letra de canción con plantilla local
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/JWT.php';
require_once __DIR__ . '/../../config/Response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Método no permitido', 405);
}

try {
    $payload = JWT::verify();
    $userId  = $payload['id'];

    $input = json_decode(file_get_contents('php://input'), true);

    $prompt = trim($input['prompt'] ?? '');
    $genre  = trim($input['genre']  ?? 'Pop');
    $mood   = trim($input['mood']   ?? 'Neutral');

    if (!$prompt) {
        Response::badRequest('El campo prompt es requerido');
    }

    $lyrics = generateLyricsFromTemplate($prompt, $genre, $mood);

    $db   = Database::getInstance()->getConnection();
    $stmt = $db->prepare('
        INSERT INTO ai_lyric_ideas (user_id, prompt, generated_lyrics, model)
        VALUES (?, ?, ?, ?)
    ');
    $stmt->execute([$userId, $prompt, $lyrics, 'template']);

    Response::success([
        'lyrics' => $lyrics,
        'model'  => 'template'
    ]);

} catch (Exception $e) {
    Response::serverError('Error al generar letra: ' . $e->getMessage());
}

function generateLyricsFromTemplate(string $prompt, string $genre, string $mood): string
{
    $words   = array_filter(explode(' ', strtolower($prompt)));
    $keyword = !empty($words) ? $words[array_key_first($words)] : 'vida';

    $moodMap = [
        'triste'      => ['la lluvia cae',   'el silencio pesa',  'la noche llega',   'el tiempo pasa'],
        'alegre'      => ['el sol despierta', 'la luz nos llama',  'el día comienza',  'todo florece'],
        'nostálgico'  => ['recuerdo aquel',   'vuelvo a pensar',   'aquellos días',    'el pasado vive'],
        'romántico'   => ['tu mirada',        'tu presencia',      'tus manos',        'tu voz'],
        'melancólico' => ['entre sombras',    'en la distancia',   'sin respuesta',    'solo el eco'],
        'eufórico'    => ['todo es posible',  'nada nos detiene',  'somos la chispa',  'arde el momento'],
        'reflexivo'   => ['me pregunto',      'busco el camino',   'hay preguntas',    'la verdad espera'],
    ];

    $moodKey  = mb_strtolower($mood);
    $phrases  = $moodMap[$moodKey] ?? ['el tiempo vuela', 'la vida avanza', 'todo cambia', 'nada se repite'];

    $line = function (string $phrase) use ($keyword): string {
        return ucfirst($phrase) . ' cuando pienso en ' . $keyword;
    };

    $chorus = "Y sigo aquí, buscando entre $keyword y el $genre\n"
            . "La melodía que define lo que soy\n"
            . ucfirst($mood) . " es la forma en que lo siento\n"
            . 'Y no hay marcha atrás, este es mi momento';

    return implode("\n", [
        '[Verso 1]',
        $line($phrases[0]),
        $line($phrases[1]),
        'El ' . $genre . ' me acompaña en este viaje',
        'Cada nota escribe un nuevo mensaje',
        '',
        '[Estribillo]',
        $chorus,
        '',
        '[Verso 2]',
        $line($phrases[2]),
        $line($phrases[3]),
        'La historia de ' . $prompt . ' sigue viva',
        'En cada verso que el corazón aviva',
        '',
        '[Estribillo]',
        $chorus,
        '',
        '[Outro]',
        'Y cuando todo acabe recordaré',
        'Que ' . $prompt . ' siempre en mí estará',
    ]);
}
