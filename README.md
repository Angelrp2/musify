# 🎵 Musify — Plataforma de Creación Musical con IA

[![PHP](https://img.shields.io/badge/PHP-8.2-777BB4?logo=php&logoColor=white)](https://php.net)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)](https://sqlite.org)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens)](https://jwt.io)
[![Ollama](https://img.shields.io/badge/IA-Ollama_Llama_3.2-FF6B35)](https://ollama.ai)
[![License](https://img.shields.io/badge/License-MIT-22c55e)](LICENSE)

> **TFG — Desarrollo de Aplicaciones Web (DAW 2) · DIGITECH · 2026**

Musify es una plataforma web que permite crear canciones completas de forma asistida por inteligencia artificial. Los usuarios pueden generar letras con **Ollama (IA local)**, diseñar portadas con **Canvas API** y explorar canciones de la comunidad.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML5 + CSS3 + JavaScript Vanilla (ES6+) |
| Backend | PHP 8.2 — API REST |
| Base de datos | SQLite 3 (6 tablas relacionadas) |
| Autenticación | JWT + bcrypt |
| IA | Ollama (Llama 3.2 3B) — local, sin coste |
| API externa | MusicBrainz (búsqueda de artistas) |
| Portadas | Canvas API (diseñador en navegador) |

---

## Instalación

### Requisitos

- PHP 8.2+ con SQLite3
- Ollama (para IA): https://ollama.ai
- Navegador moderno

### Pasos

```bash
# 1. Clonar
git clone https://github.com/Angelrp2/musify.git && cd musify

# 2. Configurar
cp config/config.example.php config/config.php
# Edita config/config.php con tus valores

# 3. Inicializar base de datos
php database/init.php

# 4. Instalar modelo IA (opcional)
ollama pull llama3.2

# 5. Arrancar servidor
cd public && php -S localhost:8000
```

Abre `http://localhost:8000`

---

## Usuarios de Prueba

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@musify.local | password | admin |
| editor@musify.local | password | editor |
| premium@musify.local | password | premium |
| demo@musify.local | password | user |

## Roles y Permisos

| Permiso | admin | editor | premium | user |
|---------|-------|--------|---------|------|
| Ver canciones públicas | ✅ | ✅ | ✅ | ✅ |
| Crear canción | ✅ | ✅ | ✅ | ✅ |
| Generar con IA | ✅ | ✅ | ✅ | ❌ |
| Editar canciones propias | ✅ | ✅ | ✅ | ✅ |
| Editar canciones de otros | ✅ | ✅ | ❌ | ❌ |
| Eliminar cualquier canción | ✅ | ❌ | ❌ | ❌ |
| Panel de administración | ✅ | ❌ | ❌ | ❌ |
| Descargar canciones | ✅ | ✅ | ✅ | ❌ |

---

## API REST

```
POST   /api/auth/register          Registrar usuario
POST   /api/auth/login             Iniciar sesión
GET    /api/auth/me                Datos del usuario autenticado

GET    /api/songs/list             Listar canciones (paginación + filtros)
POST   /api/songs/create           Crear canción
GET    /api/songs/detail?id=X      Detalle de canción
DELETE /api/songs/delete?id=X      Eliminar canción

GET    /api/playlists/list         Listar playlists
POST   /api/playlists/create       Crear playlist
POST   /api/playlists/add-song     Añadir canción a playlist

GET    /api/favorites/list         Ver favoritos
POST   /api/favorites/add          Añadir favorito
DELETE /api/favorites/remove       Quitar favorito

GET    /api/musicbrainz?q=X        Buscar artistas (MusicBrainz)
```

Autenticación: `Authorization: Bearer <token>`

---

## Características técnicas

- **IA local con Ollama** — letras sin coste ni latencia de red externa
- **JWT + bcrypt** — autenticación segura con tokens firmados HS256
- **Prepared statements** — protección total contra SQL injection
- **Canvas API** — diseñador de portadas de álbum en el navegador
- **Expresiones regulares** — validación en cliente y normalización de búsquedas
- **Debounce en buscador** — sin sobrecarga de peticiones
- **Estados loading/error/success** — feedback visual durante generación IA
- **Sistema de roles** — 4 niveles con middleware de permisos
- **SEO técnico** — sitemap.xml, robots.txt, meta tags, Open Graph
- **Mobile-first** — variables CSS, sistema de diseño escalable

---

## Licencia

MIT © 2026 Ángel Ríos — TFG DAW 2 DIGITECH
