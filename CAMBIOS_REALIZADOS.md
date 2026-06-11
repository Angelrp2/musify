# Cambios realizados sobre el entregable (musify-entrega)

Resumen rápido de qué se tocó después de la entrega, para tenerlo a mano si preguntan.

## 1. Bug real: el registro de usuarios fallaba ("readonly database")

- **Causa**: el `.zip` entregado no incluye `database/musify.db` (solo `init.sql` e `init.php`). Al inicializar la base de datos dentro del contenedor Docker (`docker compose exec web php database/init.php`), el archivo se crea como propiedad de `root`, y Apache (que corre como `www-data`) no tiene permiso de escritura. Esto hace fallar el registro de usuarios y la creación de canciones.
- **Arreglo**: se añadieron 2 líneas a `database/init.php` que ajustan los permisos del archivo `.db` y de la carpeta `database/` justo después de crear las tablas, para que Apache pueda escribir.
- **Importante**: esto no es un cambio de funcionalidad, es arreglar un bug latente que no se había notado porque la BD de pruebas ya tenía los permisos correctos de antes.

## 2. Archivo `.env` creado

- `config/config.php` exige obligatoriamente la variable `JWT_SECRET` (si falta, la API responde error 500 en todo). El `.zip` no traía `.env` (solo `.env.example`, ignorado por git).
- Se creó `.env` en la raíz con `JWT_SECRET=musify_demo_secret_2026_dawtfg_8f3a91c2` para que la app arranque. No se versiona (está en `.gitignore`).

## 3. Base de datos inicializada

- Se ejecutó `php database/init.php` para crear `database/musify.db` (no incluida en el zip), con las 7 tablas y los datos de prueba (usuarios admin/editor/demo/guest, contraseña `Password123`).

## Verificado funcionando (Docker, puerto 8090 de prueba)

- Login con usuarios de prueba ✅
- Registro de nuevos usuarios ✅
- Listado de canciones ✅
- Búsqueda MusicBrainz ✅
- Creación de canción (genera letra y guarda) ✅

## 4. Material para la exposición (nuevo)

- `PRESENTACION_MUSIFY_ENTREGA.pptx` — PowerPoint de 14 diapositivas, basado en `DOCUMENTO_ENTREGA_FINAL.md`.
- `GUION_PRESENTACION.md` — guion hablado con tiempos y orden de la demo.
- `README.md` — sección "Instalación y arranque" actualizada para incluir el paso de crear `.env`/`JWT_SECRET` (faltaba, ya estaba en `DOCUMENTO_ENTREGA_FINAL.md` pero no en el README).
- `DOCUMENTO_ENTREGA_FINAL.docx` — versión formateada (títulos, tablas con color, saltos de página) del documento de entrega, lista para imprimir/encuadernar.
- `DOCUMENTO_ENTREGA_FINAL.pdf` — **este es el que hay que fotocopiar/encuadernar**, generado a partir del .docx anterior.

## En una frase, si preguntan

> "Después de la entrega probé el proyecto desde cero en Docker y encontré que el registro de usuarios fallaba por un problema de permisos de archivos en la base de datos SQLite (no se notó antes porque la BD de pruebas ya tenía los permisos correctos). Lo arreglé con 2 líneas en `database/init.php` que ajustan los permisos automáticamente al inicializar."
