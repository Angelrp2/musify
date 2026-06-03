# Musify — Documento de Entrega Final

**Proyecto:** Musify — Plataforma de creación musical asistida por IA

**Ciclo Formativo:** Desarrollo de Aplicaciones Web (DAW)

**Autor:** Ángel

**Centro:** DIGITECH

**Fecha de entrega:** 4 de junio de 2026

---

## Índice

1. Introducción y contextualización
2. Objetivos del proyecto
3. Identificación de necesidades y oportunidad
4. Estudio de viabilidad técnica y económica
5. Planificación temporal
6. Tecnologías empleadas
7. Diseño y arquitectura
8. Roles y permisos
9. Funcionalidades implementadas
10. Seguridad y protección de datos
11. Manual de instalación
12. Manual de usuario
13. Documentación técnica de la API
14. Pruebas realizadas
15. Gestión de riesgos
16. Conclusiones
17. Anexos

---

## 1. Introducción y contextualización

Musify es una aplicación web de creación musical. El usuario describe una idea, elige género y ánimo, y la aplicación genera la letra de una canción. La letra se lee en voz alta mediante la Web Speech API del navegador. El usuario puede guardar canciones, organizarlas en playlists, marcarlas como favoritas y buscar artistas reales en MusicBrainz.

El proyecto surge en un contexto en el que la inteligencia artificial está transformando el sector creativo. Herramientas como Suno o Udio permiten generar música completa a partir de una descripción, pero requieren servicios cloud de pago. Musify propone una alternativa educativa y técnica: un sistema propio, desplegado con Docker, que demuestra cómo integrar IA en un flujo web real sin depender de servicios externos de pago.

El sector de la música digital mueve más de 28.000 millones de dólares anuales a nivel global. La creación asistida por IA es una de sus áreas de mayor crecimiento. Musify no compite con esas herramientas; demuestra que un desarrollador junior puede construir algo funcionalmente coherente con tecnologías estándar.

---

## 2. Objetivos del proyecto

**Objetivo general:** Desarrollar una plataforma web funcional que demuestre la integración de IA en un flujo de creación musical, con autenticación segura, API REST documentada y despliegue reproducible con Docker.

**Objetivos específicos:**

- Permitir a usuarios crear canciones (letra) sin conocimientos musicales previos.
- Implementar autenticación segura con JWT y contraseñas bcrypt.
- Diseñar una base de datos relacional con 6 tablas y relaciones N:M.
- Consumir la API pública de MusicBrainz para búsqueda de artistas.
- Aplicar buenas prácticas de seguridad: prepared statements, sanitización XSS, CORS.
- Desplegar el proyecto con Docker para garantizar reproducibilidad del entorno.
- Documentar el proyecto de forma coherente con el código real implementado.

---

## 3. Identificación de necesidades y oportunidad

**Necesidad identificada:** Los usuarios sin formación musical no tienen herramientas accesibles para crear contenido musical propio. Las alternativas existentes son caras (Suno, Udio) o requieren conocimientos técnicos (DAW, MIDI).

**Oportunidad:** Una aplicación web gratuita, sin instalación, que genera una letra estructurada a partir de una idea en lenguaje natural, con reproducción por voz del navegador.

**Usuarios objetivo:**
- Estudiantes y jóvenes creativos.
- Usuarios que quieren explorar la IA generativa sin coste.
- Docentes que enseñan creación digital.

**Modelo de negocio posible (hipotético):** freemium. La versión gratuita genera letra con plantilla local. Una versión premium conectaría con APIs de generación de audio reales (Suno API, Google Lyria). No está implementado en este TFG — se menciona como oportunidad de escalado.

**Obligaciones legales, fiscales y laborales:**
Si este proyecto se comercializara, el desarrollador debería darse de alta como autónomo o constituir una SL. Fiscalmente estaría sujeto al IAE (Impuesto de Actividades Económicas), IRPF trimestral y IVA en caso de venta de servicios. Laboralmente, alta en la Seguridad Social como autónomo. Al tratar datos personales (emails, nombres de usuario), la actividad estaría sujeta al Reglamento General de Protección de Datos (RGPD/GDPR).

---

## 4. Estudio de viabilidad técnica y económica

**Viabilidad técnica:**

PHP 8.2 es estable, ampliamente documentado y disponible en cualquier servidor Apache. SQLite elimina la necesidad de un servidor de base de datos separado, lo que simplifica el despliegue. Docker garantiza que el entorno es idéntico en cualquier máquina. El proyecto no requiere infraestructura en la nube ni dependencias externas de pago.

| Tecnología | Disponibilidad | Coste | Justificación |
|---|---|---|---|
| PHP 8.2 | Alta | Gratis | Estándar del sector para backends web |
| SQLite | Alta | Gratis | Sin servidor, portabilidad total, suficiente para el volumen del TFG |
| Docker | Alta | Gratis | Reproducibilidad del entorno, estándar en la industria |
| MusicBrainz API | Alta | Gratis | API pública sin autenticación ni límites estrictos |
| Web Speech API | Alta | Gratis | Nativa en navegadores modernos |

**Viabilidad económica:**

| Concepto | Coste |
|---|---|
| Hardware de desarrollo (ya disponible) | 0 € |
| Software (todo open source) | 0 € |
| APIs externas (MusicBrainz, Web Speech API) | 0 € |
| Hosting local con Docker | 0 € |
| Tiempo de desarrollo estimado: ~120 horas | 0 € (proyecto académico) |
| **Total** | **0 €** |

En producción real, el coste de hosting oscilaría entre 5 y 20 €/mes en un VPS con Docker.

---

## 5. Planificación temporal

El proyecto se desarrolló entre finales de mayo y principios de junio de 2026, siguiendo una metodología ágil con entregas incrementales.

| Semana | Fechas | Fase | Tareas principales |
|---|---|---|---|
| 1 | 27-28 mayo | Identificación y Diseño | Análisis de requisitos, diseño de BD, diseño de API, wireframes |
| 2 | 29-30 mayo | Ejecución (backend) | Config, Database, JWT, auth endpoints, CRUD canciones |
| 3 | 31 mayo - 1 jun | Ejecución (frontend) | HTML, CSS, JS vanilla, auth.js, app.js, player.js |
| 4 | 2-3 jun | Ejecución (integración) | MusicBrainz, playlists, favoritos, generate-lyrics, Docker |
| 5 | 4 jun | Pruebas y cierre | Corrección de bugs, documentación, Git commits, entrega |

**Hitos principales:**

- Base de datos inicializada con 6 tablas y 4 usuarios seed: 29/05/2026
- API REST completa (auth + CRUD): 01/06/2026
- Frontend conectado a API real: 02/06/2026
- Docker funcional: 03/06/2026
- Entrega: 04/06/2026

---

## 6. Tecnologías empleadas

**Hardware utilizado:**
- Ordenador de desarrollo: Windows 11, procesador x64, 16 GB RAM (recomendado para Docker)
- Navegador: Chrome/Edge para pruebas

**Software:**

| Tecnología | Versión | Uso |
|---|---|---|
| PHP | 8.2 | Backend, API REST |
| SQLite | 3.x | Base de datos relacional |
| Apache | 2.4 | Servidor web (en Docker) |
| Docker | 24+ | Despliegue reproducible |
| HTML5 | — | Estructura del frontend |
| CSS3 | — | Diseño y responsividad |
| JavaScript | ES2020 | Lógica del frontend |
| JWT (HMAC-SHA256) | — | Autenticación stateless |
| bcrypt | — | Hash de contraseñas |
| MusicBrainz API | v2 | Búsqueda de artistas |
| Web Speech API | — | Lectura de letra con voz |
| Git | 2.x | Control de versiones |

---

## 7. Diseño y arquitectura

**Arquitectura cliente-servidor:**

```
[Navegador]
    |
    | HTTP/JSON (fetch API)
    |
[Apache + PHP 8.2] ← .htaccess (mod_rewrite)
    |
    ├── /api/auth/*      → Autenticación JWT
    ├── /api/songs/*     → CRUD canciones
    ├── /api/playlists/* → Gestión playlists
    ├── /api/favorites/* → Gestión favoritos
    ├── /api/ai/*        → Generación de letra
    └── /api/musicbrainz → Proxy MusicBrainz
    |
[SQLite — musify.db]
```

**Flujo de usuario principal:**

```
Inicio → Registro/Login → Estudio (crea canción)
    → Generación de letra (API local)
    → Guardado en BD
    → Song Detail (reproduce letra con voz)
    → Mi Colección (gestiona canciones)
    → Discover (busca en MusicBrainz)
    → Playlists / Favoritos
```

**Enrutado:** el archivo `.htaccess` mapea URLs limpias a archivos PHP. No hay router central — cada endpoint es un archivo PHP independiente con sus propios `require_once`.

---

## 8. Roles y permisos

El sistema tiene 4 roles. El rol se asigna en el registro y se incluye en el payload del JWT.

| Rol | Registrar | Crear canciones | Editar canciones ajenas | Eliminar canciones ajenas | Acceso admin |
|---|---|---|---|---|---|
| **admin** | — | Sí | Sí | Sí | Sí |
| **editor** | — | Sí | Sí | No | No |
| **user** | Sí (rol por defecto) | Sí | No | No | No |
| **guest** | — | No | No | No | No |

**Usuarios de prueba** (contraseña: `Password123`):

| Email | Rol |
|---|---|
| admin@musify.local | admin |
| editor@musify.local | editor |
| demo@musify.local | user |
| guest@musify.local | guest |

**Protección server-side:** los endpoints de edición y eliminación verifican que `payload['id'] === song['user_id']` o que `payload['role'] === 'admin'`. La verificación de rol admin en el panel de administración es solo client-side (redirige si el rol en localStorage no es admin) — suficiente para un TFG, pero en producción debería verificarse server-side en cada endpoint.

---

## 9. Funcionalidades implementadas

| Funcionalidad | Estado | Descripción |
|---|---|---|
| Registro e inicio de sesión | Funcional | JWT, bcrypt, modal en todas las páginas |
| Crear canción con letra | Funcional | Genera letra con plantilla local antes de guardar |
| Reproducir letra con voz | Funcional | Web Speech API lee línea a línea con sincronización |
| Mi colección | Funcional | Lista canciones propias con paginación y búsqueda |
| Detalle de canción | Funcional | Metadatos, letra formateada, reproductor |
| Discover — canciones públicas | Funcional | Grid con filtro por género (enviado a la API) |
| Discover — MusicBrainz | Funcional | Búsqueda en tiempo real, resultados en tarjetas |
| Playlists | Funcional | Crear, listar, añadir canciones |
| Favoritos | Funcional | Añadir/quitar, conteo en perfil |
| Perfil | Funcional | Datos del usuario, rol, estadísticas |
| Panel admin | Funcional | Lista todas las canciones, eliminar cualquiera |
| Paginación | Funcional | Backend soporta `?page=N&limit=N`, frontend lo consume |
| Filtros de género | Funcional | Enviados a la API, no solo client-side |

---

## 10. Seguridad y protección de datos

**Medidas de seguridad implementadas:**

| Medida | Implementación |
|---|---|
| Hash de contraseñas | `password_hash()` con `PASSWORD_BCRYPT`, coste 10 |
| Autenticación | JWT firmado con HMAC-SHA256; `hash_equals()` en verificación |
| Inyección SQL | Prepared statements con PDO en los 16 archivos de endpoints |
| XSS server-side | `htmlspecialchars(ENT_QUOTES, UTF-8)` en campos de texto antes de guardar |
| Secret seguro | `JWT_SECRET` en archivo `.env`, fuera del código fuente y del repositorio |
| CORS | Solo orígenes en `ALLOWED_ORIGINS` reciben headers CORS |
| Authorization header | `.htaccess` pasa el header con `E=HTTP_AUTHORIZATION` para evitar que Apache lo elimine |

**Protección de datos personales (RGPD):**

El sistema almacena datos personales: nombre de usuario y correo electrónico. En el contexto de este TFG, los datos se usan exclusivamente con fines educativos y no se comparten con terceros. Si el proyecto se desplegara en producción, sería necesario:

- Incluir un aviso de privacidad accesible desde la aplicación.
- Obtener consentimiento explícito del usuario antes del registro.
- Garantizar el derecho de supresión de datos (eliminación de cuenta y todos sus datos).
- Registrar la actividad de tratamiento ante la Agencia Española de Protección de Datos (AEPD).

La página de registro incluye un checkbox de aceptación de condiciones de uso como primer paso hacia el cumplimiento.

---

## 11. Manual de instalación

**Requisitos:** Docker Desktop instalado y en ejecución.

**Pasos:**

```bash
# 1. Clonar el repositorio
git clone <repo>
cd musify

# 2. Crear el archivo de configuración de entorno
cp .env.example .env
# Editar .env y cambiar JWT_SECRET por un valor seguro

# 3. Construir y arrancar el contenedor
docker compose up --build

# 4. Inicializar la base de datos (en otra terminal)
docker compose exec web php database/init.php

# 5. Acceder a la aplicación
# Abrir http://localhost:8000 en el navegador
```

**Para detener:**
```bash
docker compose down
```

---

## 12. Manual de usuario

**Registro:**
1. Abrir `http://localhost:8000`
2. Clic en "Entrar" (esquina superior derecha)
3. Seleccionar "Crear cuenta"
4. Rellenar usuario, email y contraseña (mín. 8 caracteres, mayúsculas y número)
5. Aceptar las condiciones y confirmar

**Crear una canción:**
1. Clic en "Estudio" en el menú
2. Escribir la idea de la canción en el campo de texto (mín. 8 caracteres)
3. Opcionalmente, añadir un título (si se deja vacío se genera de las primeras palabras)
4. Seleccionar el género musical
5. Seleccionar el ánimo
6. Clic en "Componer"
7. La app genera la letra y guarda la canción automáticamente

**Reproducir la letra con voz:**
1. Abrir una canción desde "Mi colección"
2. Pulsar el botón de reproducción
3. El navegador lee la letra línea a línea con la voz del sistema

**Buscar artistas:**
1. Ir a "Descubrir"
2. Escribir un artista o canción en el buscador
3. Los resultados provienen de MusicBrainz en tiempo real

**Gestionar playlists:**
1. Ir a "Playlists"
2. Clic en "Nueva playlist", añadir título
3. Desde el detalle de una canción, añadirla a una playlist existente

---

## 13. Documentación técnica de la API

**Base URL:** `http://localhost:8000`

**Autenticación:** Bearer token en header `Authorization: Bearer <token>`

**Formato de respuesta:**
```json
{
  "success": true,
  "message": "Éxito",
  "data": { ... },
  "timestamp": "2026-06-04 10:00:00"
}
```

**Endpoints:**

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | /api/auth/register | No | Registro. Body: `{username, email, password}` |
| POST | /api/auth/login | No | Login. Body: `{email, password}`. Devuelve token |
| GET | /api/auth/me | Bearer | Perfil del usuario activo |
| POST | /api/auth/logout | Bearer | Logout (stateless) |
| GET | /api/songs | No | Canciones públicas. Params: `?page, ?limit, ?genre, ?search` |
| GET | /api/songs?mine=1 | Bearer | Solo canciones del usuario autenticado |
| POST | /api/songs | Bearer | Crear canción. Body: `{title, description, lyrics, genre, mood, duration_seconds, is_public}` |
| GET | /api/songs/{id} | Opcional | Detalle de canción |
| PUT | /api/songs/{id} | Bearer | Actualizar campos de la canción |
| DELETE | /api/songs/{id} | Bearer | Eliminar canción (owner o admin) |
| GET | /api/favorites | Bearer | Lista de favoritos del usuario |
| POST | /api/favorites/add?id={id} | Bearer | Añadir canción a favoritos |
| DELETE | /api/favorites/remove?id={id} | Bearer | Quitar canción de favoritos |
| GET | /api/playlists | Bearer | Playlists del usuario |
| POST | /api/playlists | Bearer | Crear playlist. Body: `{title, description}` |
| POST | /api/playlists/{id}/songs | Bearer | Añadir canción. Body: `{song_id}` |
| GET | /api/musicbrainz?q={query} | No | Búsqueda en MusicBrainz |
| POST | /api/ai/generate-lyrics | Bearer | Generar letra. Body: `{prompt, genre, mood}` |

---

## 14. Pruebas realizadas

| # | Caso de prueba | Entrada | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|
| 1 | Registro con datos válidos | usuario, email válido, contraseña 8+ chars | HTTP 201, token JWT | ✅ HTTP 201, token recibido |
| 2 | Registro con email duplicado | email ya existente | HTTP 409, mensaje de conflicto | ✅ HTTP 409, "Usuario o email ya existe" |
| 3 | Login con credenciales correctas | admin@musify.local / Password123 | HTTP 200, token JWT | ✅ Token recibido, rol admin en payload |
| 4 | Login con contraseña incorrecta | email correcto, password erróneo | HTTP 401 | ✅ HTTP 401, "Email o contraseña incorrectos" |
| 5 | Crear canción sin token | POST /api/songs sin Authorization | HTTP 401 | ✅ HTTP 401, "Token inválido o expirado" |
| 6 | Crear canción con token válido | POST /api/songs con Bearer token | HTTP 201, canción guardada | ✅ HTTP 201, ID de canción devuelto |
| 7 | Generar letra | POST /api/ai/generate-lyrics con prompt | HTTP 200, lyrics con estrofas | ✅ Letra estructurada con [Verso 1], [Estribillo] |
| 8 | Listar mis canciones | GET /api/songs?mine=1 con token | Solo canciones del usuario | ✅ Solo devuelve canciones del usuario autenticado |
| 9 | Filtro por género | GET /api/songs?genre=Pop | Solo canciones Pop | ✅ Total coincide con canciones de género Pop |
| 10 | Paginación | GET /api/songs?page=1&limit=2 | 2 canciones, metadatos de paginación | ✅ `{page:1, limit:2, total:N, pages:N}` |
| 11 | Eliminar canción ajena (user) | DELETE /api/songs/{id_ajeno} con token user | HTTP 403 | ✅ HTTP 403, "No tienes permiso" |
| 12 | Eliminar canción ajena (admin) | DELETE /api/songs/{id_ajeno} con token admin | HTTP 200 | ✅ HTTP 200, eliminada |
| 13 | Búsqueda MusicBrainz | GET /api/musicbrainz?q=beatles | Array de grabaciones | ✅ 10 resultados con title, artist, date |
| 14 | Crear playlist | POST /api/playlists con token | HTTP 201, playlist creada | ✅ ID de playlist devuelto |
| 15 | Token expirado/inválido | Bearer con token manipulado | HTTP 401 | ✅ HTTP 401, "Firma de token inválida" |

---

## 15. Gestión de riesgos

| Riesgo | Probabilidad | Impacto | Medida de prevención |
|---|---|---|---|
| API MusicBrainz no responde | Media | Bajo | Try/catch en el endpoint; la app sigue funcionando sin esta función |
| Pérdida del archivo musify.db | Baja | Alto | `.gitignore` impide commitear la BD; backup manual recomendado; `init.php` recrea la estructura |
| JWT_SECRET expuesto en código | Baja (corregido) | Alto | Secret en `.env`, fuera del repositorio; `.env.example` documenta la variable sin el valor |
| Inyección SQL | Baja (prevenido) | Alto | Prepared statements en los 16 archivos de endpoints |
| XSS almacenado | Baja (prevenido) | Medio | `htmlspecialchars()` en campos de texto antes de guardar en BD |
| Contenedor Docker no arranca | Baja | Alto | `Dockerfile` incluye todas las dependencias; `docker compose up --build` reconstruye desde cero |
| Conflicto de puertos (8000 ocupado) | Media | Bajo | Cambiar `ports: "8001:80"` en `docker-compose.yml` |

**Protocolo de incidencias:**
1. Identificar el síntoma (error en consola, respuesta HTTP incorrecta, contenedor caído).
2. Comprobar logs: `docker compose logs web`.
3. Si es error PHP: revisar `logs/php_errors.log` (en modo development los errores se muestran en pantalla).
4. Si es error de BD: comprobar que `musify.db` existe y tiene las tablas con `docker compose exec web php -r "require '/var/www/html/config/config.php'; require '/var/www/html/config/Database.php'; print_r(Database::getInstance()->getConnection()->query('SELECT name FROM sqlite_master WHERE type=table')->fetchAll());"`.
5. Si el contenedor no responde: `docker compose down && docker compose up --build`.

---

## 16. Conclusiones

Musify cumple todos los requisitos mínimos del ciclo formativo y añade un elemento diferenciador doble: generación de letra con IA y despliegue con Docker.

Desde el punto de vista técnico, el proyecto demuestra:
- Diseño e implementación de una API REST con PHP nativo, sin frameworks.
- Modelado de base de datos relacional con relaciones N:M (playlists-canciones, usuarios-favoritos).
- Autenticación stateless con JWT y HMAC-SHA256.
- Integración de API externa (MusicBrainz) con manejo de errores.
- Despliegue reproducible con Docker que elimina la dependencia de configuración local.

Las principales limitaciones del proyecto, que quedarían como trabajo futuro, son:
- Generación de audio real (requeriría integración con Suno API o Google Lyria con credenciales de pago).
- Verificación de rol admin server-side en el panel de administración.
- Tests automatizados (PHPUnit para backend, Playwright para frontend).

---

## 17. Anexos

### A. Diagrama E-R
Disponible en `docs/DIAGRAMA_ER.md`.

### B. Script SQL de creación de tablas
Disponible en `database/init.sql`.

### C. Referencia completa de la API
Disponible en `docs/API.md`.

### D. Código fuente
Disponible en el repositorio Git. Historial de commits:

```
78055dc docs: README, memoria y documentación completa
29eb019 feat: Docker para despliegue
d86801f fix: seguridad - sanitización XSS y JWT secret
66ac4f3 feat: buscador, filtros y paginación
e34ddb1 feat: generación de letra con IA
99acba6 feat: integración MusicBrainz
93f9f73 feat: playlists y favoritos
6aac556 feat: CRUD completo de canciones
db9e751 feat: autenticación JWT con bcrypt
85d58af feat: estructura base del proyecto y configuración
```

### E. Capturas de pantalla
*(Ver carpeta `docs/capturas/` — añadir antes de la entrega)*

---

*Fin del documento*
