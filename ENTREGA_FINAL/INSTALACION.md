# Guía de Instalación - Musify

**Documento:** Instrucciones para instalar y configurar Musify
**Versión:** 1.0
**Fecha:** 1 de junio 2026

---

## Requisitos Previos

### Hardware Mínimo

- **Procesador:** Intel i5 o equivalente (2 GHz+)
- **RAM:** 4 GB mínimo (8 GB recomendado)
- **Almacenamiento:** 500 MB libres
- **Conexión:** Internet para descargar dependencias

### Software Requerido

- **PHP:** 8.2 o superior
- **SQLite:** 3.0 o superior (incluido en PHP)
- **Git:** 2.0 o superior
- **Node.js:** 16+ (opcional, para herramientas de desarrollo)
- **Ollama:** Para generación de letras con IA (opcional)

### Extensiones PHP Requeridas

```bash
# Verificar extensiones instaladas
php -m | grep -E "pdo|sqlite|json|curl|openssl"
```

Extensiones necesarias:
- `pdo` - Acceso a bases de datos
- `pdo_sqlite` - Driver SQLite
- `json` - Manejo de JSON
- `curl` - Peticiones HTTP
- `openssl` - Seguridad SSL/TLS

---

## Instalación Paso a Paso

### 1. Clonar el Repositorio

```bash
# Clonar desde GitHub
git clone https://github.com/Angelrp2/musify.git
cd musify

# O descargar ZIP
# https://github.com/Angelrp2/musify/archive/refs/heads/main.zip
```

### 2. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp config/.env.example config/.env

# Editar con tus valores
nano config/.env
```

**Contenido de `.env`:**

```env
# Base de Datos
DB_PATH=database/musify.db
DB_TYPE=sqlite

# JWT
JWT_SECRET=tu_secreto_super_seguro_aqui_cambiar_en_produccion
JWT_EXPIRATION=86400

# Ollama (IA Local)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# Gemini Pro (Alternativa)
GEMINI_API_KEY=tu_api_key_aqui

# Servidor
APP_URL=http://localhost:8000
APP_ENV=development
DEBUG=true

# MusicBrainz
MUSICBRAINZ_URL=https://musicbrainz.org/ws/2
```

### 3. Inicializar Base de Datos

```bash
# Crear base de datos con tablas
sqlite3 database/musify.db < database/init.sql

# Verificar que se creó correctamente
sqlite3 database/musify.db ".tables"
```

**Salida esperada:**
```
ai_lyric_ideas  favorites       playlist_songs  playlists       songs           users
```

### 4. Verificar Permisos de Carpetas

```bash
# Dar permisos de escritura
chmod 755 database/
chmod 644 database/musify.db

# En Windows (si es necesario)
# icacls "database" /grant Users:F
```

### 5. Instalar Ollama (Opcional pero Recomendado)

#### En Windows

1. Descargar desde https://ollama.ai
2. Ejecutar instalador
3. Abrir terminal y ejecutar:

```bash
ollama pull llama3.2
ollama serve
```

#### En macOS

```bash
brew install ollama
ollama pull llama3.2
ollama serve
```

#### En Linux

```bash
curl https://ollama.ai/install.sh | sh
ollama pull llama3.2
ollama serve
```

### 6. Iniciar Servidor PHP

```bash
# Navegar a la carpeta public
cd public

# Iniciar servidor en puerto 8000
php -S localhost:8000

# O en otro puerto
php -S localhost:3000
```

**Salida esperada:**
```
Development Server (http://localhost:8000)
Listening on http://localhost:8000
Press Ctrl-C to quit.
```

### 7. Acceder a la Aplicación

Abrir navegador y acceder a:

```
http://localhost:8000
```

---

## Configuración Inicial

### 1. Crear Usuario Administrador

**Opción A: Mediante API**

```bash
# Registrar usuario admin
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@musify.local",
    "password": "Admin123456"
  }'
```

**Opción B: Directamente en BD**

```bash
# Conectar a BD
sqlite3 database/musify.db

# Insertar usuario admin
INSERT INTO users (username, email, password, role, created_at, updated_at) 
VALUES (
  'admin',
  'admin@musify.local',
  '$2y$10$...',  -- bcrypt hash de "Admin123456"
  'admin',
  datetime('now'),
  datetime('now')
);
```

### 2. Verificar Conexión a Ollama

```bash
# Probar endpoint de Ollama
curl http://localhost:11434/api/tags

# Salida esperada:
# {"models":[{"name":"llama3.2:latest",...}]}
```

### 3. Probar Generación de Letras

```bash
# Obtener token JWT
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@musify.local",
    "password": "Admin123456"
  }'

# Guardar el token en variable
TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."

# Generar letras
curl -X POST http://localhost:8000/api/ai/generate-lyrics \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "theme": "amor",
    "genre": "Pop",
    "mood": "Melancólico"
  }'
```

---

## Solución de Problemas

### Error: "Cannot connect to database"

**Causa:** Archivo de BD no existe o permisos insuficientes

**Solución:**
```bash
# Recrear BD
rm database/musify.db
sqlite3 database/musify.db < database/init.sql
chmod 644 database/musify.db
```

### Error: "PHP extension pdo_sqlite not found"

**Causa:** Extensión SQLite no instalada

**Solución (Windows):**
```bash
# Editar php.ini
# Descomentar: extension=pdo_sqlite
php -i | grep sqlite
```

**Solución (Linux):**
```bash
sudo apt-get install php-sqlite3
sudo systemctl restart apache2  # o nginx
```

### Error: "JWT token expired"

**Causa:** Token JWT expirado (24 horas)

**Solución:** Hacer login nuevamente para obtener nuevo token

### Error: "Ollama connection refused"

**Causa:** Ollama no está corriendo

**Solución:**
```bash
# Iniciar Ollama en otra terminal
ollama serve

# Verificar que está corriendo
curl http://localhost:11434/api/tags
```

### Error: "CORS error"

**Causa:** Petición desde diferente origen

**Solución:** El servidor está configurado para localhost. Para producción, configurar CORS adecuadamente en `config/cors.php`

---

## Configuración de Desarrollo

### 1. Instalar Herramientas de Desarrollo

```bash
# Instalar dependencias de desarrollo (opcional)
npm install

# O con Composer (si usas)
composer install
```

### 2. Habilitar Debug Mode

En `config/.env`:
```env
APP_ENV=development
DEBUG=true
```

### 3. Ver Logs

```bash
# Logs de errores
tail -f logs/errors.log

# Logs de acceso
tail -f logs/access.log

# Logs de IA
tail -f logs/ai.log
```

---

## Configuración de Producción

### 1. Cambiar Variables de Entorno

```env
APP_ENV=production
DEBUG=false
JWT_SECRET=cambiar_a_secreto_muy_seguro
```

### 2. Usar HTTPS

```bash
# Generar certificado SSL
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365
```

### 3. Configurar Servidor Web

**Apache:**
```apache
<VirtualHost *:443>
    ServerName musify.com
    DocumentRoot /var/www/musify/public
    
    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/key.pem
    
    <Directory /var/www/musify/public>
        RewriteEngine On
        RewriteBase /
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^ index.php [L]
    </Directory>
</VirtualHost>
```

**Nginx:**
```nginx
server {
    listen 443 ssl;
    server_name musify.com;
    root /var/www/musify/public;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### 4. Backups Automáticos

```bash
# Script de backup diario
#!/bin/bash
BACKUP_DIR="/backups/musify"
DB_PATH="/var/www/musify/database/musify.db"
DATE=$(date +%Y%m%d_%H%M%S)

cp $DB_PATH $BACKUP_DIR/musify_$DATE.db
gzip $BACKUP_DIR/musify_$DATE.db

# Mantener solo últimos 30 días
find $BACKUP_DIR -name "musify_*.db.gz" -mtime +30 -delete
```

---

## Verificación Final

Después de instalar, verificar que todo funciona:

```bash
# 1. Servidor PHP corriendo
curl http://localhost:8000

# 2. Base de datos accesible
sqlite3 database/musify.db "SELECT COUNT(*) FROM users;"

# 3. Ollama disponible (si está instalado)
curl http://localhost:11434/api/tags

# 4. API respondiendo
curl http://localhost:8000/api/health

# 5. Autenticación funcionando
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@musify.local","password":"Admin123456"}'
```

---

## Próximos Pasos

1. ✅ Crear usuario administrador
2. ✅ Explorar la aplicación
3. ✅ Generar primeras letras con IA
4. ✅ Crear canciones
5. ✅ Compartir con otros usuarios

---

**Documento finalizado:** 1 de junio 2026
**Versión:** 1.0
**Estado:** Completado
