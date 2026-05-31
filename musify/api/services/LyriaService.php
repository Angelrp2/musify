<?php

class LyriaService {
    private $apiKey;
    private $apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/lyria-3-pro-preview:generateContent';

    public function __construct($apiKey) {
        $this->apiKey = $apiKey;
    }

    public function generateMusic($lyrics, $genre = 'pop', $mood = 'upbeat', $duration = 'around 2 minutes') {
        $prompt = "Crea una canción musical profesional en formato MP3 basada en estas características:\n";
        $prompt .= "- Género: $genre\n";
        $prompt .= "- Mood: $mood\n";
        $prompt .= "- Duración: $duration\n";
        $prompt .= "- Letras: $lyrics\n";
        $prompt .= "La canción debe tener una estructura clara con intro, verso, coro, verso, coro, puente y outro.";

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
            'generationConfig' => [
                'responseModalities' => ['AUDIO', 'TEXT'],
                'responseFormat' => [
                    'audio' => [
                        'mimeType' => 'audio/mp3'
                    ]
                ]
            ]
        ];

        $response = $this->makeRequest($payload);
        
        if (isset($response['candidates'][0]['content']['parts'])) {
            $parts = $response['candidates'][0]['content']['parts'];
            
            foreach ($parts as $part) {
                if (isset($part['inlineData'])) {
                    $audioData = base64_decode($part['inlineData']['data']);
                    return $audioData;
                }
            }
        }

        throw new Exception('Error generando música con Lyria 3');
    }

    private function makeRequest($payload) {
        $ch = curl_init();
        
        curl_setopt_array($ch, [
            CURLOPT_URL => $this->apiUrl . '?key=' . $this->apiKey,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_TIMEOUT => 60
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            throw new Exception("Lyria API error: HTTP $httpCode");
        }

        return json_decode($response, true);
    }
}
?>
