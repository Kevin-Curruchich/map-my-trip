# Panel de lugar en Trips y Events

Fecha: 2026-10-12 · Rama: `feat/place-panel`

## Objetivo

Hoy el itinerario de un trip y los pasos de una propuesta de evento se muestran en una columna angosta, y para ver un lugar hay que salir a Google Maps. Queremos abrir cualquier lugar dentro de la app, con fotos, rating, reseñas, horario y contacto, sin perder el itinerario de vista, y poder compartir el enlace con el lugar abierto.

Éxito:

- En desktop la página usa el ancho: itinerario a la izquierda, mapa o lugar a la derecha.
- En mobile el lugar se abre en una hoja inferior y el botón atrás la cierra.
- Un enlace con `?place=…` abre la página con ese lugar ya abierto.
- El mismo panel sirve para lugares de Google y para nuestros lugares recomendados.

## Decisiones

| Tema | Decisión |
|---|---|
| Alcance | Trips (`trips/[id].vue`) y Events (`e/[slug].vue`) a la vez |
| Panel | Propio (no el componente `gmp-place-details` de Google) |
| Contenido | Fotos, rating, reseñas, horario, contacto, enlace a Google Maps |
| Lugares recomendados | Se usan sus datos y, si tienen `googlePlaceId` (ya existe en `recommended_places`), también los de Google |
| Desktop | Dos columnas siempre; derecha sticky |
| Mobile | `UDrawer` (bottom sheet) |
| Selección | En la URL (`?place=`), compartible |
| Costo / abuso | Sin auth extra; tope de cuota diario en Google Cloud Console (lo configura el dueño) |
| Tests | Sin tests unitarios; se verifica con `typecheck`, `lint` y navegador |

## Costos (Places API New, precios oficiales al 2026-10-12)

- Place Details **Enterprise + Atmosphere** (por `reviews`): 1.000 gratis/mes, luego $25 por 1.000.
- Place Details **Photos**: 1.000 gratis/mes, luego $7 por 1.000 imágenes.
- Pedir la lista `photos` es gratis (IDs Only); se paga cada imagen descargada.

Por eso: una sola llamada de Details por apertura, solo la primera foto se carga al abrir y el resto con `loading="lazy"`.

## Reglas de Google que el diseño respeta

- No se cachea contenido de Places ni nombres de fotos en el servidor. Solo el `placeId` se puede guardar.
- Datos de Places fuera de un mapa de Google llevan la atribución "Google Maps".
- Cada foto muestra su autor (`authorAttributions`) y hay un enlace a la ficha en Maps.
- Cada reseña muestra avatar, nombre y enlace del autor; debajo, la nota "Ordenadas por relevancia, según Google" y "Ver todas en Google Maps".

## Servidor (capa events, junto a `server/utils/google-places.ts`)

### `GET /api/places/details?source=google|recommended&id=…`

- Valida la entrada con el esquema en `layers/events/server/schemas.ts`: `id` es un place id de Google (formato acotado) si `source=google`, o un uuid si `source=recommended`.
- `source=recommended`: carga el lugar activo de `recommended_places` (404 si no existe o está inactivo). Toma nombre, dirección, descripción, Instagram, WhatsApp, web y si es aliado. Si tiene `googlePlaceId`, sigue como `google` con ese id y mezcla los datos; si no, responde solo con lo nuestro.
- `source=google`: una llamada a Place Details con `languageCode=es` y field mask
  `id,displayName,formattedAddress,googleMapsUri,photos,rating,userRatingCount,nationalPhoneNumber,websiteUri,currentOpeningHours,regularOpeningHours,reviews`.
- Responde un tipo compartido `PlaceInfo`:

```ts
interface PlaceInfo {
  source: "google" | "recommended";
  id: string;
  name: string;
  address: string | null;
  mapsUrl: string;
  rating: number | null;
  ratingCount: number | null;
  phone: string | null;
  website: string | null;
  // Recomendados
  description: string | null;
  instagram: string | null;
  whatsapp: string | null;
  partner: boolean;
  // Google
  openNow: boolean | null;
  weekdayHours: string[]; // weekdayDescriptions, ya en español
  photos: { name: string; authors: { name: string; uri: string | null }[] }[];
  reviews: {
    author: string;
    authorUri: string | null;
    authorPhoto: string | null;
    rating: number;
    text: string;
    when: string; // relativePublishTimeDescription
  }[];
  fromGoogle: boolean; // muestra la atribución
}
```

- Sin caché del servidor. Si Google falla, responde lo que tenga de nuestra base (o 502 para `source=google`).

### `GET /api/places/photo?name=…&w=…`

- Valida `name` (`places/<id>/photos/<id>`) y `w` (entero acotado, p. ej. 200–1200).
- Pide `/{name}/media?maxWidthPx=w&skipHttpRedirect=true` y responde 302 al `photoUri`. La clave nunca llega al navegador.

## Front

### Compartido (`layers/base`)

- `shared/types`: `PlaceInfo` y `PlaceRef = { source, id }`.
- `PlacePanel.vue`: props `place: PlaceRef` y `fallback?: { name, address }`. Usa `useFetch` (clave por lugar, así reabrir no repite la llamada en la sesión). Orden:
  1. Carrusel de fotos (`UCarousel`) con autor; fotos que fallan se ocultan.
  2. Nombre, rating y cantidad de reseñas; badge de aliado o recomendado.
  3. Abierto/cerrado ahora y semana desplegable.
  4. Descripción e Instagram (recomendados).
  5. Botones: llamar, web, WhatsApp, Abrir en Google Maps.
  6. Reseñas con la nota de orden y "Ver todas en Google Maps".
  7. Atribución "Google Maps" si `fromGoogle`.
  - Cargando: skeleton. Error: `fallback` + botón de Maps + aviso suave. Secciones vacías se ocultan.
- `useSelectedPlace(allowed)`: lee y escribe `?place=<source>:<id>` en la URL.
  - Abrir: `router.push` (atrás cierra). Cerrar (✕ / Esc): `router.replace` sin `place`.
  - Solo acepta lugares de `allowed` (los de ese trip o evento); un `?place=` ajeno se ignora.
- Layout en ambas páginas: grilla `lg:grid-cols-[2fr_3fr]`; columna derecha `hidden lg:block sticky`. Debajo de `lg`, el panel va en un `UDrawer` abierto cuando hay selección. Al cambiar de lugar se reemplaza el contenido sin cerrar.

### Trips (`layers/trips/app/pages/trips/[id].vue`)

- Contenedor más ancho que `max-w-4xl`.
- Izquierda: cabecera e itinerario. El título de cada actividad con `placeId` es un `<button>` que abre el lugar; las demás quedan como hoy.
- Derecha: `ItineraryPlaces` (mapa) y `PlacePanel` debajo cuando hay selección.
- `ItineraryPlaces.vue`: prop `selectedId` resalta el pin; emite `select` al hacer click en un pin.
- "Share Trip" comparte la URL actual, con el lugar abierto si lo hay.

### Events (`layers/events/app/pages/e/[slug].vue`)

- `ProposalSteps.vue`: el nombre del lugar deja de ser enlace externo y emite `select` con `{ source, id }`. Los pasos en texto plano (propuestas antiguas) no se abren.
- Derecha sin selección: mensaje "Toca un lugar para ver fotos y detalles".

## Bordes

- Actividad sin `placeId` o paso en texto plano: no se abre.
- Recomendado sin `googlePlaceId`: solo nuestros datos, sin reseñas, horario, fotos ni atribución de Google.
- Recomendado inactivo o borrado: 404 → panel con `fallback` y aviso.
- Accesibilidad: disparadores son `<button>` reales; `UDrawer` maneja el foco; Esc cierra en desktop.

## Fuera de alcance

- Mapa en Events.
- Revisar que Events guarda rating y precio de Google dentro de las propuestas (posible choque con la regla de no cachear).
- Tests unitarios.

## Verificación

- `pnpm typecheck` y `pnpm lint`.
- Navegador en desktop y mobile: abrir/cambiar/cerrar lugar en Trips y Events, botón atrás en mobile, abrir un enlace con `?place=`, un `?place=` ajeno se ignora, lugar recomendado con y sin `googlePlaceId`.
