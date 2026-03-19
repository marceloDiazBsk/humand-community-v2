# Humand Community App — Plan de Funcionalidad

## 1. Arquitectura de Navegación

### 1.1 Estado global `screen`
La app se controla mediante un estado principal `screen` con los siguientes valores posibles:

| Valor | Pantalla |
|-------|----------|
| `"muro"` | Feed principal (Home) |
| `"apps"` | Grilla de aplicaciones |
| `"community"` | Hub de Humand Community |
| `"app"` | Vista individual de mini app |

Se necesita también un estado `activeApp` para saber qué mini app mostrar dentro de `"app"`, y un sub-estado para vistas internas (detalle de curso, detalle de beneficio, etc.).

### 1.2 Bottom Tab Bar (5 tabs, siempre visible)

| Tab | Ícono | Acción | Indicador |
|-----|-------|--------|-----------|
| Inicio | Home | Navega a `"muro"` | Dot azul |
| Chats | MessageSquare | — (sin funcionalidad) | — |
| Apps | Grid3x3 | Navega a `"apps"` | Dot azul |
| Nuestra... | Star | — (sin funcionalidad) | — |
| Perfil | User | — (sin funcionalidad) | — |

El tab activo se resalta visualmente. Solo "Inicio" y "Apps" tienen navegación funcional.

### 1.3 Status Bar simulada
- Hora fija "11:13", señal y batería simulados.
- Fondo cambia según pantalla: blanco (muro/apps), navy (community/app).

---

## 2. Pantalla MURO (Feed)

### 2.1 Header
- Logo "humand" estático.
- 3 íconos a la derecha: Clock, Search, Bell (sin funcionalidad, solo decorativos).

### 2.2 Tabs horizontales
- Pills: "Muro" (activo por defecto), "Grupos", "Noticias", "Marketplace".
- "Marketplace" muestra badge con número "7".
- Solo visual: no cambian contenido al tocar.

### 2.3 Crear publicación
- Barra con avatar + campo de texto (solo visual, no funcional).

### 2.4 Post de ejemplo
- Contenido estático: avatar, nombre, timestamp, texto, placeholder de imagen.
- Reacciones estáticas: 💙 15, 👍 5, 🤩 4 + link "Ver todo".

---

## 3. Pantalla APPS (Grilla)

### 3.1 Grilla de 16 apps (3 columnas)
Todas las apps son decorativas excepto **Humand Community**, que es la entrada principal al hub.

| App | Acción al tocar |
|-----|----------------|
| Personas | — |
| Control horario | — |
| Marcajes | — |
| Organigrama | — |
| Onboarding (verde) | — |
| Onboarding (violeta) | — (badge "Nuevo") |
| Encuestas | — |
| Marketplace | — (badge "7") |
| Vacaciones y permisos | — |
| Aprendizaje | — |
| Eventos | — |
| Librerías | — |
| Tareas | — |
| Landing | — |
| Notion | — |
| **Humand Community** | **Navega a `screen: "community"`** (badge notificación rojo) |

---

## 4. Pantalla COMMUNITY HUB

### 4.1 Header
- Botón "←" vuelve a `screen: "apps"`.
- Título "Humand Community" con ícono Globe.

### 4.2 Buscador
- Input con placeholder "Buscar en Community..." (solo visual, sin filtrado funcional).

### 4.3 Banner destacado
- Card de "Humand Run Challenge" con info estática.
- Al tocar: navega a la mini app Humand Run.

### 4.4 Grilla de 9 mini apps (3 columnas)
Cada una navega a `screen: "app"` con el `activeApp` correspondiente:

| # | Mini App | ID interno |
|---|----------|-----------|
| 1 | Bienestar | `bienestar` |
| 2 | Courses | `courses` |
| 3 | Club | `club` |
| 4 | To Do List | `todo` |
| 5 | Juegos | `juegos` |
| 6 | Health | `health` |
| 7 | Comunidades | `comunidades` |
| 8 | Finanzas | `finanzas` |
| 9 | Humand Run | `run` |

---

## 5. Mini Apps — Funcionalidad Detallada

### 5.1 Bienestar

**Registro de ánimo:**
- 5 opciones de emoji clicables: 😄 Genial, 🙂 Bien, 😐 Regular, 😔 Bajo, 😢 Mal.
- Estado: `selectedMood` (null | index).
- Al seleccionar: resalta la opción elegida y muestra toast temporal "¡Registrado! Tu bienestar importa 💪" (desaparece tras 3 segundos).

**Recursos:**
- Lista estática de 3 recursos (Meditación, Respiración, Journaling).
- Botón Play decorativo (sin funcionalidad).

---

### 5.2 Humand Courses

**Estados necesarios:**
- `courseFilter`: "todos" | "tech" | "soft" | "encurso"
- `selectedCourse`: null | courseId
- `courses[]`: array con datos de cada curso

**Vista de lista:**
- Tabs de filtro funcionales: filtran los cursos mostrados según categoría.
- 5 cursos con datos: AI 101, Excel Avanzado, Liderazgo Ágil, Comunicación Efectiva, Data Analytics.
- Cada curso muestra: emoji, título, subtítulo, tags, duración, rating, barra de progreso (si aplica).
- Al tocar un curso: `selectedCourse = courseId`, muestra vista detalle.

**Vista detalle de curso:**
- Botón "← Cursos" vuelve a la lista (`selectedCourse = null`).
- Card hero con stats del curso.
- Lista de módulos/lecciones con 3 estados visuales:
  - ✅ Completado (check verde, texto tachado)
  - ▶️ En curso (ícono play, badge "En curso")
  - 🔒 Bloqueado (candado gris)
- Botón de acción según progreso:
  - 0% → "Inscribirme"
  - 1-99% → "▶ Continuar"
  - 100% → "🏆 Descargar Certificado"
- Los botones son visuales, sin funcionalidad real.

---

### 5.3 Humand Club

**Estados necesarios:**
- `clubFilter`: "todos" | "gastro" | "cine" | "shopping"
- `selectedBenefit`: null | benefitId

**Vista de lista:**
- Filtros funcionales por categoría (pills horizontales).
- 6 beneficios: McDonald's, Cinemark, Nike, Starbucks, Spotify, Rappi.
- Al tocar un beneficio: muestra vista detalle.

**Vista detalle de beneficio:**
- Botón "← Beneficios" vuelve a la lista.
- Card hero con descuento grande.
- Código de descuento con botón "📋 Copiar" funcional (copia al clipboard con `navigator.clipboard`).
- Card de condiciones (estática).

---

### 5.4 To Do List

**Estados necesarios:**
- `todos[]`: array de { id, text, completed }
- `newTask`: string (input controlado)

**Funcionalidad:**
- Tareas por defecto pre-cargadas (4 tareas, 1 completada).
- Toggle de completado: al tocar checkbox cambia `completed` (true/false).
- Agregar tarea: escribir en input + presionar Enter o botón "+".
- La tarea nueva se agrega al final de la lista con `completed: false`.
- Las tareas completadas muestran texto tachado y checkbox verde con ✓.

---

### 5.5 Juegos & Trivias

- Grilla 2x2 con 4 cards estáticas.
- Juegos: Trivia General, Adivina el Emoji, Humand Wordle, Versus 1v1.
- Solo visual, sin funcionalidad interactiva.

---

### 5.6 Health

- Grilla 2x2 de recetas saludables (estático): Bowl de Quinoa, Smoothie, Wrap de Pollo, Avena Overnight.
- Lista de 3 recursos de salud (estático): Ergonomía, Sueño saludable, Hidratación.
- Todo decorativo, sin interacción.

---

### 5.7 Comunidades

**Estados necesarios:**
- `communities[]`: array con { id, name, emoji, members, joined }

**Funcionalidad:**
- Banner informativo estático.
- Lista de 6 comunidades: Fútbol (342), Libros (198), Running (267), Tecnología (412), Gaming (289), Música (201).
- Botón toggle funcional "Unirme" ↔ "Unido" por comunidad.
- Algunas comunidades pre-unidas en estado inicial.

---

### 5.8 Finanzas Personales

- Card de presupuesto con barra horizontal dividida en 3 segmentos (50/30/20).
- Leyenda con montos estáticos.
- Lista de 3 recursos financieros (estático).
- Todo decorativo.

---

### 5.9 Humand Run (la más compleja)

**Estados necesarios:**
- `runTab`: "dashboard" | "cargar" | "ranking" | "apps"
- `uploadMethod`: "manual" | "foto"
- `manualKm`: number (editable)
- `manualTime`: string
- `manualDate`: string
- `rankingScope`: "empresa" | "pais" | "global"
- `integrations`: { appleHealth: bool, strava: bool, garmin: bool, nike: bool }
- `registered`: bool (estado de éxito post-registro)

**4 Sub-tabs internos:**

#### Dashboard
- 4 stat cards estáticas (Km totales: 78.5, Actividades: 23, Ranking: #5, Racha: 7).
- Barra de progreso a meta: 78.5/100 km (estática).
- Lista de actividades recientes (4 entradas estáticas).

#### Cargar Km
- Toggle entre modo Manual y modo Con Foto.

**Modo Manual:**
- Spinner de km: botones "−" y "+" modifican `manualKm` en ±0.1.
- Input numérico editable directamente.
- Pills de valores rápidos (1.0, 3.0, 5.0, 10.0, 21.1, 42.2). Al tocar se setea `manualKm`.
- Campos opcionales: tiempo (input texto, placeholder "mm:ss") y fecha (date input).

**Modo Con Foto:**
- Zona de upload visual (solo UI, sin upload real).
- Info de verificación automática.

**Botón de registro:**
- Muestra "🏃 Registrar X km" con el valor actual de `manualKm`.
- Al tocar: cambia a estado de éxito (`registered = true`) con animación.
- Estado de éxito: check verde + "¡Actividad registrada!" + "X km sumados" + botón "Cargar otra" (resetea el formulario).

#### Ranking (Leaderboard)
- 3 sub-tabs de alcance funcionales: Mi Empresa, País, Global.
- Cada tab muestra datos distintos.

**Mi Empresa:** Podio top 3 + lista de 6 personas con departamento. Fila "Tú" (#5) resaltada.
**País:** Podio top 3 + lista con empresa. "Tú" en posición #142. Info: ranking Argentina.
**Global:** Podio top 3 + lista con país. "Tú" en posición #1847. Info: 2,340 participantes.

- Podio visual: 3 barras verticales de distinta altura (1ro centro alto, 2do izquierda, 3ro derecha).

#### Apps (Integraciones)
- Lista de 4 integraciones con toggle iOS funcional.
- Apple Health: conectado por defecto.
- Strava, Garmin, Nike Run Club: desconectados por defecto.
- Toggle funcional: al tocar cambia estado de la integración.
- Animación de deslizamiento en el toggle.
- Sección de dispositivos compatibles: pills estáticas (Apple Watch, Garmin, Fitbit, Samsung Watch, Mi Band, Polar).

---

## 6. Resumen de Interacciones Funcionales

| Interacción | Ubicación | Tipo |
|-------------|-----------|------|
| Navegación entre pantallas | Tab bar + botones back | Estado `screen` |
| Navegación a mini apps | Community Hub grid | Estado `activeApp` |
| Selección de mood | Bienestar | Toggle + toast |
| Filtrado de cursos | Courses | Filtro por categoría |
| Vista detalle de curso | Courses → card | Sub-navegación |
| Filtrado de beneficios | Club | Filtro por categoría |
| Copiar código de descuento | Club → detalle | Clipboard API |
| Agregar/completar tareas | To Do List | CRUD básico |
| Unirse/dejar comunidad | Comunidades | Toggle |
| Countdown en tiempo real | Humand Run banner | setInterval cada segundo |
| Spinner de km | Humand Run → Cargar | Incremento/decremento |
| Selección rápida de km | Humand Run → Cargar | Click en pill |
| Toggle manual/foto | Humand Run → Cargar | Tab switch |
| Registro de actividad | Humand Run → Cargar | Flujo completo con éxito |
| Cambio de scope ranking | Humand Run → Ranking | Tab switch con datos distintos |
| Toggles de integración | Humand Run → Apps | iOS switch funcional |

---

## 7. Estructura de Componentes Sugerida

```
App
├── StatusBar
├── ScreenRouter (según screen)
│   ├── MuroScreen
│   │   ├── MuroHeader
│   │   ├── MuroTabs
│   │   ├── CreatePost
│   │   └── PostCard
│   ├── AppsScreen
│   │   ├── AppsHeader
│   │   └── AppGrid (16 items)
│   ├── CommunityScreen
│   │   ├── CommunityHeader
│   │   ├── SearchBar
│   │   ├── FeaturedBanner
│   │   └── MiniAppGrid (9 items)
│   └── AppScreen (según activeApp)
│       ├── BienestarApp
│       ├── CoursesApp
│       │   ├── CourseList
│       │   └── CourseDetail
│       ├── ClubApp
│       │   ├── BenefitList
│       │   └── BenefitDetail
│       ├── TodoApp
│       ├── JuegosApp
│       ├── HealthApp
│       ├── ComunidadesApp
│       ├── FinanzasApp
│       └── HumandRunApp
│           ├── RunDashboard
│           ├── RunCargar
│           ├── RunRanking
│           └── RunApps
└── BottomTabBar
```
