<?php

class TTSService {
    private $apiKey;
    private $apiUrl = 'https://texttospeech.googleapis.com/v1/text:synthesize';

    public function __construct($apiKey) {
        $this->apiKey = $apiKey;
    }

    public function synthesizeText($text, $languageCode = 'es-ES', $voiceName = 'es-ES-Standard-A') {
        $payload = [
            'input' => [
                'text' => $text
            ],
            'voice' => [
                'languageCode' => $languageCode,
                'name' => $voiceName
            ],
            'audioConfig' => [
                'audioEncoding' => 'MP3',
                'sampleRateHertz' => 44100,
                'pitch' => 0.0,
                'speakingRate' => 1.0
            ]
        ];

        $response = $this->makeRequest($payload);
        
        if (isset($response['audioContent'])) {
            $audioData = base64_decode($response['audioContent']);
            return $audioData;
        }

        throw new Exception('Error generando voz con Google TTS');
    }

    public function getAvailableVoices($languageCode = 'es-ES') {
        $ch = curl_init();
        
        curl_setopt_array($ch, [
            CURLOPT_URL => 'https://texttospeech.googleapis.com/v1/voices?key=' . $this->apiKey . '&languageCode=' . $languageCode,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_TIMEOUT => 10
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            throw new Exception("TTS API error: HTTP $httpCode");
        }

        return json_decode($response, true);
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
            throw new Exception("TTS API error: HTTP $httpCode");
        }

        return json_decode($response, true);
    }
}
?>
