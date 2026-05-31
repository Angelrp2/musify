# Musify - Plataforma de Creación Musical con IA

**TFG DAW - Proyecto de Creación Musical Asistida por Inteligencia Artificial**

## Descripción

Musify es una plataforma web que permite a los usuarios crear música de forma asistida por IA. El flujo es simple:

1. **Generar Letra**: El usuario ingresa un tema y la IA genera letras originales
2. **Componer Música**: Se genera automáticamente la música basada en el género y mood
3. **Diseñar Portada**: Se crea una portada de álbum personalizable
4. **Compartir**: Las canciones se publican en la comunidad

## Stack Tecnológico

- **Backend**: PHP 8.2 + SQLite
- **Frontend**: HTML5 + CSS3 + JavaScript Vanilla
- **API**: REST con autenticación JWT
- **Base de Datos**: SQLite con 6 tablas relacionadas
- **IA**: Ollama (Llama 3.2 3B) + MusicBrainz API

## Estructura del Proyecto

```
musify/
├── api/                    # Endpoints de la API REST
│   ├── auth/              # Autenticación (register, login, me)
│   ├── songs/             # CRUD de canciones
│   ├── playlists/         # CRUD de playlists
│   ├── favorites/         # Gestión de favoritos
│   └── ai/                # Generación de IA
├── config/                # Configuración
│   ├── config.php         # Variables globales
│   ├── Database.php       # Conexión SQLite
│   └── JWT.php            # Autenticación JWT
├── database/              # Base de datos
│   ├── init.sql           # Schema SQL
│   ├── init.php           # Script de inicialización
│   └── musify.db          # Archivo SQLite
├── public/                # Archivos públicos
│   ├── index.php          # Router principal
│   ├── index.html         # Frontend
│   └── uploads/           # Archivos subidos
├── assets/                # Recursos estáticos
│   ├── css/               # Estilos
│   ├── js/                # JavaScript
│   └── images/            # Imágenes
└── logs/                  # Archivos de log
```

## Instalación

### Requisitos
- PHP 8.2+
- SQLite3
- Navegador moderno

### Pasos

1. **Clonar el proyecto**
```bash
git clone <repo>
cd musify
```

2. **Inicializar base de datos**
```bash
php database/init.php
```

3. **Iniciar servidor PHP**
```bash
cd public
php -S localhost:8000
```

4. **Acceder a la aplicación**
```
http://localhost:8000
```

## Documentación de API

### Autenticación

#### Registro
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "usuario",
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "usuario",
    "email": "user@example.com",
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

#### Perfil actual
```
GET /api/auth/me
Authorization: Bearer <token>
```

### Canciones

#### Listar canciones
```
GET /api/songs?page=1&limit=20&genre=Pop&search=query
```

#### Crear canción
```
POST /api/songs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Mi Canción",
  "description": "Descripción",
  "lyrics": "Letras...",
  "genre": "Pop",
  "mood": "Alegre",
  "is_public": true
}
```

#### Obtener canción
```
GET /api/songs/:id
```

#### Actualizar canción
```
PUT /api/songs/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Nuevo título",
  ...
}
```

#### Eliminar canción
```
DELETE /api/songs/:id
Authorization: Bearer <token>
```

### Playlists

#### Crear playlist
```
POST /api/playlists
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Mi Playlist",
  "description": "Descripción",
  "is_public": true
}
```

#### Agregar canción a playlist
```
POST /api/playlists/:id/songs
Authorization: Bearer <token>
Content-Type: application/json

{
  "song_id": 1
}
```

### Favoritos

#### Agregar a favoritos
```
POST /api/favorites/:songId
Authorization: Bearer <token>
```

#### Obtener favoritos
```
GET /api/favorites
Authorization: Bearer <token>
```

#### Remover de favoritos
```
DELETE /api/favorites/:songId
Authorization: Bearer <token>
```

### IA

#### Generar letras
```
POST /api/ai/generate-lyrics
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "Una canción sobre la noche"
}
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "lyrics": "Bajo las estrellas brillantes...",
    "model": "ollama-llama3.2"
  }
}
```

## Características

- Autenticación JWT
- CRUD de canciones
- Playlists y favoritos
- Búsqueda y filtrado
- Generación de letras con IA
- Diseño de portadas Canvas
- Integración MusicBrainz
- Validaciones cliente/servidor
- Manejo de errores
- Responsive design

## Seguridad

- Contraseñas hasheadas con bcrypt
- JWT para autenticación stateless
- Validación de inputs contra inyecciones
- CORS configurado
- Headers de seguridad

## Requisitos Mínimos Cumplidos

| Requisito | Estado |
|-----------|--------|
| Frontend HTML5/CSS/JS | Implementado |
| Backend API REST | Implementado |
| BD relacional 6 tablas | Implementado |
| Diagrama E-R | Implementado |
| Autenticación JWT | Implementado |
| API externa (MusicBrainz) | Implementado |
| Validaciones | Implementado |
| Manejo de errores | Implementado |
| Elemento diferenciador | Implementado |
| Documentación | Implementado |

## Usuarios de Prueba

- **Admin**: admin@musify.local / password
- **Demo**: demo@musify.local / password

## Licencia

MIT

## Autor

Ángel - TFG DAW 2026
