# Humand Community V2

## Stack
- Next.js 16 (App Router, TypeScript)
- Supabase (Postgres + Storage)
- Tailwind CSS + CSS variables para design tokens
- Lucide React + SVG inline para iconografia
- Deploy: Vercel (auto-deploy desde main)

## Design System — OBLIGATORIO

Antes de escribir cualquier codigo UI, componente, estilo CSS, o elemento visual,
**invocar la skill `design-system-foundations`**. Esta skill contiene:

- Paleta completa de colores (Humand, Neutral, extendidas)
- Tipografia (Roboto 400/600, escala de tokens)
- Espaciado (multiplos de 8px)
- Border radius (S/M/L segun altura)
- Elevation (3 sombras: 4dp, 8dp, Inverted)
- **Patrones de componentes** (`references/component-patterns.md`):
  - Iconografia: SVG outlined, NUNCA emojis como iconos de UI
  - Headers: principal blanco, secciones internas #1d204e
  - Tab pills: outlined (navegacion) y filled (filtros)
  - Cards: app grid, interactiva, destacada (gradient)
  - Badges: numerico (rojo) y textual (verde)
  - Bottom tab bar: shadow inverted, SVG 24px
  - Feed/listas, inputs, botones

Leer especificamente `references/component-patterns.md` cuando se vaya a:
- Crear una nueva pantalla o seccion
- Agregar iconos a cualquier parte de la UI
- Construir headers, tabs, cards, badges, o botones
- Modificar el feed, listas, o formularios

## Reglas clave del proyecto

1. **Nunca emojis como iconos de UI** — SVG outlined con colores de la paleta
2. **Emojis solo para contenido de usuario** — reacciones, mood tracker, categorias de juegos
3. **Un icono = un par de colores fijo** — cada categoria tiene stroke/background definido
4. **Headers internos: fondo #1d204e**, texto e iconos blancos
5. **Tab bar: shadow inverted**, azul activo (#496be3), gris inactivo (#8d8c9f)
6. **Cards con shadow-4dp sobre fondos grises**, border-bottom sobre fondos blancos
7. **Fuente unica: Roboto**, pesos 400 y 600, letter-spacing 0.2px

## Estructura del proyecto

```
src/
  app/
    page.tsx      — App completa (SPA con navegacion por estado)
    layout.tsx    — Root layout con metadata
    globals.css   — CSS variables del design system
  lib/
    supabase.ts   — Cliente Supabase
```

## Base de datos (Supabase)

Tablas: posts, comments, todos, communities, courses, benefits, run_activities, mood_entries
Storage: bucket `run-images` (publico) para fotos de actividades de running

## Navegacion

Estado `screen`: muro | apps | community | app
Estado `activeApp`: bienestar | courses | club | todo | juegos | health | comunidades | finanzas | run

No se usa Next.js routing — toda la navegacion es por estado dentro de page.tsx.
