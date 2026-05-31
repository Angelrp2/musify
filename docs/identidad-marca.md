# Manual de Identidad de Marca — Musify

## Nombre y concepto

Musify = Music + -ify (sufijo de transformacion, como Spotify, Glorify)
Concepto: Democratizar la creacion musical con IA

## Paleta de colores

| Nombre | Hex | Uso |
|--------|-----|-----|
| Violeta principal | #6366F1 | CTAs, botones, elementos destacados |
| Violeta oscuro | #4F46E5 | Hover, estados activos |
| Violeta secundario | #8B5CF6 | Acentos, gradientes |
| Rosa acento | #EC4899 | Highlights especiales |
| Verde exito | #10B981 | Confirmaciones, exito |
| Rojo error | #EF4444 | Errores, alertas |
| Amarillo aviso | #F59E0B | Advertencias |
| Texto principal | #111827 | Cuerpo de texto |
| Texto secundario | #6B7280 | Subtitulos, metadata |
| Fondo claro | #F9FAFB | Fondo de secciones |
| Borde | #E5E7EB | Bordes de componentes |

## Tipografia

- Principal (UI): System font stack (apple/segoe/roboto) — legible en todos los OS
- Mono (letras/codigo): monospace — para el output de letras generadas

## Logotipo

- Icono: Nota musical (♪) en color primario
- Fuente: Bold, tipografia del sistema
- Color sobre fondo claro: #6366F1
- Color sobre fondo oscuro: blanco

## Tono de comunicacion

- Cercano y moderno (tu, no usted)
- Creativo e inspirador
- Tecnico pero accesible
- Ejemplos: "Crea tu cancion en segundos", "Tu musica, tu IA"

## Uso incorrecto

- No deformar el logotipo
- No usar sobre fondos que no contrasten (ratio minimo 4.5:1)
- No cambiar los colores corporativos
- No usar el nombre con signos de puntuacion dentro (Musify!, Musify?)

## Variables CSS del sistema

El sistema de diseno esta implementado en variables CSS en `assets/css/style.css`:

```css
:root {
  --color-primary: #6366f1;
  --color-success: #10b981;
  --color-error:   #ef4444;
  --spacing-md:    16px;
  --radius-md:     8px;
  --transition:    0.2s ease;
}
```

Para adaptar el proyecto a otra marca: cambiar unicamente estas variables.
