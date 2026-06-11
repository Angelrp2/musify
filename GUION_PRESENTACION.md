# Guion de presentación — Musify (TFG DAW, versión entregada)

Duración estimada: 10-12 minutos. Ajustá los tiempos según lo que te den.

---

## 1. Portada (30 seg)

> "Buenos días/tardes. Mi proyecto se llama Musify, una plataforma web de creación musical: el usuario describe una idea, elige género y estado de ánimo, y la aplicación genera la letra de una canción, que luego se puede escuchar con la voz del navegador."

---

## 2. Índice (20 seg)

Repasar rápido: qué es, objetivos, tecnologías, arquitectura, funcionalidades, seguridad, base de datos, pruebas, demo y conclusiones.

---

## 3. ¿Qué es Musify? (1 min)

> "La idea nace de acercar la creación musical a personas sin conocimientos técnicos ni musicales. El usuario escribe una descripción, elige género y ánimo, y el sistema genera una letra estructurada con verso, estribillo y outro a partir de esa idea. La letra se puede reproducir con voz sintetizada usando la Web Speech API del navegador, sin depender de servicios de pago externos."

---

## 4. Objetivos (45 seg)

> "El objetivo general fue construir una plataforma funcional que demuestre integración de un flujo de creación musical con autenticación segura, API REST documentada y despliegue reproducible con Docker. Específicamente: que cualquier usuario pueda crear letras sin saber de música, autenticación con JWT y bcrypt, base de datos relacional con 6 tablas, consumo de la API pública de MusicBrainz, y buenas prácticas de seguridad."

---

## 5. Tecnologías (45 seg)

> "El frontend está hecho en HTML, CSS y JavaScript puro. El backend en PHP 8.2, sin frameworks, con arquitectura REST. La base de datos es SQLite con 6 tablas relacionadas. Todo se despliega con Docker y Apache, lo que garantiza que el entorno sea idéntico en cualquier máquina."

---

## 6. Arquitectura (1 min)

> "Sigue una arquitectura cliente-servidor. El frontend hace peticiones fetch a la API REST. Apache, con `.htaccess` y mod_rewrite, enruta las URLs limpias a archivos PHP independientes — no hay un router central, cada endpoint tiene sus propios `require_once`."

Explicar el flujo (slide de arquitectura):

> "El usuario se registra o hace login, entra al Estudio, describe su idea, elige género y ánimo, y pulsa Componer. La API genera la letra con una plantilla local basada en esos datos, la guarda en SQLite, y el usuario puede reproducirla con voz, organizarla en playlists, marcarla como favorita o buscar artistas reales en MusicBrainz."

---

## 7. Roles y permisos (30 seg)

> "Hay 4 roles: admin, editor, user y guest. El admin tiene gestión total, incluido un panel propio. El editor puede crear y editar canciones. El user (rol por defecto al registrarse) crea sus propias canciones, playlists y favoritos. El guest solo puede leer. La protección de edición/borrado se verifica en el servidor comparando el usuario del token con el dueño de la canción."

---

## 8. Funcionalidades (1 min)

> "Además de la generación de letra, la plataforma tiene: registro y login con JWT, CRUD completo de canciones, reproducción de letra con voz, mi colección con búsqueda y paginación, discover con canciones públicas y búsqueda en MusicBrainz, playlists, favoritos, perfil de usuario y panel de administración."

---

## 9. Seguridad y RGPD (45 seg)

> "Las contraseñas se guardan con `password_hash()` bcrypt. La autenticación es JWT firmado con HMAC-SHA256, sin aceptar el algoritmo 'none'. Todas las consultas usan sentencias preparadas con PDO. Los campos de texto pasan por `htmlspecialchars()` antes de guardarse, para evitar XSS. El `JWT_SECRET` vive en un `.env` fuera del repositorio. Al tratar datos personales (usuario, email), el registro incluye un checkbox de aceptación de condiciones como primer paso hacia el cumplimiento del RGPD."

---

## 10. Base de datos (45 seg)

> "La base de datos tiene 6 tablas: usuarios, canciones, playlists, la relación playlists-canciones, favoritos, y un historial de ideas generadas por IA. Las relaciones usan ON DELETE CASCADE."

(Si preguntan, mostrar `docs/DIAGRAMA_ER.md`.)

---

## 11. Pruebas realizadas (30 seg)

> "Hice 15 pruebas manuales documentadas: registro, login, generación de letra, CRUD de canciones, permisos por rol, paginación, filtros, búsqueda en MusicBrainz, playlists y validación de tokens. Todas con resultado correcto."

---

## 12. Demo en vivo (3-4 min) — LO MÁS IMPORTANTE

Orden recomendado:

1. **Login** con un usuario de prueba (`admin@musify.local` / `Password123`, ver tabla de usuarios).
2. **Estudio**: escribir una idea corta (ej: "una canción alegre sobre el verano"), elegir género y ánimo, pulsar "Componer".
3. **Detalle de canción**: reproducir la letra con voz (Web Speech API).
4. **Mi colección**: mostrar la canción guardada.
5. **Playlists**: crear una playlist y añadir la canción.
6. **Favoritos**: marcarla como favorita.
7. **Discover**: buscar un artista real en MusicBrainz.
8. (Opcional) **Panel admin**: si entrás como admin, mostrar la gestión de canciones.

> Frase de transición: "Ahora les muestro el funcionamiento real de la plataforma."

---

## 13. Conclusiones (45 seg)

> "Musify cumple los requisitos del ciclo: arquitectura cliente-servidor, API REST documentada, base de datos relacional con relaciones N:M, autenticación con roles, consumo de una API externa, despliegue reproducible con Docker, y un elemento diferenciador: generación de letra asistida y reproducción por voz, todo sin depender de servicios de pago."

Limitaciones / trabajo futuro: generación de audio real (requeriría APIs de pago como Suno o Google Lyria), verificación de rol admin server-side en el panel, y tests automatizados.

---

## 14. Cierre (10 seg)

> "Muchas gracias. Quedo a disposición para cualquier pregunta."

---

## Notas para el ensayo

- Practicá en voz alta al menos 2 veces con cronómetro.
- La demo en vivo (paso 12) es lo más importante — ensayala completa antes.
- Si te preguntan por qué SQLite y no MySQL: proyecto académico de alcance acotado, sin necesidad de concurrencia alta, simplifica el despliegue.
- Si te preguntan por qué la letra no usa Gemini/IA externa: porque el objetivo era demostrar un flujo completo sin depender de APIs de pago; queda mencionado como posible escalado a futuro (Suno/Google Lyria).
- Si Docker no arranca a último momento: tené el proyecto ya levantado y probado ANTES de empezar, no confiar en arrancarlo en vivo.
