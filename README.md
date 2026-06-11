# Musify

Plataforma web de creación musical. El usuario describe una idea, elige género y ánimo, y la aplicación genera la letra de una canción. Puede guardarla, reproducirla con voz sintetizada, buscar artistas en MusicBrainz y gestionar playlists y favoritos.

TFG DAW — Ángel, DIGITECH 2026.

---

## Stack

- **Backend:** PHP 8.2, API REST, SQLite
- **Frontend:** HTML5, CSS3, JavaScript vanilla
- **Autenticación:** JWT firmado con HMAC-SHA256, contraseñas con bcrypt
- **Base de datos:** SQLite (6 tablas)
- **API externa:** MusicBrainz (búsqueda de artistas y canciones)
- **IA:** Generación de letra con plantilla local
- **Despliegue:** Docker con Apache

---

## Requisitos

- Docker Desktop

---

## Instalación y arranque

```bash
git clone <repo>
cd musify
```

Crear el archivo `.env` (copiando `.env.example`) y definir un `JWT_SECRET` propio:

```bash
cp .env.example .env
# editar .env y poner: JWT_SECRET=una-clave-larga-y-aleatoria
```

```bash
docker compose up --build
```

En otra terminal, inicializar la base de datos:

```bash
docker compose exec web php database/init.php
```

Abrir `http://localhost:8000`.

---

## Usuarios de prueba

Contraseña para todos: `Password123`

| Usuario | Email | Rol | Permisos |
|---------|-------|-----|----------|
| admin | admin@musify.local | admin | Gestión total — usuarios y canciones |
| editor | editor@musify.local | editor | Crear y editar canciones propias y ajenas |
| demo_user | demo@musify.local | user | Crear canciones propias, playlists, favoritos |
| guest | guest@musify.local | guest | Solo lectura |

---

## Estructura del proyecto

```
musify/
├── api/
│   ├── auth/          → login.php, register.php, me.php, logout.php
│   ├── songs/         → list.php, create.php, detail.php, update.php, delete.php, generate.php
│   ├── playlists/     → list.php, create.php, add-song.php
│   ├── favorites/     → list.php, add.php, remove.php
│   ├── ai/            → generate-lyrics.php
│   └── musicbrainz.php
├── config/
│   ├── config.php     → constantes y carga de .env
│   ├── Database.php   → singleton PDO SQLite
│   ├── JWT.php        → encode/decode/verify HMAC-SHA256
│   └── Response.php   → helper respuestas JSON
├── database/
│   ├── init.sql       → schema (6 tablas) + datos seed
│   ├── init.php       → ejecuta init.sql
│   └── musify.db      → archivo SQLite (no versionar)
├── css/style.css
├── js/
│   ├── auth.js        → login, registro, JWT
│   ├── app.js         → lógica de páginas
│   └── player.js      → reproductor + Web Speech API
├── index.html
├── create.html
├── my-songs.html
├── song-detail.html
├── discover.html
├── playlists.html
├── profile.html
├── admin.html
├── .htaccess          → enrutado Apache
├── .env               → JWT_SECRET (no versionar)
├── .env.example
├── Dockerfile
└── docker-compose.yml
```

---

## API — endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /api/auth/register | No | Registro de usuario |
| POST | /api/auth/login | No | Login, devuelve JWT |
| GET | /api/auth/me | Bearer | Perfil del usuario activo |
| POST | /api/auth/logout | Bearer | Logout (stateless) |
| GET | /api/songs | No | Canciones públicas (soporta ?page, ?limit, ?genre, ?search) |
| GET | /api/songs?mine=1 | Bearer | Canciones propias del usuario |
| POST | /api/songs | Bearer | Crear canción |
| GET | /api/songs/{id} | Opcional | Detalle de canción |
| PUT | /api/songs/{id} | Bearer | Actualizar canción propia |
| DELETE | /api/songs/{id} | Bearer | Eliminar canción propia |
| GET | /api/favorites | Bearer | Favoritos del usuario |
| POST | /api/favorites/add?id={id} | Bearer | Añadir a favoritos |
| DELETE | /api/favorites/remove?id={id} | Bearer | Quitar de favoritos |
| GET | /api/playlists | Bearer | Playlists del usuario |
| POST | /api/playlists | Bearer | Crear playlist |
| POST | /api/playlists/{id}/songs | Bearer | Añadir canción a playlist |
| GET | /api/musicbrainz?q={query} | No | Búsqueda en MusicBrainz |
| POST | /api/ai/generate-lyrics | Bearer | Generar letra con plantilla local |

---

## Base de datos — 6 tablas

1. **users** — id, username, email, password_hash, bio, avatar_url, role, is_public, created_at, updated_at
2. **songs** — id, user_id, title, description, lyrics, audio_url, cover_image_url, genre, mood, duration_seconds, is_public, created_at, updated_at
3. **playlists** — id, user_id, title, description, cover_image_url, is_public, created_at, updated_at
4. **playlist_songs** — id, playlist_id, song_id, position, added_at
5. **favorites** — id, user_id, song_id, created_at
6. **ai_lyric_ideas** — id, user_id, prompt, generated_lyrics, model, created_at

Diagrama E-R completo en `docs/DIAGRAMA_ER.md`.

---

## Seguridad

- Contraseñas con `password_hash()` bcrypt
- JWT con firma HMAC-SHA256, sin aceptar algoritmo `none`
- `JWT_SECRET` en `.env`, fuera del código fuente
- Prepared statements en todas las consultas SQL
- `htmlspecialchars()` en campos de texto antes de guardar en BD
- Header `Authorization` pasado a PHP vía `E=HTTP_AUTHORIZATION` en `.htaccess`

---

## Autor

Ángel — TFG DAW, DIGITECH 2026
