# Arquitectura Técnica - Musify

**Documento:** Descripción de la arquitectura del sistema
**Versión:** 1.0
**Fecha:** 1 de junio 2026

---

## Resumen Ejecutivo

Musify es una aplicación web de tres capas (3-tier architecture) que permite a los usuarios crear canciones completas asistidas por inteligencia artificial. La arquitectura está diseñada para ser escalable, segura y mantenible.

---

## Arquitectura de Capas

```
┌─────────────────────────────────────────────────────────────┐
│                     CAPA DE PRESENTACIÓN                     │
│              (Frontend - HTML5, CSS3, JavaScript)            │
│                                                               │
│  ┌──────────────┬──────────────┬──────────────┬────────────┐ │
│  │   index.html │ create.html  │ my-songs.html│ login.html │ │
│  └──────────────┴──────────────┴──────────────┴────────────┘ │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  CSS (style.css) - Responsive, Mobile-first              │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  JavaScript (app.js, auth.js, backend.js)               │ │
│  │  - Validación de formularios                             │ │
│  │  - Comunicación con API                                  │ │
│  │  - Gestión de estado                                     │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/AJAX
┌─────────────────────────────────────────────────────────────┐
│                   CAPA DE APLICACIÓN                         │
│              (Backend - PHP 8.2 API REST)                    │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Router (index.php)                                      │ │
│  │  - Enrutamiento de requests                              │ │
│  │  - Manejo de CORS                                        │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            ↓                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Middleware                                              │ │
│  │  - Autenticación JWT                                     │ │
│  │  - Validación de permisos                                │ │
│  │  - Logging                                               │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            ↓                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Controllers (api/*)                                     │ │
│  │  - /auth (register, login)                               │ │
│  │  - /songs (CRUD)                                         │ │
│  │  - /playlists (gestión)                                  │ │
│  │  - /favorites (gestión)                                  │ │
│  │  - /ai (generación con IA)                               │ │
│  └──────────────────────────────────────────────────────────┘ │
│                            ↓                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Services (lógica de negocio)                            │ │
│  │  - SongService                                           │ │
│  │  - AIService                                             │ │
│  │  - PlaylistService                                       │ │
│  │  - MusicBrainzService                                    │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓ SQL
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE DATOS                             │
│              (SQLite - 6 tablas relacionadas)                │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Database (musify.db)                                    │ │
│  │                                                           │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐     │ │
│  │  │   users     │  │   songs     │  │  playlists   │     │ │
│  │  ├─────────────┤  ├─────────────┤  ├──────────────┤     │ │
│  │  │ id (PK)     │  │ id (PK)     │  │ id (PK)      │     │ │
│  │  │ username    │  │ user_id (FK)│  │ user_id (FK) │     │ │
│  │  │ email       │  │ title       │  │ name         │     │ │
│  │  │ password    │  │ genre       │  │ description  │     │ │
│  │  │ role        │  │ mood        │  │ is_public    │     │ │
│  │  │ created_at  │  │ lyrics      │  │ created_at   │     │ │
│  │  └─────────────┘  │ audio_url   │  └──────────────┘     │ │
│  │                   │ cover_url   │                         │ │
│  │  ┌─────────────┐  │ is_public   │  ┌──────────────┐     │ │
│  │  │  favorites  │  │ created_at  │  │   playlist   │     │ │
│  │  ├─────────────┤  └─────────────┘  │    _songs    │     │ │
│  │  │ id (PK)     │                    ├──────────────┤     │ │
│  │  │ user_id (FK)│  ┌─────────────┐  │ id (PK)      │     │ │
│  │  │ song_id (FK)│  │ai_lyric_ideas│  │playlist_id  │     │ │
│  │  │ created_at  │  ├─────────────┤  │song_id (FK) │     │ │
│  │  └─────────────┘  │ id (PK)     │  │ order        │     │ │
│  │                   │ user_id (FK)│  └──────────────┘     │ │
│  │                   │ theme       │                         │ │
│  │                   │ genre       │                         │ │
│  │                   │ mood        │                         │ │
│  │                   │ lyrics      │                         │ │
│  │                   │ created_at  │                         │ │
│  │                   └─────────────┘                         │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Flujo de Datos

### 1. Autenticación

```
Usuario → Formulario Login → JavaScript → POST /api/auth/login
                                              ↓
                                        JWT.verify()
                                              ↓
                                        Database Query
                                              ↓
                                        JWT Token ← JavaScript
                                              ↓
                                        localStorage
```

### 2. Generación de Canción

```
Usuario → Formulario Idea → JavaScript → POST /api/ai/generate-lyrics
                                              ↓
                                        AIService
                                              ↓
                                        Ollama/Gemini Pro
                                              ↓
                                        Letras Generadas
                                              ↓
                                        Guardar en BD
                                              ↓
                                        Mostrar en UI
```

### 3. Creación de Canción Completa

```
Letras + Música + Imagen → POST /api/songs/create
                                    ↓
                            Validación
                                    ↓
                            Guardar en BD
                                    ↓
                            Guardar archivos
                                    ↓
                            Respuesta JSON
                                    ↓
                            Actualizar UI
```

---

## Componentes Principales

### Frontend

**Archivos HTML:**
- `index.html` - Página de inicio
- `create.html` - Studio de creación
- `my-songs.html` - Biblioteca personal
- `song-detail.html` - Detalle de canción
- `login.html` - Autenticación
- `dashboard.html` - Panel de usuario

**CSS:**
- `style.css` - Estilos globales, responsive design

**JavaScript:**
- `app.js` - Lógica principal de la aplicación
- `auth.js` - Gestión de autenticación
- `backend.js` - Comunicación con API

### Backend

**Configuración:**
- `config/Database.php` - Conexión a SQLite
- `config/JWT.php` - Generación y verificación de tokens
- `config/.env` - Variables de entorno

**Controladores:**
- `api/auth/register.php` - Registro de usuarios
- `api/auth/login.php` - Inicio de sesión
- `api/songs/list.php` - Listar canciones
- `api/songs/create.php` - Crear canción
- `api/songs/detail.php` - Detalle de canción
- `api/ai/generate-lyrics.php` - Generar letras
- `api/ai/generate-music.php` - Generar música
- `api/ai/generate-image.php` - Generar portada

**Router:**
- `public/index.php` - Enrutamiento principal

### Base de Datos

**Tablas:**
1. `users` - Usuarios registrados
2. `songs` - Canciones creadas
3. `playlists` - Playlists de usuarios
4. `playlist_songs` - Relación M:N
5. `favorites` - Canciones favoritas
6. `ai_lyric_ideas` - Letras generadas

---

## Seguridad

### Autenticación

- **JWT (JSON Web Tokens):** Tokens firmados con HS256
- **Expiración:** 24 horas
- **Almacenamiento:** localStorage en cliente
- **Validación:** Middleware en cada endpoint protegido

### Contraseñas

- **Hashing:** bcrypt con PASSWORD_BCRYPT
- **Validación:** 8+ caracteres, mayúscula, número
- **Nunca en logs:** Las contraseñas nunca se registran

### Prevención de Ataques

- **SQL Injection:** Prepared statements en todas las queries
- **CSRF:** Token CSRF en formularios (si aplica)
- **XSS:** Escapado de outputs en HTML
- **CORS:** Configurado para localhost
- **Rate Limiting:** Máximo 100 requests/minuto

---

## APIs Externas Integradas

### 1. Ollama (IA Local)

- **Propósito:** Generación de letras
- **Modelo:** Llama 3.2 3B
- **Ventajas:** Local, sin coste, privado
- **Endpoint:** `http://localhost:11434/api/generate`

### 2. Gemini Pro (Alternativa)

- **Propósito:** Generación de letras mejorada
- **Ventajas:** Mejor calidad, más rápido
- **Requiere:** API Key

### 3. MusicBrainz

- **Propósito:** Búsqueda de artistas
- **Endpoint:** `https://musicbrainz.org/ws/2/artist`
- **Formato:** JSON
- **Rate Limit:** 1 request/segundo

---

## Flujo de Desarrollo

### Desarrollo Local

```bash
# 1. Clonar repositorio
git clone https://github.com/Angelrp2/musify.git

# 2. Configurar base de datos
sqlite3 database/musify.db < database/init.sql

# 3. Instalar Ollama (opcional)
ollama pull llama3.2

# 4. Iniciar servidor
cd public && php -S localhost:8000

# 5. Abrir en navegador
http://localhost:8000
```

### Testing

```bash
# Endpoints de prueba
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@musify.local","password":"password"}'

# Generar letras
curl -X POST http://localhost:8000/api/ai/generate-lyrics \
  -H "Authorization: Bearer <token>" \
  -d '{"theme":"amor","genre":"Pop"}'
```

---

## Performance

### Optimizaciones Implementadas

- **Paginación:** Máximo 100 items por página
- **Caché:** Resultados de búsqueda en localStorage
- **Lazy Loading:** Imágenes cargadas bajo demanda
- **Minificación:** CSS y JS minificados (si aplica)
- **Compresión:** Gzip habilitado en servidor

### Métricas Esperadas

- **Tiempo de carga:** < 3 segundos
- **First Contentful Paint:** < 1.5 segundos
- **Time to Interactive:** < 2.5 segundos

---

## Escalabilidad

### Posibles Mejoras Futuras

1. **Caché distribuido:** Redis para sesiones
2. **Base de datos:** PostgreSQL para producción
3. **Microservicios:** Separar IA en servicio independiente
4. **CDN:** Distribuir assets estáticos
5. **WebSockets:** Actualizaciones en tiempo real
6. **Contenedores:** Docker para despliegue

---

## Despliegue

### Requisitos de Producción

- PHP 8.2+ con extensiones: PDO, SQLite
- Servidor web: Apache o Nginx
- HTTPS obligatorio
- Backups automáticos de BD

### Variables de Entorno Críticas

```
DB_PATH=database/musify.db
JWT_SECRET=tu_secreto_seguro_aqui
OLLAMA_URL=http://localhost:11434
GEMINI_API_KEY=tu_api_key
```

---

## Monitoreo

### Logs

- **Errores:** `/logs/errors.log`
- **Acceso:** `/logs/access.log`
- **IA:** `/logs/ai.log`

### Métricas

- Número de usuarios activos
- Canciones creadas por día
- Errores de API
- Tiempo de respuesta promedio

---

**Documento finalizado:** 1 de junio 2026
**Versión:** 1.0
**Estado:** Completado
