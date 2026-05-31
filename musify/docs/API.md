# Documentación de API - Musify

## Base URL

```
http://localhost:8000/api
```

## Autenticación

Todos los endpoints protegidos requieren un token JWT en el header:

```
Authorization: Bearer <token>
```

## Endpoints

### Autenticación

#### Registro

```
POST /auth/register
Content-Type: application/json

{
  "username": "usuario",
  "email": "user@example.com",
  "password": "password123"
}
```

Respuesta:
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "id": 1,
    "username": "usuario",
    "email": "user@example.com",
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

#### Login

```
POST /auth/login
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
  "message": "Inicio de sesión exitoso",
  "data": {
    "id": 1,
    "username": "usuario",
    "email": "user@example.com",
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

#### Perfil Actual

```
GET /auth/me
Authorization: Bearer <token>
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "usuario",
    "email": "user@example.com",
    "role": "user"
  }
}
```

#### Logout

```
POST /auth/logout
Authorization: Bearer <token>
```

### Canciones

#### Listar Canciones

```
GET /songs/list?genre=Pop&search=query&page=1
```

Respuesta:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "title": "Mi Canción",
      "description": "Descripción",
      "lyrics": "Letras...",
      "genre": "Pop",
      "mood": "Alegre",
      "audio_url": "path/to/audio.mp3",
      "cover_image_url": "path/to/cover.png",
      "is_public": 1,
      "created_at": "2026-05-27 10:00:00"
    }
  ]
}
```

#### Crear Canción

```
POST /songs/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Mi Canción",
  "description": "Descripción",
  "genre": "Pop",
  "mood": "Alegre",
  "lyrics": "Letras...",
  "is_public": 1
}
```

#### Obtener Detalle de Canción

```
GET /songs/detail?id=1
```

#### Actualizar Canción

```
PUT /songs/update?id=1
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Nuevo título",
  "description": "Nueva descripción",
  "genre": "Rock"
}
```

#### Eliminar Canción

```
DELETE /songs/delete?id=1
Authorization: Bearer <token>
```

### Favoritos

#### Agregar a Favoritos

```
POST /favorites/add?id=1
Authorization: Bearer <token>
```

#### Obtener Favoritos

```
GET /favorites/list
Authorization: Bearer <token>
```

#### Eliminar de Favoritos

```
DELETE /favorites/remove?id=1
Authorization: Bearer <token>
```

### Playlists

#### Crear Playlist

```
POST /playlists/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Mi Playlist",
  "description": "Descripción",
  "is_public": 1
}
```

#### Obtener Playlists

```
GET /playlists/list
Authorization: Bearer <token>
```

#### Agregar Canción a Playlist

```
POST /playlists/add-song?id=1
Authorization: Bearer <token>
Content-Type: application/json

{
  "song_id": 1
}
```

### MusicBrainz

#### Buscar Artistas

```
GET /musicbrainz?q=query
```

Respuesta:
```json
{
  "success": true,
  "data": [
    {
      "id": "artist-id",
      "title": "Nombre del Artista",
      "artist": "Artista",
      "date": "2020-01-01"
    }
  ]
}
```

## Códigos de Estado HTTP

- `200 OK`: Solicitud exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Solicitud inválida
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: No autorizado
- `404 Not Found`: Recurso no encontrado
- `409 Conflict`: Conflicto (ej: recurso duplicado)
- `500 Internal Server Error`: Error del servidor

## Errores

Respuesta de error:
```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": {
    "field": "Mensaje de error específico"
  }
}
```
