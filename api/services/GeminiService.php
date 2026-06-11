<?php

class GeminiService {
    private $apiKey;
    private $apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    public function __construct($apiKey) {
        $this->apiKey = $apiKey;
    }

    public function generateLyrics($prompt, $genre = 'pop', $mood = 'happy') {
        $fullPrompt = "Genera una letra de canción en español para una canción de género $genre con un mood $mood. ";
        $fullPrompt .= "El tema es: $prompt. ";
        $fullPrompt .= "La letra debe tener verso, coro y puente. Devuelve solo la letra, sin explicaciones adicionales.";

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $fullPrompt]
                    ]
                ]
            ]
        ];

        $response = $this->makeRequest($payload);
        
        if (isset($response['candidates'][0]['content']['parts'][0]['text'])) {
            return $response['candidates'][0]['content']['parts'][0]['text'];
        }

        throw new Exception('Error generando letra con Gemini');
    }

    public function improveLyrics($lyrics, $feedback) {
        $prompt = "Mejora esta letra de canción basándote en el siguiente feedback: $feedback\n\nLetra original:\n$lyrics\n\nDevuelve solo la letra mejorada.";

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ]
        ];

        $response = $this->makeRequest($payload);
        
        if (isset($response['candidates'][0]['content']['parts'][0]['text'])) {
            return $response['candidates'][0]['content']['parts'][0]['text'];
        }

        throw new Exception('Error mejorando letra con Gemini');
    }

    private function makeRequest($payload) {
        $ch = curl_init();
        
        curl_setopt_array($ch, [
            CURLOPT_URL => $this->apiUrl . '?key=' . $this->apiKey,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($payload),
            CURLOPT_TIMEOUT => 30
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            throw new Exception("Gemini API error: HTTP $httpCode");
        }

        return json_decode($response, true);
    }
}
?>
