<?php
/**
 * Script para inicializar la base de datos SQLite
 * Ejecutar: php database/init.php
 */

require_once __DIR__ . '/../config/config.php';

try {
    // Crear conexión
    $pdo = new PDO('sqlite:' . DB_PATH);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Leer y ejecutar SQL
    $sql = file_get_contents(__DIR__ . '/init.sql');
    $pdo->exec($sql);

    // Asegurar que Apache (www-data) pueda escribir en la BD y su carpeta
    // (init.php suele ejecutarse como root dentro del contenedor)
    @chmod(DB_PATH, 0666);
    @chmod(dirname(DB_PATH), 0777);

    echo "Base de datos inicializada correctamente\n";
    echo "Ubicacion: " . DB_PATH . "\n";
    
    // Verificar tablas
    $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table'");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "Tablas creadas: " . count($tables) . "\n";
    foreach ($tables as $table) {
        echo "  - $table\n";
    }
    
} catch (PDOException $e) {
    die("Error: " . $e->getMessage() . "\n");
}
