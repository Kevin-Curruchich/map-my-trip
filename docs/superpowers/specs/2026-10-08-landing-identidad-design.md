# Landing, identidad visual y login antes de usar la IA

Fecha: 2026-10-08 · Estado: aprobado en conversación, pendiente de revisión escrita

## Objetivo

MapMyTrip aún no está en producción y la landing es el primer contacto. Hoy:

- El hero tiene tres acciones que compiten ("Sign Up", "Planear con mi grupo", "Why MapMyTrip?") y mezcla inglés y español.
- La página no da a conocer las features reales (planes en grupo con votación, propuestas con lugares reales, viajes con IA).
- No hay identidad visual: el logo es una "M" en un cuadro y el favicon es el de Nuxt.
- Los planes en grupo consumen IA sin que el creador tenga cuenta, así que no hay registro de quién consume.

Éxito: una persona nueva entiende en un vistazo qué hace el producto y empieza un plan sin que se le pida registrarse en frío; todo consumo de IA queda ligado a una cuenta de Google.

## Decisiones

| Tema | Decisión |
|---|---|
| Idioma | Solo español por ahora (`lang="es"`) |
| Acción principal | Planes en grupo (`/e/new`); viajes con IA como acción secundaria |
| Registro | Al momento de usar la IA, no en el hero |
| Personalidad | Limpia y confiable, con colores vivos y cálidos |
| Precio | Habrá un free tier sin definir: se dice "Empieza gratis" sin cifras ni límites |

## 1. Identidad visual

### Paleta

| Token | Valor | Uso |
|---|---|---|
| Mango (primario) | `#FFA51F` | Botones principales, acentos, logo |
| Mango texto | `#E58A00` | Texto acentuado sobre blanco ("Trip", palabras destacadas) |
| Verde (secundario) | `#12A150` | Éxito, votos, etiquetas, enlaces secundarios |
| Verde texto | `#0B7A3B` sobre `#E7F6EC` | Etiquetas y badges verdes |
| Tinta | `#1C1917` | Texto principal, fondo del bloque CTA final |
| Fondo | `#FFFFFF` | Fondo de página |
| Superficie | `#F5F5F4` | Tarjetas y bloques secundarios |

Regla de accesibilidad: el texto sobre mango siempre es oscuro (`#2B1A00` o tinta). Blanco sobre mango no pasa contraste AA.

### Tipografía

Manrope (Google Fonts) para todo el sitio. Pesos: 400, 500, 700 y 800. Los títulos usan 800 con `letter-spacing` negativo (≈ -0.03em).

### Logo

Concepto "chat que es un pin": una burbuja de chat con la punta hacia abajo que marca un lugar, con tres puntos dentro; el del centro es verde y representa la opción elegida.

SVG de referencia (viewBox 64×64), que se refina al implementar sin cambiar el concepto:

```svg
<path d="M14 6h36a10 10 0 0 1 10 10v22a10 10 0 0 1-10 10H41l-9 12-9-12h-9A10 10 0 0 1 4 38V16A10 10 0 0 1 14 6z" fill="#FFA51F"/>
<circle cx="19" cy="27" r="4.5" fill="#1C1917"/>
<circle cx="32" cy="27" r="4.5" fill="#12A150"/>
<circle cx="45" cy="27" r="4.5" fill="#1C1917"/>
```

Variantes: a color (la de arriba), de un solo color oscuro (burbuja tinta con puntos mango/verde/mango) y de un solo color claro (para fondos oscuros). El nombre se escribe "MapMy**Trip**" en Manrope 800, con "Trip" en mango texto.

### Aplicación en el código

- **Tema de Nuxt UI:** el mango es el color `primary` y el verde, el `success`. Se configura en `layers/base/app/app.config.ts` (colores) y en `layers/base/app/assets/css/main.css` (escalas `--color-mango-*` y `--color-verde-*` en `@theme`, y la fuente Manrope). Al ser global, toda la app adopta los colores de inmediato.
- **Fuente:** Manrope se carga desde Google Fonts. Usar `@nuxt/fonts` si encaja con la configuración actual; si no, un `<link>` en el `head`.
- **`AppLogo.vue`** en `layers/base/app/components/`: el ícono y, opcionalmente, el nombre, con una prop de variante. Reemplaza la "M" de `AppHeader.vue`.
- **Íconos del sitio** en `public/`: `favicon.svg`, `favicon.ico` (16/32/48), `apple-touch-icon.png` (180), `icon-192.png` e `icon-512.png`, todos generados a partir del SVG. Se declaran en el `head` de la app.
- **Imagen de vista previa en WhatsApp** (`layers/events/app/components/OgImage/Event.takumi.vue`): se rediseña con fondo mango, el logo real y Manrope. Conserva la misma información: título, lugar y fecha, pie y número de personas.
- **Header en español:** "Mis planes", "Entrar", "Salir". Se eliminan "Sign out", "New Trip" y "Your AI-powered travel planning assistant".

## 2. Landing

Página `layers/marketing/app/pages/index.vue` armada con componentes de la capa `marketing` (`app/components/landing/`), uno por sección. Todo el texto en español.

### Header (`AppHeader.vue`, capa `base`)

- Logo a la izquierda.
- A la derecha: los enlaces "Cómo funciona" y "Viajes con IA" (anclas a sus secciones, solo en la landing) y el botón "Entrar".
- Con sesión iniciada: "Mis planes" y la foto con su menú ("Mis planes", "Salir").
- En móvil: solo el logo y "Entrar" (o la foto).

### Hero

- Etiqueta: "Planes en grupo con IA".
- Título: "Decidan juntos qué hacer, *sin perderse en el chat*" (la segunda parte en mango texto).
- Texto: "Crea el plan y compártelo en WhatsApp. Cada quien dice cuánto puede gastar y qué le gustaría; la IA propone 3 planes con lugares reales y el grupo vota."
- Botón principal: **"Empieza gratis"** → `/e/new`.
- Enlace secundario: "o planea un viaje →" → `/trips` (pide login si no hay sesión; ver la sección 3).
- Debajo: "Tus amigos se unen y votan sin crear cuenta".
- **Demo**, igual en escritorio y móvil: un solo teléfono con la página del plan en votación y, flotando encima, la burbuja de WhatsApp con la vista previa del link. En escritorio va a la derecha del texto y en móvil, debajo; el botón principal queda visible sin hacer scroll en móvil.
  - Hecha en HTML y CSS, sin capturas, con datos de ejemplo realistas: "Sábado en Antigua", Antigua Guatemala, sáb 14 oct.
  - Refleja la UI real de `/e/[slug]`: propuestas con título y badge de presupuesto (etiquetas reales: Económico, Normal, Sin límite), pasos numerados, lugar con rating, badge "Recomendado", conteo de votos y botones "Votar" / "Tu voto".
  - La burbuja usa el diseño nuevo de la imagen de vista previa.
  - Es decorativa: `aria-hidden`, con una descripción breve para lectores de pantalla.

### Cómo funciona (`#como-funciona`)

Título: "De '¿qué hacemos?' a plan cerrado en 3 pasos".

1. **Crea el plan:** qué, dónde y cuándo.
2. **Compártelo en WhatsApp:** cada quien dice su presupuesto y gustos, sin cuenta.
3. **La IA propone, el grupo vota:** tres opciones con lugares reales; tú cierras la decisión.

### Features

Título: "Todo lo que hace por tu grupo". Cuadrícula de 6 tarjetas, en mosaico en escritorio y en una sola columna en móvil:

- Propuestas con lugares reales (Google Places y lugares recomendados)
- Votación en vivo: ves quién votó y qué va ganando
- Link con vista previa en WhatsApp
- El presupuesto y los gustos de cada quien, que la IA toma en cuenta
- Lugar y fecha exactos en el mapa
- Mis planes: tus viajes guardados y los planes de tus grupos en un solo lugar

### Viajes con IA (`#viajes`)

Título: "¿Viaje más largo? Tu itinerario día por día". Describes duración, viajeros, estilo y presupuesto, y recibes un itinerario con actividades en el mapa. Ilustración: demo en HTML y CSS (días con actividades y un mapa estilizado), no una captura. Botón: "Planear un viaje" → `/trips`.

### Preguntas frecuentes

- **¿Mis amigos necesitan cuenta?** No, se unen y votan desde el link.
- **¿Por qué me pide entrar con Google?** Para usar la IA (proponer planes o crear un viaje) y guardar tus planes.
- **¿Cuánto cuesta?** Puedes empezar gratis.
- **¿De dónde salen los lugares?** De Google Places y de lugares que recomendamos.

### Llamada final y pie de página

Bloque oscuro (tinta) con el título "El próximo plan del grupo empieza aquí" y el botón "Empieza gratis". Pie de página con el logo, "© {año} MapMyTrip" y el enlace a GitHub.

### SEO y movimiento

- `useSeoMeta` en la landing: título, descripción y `og:image` propia (una imagen de la marca para compartir la landing).
- `htmlAttrs: { lang: "es" }` en la configuración de la app.
- Animación mínima de aparición al hacer scroll, desactivada con `prefers-reduced-motion`.

## 3. Login antes de usar la IA

### Reglas

| Acción | ¿Requiere cuenta? |
|---|---|
| Crear un plan en grupo | No |
| Unirse a un plan y votar | No |
| Cerrar la votación | No (solo el creador, como hoy) |
| **Proponer planes con IA** (creador) | **Sí** |
| **Crear un viaje con IA** (`/trips`) | **Sí** (ya es así hoy; se mantiene) |

### Servidor

- `layers/events/server/api/events/[slug]/proposals.post.ts`: llama a `requireUserSession` antes de cualquier otra cosa (401 sin sesión) y después comprueba que sea el creador, como hoy.
- **El plan se liga a la cuenta.** Si el creador lo hizo sin sesión (`ownerSub` es null) y prueba que es el dueño con su token, al generar se guarda `ownerSub = user.sub`. Así el consumo queda registrado y el plan aparece en "Mis planes". Si el plan ya tiene `ownerSub`, debe coincidir con la cuenta actual.
- **Regreso después del login:** antes de ir a `/auth/google` se guarda la ruta de origen (una cookie corta o `?redirect=` validado). `layers/auth/server/routes/auth/google.get.ts` redirige ahí al terminar; sin ruta guardada, va a `/plans`, como hoy.
- **Validación de la ruta:** se acepta solo una ruta interna que empiece con `/` y no con `//` o `/\`, sin esquema ni host. Cualquier otra cosa cae en `/plans`. La función vive en `layers/auth/shared/utils/` para usarla en cliente y servidor.

### Cliente

- `/e/[slug]`: el botón conserva el texto **"Proponer planes con IA"** (o "Proponer otros planes"). Si no hay sesión, al pulsarlo se abre un `UModal` que explica que debe iniciar sesión para usar la IA, con el botón "Continuar con Google". Ese botón va directo a Google (sin pasar por `/login`) con regreso a `/e/{slug}`, y al volver el creador pulsa de nuevo y genera. El token de creador sigue en el navegador, así que conserva la propiedad del plan.
- Middleware `auth` (`layers/auth/app/middleware/auth.ts`): redirige a `/login?redirect=<ruta actual>`.
- `/login`: en español, con el logo nuevo y el texto "Entra para usar la IA y guardar tus planes". Si ya hay sesión, va a la ruta de `redirect` validada (o a `/plans`).

## Fuera de alcance

- Traducir `/trips` y el resto de la app al español (pendiente aparte).
- Rediseñar las páginas de la app más allá de heredar colores, fuente y logo.
- Definir el free tier, sus límites y el sistema de suscripciones (la rama `backup/subscriptions-prisma` queda como referencia).
- Pruebas automatizadas: por ahora no se agrega vitest.

## Verificación

- `pnpm lint` y `pnpm typecheck` sin errores.
- `pnpm build` exitoso.
- Revisión en el navegador, a 375 px y a 1280 px, de la landing, el login, `/e/new` y `/e/[slug]`, sin scroll horizontal.
- Login antes de la IA, a mano:
  1. Crear un plan sin sesión.
  2. Unir a una persona.
  3. Pulsar "Proponer planes con IA": aparece el aviso.
  4. Continuar con Google: regresa a `/e/{slug}`.
  5. Generar: funciona, y el plan aparece en "Mis planes".
- `POST /api/events/{slug}/proposals` sin sesión responde 401.
- Una URL de login con `redirect=https://evil.com` o `//evil.com` termina en `/plans`.
- Favicon visible en pestañas claras y oscuras; vista previa del link de un plan con el diseño nuevo.
