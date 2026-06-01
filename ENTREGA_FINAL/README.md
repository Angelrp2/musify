# 🎵 Musify — Plataforma de Creación Musical con IA

[![PHP](https://img.shields.io/badge/PHP-8.3-777BB4?logo=php&logoColor=white)](https://php.net)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)](https://sqlite.org)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens)](https://jwt.io)
[![Ollama](https://img.shields.io/badge/IA-Ollama_Llama_3.2-FF6B35)](https://ollama.ai)
[![License](https://img.shields.io/badge/License-MIT-22c55e)](LICENSE)

> **TFG — Desarrollo de Aplicaciones Web (DAW 2) · DIGITECH · 2026**

Musify es una plataforma web con diseño editorial que permite crear canciones completas de forma asistida por inteligencia artificial. Los usuarios pueden generar letras con **Ollama (IA local)**, sintetizar música con **Web Audio API**, diseñar portadas con **Canvas API** y explorar artistas con **MusicBrainz**.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML5 + CSS3 + JavaScript Vanilla (ES6+) |
| Diseño | Sistema editorial — Instrument Serif + JetBrains Mono |
| Backend | PHP 8.3 — API REST (sin frameworks) |
| Base de datos | SQLite 3 (6 tablas relacionadas) |
| Autenticación | JWT + bcrypt (OWASP PBKDF2) |
| IA letras | Ollama (Llama 3.2 3B) — local, sin coste |
| IA música | Web Audio API — síntesis por géneros en el navegador |
| Portadas | Canvas API — diseñador en el navegador |
| API externa | MusicBrainz — búsqueda de artistas (CORS nativo) |

---

## Instalación

### Requisitos

- PHP 8.3+ con SQLite3 (incluido en Laragon/XAMPP)
- Ollama (para IA local): https://ollama.ai
- Navegador moderno (Chrome / Firefox / Edge)

### Pasos

```bash
# 1. Clonar
git clone https://github.com/Angelrp2/musify.git && cd musify

# 2. Configurar
cp config/config.example.php config/config.php
# Editar config/config.php si es necesario

# 3. Inicializar base de datos (crea tablas + usuarios de prueba)
php database/init.php

# 4. Instalar modelo IA (opcional — funciona sin él con plantillas locales)
ollama pull llama3.2

# 5. Arrancar servidor
cd public && php -S localhost:8000
```

Abre `http://localhost:8000`

---

## Páginas disponibles

| Ruta | Descripción |
|------|------------|
| `/` | Portada editorial con tracklist demo |
| `/create.html` | AI Studio — generar canciones |
| `/my-songs.html` | Mi colección personal |
| `/song-detail.html` | Reproductor y detalle de canción |
| `/search.html` | Búsqueda con filtros y regex |
| `/playlists.html` | Gestión de playlists |
| `/login.html` | Inicio de sesión dedicado |
| `/dashboard.html` | Panel de usuario |
| `/profile.html` | Perfil de usuario |
| `/settings.html` | Ajustes de cuenta |
| `/generos.html` | Catálogo de géneros disponibles |
| `/changelog.html` | Historial de versiones |
| `/tfg.html` | Información del TFG |
| `/contacto.html` | Formulario de contacto con regex |
| `/aviso-legal.html` | Política de privacidad y RGPD |
| `/credito.html` | Créditos y tecnologías |

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
POST   /api/auth/login             Iniciar sesión (devuelve JWT)
GET    /api/auth/me                Datos del usuario autenticado

GET    /api/songs                  Listar canciones (paginación + filtros)
POST   /api/songs                  Crear canción
GET    /api/songs/:id              Detalle de canción
PUT    /api/songs/:id              Actualizar canción
DELETE /api/songs/:id              Eliminar canción

GET    /api/playlists              Listar playlists
POST   /api/playlists              Crear playlist
POST   /api/playlists/add-song     Añadir canción a playlist

GET    /api/favorites              Ver favoritos
POST   /api/favorites/:songId      Añadir favorito
DELETE /api/favorites/:songId      Quitar favorito

POST   /api/ai/generate-lyrics     Generar letra con Ollama (req. premium+)
GET    /api/musicbrainz?q=X        Buscar artistas (MusicBrainz)
```

Autenticación: `Authorization: Bearer <token>`

---

## Características técnicas

- **Diseño editorial** — sistema de tokens CSS (papel crema, tinta, acento tomate), Instrument Serif + JetBrains Mono
- **IA local con Ollama** — letras sin coste ni latencia externa; fallback a plantillas locales si Ollama no está disponible
- **Web Audio API** — síntesis musical generativa por género con seed reproducible
- **Canvas API** — diseñador de portadas de álbum en el navegador
- **JWT + bcrypt** — autenticación segura (HS256 + PBKDF2-SHA256 en cliente)
- **Prepared statements** — protección contra SQL injection en todos los endpoints
- **Expresiones regulares** — validación en cliente (login, registro, contacto, búsqueda) y normalización de texto
- **Debounce** — búsqueda en tiempo real sin sobrecarga de peticiones
- **Estados loading/error/success** — feedback visual durante generación IA (animación por pasos)
- **Sistema de roles** — 4 niveles (admin/editor/premium/user) con middleware PHP
- **SEO técnico** — sitemap.xml, robots.txt, meta tags, Open Graph, un H1 por página
- **16 páginas** — estructura multipágina completa con navegación coherente

---

## Licencia

MIT © 2026 Ángel Ríos — TFG DAW 2 DIGITECH
