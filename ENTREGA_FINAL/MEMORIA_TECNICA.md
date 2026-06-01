# Musify — Documento de Entrega Final

## Portada

**Musify: Plataforma de Creación Musical con Inteligencia Artificial**

Proyecto Final del Ciclo Formativo de Desarrollo de Aplicaciones Web (DAW 2)

**Autor:** Ángel Ríos  
**Fecha:** Mayo 2026  
**Centro:** DIGITECH  
**Tutor:** —

---

## Índice

1. Introducción
2. Contextualización y viabilidad
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

Musify es una aplicación web que permite a usuarios crear canciones completas de forma asistida por inteligencia artificial. El proyecto surge de la intersección entre la creatividad musical y la tecnología de IA, buscando democratizar la creación musical para personas sin conocimientos técnicos.

La aplicación integra **Ollama con Llama 3.2 3B** como motor de generación de letras mediante IA local, y consume la API pública de **MusicBrainz** para búsqueda de artistas relacionados. El diseño de portadas se realiza mediante **Canvas API** directamente en el navegador.

---

## 2. Contextualización y Viabilidad

### 2.1 Contextualización

Musify se enmarca en el sector de las plataformas de entretenimiento digital y herramientas creativas asistidas por IA. El tipo de empresa que implementaría este proyecto sería una startup tecnológica del sector audiovisual o una empresa de software SaaS, similar a modelos de negocio como Suno AI, Udio o Boomy.

El contexto actual es favorable: la IA generativa ha reducido la barrera de entrada para la creación de contenido, y el mercado de plataformas de música generativa crece a un ritmo del 26% anual según datos de 2025.

### 2.2 Justificación y oportunidad de negocio

La industria de la música generativa con IA tiene un mercado en crecimiento exponencial. Según datos de 2025, el mercado global de IA en música superó los 2.600 millones de dólares. Musify responde a una necesidad real: permitir a personas sin formación musical crear contenido original de calidad.

Diferenciadores clave respecto a la competencia:
- IA completamente local (Ollama) — sin costes de API por generación
- Privacidad total: los datos no salen del servidor del usuario
- Stack ligero y desplegable en cualquier VPS básico

### 2.3 Obligaciones fiscales, laborales y PRL

Para la puesta en marcha de Musify como empresa real sería necesario:

- Alta en el IAE (epígrafe 763 — Servicios prestados a las empresas)
- Alta en la Seguridad Social como autónomo o constitución de SL
- Cumplimiento del Estatuto de los Trabajadores si hay empleados
- Evaluación de riesgos laborales conforme a la Ley 31/1995 (PRL)
- Cumplimiento del RGPD (Reglamento General de Protección de Datos) para el tratamiento de datos de usuarios
- Política de cookies y aviso legal en la web

### 2.4 Viabilidad económica y presupuesto

**Costes de desarrollo estimados:**

| Concepto | Coste |
|----------|-------|
| Horas de desarrollo (300h × 25€/h) | 7.500€ |
| Servidor VPS (12 meses) | 240€ |
| Dominio y SSL | 25€ |
| Ollama (IA local) | 0€ |
| **TOTAL primer año** | **7.765€** |

**Modelo de ingresos (freemium):**

| Plan | Precio | Funciones |
|------|--------|-----------|
| Free | 0€/mes | Explorar, 3 canciones/mes |
| Premium | 9,99€/mes | Generación ilimitada, descarga |
| Pro | 24,99€/mes | Descarga + uso comercial |

Break-even estimado: **777 usuarios Premium activos**

---

## 3. Planificación y Metodología

El proyecto se desarrolló siguiendo una metodología ágil adaptada al ciclo formativo, dividida en fases semanales:

**Fase 1 — Identificación (semana 1-2):** Análisis de necesidades, benchmarking de plataformas similares, definición de requisitos funcionales y no funcionales.

**Fase 2 — Diseño (semana 3-4):** Diseño de la arquitectura, modelo entidad-relación, wireframes de la interfaz y flujos de usuario.

**Fase 3 — Ejecución (semana 5-10):** Implementación del backend PHP, frontend JavaScript, integración de Ollama y MusicBrainz.

**Fase 4 — Pruebas (semana 11-12):** Validación de funcionalidades, pruebas de seguridad, corrección de errores y ajustes de UX.

### 3.2 Identificación de riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|-----------|
| Ollama no disponible en servidor de producción | Media | Alto | Fallback a generación offline simple |
| Pérdida de datos SQLite | Baja | Crítico | Backup diario automatizado |
| Vulnerabilidad de seguridad JWT | Media | Alto | Auditoría de código, expiración corta |
| Problemas de rendimiento con muchos usuarios | Media | Medio | Caché de resultados, paginación |

### 3.3 Protocolo de incidencias

1. **Recopilación:** El usuario reporta el error mediante el formulario de contacto o la consola del servidor
2. **Análisis:** Se revisan los logs en `/logs/` y se reproduce el error en entorno local
3. **Solución:** Se aplica el fix en rama separada, se prueba y se hace merge
4. **Registro:** Se documenta en el CHANGELOG del repositorio

---

## 4. Tecnologías Empleadas

**Frontend:** HTML5, CSS3, JavaScript Vanilla (ES6+). Se utilizó un enfoque mobile-first con variables CSS para sistema de diseño escalable. Canvas API para el diseñador de portadas.

**Backend:** PHP 8.2 con arquitectura REST. Separación clara entre rutas, controladores y servicios.

**Base de Datos:** SQLite para almacenamiento relacional. Esquema con 6 tablas relacionadas: users, songs, playlists, playlist_songs, favorites, generations.

**Inteligencia Artificial:** Ollama (Llama 3.2 3B) — ejecutado localmente, sin costes por petición.

**APIs Externas:** MusicBrainz (búsqueda de artistas — API pública gratuita).

**Seguridad:** JWT para autenticación, bcrypt para contraseñas, prepared statements contra SQLi.

**Control de Versiones:** Git + GitHub.

---

## 5. Diseño y Arquitectura

La aplicación sigue una arquitectura cliente-servidor:

El **frontend** es una SPA (Single Page Application) que se ejecuta en el navegador. Comunica con el backend mediante peticiones HTTP usando la Fetch API.

El **backend** es un servidor PHP que expone una API REST con endpoints para autenticación, gestión de canciones, y consumo de APIs externas.

La **base de datos** SQLite almacena información de usuarios (con contraseñas hasheadas con bcrypt), canciones generadas, playlists, favoritos y metadatos de generaciones.

**Flujo de comunicación:**
```
Usuario → Frontend (HTML/CSS/JS)
        → Fetch API → Backend PHP
                    → SQLite (datos)
                    → Ollama (generación IA)
                    → MusicBrainz (búsqueda artistas)
        ← JSON Response
        ← Actualización de UI
```

**Sistema de roles:**

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

## 6. Funcionalidades Implementadas

**Autenticación:** Registro e inicio de sesión con tokens JWT. Contraseñas hasheadas con bcrypt. Middleware de verificación en todos los endpoints protegidos.

**Generación de Canciones:** Flujo progresivo con feedback visual (estados loading/success/error). Generación de letras mediante Ollama + Llama 3.2 3B. Diseño de portada con Canvas API.

**Gestión de Canciones:** CRUD completo. Visualización, reproducción, descarga y eliminación.

**Búsqueda de Artistas:** Integración con MusicBrainz. Búsqueda con normalización de texto y expresiones regulares.

**Reproductor de Audio:** Reproducción con controles de volumen y barra de progreso.

**Buscador y Filtros:** Búsqueda en tiempo real con debounce, filtro por género, ordenación múltiple, paginación.

**Sistema de Roles:** 4 roles diferenciados (admin/editor/premium/user) con middleware de permisos.

**Validaciones:** Expresiones regulares en cliente para UX, prepared statements en servidor para seguridad.

---

## 7. Manual de Usuario

### Acceso a la aplicación

Abre `http://localhost:8000` en tu navegador.

### Registro

1. Clic en "Registrarse"
2. Introduce email y contraseña (mínimo 8 caracteres, una mayúscula y un número)
3. Clic en "Crear cuenta"

### Iniciar sesión

1. Clic en "Iniciar sesión"
2. Email y contraseña
3. Clic en "Iniciar sesión"

### Crear una canción

1. Clic en "Crear canción"
2. Describe la canción (ej: *"rock melancólico sobre la nostalgia de los 90"*)
3. Selecciona género y mood
4. Opcionalmente busca artistas relacionados en MusicBrainz
5. Clic en "Generar canción" — espera el proceso de IA (5-30 segundos)
6. Personaliza la portada en el diseñador Canvas

### Explorar canciones

- Usa el buscador para encontrar canciones por título o artista
- Filtra por género con el selector
- Ordena por fecha, título o popularidad
- Navega entre páginas con la paginación

### Usuarios de prueba

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@musify.local | password | admin |
| editor@musify.local | password | editor |
| premium@musify.local | password | premium |
| demo@musify.local | password | user |

---

## 8. Documentación Técnica

### Endpoints de la API

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/register` | ❌ | Registrar usuario |
| POST | `/api/auth/login` | ❌ | Iniciar sesión |
| GET | `/api/auth/me` | ✅ | Datos del usuario |
| GET | `/api/songs/list` | ✅ | Listar canciones |
| POST | `/api/songs/create` | ✅ | Crear canción |
| GET | `/api/songs/detail` | ✅ | Detalle de canción |
| PUT | `/api/songs/update` | ✅ | Actualizar canción |
| DELETE | `/api/songs/delete` | ✅ | Eliminar canción |
| GET | `/api/playlists/list` | ✅ | Listar playlists |
| POST | `/api/playlists/create` | ✅ | Crear playlist |
| POST | `/api/playlists/add-song` | ✅ | Añadir canción |
| GET | `/api/favorites/list` | ✅ | Ver favoritos |
| POST | `/api/favorites/add` | ✅ | Añadir favorito |
| DELETE | `/api/favorites/remove` | ✅ | Quitar favorito |
| GET | `/api/musicbrainz` | ❌ | Buscar artistas |

### Estructura de la base de datos

```sql
users        (id, username, email, password, role, avatar_url, created_at)
songs        (id, user_id, title, description, lyrics, genre, mood, audio_url, image_url, is_public, plays, created_at)
playlists    (id, user_id, title, description, is_public, created_at)
playlist_songs (id, playlist_id, song_id, position, added_at)
favorites    (id, user_id, song_id, created_at)
generations  (id, user_id, song_id, prompt, model_used, status, error_message, created_at)
```

### Seguridad implementada

- **Contraseñas:** bcrypt con coste 10 (PHP `password_hash`)
- **Tokens JWT:** firmados con HS256, expiración 7 días
- **SQL Injection:** prepared statements en todas las consultas
- **XSS:** sanitización con `htmlspecialchars` en outputs
- **CORS:** headers restrictivos, solo orígenes permitidos
- **Headers de seguridad:** X-Frame-Options, X-XSS-Protection, X-Content-Type-Options

---

## 9. Pruebas Realizadas

| Escenario | Resultado |
|-----------|-----------|
| Registro con email duplicado | ✅ Error controlado |
| Login con credenciales incorrectas | ✅ Error 401 con mensaje |
| Acceso a endpoint protegido sin token | ✅ Error 401 |
| Acceso con rol insuficiente | ✅ Error 403 |
| Creación de canción con datos válidos | ✅ Canción creada |
| Generación IA con Ollama offline | ✅ Error manejado con mensaje |
| Búsqueda en MusicBrainz | ✅ Resultados mostrados |
| Paginación con filtros activos | ✅ Resultados correctos |
| Formulario con datos inválidos (regex) | ✅ Feedback visual rojo |
| Vista en móvil 375px | ✅ Sin scroll horizontal |

---

## 10. Conclusiones

Musify demuestra cómo la inteligencia artificial puede integrarse de forma práctica en una aplicación web construida con tecnologías fundamentales (PHP + SQL + JS Vanilla), sin depender de frameworks ni servicios de pago.

El proyecto cumple con los requisitos del ciclo formativo:
- Arquitectura clara con separación frontend/backend
- API REST completa con autenticación JWT
- Base de datos relacional con 6 tablas y relaciones
- Sistema de roles y permisos implementado
- Integración de IA local (Ollama) y API externa (MusicBrainz)
- Validaciones con expresiones regulares en cliente y servidor
- Diseño responsive mobile-first con sistema de variables CSS
- SEO técnico: sitemap.xml, robots.txt, meta tags, jerarquía de encabezados

La aplicación está lista para demo funcional y puede extenderse con funcionalidades como streaming de audio, colaboración entre usuarios o exportación a plataformas de distribución musical.

---

## 11. Anexos

### Diagrama E-R

Ver `docs/DIAGRAMA_ER.md` para el código de dbdiagram.io.

### Schema SQL

Ver `database/init.sql` para el script completo de creación de tablas.

### Manual de identidad de marca

Ver `docs/identidad-marca.md` para paleta de colores, tipografía y guía de uso del logo.

### Capturas de pantalla

Ver `docs/capturas/` para capturas de las principales pantallas.

### Código fuente

Disponible en: https://github.com/Angelrp2/musify

---

*Documento de entrega — Musify TFG DAW 2 — DIGITECH 2026*
