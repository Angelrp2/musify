# Diagrama Entidad-Relación (E-R) - Musify

## Descripción de Tablas

### users
Almacena información de los usuarios del sistema.

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Identificador único |
| username | TEXT | UNIQUE, NOT NULL | Nombre de usuario |
| email | TEXT | UNIQUE, NOT NULL | Correo electrónico |
| password_hash | TEXT | NOT NULL | Contraseña hasheada |
| bio | TEXT | | Biografía del usuario |
| avatar_url | TEXT | | URL del avatar |
| role | TEXT | DEFAULT 'user' | Rol (admin, editor, user, guest) |
| is_public | INTEGER | DEFAULT 1 | Perfil público (0/1) |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Fecha de actualización |

### songs
Almacena las canciones creadas por los usuarios.

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Identificador único |
| user_id | INTEGER | FOREIGN KEY | Referencia a usuario |
| title | TEXT | NOT NULL | Título de la canción |
| description | TEXT | | Descripción |
| lyrics | TEXT | | Letras de la canción |
| audio_url | TEXT | | URL del archivo de audio |
| cover_image_url | TEXT | | URL de la portada |
| genre | TEXT | | Género musical |
| mood | TEXT | | Mood/Ánimo |
| duration_seconds | INTEGER | | Duración en segundos |
| is_public | INTEGER | DEFAULT 0 | Canción pública (0/1) |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Fecha de actualización |

**Relación:** Muchas canciones pueden pertenecer a un usuario. Un usuario puede tener muchas canciones.

### playlists
Almacena las playlists creadas por los usuarios.

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Identificador único |
| user_id | INTEGER | FOREIGN KEY | Referencia a usuario |
| title | TEXT | NOT NULL | Título de la playlist |
| description | TEXT | | Descripción |
| cover_image_url | TEXT | | URL de la portada |
| is_public | INTEGER | DEFAULT 0 | Playlist pública (0/1) |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Fecha de creación |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Fecha de actualización |

**Relación:** Un usuario puede crear muchas playlists.

### playlist_songs
Tabla de relación muchos a muchos entre playlists y songs.

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Identificador único |
| playlist_id | INTEGER | FOREIGN KEY | Referencia a playlist |
| song_id | INTEGER | FOREIGN KEY | Referencia a canción |
| position | INTEGER | | Posición en la playlist |
| added_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Fecha de adición |

**Relación:** Una playlist puede contener muchas canciones. Una canción puede estar en muchas playlists.

### favorites
Almacena las canciones favoritas de los usuarios.

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Identificador único |
| user_id | INTEGER | FOREIGN KEY | Referencia a usuario |
| song_id | INTEGER | FOREIGN KEY | Referencia a canción |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Fecha de adición |

**Relación:** Un usuario puede tener muchos favoritos. Una canción puede ser favorita de muchos usuarios.

### ai_lyric_ideas
Almacena el historial de generaciones de letras con IA.

| Campo | Tipo | Restricción | Descripción |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Identificador único |
| user_id | INTEGER | FOREIGN KEY | Referencia a usuario |
| prompt | TEXT | NOT NULL | Prompt usado para generar |
| generated_lyrics | TEXT | | Letras generadas |
| model | TEXT | DEFAULT 'ollama-llama3.2' | Modelo usado |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Fecha de creación |

**Relación:** Un usuario puede tener muchas ideas de letras generadas.

## Diagrama Conceptual

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                         USUARIOS                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ id (PK)                                                  │  │
│  │ username (UNIQUE)                                        │  │
│  │ email (UNIQUE)                                           │  │
│  │ password_hash                                            │  │
│  │ bio                                                      │  │
│  │ avatar_url                                               │  │
│  │ role                                                     │  │
│  │ is_public                                                │  │
│  │ created_at                                               │  │
│  │ updated_at                                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                    ┌─────────┼─────────┐                        │
│                    │         │         │                        │
│                    ▼         ▼         ▼                        │
│              ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│              │ SONGS    │ │PLAYLISTS │ │AI_LYRIC_IDEAS    │   │
│              ├──────────┤ ├──────────┤ ├──────────────────┤   │
│              │ id (PK)  │ │ id (PK)  │ │ id (PK)          │   │
│              │ user_id  │ │ user_id  │ │ user_id (FK)     │   │
│              │ title    │ │ title    │ │ prompt           │   │
│              │ lyrics   │ │ desc.    │ │ generated_lyrics │   │
│              │ audio_url│ │ is_public│ │ model            │   │
│              │ genre    │ │ created  │ │ created_at       │   │
│              │ mood     │ │          │ │                  │   │
│              │ is_public│ │          │ │                  │   │
│              │ created  │ │          │ │                  │   │
│              └──────────┘ └──────────┘ └──────────────────┘   │
│                    │              │                            │
│                    │              │                            │
│                    └──────┬───────┘                             │
│                           │                                    │
│                           ▼                                    │
│                  ┌──────────────────────┐                      │
│                  │ PLAYLIST_SONGS       │                      │
│                  ├──────────────────────┤                      │
│                  │ id (PK)              │                      │
│                  │ playlist_id (FK)     │                      │
│                  │ song_id (FK)         │                      │
│                  │ position             │                      │
│                  │ added_at             │                      │
│                  └──────────────────────┘                      │
│                                                                 │
│              ┌──────────────────────┐                          │
│              │ FAVORITES            │                          │
│              ├──────────────────────┤                          │
│              │ id (PK)              │                          │
│              │ user_id (FK)         │                          │
│              │ song_id (FK)         │                          │
│              │ created_at           │                          │
│              └──────────────────────┘                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Relaciones

- **users → songs**: 1:N (Un usuario tiene muchas canciones)
- **users → playlists**: 1:N (Un usuario tiene muchas playlists)
- **users → favorites**: 1:N (Un usuario tiene muchos favoritos)
- **users → ai_lyric_ideas**: 1:N (Un usuario tiene muchas ideas de letras)
- **playlists → songs**: N:M (A través de playlist_songs)
- **users → songs (favoritos)**: N:M (A través de favorites)

## Índices

Se han creado índices para optimizar las búsquedas:

- `idx_songs_user_id`: Búsqueda de canciones por usuario
- `idx_songs_genre`: Búsqueda de canciones por género
- `idx_songs_public`: Búsqueda de canciones públicas
- `idx_playlists_user_id`: Búsqueda de playlists por usuario
- `idx_favorites_user_id`: Búsqueda de favoritos por usuario
- `idx_playlist_songs_playlist_id`: Búsqueda de canciones en playlist
- `idx_users_email`: Búsqueda de usuarios por email
