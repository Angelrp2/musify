<?php

class AudioMixerService {
    private $uploadsDir;

    public function __construct($uploadsDir = '/uploads') {
        $this->uploadsDir = $uploadsDir;
        if (!is_dir($this->uploadsDir)) {
            mkdir($this->uploadsDir, 0755, true);
        }
    }

    public function mixAudio($voiceFile, $musicFile, $outputFile = null) {
        if (!file_exists($voiceFile)) {
            throw new Exception("Archivo de voz no encontrado: $voiceFile");
        }
        if (!file_exists($musicFile)) {
            throw new Exception("Archivo de música no encontrado: $musicFile");
        }

        if ($outputFile === null) {
            $outputFile = $this->uploadsDir . '/mixed_' . uniqid() . '.mp3';
        }

        $command = sprintf(
            'ffmpeg -i "%s" -i "%s" -filter_complex "[0]volume=0.7[a];[1]volume=0.3[b];[a][b]amix=inputs=2:duration=first" -c:a libmp3lame -q:a 4 "%s" 2>&1',
            escapeshellarg($voiceFile),
            escapeshellarg($musicFile),
            escapeshellarg($outputFile)
        );

        $output = shell_exec($command);
        
        if (!file_exists($outputFile)) {
            throw new Exception("Error mezclando audio con ffmpeg: $output");
        }

        return $outputFile;
    }

    public function normalizeAudio($inputFile, $outputFile = null) {
        if (!file_exists($inputFile)) {
            throw new Exception("Archivo de entrada no encontrado: $inputFile");
        }

        if ($outputFile === null) {
            $outputFile = $this->uploadsDir . '/normalized_' . uniqid() . '.mp3';
        }

        $command = sprintf(
            'ffmpeg -i "%s" -af loudnorm=I=-16:TP=-1.5:LRA=11 -c:a libmp3lame -q:a 4 "%s" 2>&1',
            escapeshellarg($inputFile),
            escapeshellarg($outputFile)
        );

        $output = shell_exec($command);
        
        if (!file_exists($outputFile)) {
            throw new Exception("Error normalizando audio: $output");
        }

        return $outputFile;
    }

    public function getAudioDuration($audioFile) {
        if (!file_exists($audioFile)) {
            throw new Exception("Archivo de audio no encontrado: $audioFile");
        }

        $command = sprintf(
            'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1:noinherit=1 "%s"',
            escapeshellarg($audioFile)
        );

        $duration = shell_exec($command);
        return floatval(trim($duration));
    }

    public function convertAudioFormat($inputFile, $outputFormat = 'mp3', $outputFile = null) {
        if (!file_exists($inputFile)) {
            throw new Exception("Archivo de entrada no encontrado: $inputFile");
        }

        if ($outputFile === null) {
            $outputFile = $this->uploadsDir . '/converted_' . uniqid() . '.' . $outputFormat;
        }

        $command = sprintf(
            'ffmpeg -i "%s" -c:a libmp3lame -q:a 4 "%s" 2>&1',
            escapeshellarg($inputFile),
            escapeshellarg($outputFile)
        );

        $output = shell_exec($command);
        
        if (!file_exists($outputFile)) {
            throw new Exception("Error convirtiendo formato de audio: $output");
        }

        return $outputFile;
    }

    public function deleteFile($filePath) {
        if (file_exists($filePath)) {
            return unlink($filePath);
        }
        return false;
    }
}
?>
