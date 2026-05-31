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

La aplicación integra múltiples servicios de IA (Gemini Pro, Google Text-to-Speech, Google Lyria) para generar de forma progresiva: letra, música, voz y portada visual. Además, consume la API pública de MusicBrainz para proporcionar información sobre artistas relacionados.

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

Base de Datos: SQLite para almacenamiento relacional. Se diseñó un esquema con 3 tablas principales: usuarios, canciones, y generaciones.

APIs Externas: Gemini Pro, Google Text-to-Speech, Google Lyria, MusicBrainz.

Control de Versiones: Git para versionado del código.

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

Generación de Canciones: Flujo progresivo que genera letra, música, voz y portada.

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

Descargar Canción:

En los detalles de la canción, haz clic en "Descargar".

Se descargará un archivo MP3.

Eliminar Canción:

En los detalles de la canción, haz clic en "Eliminar".

Confirma la eliminación.

La canción se eliminará de tu biblioteca.

---

## 8. Documentación Técnica

Endpoints Disponibles:

POST /api/auth/register: Registrar nuevo usuario.

POST /api/auth/login: Iniciar sesión.

GET /api/auth/me: Obtener datos del usuario autenticado.

POST /api/songs/create: Crear nueva canción.

GET /api/songs/list: Listar canciones del usuario.

GET /api/songs/detail: Obtener detalles de una canción.

DELETE /api/songs/delete: Eliminar una canción.

GET /api/musicbrainz: Buscar artistas.

Estructura de Base de Datos:

Tabla users: id, email, password, role, created_at.

Tabla songs: id, user_id, title, description, lyrics, audio_url, image_url, created_at.

Tabla generations: id, user_id, prompt, status, created_at.

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

Elemento diferenciador (animaciones, UX mejorada).

La aplicación está lista para ser utilizada por usuarios reales y puede ser extendida en el futuro con funcionalidades adicionales.

---

## 11. Anexos

Capturas de Pantalla: Incluir capturas de las principales pantallas de la aplicación.

Diagrama E-R: Incluir diagrama de la base de datos.

Script SQL: Incluir script de creación de tablas.

Código Fuente: Disponible en el repositorio Git.

---

Fin del Documento
