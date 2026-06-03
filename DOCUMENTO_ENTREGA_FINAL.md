# Musify - Documento de Entrega Final

## Portada

Musify: Generador de Canciones con Inteligencia Artificial

Proyecto Final del Ciclo Formativo de Desarrollo de Aplicaciones Web

Autor: Ángel

Fecha: 27 de Mayo de 2026

Centro: DIGITECH

---

## Índice

1. Introducción
2. Objetivos del Proyecto
3. Planificación y Metodología
4. Tecnologías Empleadas
5. Diseño y Arquitectura
6. Funcionalidades Implementadas
7. Manual de Usuario
8. Documentación Técnica
9. Pruebas Realizadas
10. Conclusiones
11. Anexos

---

## 1. Introducción

Musify es una aplicación web que permite a usuarios crear canciones completas de forma automática utilizando inteligencia artificial. El proyecto surge de la intersección entre la creatividad musical y la tecnología de IA, buscando democratizar la creación musical para personas sin conocimientos técnicos.

La aplicación genera la letra de una canción a partir de una descripción del usuario, utilizando una plantilla estructurada en estrofas y estribillo. La lectura de la letra se realiza mediante la Web Speech API del navegador. Además, consume la API pública de MusicBrainz para búsqueda de artistas y canciones reales. El despliegue se realiza mediante Docker, lo que garantiza reproducibilidad del entorno sin dependencias de configuración local.

---

## 2. Objetivos del Proyecto

Objetivo General: Crear una plataforma web funcional que demuestre la aplicación práctica de inteligencia artificial en la creación musical.

Objetivos Específicos:

Permitir a usuarios no expertos crear canciones sin conocimientos musicales previos.

Implementar un sistema de autenticación seguro con gestión de sesiones.

Integrar múltiples APIs de IA de forma coherente en un flujo de trabajo.

Consumir una API externa pública (MusicBrainz) para enriquecer la experiencia.

Implementar validaciones en cliente y servidor para garantizar integridad de datos.

Demostrar buenas prácticas en desarrollo web: modularidad, seguridad, y escalabilidad.

---

## 3. Planificación y Metodología

El proyecto se desarrolló siguiendo una metodología ágil adaptada al ciclo formativo. Se dividió en fases:

Fase 1 (Identificación): Análisis de necesidades y definición de requisitos.

Fase 2 (Diseño): Diseño de la arquitectura, base de datos y flujos de usuario.

Fase 3 (Ejecución): Implementación de frontend, backend, y integración de APIs.

Fase 4 (Pruebas): Validación de funcionalidades y corrección de errores.

Cada fase incluyó documentación de decisiones tomadas y justificación de tecnologías seleccionadas.

---

## 4. Tecnologías Empleadas

Frontend: HTML5, CSS3, JavaScript vanilla. Se utilizó un enfoque mobile-first para garantizar responsividad en todos los dispositivos.

Backend: PHP 8.2 con arquitectura REST. Se implementó separación clara entre rutas, controladores, modelos y servicios.

Base de Datos: SQLite para almacenamiento relacional. Se diseñó un esquema con 6 tablas: users, songs, playlists, playlist_songs, favorites, ai_lyric_ideas.

API externa: MusicBrainz para búsqueda de artistas y grabaciones.

Generación de letra: plantilla local estructurada (estrofas + estribillo), sin dependencias de API externas.

Lectura de letra: Web Speech API del navegador (síntesis de voz nativa, sin instalación adicional).

Despliegue: Docker con imagen php:8.2-apache, lo que elimina la dependencia de configuración local y garantiza reproducibilidad.

Control de versiones: Git.

---

## 5. Diseño y Arquitectura

La aplicación sigue una arquitectura cliente-servidor clara:

El frontend es una aplicación web que se ejecuta en el navegador del usuario. Comunica con el backend mediante peticiones HTTP utilizando fetch API.

El backend es un servidor PHP que expone una API REST con endpoints para autenticación, gestión de canciones, y consumo de APIs externas.

La base de datos almacena información de usuarios (con contraseñas hasheadas), canciones generadas, y metadatos de generaciones.

Flujo de Comunicación:

Usuario interactúa con interfaz web.

Frontend envía petición HTTP al backend.

Backend procesa petición, interactúa con BD y APIs externas.

Backend devuelve respuesta JSON.

Frontend actualiza interfaz con datos recibidos.

---

## 6. Funcionalidades Implementadas

Autenticación: Registro e inicio de sesión con tokens JWT.

Generación de letra: el usuario describe una idea, elige género y ánimo, y la aplicación genera una letra estructurada con estrofas y estribillo. La lectura con voz sintetizada utiliza la Web Speech API del navegador.

Gestión de Canciones: Visualización, reproducción, descarga y eliminación.

Búsqueda de Artistas: Integración con MusicBrainz.

Reproductor de Audio: Reproducción con controles de volumen y progreso.

Validaciones: En cliente para UX, en servidor para seguridad.

Manejo de Errores: Mensajes claros al usuario en caso de fallos.

---

## 7. Manual de Usuario

Acceso a la Aplicación:

Abre tu navegador y ve a http://localhost:8000

Verás la página de inicio con opciones para iniciar sesión o registrarse.

Registro:

Haz clic en "Registrarse".

Ingresa tu email y contraseña (mínimo 8 caracteres).

Confirma tu contraseña.

Haz clic en "Crear cuenta".

Iniciar Sesión:

Haz clic en "Iniciar sesión".

Ingresa tu email y contraseña.

Haz clic en "Iniciar sesión".

Crear una Canción:

Haz clic en "Crear canción".

Describe la canción que quieres (ej: "rock melancólico sobre la nostalgia").

Opcionalmente, busca artistas relacionados.

Haz clic en "Generar canción".

Espera a que se complete la generación.

Ver Mis Canciones:

Haz clic en "Mis canciones".

Verás una tabla con todas tus canciones.

Haz clic en una canción para ver detalles.

Reproducir Canción:

Abre los detalles de una canción.

Usa el reproductor para escuchar.

Ajusta volumen y progreso según necesites.

Leer la letra con voz:

En los detalles de la canción, pulsa el botón de reproducción.

El navegador lee la letra en voz alta mediante Web Speech API.

Eliminar Canción:

En los detalles de la canción, haz clic en "Eliminar".

Confirma la eliminación.

La canción se eliminará de tu biblioteca.

---

## 8. Documentación Técnica

Endpoints principales:

POST /api/auth/register — Registro de usuario.

POST /api/auth/login — Login, devuelve token JWT.

GET /api/auth/me — Perfil del usuario autenticado.

GET /api/songs — Canciones públicas (soporta ?page, ?limit, ?genre, ?search).

GET /api/songs?mine=1 — Canciones propias del usuario autenticado.

POST /api/songs — Crear canción (requiere JWT).

GET /api/songs/{id} — Detalle de canción.

PUT /api/songs/{id} — Actualizar canción propia.

DELETE /api/songs/{id} — Eliminar canción propia.

GET /api/favorites — Favoritos del usuario.

POST /api/favorites/add?id={id} — Añadir a favoritos.

GET /api/playlists — Playlists del usuario.

POST /api/playlists — Crear playlist.

POST /api/playlists/{id}/songs — Añadir canción a playlist.

GET /api/musicbrainz?q={query} — Búsqueda en MusicBrainz.

POST /api/ai/generate-lyrics — Generar letra con plantilla local.

Estructura de base de datos (6 tablas):

Tabla users: id, username, email, password_hash, bio, avatar_url, role, is_public, created_at, updated_at.

Tabla songs: id, user_id, title, description, lyrics, audio_url, cover_image_url, genre, mood, duration_seconds, is_public, created_at, updated_at.

Tabla playlists: id, user_id, title, description, cover_image_url, is_public, created_at, updated_at.

Tabla playlist_songs: id, playlist_id, song_id, position, added_at. Relación N:M entre playlists y canciones.

Tabla favorites: id, user_id, song_id, created_at. Relación N:M entre usuarios y canciones.

Tabla ai_lyric_ideas: id, user_id, prompt, generated_lyrics, model, created_at. Historial de generaciones de letra.

Diagrama E-R completo disponible en docs/DIAGRAMA_ER.md.

Despliegue con Docker:

El proyecto incluye Dockerfile y docker-compose.yml. El contenedor usa php:8.2-apache con pdo_sqlite y mod_rewrite habilitados. Para arrancar: docker compose up --build seguido de docker compose exec web php database/init.php.

Seguridad Implementada:

Contraseñas hasheadas con BCRYPT.

Tokens JWT para autenticación.

Prepared statements para prevenir inyecciones SQL.

Validación y sanitización de datos de entrada.

---

## 9. Pruebas Realizadas

Se realizaron pruebas en diferentes escenarios:

Registro e Inicio de Sesión: Verificar que usuarios pueden crear cuentas y acceder.

Generación de Canciones: Verificar que el flujo completo funciona correctamente.

Validaciones: Verificar que se rechazan datos inválidos.

Errores: Verificar que se manejan correctamente fallos de APIs externas.

Responsividad: Verificar que la interfaz funciona en móvil, tablet y desktop.

Seguridad: Verificar que no hay vulnerabilidades comunes.

---

## 10. Conclusiones

Musify demuestra cómo la inteligencia artificial puede ser utilizada de forma creativa y accesible. El proyecto cumple con todos los requisitos mínimos del ciclo formativo:

Arquitectura clara separando frontend y backend.

Frontend responsive que funciona en todos los dispositivos.

Backend funcional con API REST.

Base de datos relacional con múltiples tablas.

Seguridad implementada (autenticación, validaciones, prepared statements).

Documentación completa.

Elemento diferenciador: generación de letra con IA + despliegue reproducible con Docker.

La aplicación está lista para ser utilizada por usuarios reales y puede ser extendida en el futuro con funcionalidades adicionales.

---

## 11. Anexos

Capturas de Pantalla: Incluir capturas de las principales pantallas de la aplicación.

Diagrama E-R: Incluir diagrama de la base de datos.

Script SQL: Incluir script de creación de tablas.

Código Fuente: Disponible en el repositorio Git.

---

Fin del Documento
