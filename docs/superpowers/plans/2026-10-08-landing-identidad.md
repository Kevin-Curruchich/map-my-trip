# Landing, identidad visual y login antes de la IA · Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar a MapMyTrip una identidad visual (mango/verde, Manrope, logo "chat que es un pin"), rehacer la landing en español centrada en planes en grupo, y exigir login justo antes de cualquier consumo de IA.

**Architecture:** La identidad vive en la capa `base`: tema de Nuxt UI (`app.config.ts` + `main.css`), componente `AppLogo` e íconos en `public/`. La landing se arma con componentes por sección en la capa `marketing`. El login antes de la IA combina tres piezas: una utilidad compartida que valida la ruta de regreso (capa `auth`), el endpoint de propuestas que exige sesión y liga el plan a la cuenta (capa `events`), y un aviso en la página del plan.

**Tech Stack:** Nuxt 4.5 con layers, Nuxt UI 4.11 (incluye `@nuxt/fonts`), Tailwind CSS 4, nuxt-auth-utils, nuxt-og-image 6 (renderer takumi), Drizzle.

**Spec:** `docs/superpowers/specs/2026-10-08-landing-identidad-design.md`

## Global Constraints

- Todo texto visible al usuario, en español. Los comentarios de código, en inglés, como en el resto del repo.
- Paleta: mango `#FFA51F` (primary), mango texto `#E58A00`, verde `#12A150` (success), verde texto `#0B7A3B` sobre `#E7F6EC`, tinta `#1C1917`, fondo `#FFFFFF`, superficie `#F5F5F4`.
- El texto sobre mango siempre es oscuro (`#2B1A00` / `mango-950`). Nunca blanco sobre mango.
- Tipografía: Manrope (400, 500, 700, 800). Títulos en 800 con `tracking-tight`.
- Wordmark: "MapMy" + "Trip", con "Trip" en `text-mango-600`.
- Precio: solo "Empieza gratis" / "Puedes empezar gratis". Sin cifras ni límites.
- Planes en grupo: crear, unirse, votar y cerrar no requieren cuenta. **Proponer planes con IA** y **crear un viaje** sí.
- El botón de la IA en `/e/[slug]` conserva su texto ("Proponer planes con IA" / "Proponer otros planes"). Sin sesión abre un aviso; no cambia de texto.
- La demo del hero es la misma en escritorio y móvil: un teléfono con la votación y la burbuja de WhatsApp flotando encima.
- Sin vitest ni otro framework de pruebas. La verificación es `pnpm lint`, `pnpm typecheck`, `pnpm build`, `curl` y el navegador.
- Estilo de código: comillas dobles y punto y coma en TS (como el resto del repo); `pnpm lint` corre con `--fix` en el pre-commit.

## Review Focus

1. **Ruta de regreso maliciosa:** `?redirect=//evil.com`, `/\evil.com`, `https://evil.com`, `/%09/evil.com`, `/\t/evil.com` o un array (`?redirect=a&redirect=b`) deben terminar en `/plans`, nunca en otro dominio. Lo cubre la Task 4, paso 6.
2. **Un plan con dueño, otra cuenta:** quien tenga el token de creador pero haya iniciado sesión con *otra* cuenta de Google que la guardada en `ownerSub` debe recibir 403 al generar, y el plan no cambia de dueño. Lo cubre la Task 5, paso 4.
3. **La sesión expira entre cargar la página y pulsar el botón:** el servidor responde 401 aunque el cliente creía tener sesión. Debe abrirse el aviso de login, no un toast de error genérico. Lo cubre la Task 6, paso 3.
4. **Contraste del mango:** `text-primary` (mango-500) sobre blanco tiene un contraste de ~2:1. El texto pequeño en mango usa `text-mango-600` o más oscuro, y los botones sólidos primary llevan texto oscuro. Lo cubre la Task 1, paso 5.
5. **Modo oscuro:** Nuxt UI respeta el modo oscuro del sistema. La landing usa clases semánticas (`bg-default`, `text-highlighted`, `text-muted`) para seguir siendo legible; solo la demo del teléfono tiene colores fijos. Lo cubre la Task 9, paso 5.

---

## Mapa de archivos

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `layers/base/app/assets/css/main.css` | Modificar | Escalas `mango`/`verde`, fuente Manrope, animación de aparición |
| `layers/base/app/app.config.ts` | Modificar | Colores de Nuxt UI y texto oscuro en botones primary |
| `layers/base/nuxt.config.ts` | Modificar | `lang="es"`, links de íconos en `head` |
| `layers/base/app/components/AppLogo.vue` | Crear | Ícono y wordmark del logo |
| `layers/base/app/assets/brand/icon-app.svg` | Crear | Fuente del ícono de app (fondo blanco) para los PNG |
| `public/favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` | Crear/reemplazar | Íconos del sitio |
| `layers/base/app/components/AppHeader.vue` | Modificar | Header en español con logo y anclas |
| `layers/auth/shared/utils/redirect.ts` | Crear | `safeRedirect()` y `AUTH_REDIRECT_COOKIE` |
| `layers/auth/app/composables/useGoogleLogin.ts` | Crear | Guardar la ruta de regreso e ir a Google |
| `layers/auth/app/pages/login.vue` | Modificar | Login en español con regreso |
| `layers/auth/app/middleware/auth.ts` | Modificar | Enviar `?redirect=` |
| `layers/auth/server/routes/auth/google.get.ts` | Modificar | Redirigir a la ruta guardada |
| `layers/events/server/api/events/[slug]/proposals.post.ts` | Modificar | Exigir sesión y ligar el plan a la cuenta |
| `layers/events/app/pages/e/[slug].vue` | Modificar | Aviso de login al pulsar el botón de la IA |
| `layers/events/app/components/OgImage/Event.takumi.vue` | Modificar | Vista previa de WhatsApp con la nueva marca |
| `layers/marketing/app/components/landing/*.vue` | Crear | Una sección de la landing por archivo |
| `layers/marketing/app/components/OgImage/Landing.takumi.vue` | Crear | Imagen para compartir la landing |
| `layers/marketing/app/pages/index.vue` | Reescribir | Arma las secciones y el SEO |

---

### Task 1: Tema de marca (colores, fuente, idioma)

**Files:**
- Modify: `layers/base/app/assets/css/main.css`
- Modify: `layers/base/app/app.config.ts`
- Modify: `layers/base/nuxt.config.ts`

**Interfaces:**
- Produces: utilidades de Tailwind `mango-50…950` y `verde-50…950` (por ejemplo `text-mango-600`, `bg-verde-50`); Nuxt UI `color="primary"` = mango y `color="success"` = verde; clase CSS `.reveal` para la aparición al hacer scroll; `font-sans` = Manrope.

- [ ] **Step 1: Escalas de color, fuente y animación en `main.css`**

Reemplaza el contenido de `layers/base/app/assets/css/main.css` por:

```css
@import "tailwindcss" theme(static);
@import "@nuxt/ui";

@source '../../../../';

@theme static {
  /* @nuxt/fonts (bundled with Nuxt UI) downloads Manrope from Google Fonts. */
  --font-sans: "Manrope", ui-sans-serif, system-ui, sans-serif;

  /* Brand mango: 500 is the primary, 600 is for text on white. */
  --color-mango-50: #fff8eb;
  --color-mango-100: #ffedcc;
  --color-mango-200: #ffd999;
  --color-mango-300: #ffc266;
  --color-mango-400: #ffb13d;
  --color-mango-500: #ffa51f;
  --color-mango-600: #e58a00;
  --color-mango-700: #b86a00;
  --color-mango-800: #8a5000;
  --color-mango-900: #5c3500;
  --color-mango-950: #2b1a00;

  /* Brand green: 500 is success, 700 on 50 for badges. */
  --color-verde-50: #e7f6ec;
  --color-verde-100: #cff0da;
  --color-verde-200: #a3e2b9;
  --color-verde-300: #6fcf91;
  --color-verde-400: #3bb86a;
  --color-verde-500: #12a150;
  --color-verde-600: #0e8a44;
  --color-verde-700: #0b7a3b;
  --color-verde-800: #0a5e2f;
  --color-verde-900: #084424;
  --color-verde-950: #042714;
}

/* Sections fade in as they scroll into view; no JS, and skipped for people
   who ask for less motion or browsers without scroll-driven animations. */
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .reveal {
      animation: reveal linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 35%;
    }
  }
}

@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
}
```

- [ ] **Step 2: Colores de Nuxt UI en `app.config.ts`**

Reemplaza `layers/base/app/app.config.ts` por:

```ts
export default defineAppConfig({
  title: "MapMyTrip",
  ui: {
    colors: {
      primary: "mango",
      success: "verde",
      neutral: "stone",
    },
    button: {
      // White on mango fails contrast; solid primary buttons use dark text.
      compoundVariants: [
        { color: "primary", variant: "solid", class: "text-mango-950" },
      ],
    },
  },
});
```

- [ ] **Step 3: Idioma del sitio en `layers/base/nuxt.config.ts`**

```ts
export default defineNuxtConfig({
  modules: ["@nuxt/ui"],
  css: ["#layers/base/app/assets/css/main.css"],
  app: {
    head: {
      htmlAttrs: { lang: "es" },
    },
  },
});
```

- [ ] **Step 4: Verificar compilación y tipos**

Run: `pnpm lint && pnpm typecheck`
Expected: sin errores.

- [ ] **Step 5: Verificar en el navegador**

Run: `pnpm dev` y abre `http://localhost:3000/`.
Expected:
- Los botones primary de la landing actual se ven mango con texto oscuro.
- En las DevTools, `<html lang="es">` y la fuente calculada del `body` es Manrope.
- Abre `/login`: el texto se ve en Manrope.

Si el botón primary sigue con texto blanco, la entrada de `compoundVariants` no se está fusionando con la de Nuxt UI. En ese caso quita `button` del paso 2 y agrega al final de `main.css` esta regla, que apunta a la combinación de clases que Nuxt UI usa en los botones sólidos primary (y en badges sólidos, que también deben ir con texto oscuro):

```css
/* Solid primary components render "bg-primary text-inverted"; white on mango
   fails contrast, so they get dark text instead. */
.bg-primary.text-inverted {
  color: var(--color-mango-950);
}
```

- [ ] **Step 6: Commit**

```bash
git add layers/base/app/assets/css/main.css layers/base/app/app.config.ts layers/base/nuxt.config.ts
git commit -m "feat(base): brand theme with mango and green palette and Manrope"
```

---

### Task 2: Logo e íconos del sitio

**Files:**
- Create: `layers/base/app/components/AppLogo.vue`
- Create: `layers/base/app/assets/brand/icon-app.svg`
- Create: `public/favicon.svg`, `public/apple-touch-icon.png`, `public/icon-192.png`, `public/icon-512.png`
- Replace: `public/favicon.ico`
- Modify: `layers/base/nuxt.config.ts`

**Interfaces:**
- Consumes: utilidades `text-mango-600` (Task 1).
- Produces: `<AppLogo :wordmark="boolean" variant="color" | "dark" | "light" :size="number" />`, auto-importado en todas las capas. `size` es el lado del ícono en px (por defecto 32). `wordmark` muestra "MapMyTrip" (por defecto `true`).

- [ ] **Step 1: Crear `AppLogo.vue`**

`layers/base/app/components/AppLogo.vue`:

```vue
<script setup lang="ts">
// The mark is a chat bubble whose tail pins a place; the green dot is the
// option the group picked. Variants keep it readable on any background.
const {
  variant = "color",
  size = 32,
  wordmark = true,
} = defineProps<{
  variant?: "color" | "dark" | "light";
  size?: number;
  wordmark?: boolean;
}>();

const fills = {
  color: { bubble: "#FFA51F", side: "#1C1917", middle: "#12A150" },
  dark: { bubble: "#1C1917", side: "#FFA51F", middle: "#12A150" },
  light: { bubble: "#FFFFFF", side: "#1C1917", middle: "#12A150" },
} as const;
const fill = computed(() => fills[variant]);
</script>

<template>
  <span class="inline-flex items-center gap-2">
    <svg
      :width="size"
      :height="size"
      viewBox="0 0 64 64"
      :aria-hidden="wordmark ? 'true' : undefined"
      :role="wordmark ? undefined : 'img'"
      :aria-label="wordmark ? undefined : 'MapMyTrip'"
      class="shrink-0"
    >
      <path
        d="M14 6h36a10 10 0 0 1 10 10v22a10 10 0 0 1-10 10H41l-9 12-9-12h-9A10 10 0 0 1 4 38V16A10 10 0 0 1 14 6z"
        :fill="fill.bubble"
      />
      <circle cx="19" cy="27" r="4.5" :fill="fill.side" />
      <circle cx="32" cy="27" r="4.5" :fill="fill.middle" />
      <circle cx="45" cy="27" r="4.5" :fill="fill.side" />
    </svg>
    <span
      v-if="wordmark"
      class="text-xl font-extrabold tracking-tight"
      :class="variant === 'light' ? 'text-white' : 'text-highlighted'"
    >
      MapMy<span class="text-mango-600">Trip</span>
    </span>
  </span>
</template>
```

- [ ] **Step 2: Crear `public/favicon.svg`** (fondo transparente)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <path d="M14 6h36a10 10 0 0 1 10 10v22a10 10 0 0 1-10 10H41l-9 12-9-12h-9A10 10 0 0 1 4 38V16A10 10 0 0 1 14 6z" fill="#FFA51F"/>
  <circle cx="19" cy="27" r="4.5" fill="#1C1917"/>
  <circle cx="32" cy="27" r="4.5" fill="#12A150"/>
  <circle cx="45" cy="27" r="4.5" fill="#1C1917"/>
</svg>
```

- [ ] **Step 3: Crear `layers/base/app/assets/brand/icon-app.svg`** (fondo blanco con margen, para iOS y Android)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <g transform="translate(96 96) scale(5)">
    <path d="M14 6h36a10 10 0 0 1 10 10v22a10 10 0 0 1-10 10H41l-9 12-9-12h-9A10 10 0 0 1 4 38V16A10 10 0 0 1 14 6z" fill="#FFA51F"/>
    <circle cx="19" cy="27" r="4.5" fill="#1C1917"/>
    <circle cx="32" cy="27" r="4.5" fill="#12A150"/>
    <circle cx="45" cy="27" r="4.5" fill="#1C1917"/>
  </g>
</svg>
```

- [ ] **Step 4: Generar los PNG y el `.ico`**

`sharp-cli` (libvips con soporte SVG) genera los PNG, y Pillow, que está en el venv `~/.venvs/design-skill`, genera el `.ico`. Ninguno se agrega como dependencia del proyecto.

```bash
SCRATCH=$(mktemp -d)
pnpm dlx sharp-cli -i layers/base/app/assets/brand/icon-app.svg -o public/apple-touch-icon.png resize 180 180
pnpm dlx sharp-cli -i layers/base/app/assets/brand/icon-app.svg -o public/icon-192.png resize 192 192
pnpm dlx sharp-cli -i layers/base/app/assets/brand/icon-app.svg -o public/icon-512.png resize 512 512
pnpm dlx sharp-cli -i public/favicon.svg -o "$SCRATCH/favicon-256.png" resize 256 256
~/.venvs/design-skill/bin/python -I -c "import sys; from PIL import Image; Image.open(sys.argv[1]).save(sys.argv[2], sizes=[(16,16),(32,32),(48,48)])" "$SCRATCH/favicon-256.png" public/favicon.ico
file public/*.png public/favicon.ico
```

Expected: `file` reporta `PNG image data, 180 x 180`, `192 x 192`, `512 x 512` y `MS Windows icon resource - 3 icons`.

- [ ] **Step 5: Declarar los íconos en `layers/base/nuxt.config.ts`**

```ts
export default defineNuxtConfig({
  modules: ["@nuxt/ui"],
  css: ["#layers/base/app/assets/css/main.css"],
  app: {
    head: {
      htmlAttrs: { lang: "es" },
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      ],
      meta: [{ name: "theme-color", content: "#FFA51F" }],
    },
  },
});
```

- [ ] **Step 6: Verificar**

Run: `pnpm lint && pnpm typecheck`, luego `pnpm dev`.
Expected: la pestaña muestra la burbuja mango (prueba con el navegador en modo claro y oscuro). Abre `http://localhost:3000/icon-512.png`: logo centrado sobre blanco, con margen.

- [ ] **Step 7: Commit**

```bash
git add layers/base/app/components/AppLogo.vue layers/base/app/assets/brand/icon-app.svg layers/base/nuxt.config.ts public/favicon.svg public/favicon.ico public/apple-touch-icon.png public/icon-192.png public/icon-512.png
git commit -m "feat(base): add MapMyTrip logo, favicon and app icons"
```

---

### Task 3: Header en español

**Files:**
- Modify: `layers/base/app/components/AppHeader.vue`

**Interfaces:**
- Consumes: `<AppLogo />` (Task 2); `useAuth()` → `{ loggedIn, userName, userPicture, logout }` (ya existe).
- Produces: anclas `#como-funciona` y `#viajes`, que la Task 9 usa como `id` de sus secciones.

- [ ] **Step 1: Reescribir `AppHeader.vue`**

```vue
<script lang="ts" setup>
import type { DropdownMenuItem } from "@nuxt/ui";

const route = useRoute();
const { loggedIn, userName, userPicture, logout } = useAuth();

// Section links only make sense on the landing, where the sections live.
const isLanding = computed(() => route.path === "/");

const userMenu = computed<DropdownMenuItem[]>(() => [
  { label: userName.value, type: "label", icon: "i-lucide-user" },
  { type: "separator" },
  { label: "Mis planes", icon: "i-lucide-list", to: "/plans" },
  { label: "Salir", icon: "i-lucide-log-out", onSelect: logout },
]);
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-default bg-default/80 backdrop-blur-md">
    <div class="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
      <NuxtLink to="/" aria-label="MapMyTrip, inicio">
        <AppLogo :size="30" />
      </NuxtLink>

      <nav class="flex items-center gap-1 sm:gap-2">
        <template v-if="isLanding">
          <UButton to="#como-funciona" variant="ghost" color="neutral" size="sm" class="hidden sm:inline-flex">
            Cómo funciona
          </UButton>
          <UButton to="#viajes" variant="ghost" color="neutral" size="sm" class="hidden sm:inline-flex">
            Viajes con IA
          </UButton>
        </template>

        <template v-if="loggedIn">
          <UButton to="/plans" variant="ghost" color="neutral" size="sm" icon="i-lucide-list">
            Mis planes
          </UButton>
          <UDropdownMenu :items="userMenu">
            <UAvatar :src="userPicture" :alt="userName" size="sm" class="cursor-pointer" />
          </UDropdownMenu>
        </template>
        <UButton v-else to="/login" variant="outline" color="neutral" size="sm">
          Entrar
        </UButton>
      </nav>
    </div>
  </header>
</template>
```

- [ ] **Step 2: Verificar**

Run: `pnpm lint && pnpm typecheck`, luego `pnpm dev`.
Expected:
- En `/`, a 1280 px: logo, "Cómo funciona", "Viajes con IA" y "Entrar". A 375 px: solo el logo y "Entrar", sin scroll horizontal.
- En `/e/new`: no aparecen las anclas.
- Con sesión iniciada: "Mis planes" y la foto, cuyo menú dice "Salir".

- [ ] **Step 3: Commit**

```bash
git add layers/base/app/components/AppHeader.vue
git commit -m "feat(base): Spanish header with new logo and landing anchors"
```

---

### Task 4: Login con regreso a la página de origen

**Files:**
- Create: `layers/auth/shared/utils/redirect.ts`
- Create: `layers/auth/app/composables/useGoogleLogin.ts`
- Modify: `layers/auth/app/pages/login.vue`
- Modify: `layers/auth/app/middleware/auth.ts`
- Modify: `layers/auth/server/routes/auth/google.get.ts`

**Interfaces:**
- Produces:
  - `safeRedirect(value: unknown, fallback?: string): string`, auto-importada en el cliente y el servidor (las capas auto-importan `shared/utils`, como `formatEventDate` en `events`).
  - `AUTH_REDIRECT_COOKIE: "auth-redirect"`.
  - `useGoogleLogin()` → `{ signInWithGoogle(redirectTo: unknown): Promise<void>, isRedirecting: Ref<boolean> }`. La Task 6 lo usa.

- [ ] **Step 1: Crear `layers/auth/shared/utils/redirect.ts`**

```ts
// Where to send someone after Google sign-in. Only a path on this site is
// accepted, so the login can't be used to bounce people to another domain.
export const AUTH_REDIRECT_COOKIE = "auth-redirect";

export function safeRedirect(value: unknown, fallback = "/plans"): string {
  if (typeof value !== "string" || !value.startsWith("/")) return fallback;
  // "//host" and "/\host" are protocol-relative to browsers; browsers also
  // drop tabs and newlines, so "/\t/host" would become "//host".
  if (/^\/[/\\]/.test(value) || /[\s\\]/.test(value)) return fallback;
  // Encoded variants ("/%2F/host", "/%09/host") are checked once decoded.
  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return fallback;
  }
  if (/^\/[/\\]/.test(decoded) || /[\s\\]/.test(decoded)) return fallback;
  return value;
}
```

- [ ] **Step 2: Crear `layers/auth/app/composables/useGoogleLogin.ts`**

```ts
// Remembers where to come back to and starts the Google OAuth flow; the
// callback (server/routes/auth/google.get.ts) reads the cookie.
export function useGoogleLogin() {
  const redirectCookie = useCookie<string | null>(AUTH_REDIRECT_COOKIE, {
    maxAge: 60 * 10,
    sameSite: "lax",
    path: "/",
  });
  const isRedirecting = ref(false);

  async function signInWithGoogle(redirectTo: unknown) {
    isRedirecting.value = true;
    redirectCookie.value = safeRedirect(redirectTo);
    // Let useCookie write document.cookie before leaving the page.
    await nextTick();
    await navigateTo("/auth/google", { external: true });
  }

  return { signInWithGoogle, isRedirecting };
}
```

- [ ] **Step 3: Reescribir `layers/auth/app/pages/login.vue`**

```vue
<script setup lang="ts">
definePageMeta({
  layout: false,
});

const route = useRoute();
const { loggedIn } = useAuth();
const { signInWithGoogle, isRedirecting } = useGoogleLogin();

useSeoMeta({
  title: "Entrar · MapMyTrip",
  robots: "noindex",
});

const redirectTo = safeRedirect(route.query.redirect);

if (loggedIn.value) {
  await navigateTo(redirectTo, { replace: true });
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-default p-4">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="flex flex-col items-center text-center">
          <NuxtLink to="/" aria-label="MapMyTrip, inicio">
            <AppLogo :size="40" />
          </NuxtLink>
          <h1 class="mt-6 text-2xl font-extrabold tracking-tight text-highlighted">
            Entra para continuar
          </h1>
          <p class="mt-2 text-muted">
            Entra para usar la IA y guardar tus planes.
          </p>
        </div>
      </template>

      <UButton
        color="neutral"
        variant="outline"
        size="lg"
        icon="i-simple-icons-google"
        block
        :loading="isRedirecting"
        @click="signInWithGoogle(redirectTo)"
      >
        {{ isRedirecting ? "Conectando con Google…" : "Continuar con Google" }}
      </UButton>

      <p class="mt-4 text-center text-xs text-dimmed">
        Tus amigos no necesitan cuenta para unirse a un plan y votar.
      </p>
    </UCard>
  </div>
</template>
```

- [ ] **Step 4: El middleware envía la ruta de origen** (`layers/auth/app/middleware/auth.ts`)

```ts
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession();

  if (!loggedIn.value) {
    return navigateTo({ path: "/login", query: { redirect: to.fullPath } });
  }
});
```

- [ ] **Step 5: El callback de Google usa la ruta guardada** (`layers/auth/server/routes/auth/google.get.ts`)

Reemplaza `return sendRedirect(event, "/plans");` y el `onError`:

```ts
    const redirectTo = safeRedirect(getCookie(event, AUTH_REDIRECT_COOKIE));
    deleteCookie(event, AUTH_REDIRECT_COOKIE, { path: "/" });
    return sendRedirect(event, redirectTo);
  },
  onError(event, error) {
    console.error("Google OAuth error:", error);
    deleteCookie(event, AUTH_REDIRECT_COOKIE, { path: "/" });
    return sendRedirect(event, "/login");
  },
});
```

- [ ] **Step 6: Verificar `safeRedirect` con casos reales**

No hay framework de pruebas, así que se comprueba con un script de un solo uso en el scratchpad que importa el archivo con `tsx`:

```bash
pnpm dlx tsx -e '
import { safeRedirect } from "./layers/auth/shared/utils/redirect.ts";
const cases: [unknown, string][] = [
  ["/e/k3x9tq2m", "/e/k3x9tq2m"],
  ["/trips?x=1#y", "/trips?x=1#y"],
  ["//evil.com", "/plans"],
  ["/\\evil.com", "/plans"],
  ["/\t/evil.com", "/plans"],
  ["/%09/evil.com", "/plans"],
  ["/%2F/evil.com", "/plans"],
  ["https://evil.com", "/plans"],
  ["javascript:alert(1)", "/plans"],
  ["e/abc", "/plans"],
  ["/%E0%A4%A", "/plans"],
  [["/a", "/b"], "/plans"],
  [undefined, "/plans"],
];
let failed = 0;
for (const [input, expected] of cases) {
  const got = safeRedirect(input);
  if (got !== expected) { failed++; console.log("FAIL", JSON.stringify(input), "→", got, "expected", expected); }
}
console.log(failed ? `${failed} failed` : "all passed");
process.exit(failed ? 1 : 0);
'
```

Expected: `all passed`.

- [ ] **Step 7: Verificar el flujo en el navegador**

Run: `pnpm lint && pnpm typecheck`, luego `pnpm dev`. Sin sesión:
1. Abre `/trips`: te lleva a `/login?redirect=/trips`.
2. Pulsa "Continuar con Google" y completa el login: regresas a `/trips`.
3. Cierra sesión, abre `/login?redirect=//evil.com` y entra: terminas en `/plans`.
4. Con sesión iniciada, abre `/login?redirect=/e/new`: te manda directo a `/e/new`.

- [ ] **Step 8: Commit**

```bash
git add layers/auth
git commit -m "feat(auth): return to the original page after Google sign-in"
```

---

### Task 5: Proponer planes con IA exige sesión

**Files:**
- Modify: `layers/events/server/api/events/[slug]/proposals.post.ts`

**Interfaces:**
- Consumes: `requireUserSession` (nuxt-auth-utils), `requireEventOwner` (ya existe en `layers/events/server/utils/event-owner.ts`).
- Produces: `POST /api/events/:slug/proposals` responde **401** sin sesión y **403** si el plan pertenece a otra cuenta. Un plan sin `ownerSub` queda ligado a `user.sub` antes de llamar a la IA. La Task 6 depende del 401.

- [ ] **Step 1: Exigir sesión y ligar el plan**

En `proposals.post.ts`, agrega `and` e `isNull` al import de drizzle y modifica el inicio del handler:

```ts
import { and, asc, eq, isNull } from "drizzle-orm";
import { EventSlugParamsSchema } from "../../../schemas";
import { generateProposals } from "../../../services/proposals.service";

// The creator asks the AI for 3 plans. Asking again replaces them and resets
// the votes, so it also works after more people join. Using the AI requires
// a Google account so every generation is tied to someone.
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event);
  const { slug } = await getValidatedRouterParams(
    event,
    EventSlugParamsSchema.parse
  );

  const db = useDb();
  const found = await db.query.events.findFirst({
    where: eq(tables.events.slug, slug),
  });

  if (!found) {
    throw createError({ statusCode: 404, statusMessage: "Event not found" });
  }
  await requireEventOwner(event, found);
  // The owner token alone isn't enough once the plan belongs to an account.
  if (found.ownerSub && found.ownerSub !== user.sub) {
    throw createError({
      statusCode: 403,
      statusMessage: "Only the event creator can do this",
    });
  }
  if (found.status === "closed") {
    throw createError({ statusCode: 409, statusMessage: "Event is closed" });
  }
```

Después de la comprobación `participants.length === 0` y **antes** de `const generated = await generateProposals(...)`, agrega:

```ts
  // Plans created signed out are claimed by the account that first uses the
  // AI on them, so they show up in "Mis planes".
  if (!found.ownerSub) {
    await db
      .update(tables.events)
      .set({ ownerSub: user.sub })
      .where(and(eq(tables.events.id, found.id), isNull(tables.events.ownerSub)));
  }
```

El resto del archivo (generación, transacción, 201) no cambia.

- [ ] **Step 2: Verificar tipos**

Run: `pnpm lint && pnpm typecheck`
Expected: sin errores.

- [ ] **Step 3: Sin sesión responde 401**

Con `pnpm dev` corriendo, crea un plan sin sesión desde `/e/new` y copia su slug de la URL:

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/events/<slug>/proposals
```

Expected: `401`.

- [ ] **Step 4: Otra cuenta responde 403**

Requiere dos cuentas de Google.
1. Crea un plan sin sesión, únete con un nombre desde una ventana privada y, con la cuenta A iniciada en la ventana original, ejecuta en la consola del navegador en `/e/<slug>`:

   ```js
   await fetch("/api/events/<slug>/proposals", {
     method: "POST",
     headers: { "x-owner-token": localStorage.getItem("mapmytrip:owner:<slug>") },
   }).then((r) => r.status);
   ```

   Expected: `201`.
2. Comprueba en la base de datos: `select owner_sub from map_my_trip_db.events where slug = '<slug>';` debe tener el `sub` de A.
3. Sal, entra con la cuenta B en el mismo navegador (el token de creador sigue en `localStorage`) y vuelve a ejecutar el mismo `fetch`.

Expected: `403`, y `owner_sub` sigue siendo el de A.

Si no tienes una segunda cuenta a mano, haz el paso 3 cambiando a mano `owner_sub` en la base de datos por otro valor y generando con tu cuenta. Debe dar 403.

- [ ] **Step 5: Commit**

```bash
git add "layers/events/server/api/events/[slug]/proposals.post.ts"
git commit -m "feat(events): require sign-in to generate AI proposals and claim the plan"
```

---

### Task 6: Aviso de login en la página del plan

**Files:**
- Modify: `layers/events/app/pages/e/[slug].vue`

**Interfaces:**
- Consumes: `useGoogleLogin()` → `{ signInWithGoogle, isRedirecting }` (Task 4); 401 de `POST /api/events/:slug/proposals` (Task 5); `useUserSession()` → `{ loggedIn }`.

- [ ] **Step 1: Estado del aviso en el `<script setup>`**

Después de `const toast = useToast();` agrega:

```ts
const { loggedIn } = useUserSession();
const { signInWithGoogle, isRedirecting } = useGoogleLogin();
// Using the AI needs an account; the button keeps its label and explains why.
const loginPromptOpen = ref(false);

function onProposeClick() {
  if (!loggedIn.value) {
    loginPromptOpen.value = true;
    return;
  }
  generateProposals();
}
```

- [ ] **Step 2: Un 401 también abre el aviso**

En `generateProposals()`, reemplaza el bloque `catch` por:

```ts
  } catch (generateError) {
    // The session can expire while the page is open.
    if ((generateError as { statusCode?: number }).statusCode === 401) {
      loginPromptOpen.value = true;
      return;
    }
    console.error("Error generating proposals:", generateError);
    toast.add({
      title: "No pudimos proponer planes",
      description: "Inténtalo de nuevo en un momento.",
      color: "error",
    });
  } finally {
```

- [ ] **Step 3: Conectar el botón y agregar el modal en el `<template>`**

En el `UButton` con `icon="i-lucide-sparkles"`, cambia `@click="generateProposals"` por `@click="onProposeClick"`. El texto del botón no cambia.

Justo antes de la etiqueta de cierre `</UContainer>` agrega:

```vue
    <UModal
      v-model:open="loginPromptOpen"
      title="Inicia sesión para usar la IA"
      description="Las propuestas se generan con IA, así que necesitamos saber quién las pide. Tus amigos siguen uniéndose y votando sin cuenta."
    >
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton variant="ghost" color="neutral" @click="loginPromptOpen = false">
            Ahora no
          </UButton>
          <UButton
            icon="i-simple-icons-google"
            :loading="isRedirecting"
            @click="signInWithGoogle(`/e/${slug}`)"
          >
            Continuar con Google
          </UButton>
        </div>
      </template>
    </UModal>
```

- [ ] **Step 4: Actualizar el comentario del token de creador**

En `layers/events/app/composables/useEventOwner.ts`, el comentario inicial dice que el token permite generar propuestas sin cuenta, lo que ya no es cierto. Cámbialo por:

```ts
// The creator's token for each event they made in this browser. It proves
// they created it (to close the vote, and with an account, to use the AI).
```

- [ ] **Step 5: Verificar el flujo completo**

Run: `pnpm lint && pnpm typecheck`, luego `pnpm dev`, sin sesión:
1. En `/e/new`, crea un plan sin sesión.
2. En otra ventana privada, abre el link y únete con un nombre.
3. En la ventana original, pulsa "Proponer planes con IA": se abre el aviso y el botón mantiene su texto.
4. "Ahora no" lo cierra. "Continuar con Google" → login → regresas a `/e/<slug>`.
5. Pulsa de nuevo "Proponer planes con IA": se generan las 3 propuestas.
6. Abre `/plans`: el plan aparece en tu lista.
7. Sesión expirada: con la página abierta y sesión iniciada, borra la cookie `nuxt-session` en las DevTools y pulsa el botón. Debe abrirse el aviso, no un toast de error.

- [ ] **Step 6: Commit**

```bash
git add "layers/events/app/pages/e/[slug].vue" layers/events/app/composables/useEventOwner.ts
git commit -m "feat(events): ask the creator to sign in before using the AI"
```

---

### Task 7: Vista previa de WhatsApp con la nueva marca

**Files:**
- Modify: `layers/events/app/components/OgImage/Event.takumi.vue` (solo el `<template>`; el `<script>` no cambia)

**Interfaces:**
- Consumes: datos ya calculados en el script: `event`, `title`, `titleSize`, `whereWhen`, `footer`, `peopleLabel`.

- [ ] **Step 1: Reemplazar el `<template>`**

```vue
<template>
  <div
    class="w-full h-full flex flex-col justify-between p-16"
    style="background-color: #FFA51F; font-family: Manrope; color: #1C1917"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <svg width="64" height="64" viewBox="0 0 64 64">
          <path
            d="M14 6h36a10 10 0 0 1 10 10v22a10 10 0 0 1-10 10H41l-9 12-9-12h-9A10 10 0 0 1 4 38V16A10 10 0 0 1 14 6z"
            fill="#1C1917"
          />
          <circle cx="19" cy="27" r="4.5" fill="#FFA51F" />
          <circle cx="32" cy="27" r="4.5" fill="#12A150" />
          <circle cx="45" cy="27" r="4.5" fill="#FFA51F" />
        </svg>
        <span class="ml-4 text-4xl font-extrabold" style="letter-spacing: -0.03em">
          MapMyTrip
        </span>
      </div>
      <span
        class="px-6 py-2 rounded-full text-2xl font-bold"
        style="background-color: #1C1917; color: #FFFFFF"
      >
        Plan en grupo
      </span>
    </div>

    <div v-if="event" class="flex flex-col">
      <h1
        class="leading-tight font-extrabold"
        :class="titleSize"
        style="line-clamp: 2; letter-spacing: -0.03em"
      >
        {{ title }}
      </h1>
      <p class="mt-6 text-4xl font-bold" style="line-clamp: 1; color: #2B1A00; opacity: 0.8">
        {{ truncate(whereWhen, 60) }}
      </p>
    </div>
    <h1
      v-else
      class="text-[84px] leading-none font-extrabold"
      style="letter-spacing: -0.03em"
    >
      Decidan juntos qué hacer
    </h1>

    <div
      v-if="event"
      class="flex items-center justify-between rounded-3xl bg-white px-10 py-6"
    >
      <span class="text-3xl font-extrabold" style="line-clamp: 1">
        {{ footer }}
      </span>
      <span class="ml-6 shrink-0 whitespace-nowrap text-3xl font-medium" style="color: #57534E">
        {{ peopleLabel }}
      </span>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Verificar la imagen**

Con `pnpm dev`, abre `/e/<slug>` de un plan existente y, en las DevTools, copia la URL de `og:image`. Ábrela.
Expected: fondo mango, logo oscuro, texto en Manrope y la misma información que antes (título, lugar y fecha, pie, personas).

Si el `<svg>` no se dibuja (takumi lo ignora), reemplázalo por `<img src="/favicon.svg" width="64" height="64" />` y vuelve a comprobar. Esa variante muestra el logo a color sobre mango; si se pierde la burbuja, crea `public/logo-dark.svg` con los colores de la variante `dark` de `AppLogo` y usa ese archivo.

Si la fuente no es Manrope, revisa la opción `fonts` de nuxt-og-image (`node_modules/nuxt-og-image/dist/module.d.mts`) y agrega `ogImage: { fonts: ["Manrope:400", "Manrope:700", "Manrope:800"] }` en `layers/events/nuxt.config.ts`.

- [ ] **Step 3: Commit**

```bash
git add layers/events/app/components/OgImage/Event.takumi.vue
git commit -m "feat(events): rebrand the WhatsApp link preview"
```

---

### Task 8: Hero de la landing con la demo

**Files:**
- Create: `layers/marketing/app/components/landing/PhoneDemo.vue`
- Create: `layers/marketing/app/components/landing/Hero.vue`

**Interfaces:**
- Consumes: `UButton` con `color="primary"` (mango, texto oscuro, Task 1); `eventBudgetOptions` en `layers/events/shared/constants/event-options.constant.ts` (Económico, Normal, Sin límite).
- Produces: `<LandingHero />` y `<LandingPhoneDemo />` (prefijo `Landing` por la carpeta `components/landing/`).

- [ ] **Step 1: Crear `PhoneDemo.vue`**

Colores fijos a propósito: representa la app en modo claro dentro de un teléfono, también cuando la página está en modo oscuro.

```vue
<script setup lang="ts">
import { eventBudgetOptions } from "~~/layers/events/shared/constants/event-options.constant";

// Sample data shaped like a real plan in voting; labels come from the app so
// the demo can't drift from what people will actually see.
const budget = (value: "low" | "medium" | "high") =>
  eventBudgetOptions.find((option) => option.value === value)?.label;

const proposals = [
  {
    title: "Café, cerro y atardecer",
    budget: budget("medium"),
    votes: 3,
    mine: true,
    steps: [
      { title: "Desayuno con vista al volcán", place: { name: "Café Sky", rating: "4.6", count: "1,203", price: "$$", recommended: true } },
      { title: "Subir al Cerro de la Cruz", place: null },
    ],
  },
  {
    title: "Mercado y ruinas",
    budget: budget("low"),
    votes: 1,
    mine: false,
    steps: [{ title: "Almuerzo en el mercado", place: null }],
  },
];
</script>

<template>
  <figure class="relative mx-auto w-full max-w-85 pt-10">
    <figcaption class="sr-only">
      Ejemplo: un plan compartido en WhatsApp y la página donde el grupo vota
      entre propuestas de la IA.
    </figcaption>

    <div aria-hidden="true">
      <!-- Phone with the voting page -->
      <div class="overflow-hidden rounded-[2.2rem] border-[7px] border-[#1C1917] bg-white text-[#1C1917] shadow-2xl">
        <div class="space-y-3 px-4 pb-5 pt-14">
          <div>
            <p class="text-lg font-extrabold tracking-tight">Sábado en Antigua</p>
            <p class="text-xs text-[#78716C]">Antigua Guatemala · sáb 14 oct</p>
          </div>
          <p class="text-sm font-bold">Voten por un plan</p>

          <div
            v-for="proposal in proposals"
            :key="proposal.title"
            class="rounded-xl border p-3"
            :class="proposal.mine ? 'border-2 border-[#FFA51F]' : 'border-[#E7E5E4]'"
          >
            <div class="flex items-start justify-between gap-2">
              <p class="text-sm font-extrabold">{{ proposal.title }}</p>
              <span class="shrink-0 rounded-md bg-[#FFF2DB] px-1.5 py-0.5 text-[10px] font-bold text-[#8A5000]">
                {{ proposal.budget }}
              </span>
            </div>
            <ol class="mt-2 space-y-1.5">
              <li v-for="(step, index) in proposal.steps" :key="step.title" class="flex gap-2">
                <span class="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#F5F5F4] text-[9px] font-bold">
                  {{ index + 1 }}
                </span>
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-semibold">{{ step.title }}</p>
                  <div v-if="step.place" class="mt-1 rounded-md border border-[#EEEEEE] px-2 py-1 text-[11px]">
                    <span class="font-bold">📍 {{ step.place.name }}</span>
                    <span v-if="step.place.recommended" class="ml-1 rounded bg-[#E7F6EC] px-1 text-[9px] font-bold text-[#0B7A3B]">
                      Recomendado
                    </span>
                    <p class="text-[#78716C]">⭐ {{ step.place.rating }} ({{ step.place.count }}) · {{ step.place.price }}</p>
                  </div>
                </div>
              </li>
            </ol>
            <div class="mt-2 flex items-center justify-between">
              <span class="text-[11px] text-[#78716C]">{{ proposal.votes === 1 ? "1 voto" : `${proposal.votes} votos` }}</span>
              <span
                class="rounded-md px-2 py-0.5 text-[11px] font-bold"
                :class="proposal.mine ? 'bg-[#FFA51F] text-[#2B1A00]' : 'border border-[#FFA51F] text-[#2B1A00]'"
              >
                {{ proposal.mine ? "✓ Tu voto" : "👍 Votar" }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Floating WhatsApp bubble with the link preview -->
      <div class="absolute left-0 top-0 w-[78%] -translate-x-2 rounded-xl bg-[#D9FDD3] p-1.5 shadow-xl sm:-translate-x-8">
        <div class="overflow-hidden rounded-lg">
          <div class="bg-[#FFA51F] p-3 text-[#2B1A00]">
            <div class="flex items-center justify-between text-[10px] font-extrabold">
              <span class="inline-flex items-center gap-1">
                <AppLogo variant="dark" :size="14" :wordmark="false" />
                MapMyTrip
              </span>
              <span class="rounded-full bg-[#1C1917] px-2 py-0.5 text-white">Plan en grupo</span>
            </div>
            <p class="mt-2 text-base font-extrabold leading-tight tracking-tight">Sábado en Antigua</p>
            <p class="text-[10px] font-semibold opacity-80">Antigua Guatemala · sáb 14 oct</p>
          </div>
          <div class="bg-[#F7F7F7] px-2 py-1 text-[10px] text-[#555555]">mapmytrip.app</div>
        </div>
        <p class="px-1 pt-1 text-[11px] text-[#111111]">voten aquí 👇</p>
      </div>
    </div>
  </figure>
</template>
```

- [ ] **Step 2: Crear `Hero.vue`**

```vue
<template>
  <section class="container mx-auto grid items-center gap-10 px-4 py-12 lg:grid-cols-2 lg:gap-16 lg:py-20">
    <div>
      <UBadge color="success" variant="subtle" size="lg" class="rounded-full">
        Planes en grupo con IA
      </UBadge>
      <h1 class="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight text-highlighted sm:text-5xl lg:text-6xl">
        Decidan juntos qué hacer,
        <span class="text-mango-600">sin perderse en el chat</span>
      </h1>
      <p class="mt-5 max-w-xl text-lg text-muted">
        Crea el plan y compártelo en WhatsApp. Cada quien dice cuánto puede
        gastar y qué le gustaría; la IA propone 3 planes con lugares reales y
        el grupo vota.
      </p>
      <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <UButton to="/e/new" size="xl" class="justify-center font-extrabold">
          Empieza gratis
        </UButton>
        <UButton
          to="/trips"
          variant="link"
          color="success"
          size="lg"
          trailing-icon="i-lucide-arrow-right"
          class="justify-center font-bold"
        >
          o planea un viaje
        </UButton>
      </div>
      <p class="mt-4 text-sm text-dimmed">
        Tus amigos se unen y votan sin crear cuenta
      </p>
    </div>

    <LandingPhoneDemo />
  </section>
</template>
```

- [ ] **Step 3: Montarlo temporalmente para revisarlo**

En `layers/marketing/app/pages/index.vue`, reemplaza el `<UPageHero ... />` por `<LandingHero />`. El resto de la página se reescribe en la Task 9.

- [ ] **Step 4: Verificar**

Run: `pnpm lint && pnpm typecheck`, luego `pnpm dev`.
Expected:
- A 1280 px: el texto a la izquierda y el teléfono a la derecha, con la burbuja asomando por la esquina superior izquierda.
- A 375 px: el texto, "Empieza gratis" visible sin scroll y el teléfono debajo, sin scroll horizontal (`document.documentElement.scrollWidth === innerWidth` en la consola debe dar `true`).
- "Empieza gratis" va a `/e/new`. "o planea un viaje" va a `/trips` y, sin sesión, pasa por el login con `redirect=/trips`.

- [ ] **Step 5: Commit**

```bash
git add layers/marketing/app/components/landing/PhoneDemo.vue layers/marketing/app/components/landing/Hero.vue layers/marketing/app/pages/index.vue
git commit -m "feat(marketing): group-plan hero with a voting demo"
```

---

### Task 9: Resto de la landing, SEO e imagen para compartir

**Files:**
- Create: `layers/marketing/app/components/landing/HowItWorks.vue`
- Create: `layers/marketing/app/components/landing/Features.vue`
- Create: `layers/marketing/app/components/landing/TripDemo.vue`
- Create: `layers/marketing/app/components/landing/Trips.vue`
- Create: `layers/marketing/app/components/landing/Faq.vue`
- Create: `layers/marketing/app/components/landing/FinalCta.vue`
- Create: `layers/marketing/app/components/landing/Footer.vue`
- Create: `layers/marketing/app/components/OgImage/Landing.takumi.vue`
- Rewrite: `layers/marketing/app/pages/index.vue`

**Interfaces:**
- Consumes: `<LandingHero />` (Task 8), `<AppLogo />` (Task 2), clase `.reveal` (Task 1), anclas `#como-funciona` y `#viajes` (Task 3).

- [ ] **Step 1: `HowItWorks.vue`**

```vue
<script setup lang="ts">
const steps = [
  { icon: "i-lucide-map-pin-plus", title: "Crea el plan", description: "Qué, dónde y cuándo." },
  { icon: "i-simple-icons-whatsapp", title: "Compártelo en WhatsApp", description: "Cada quien dice su presupuesto y sus gustos, sin cuenta." },
  { icon: "i-lucide-vote", title: "La IA propone, el grupo vota", description: "Tres opciones con lugares reales; tú cierras la decisión." },
];
</script>

<template>
  <section id="como-funciona" class="scroll-mt-20 bg-elevated/50 py-16 lg:py-24">
    <div class="container mx-auto px-4">
      <h2 class="reveal text-center text-3xl font-extrabold tracking-tight text-highlighted sm:text-4xl">
        De “¿qué hacemos?” a plan cerrado en 3 pasos
      </h2>
      <ol class="mt-12 grid gap-6 md:grid-cols-3">
        <li
          v-for="(step, index) in steps"
          :key="step.title"
          class="reveal rounded-2xl border border-default bg-default p-6"
        >
          <div class="flex items-center gap-3">
            <span class="flex size-9 items-center justify-center rounded-full bg-primary font-extrabold text-mango-950">
              {{ index + 1 }}
            </span>
            <UIcon :name="step.icon" class="size-6 text-verde-600" />
          </div>
          <h3 class="mt-4 text-lg font-extrabold text-highlighted">{{ step.title }}</h3>
          <p class="mt-1 text-muted">{{ step.description }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>
```

- [ ] **Step 2: `Features.vue`**

```vue
<script setup lang="ts">
// Wide cards span two columns on large screens to break the grid rhythm.
const features = [
  { icon: "i-lucide-map-pinned", title: "Propuestas con lugares reales", description: "Basadas en Google Places y en lugares que recomendamos, no en inventos de la IA.", wide: true },
  { icon: "i-lucide-chart-bar", title: "Votación en vivo", description: "Ves quién votó y qué va ganando." },
  { icon: "i-simple-icons-whatsapp", title: "Link con vista previa", description: "Llega a WhatsApp con título, lugar y fecha." },
  { icon: "i-lucide-wallet", title: "El presupuesto de cada quien", description: "La IA toma en cuenta cuánto puede gastar cada persona y qué le gustaría." },
  { icon: "i-lucide-calendar-check", title: "Lugar y fecha exactos", description: "Eliges el sitio en el mapa y el día." },
  { icon: "i-lucide-list", title: "Mis planes", description: "Tus viajes guardados y los planes de tus grupos, en un solo lugar.", wide: true },
];
</script>

<template>
  <section class="py-16 lg:py-24">
    <div class="container mx-auto px-4">
      <h2 class="reveal text-center text-3xl font-extrabold tracking-tight text-highlighted sm:text-4xl">
        Todo lo que hace por tu grupo
      </h2>
      <div class="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="reveal rounded-2xl bg-elevated/60 p-6"
          :class="{ 'lg:col-span-2': feature.wide }"
        >
          <UIcon :name="feature.icon" class="size-7 text-mango-600" />
          <h3 class="mt-4 font-extrabold text-highlighted">{{ feature.title }}</h3>
          <p class="mt-1 text-sm text-muted">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
```

Nota: verifica que los íconos existen en el set local de lucide (`ls node_modules/@iconify-json/lucide` y `grep -o '"map-pinned"\|"chart-bar"\|"wallet"\|"calendar-check"\|"vote"\|"map-pin-plus"' node_modules/@iconify-json/lucide/icons.json | sort -u`). Si alguno falta, usa el más cercano que sí exista (por ejemplo `i-lucide-bar-chart-3` o `i-lucide-map-pin`).

- [ ] **Step 3: `TripDemo.vue` y `Trips.vue`**

`TripDemo.vue` (colores fijos, como la demo del hero):

```vue
<script setup lang="ts">
const days = [
  { day: "Día 1", items: ["Llegada y paseo por el Arco", "Cena en el centro"] },
  { day: "Día 2", items: ["Lancha a San Juan La Laguna", "Atardecer en Panajachel"] },
];
// Pin positions on the stylised map, in percent.
const pins = [
  { top: "28%", left: "30%" },
  { top: "52%", left: "58%" },
  { top: "70%", left: "38%" },
];
</script>

<template>
  <div
    class="grid gap-4 rounded-3xl border border-default bg-white p-4 text-[#1C1917] shadow-xl sm:grid-cols-2"
    role="img"
    aria-label="Ejemplo de itinerario de dos días con sus lugares en el mapa"
  >
    <div class="space-y-3" aria-hidden="true">
      <div v-for="day in days" :key="day.day" class="rounded-xl bg-[#F5F5F4] p-3">
        <p class="text-xs font-extrabold text-[#E58A00]">{{ day.day }}</p>
        <ul class="mt-1 space-y-1 text-sm">
          <li v-for="item in day.items" :key="item" class="flex gap-2">
            <span class="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#12A150]" />
            {{ item }}
          </li>
        </ul>
      </div>
    </div>
    <div class="relative min-h-48 overflow-hidden rounded-xl bg-[#E7F6EC]" aria-hidden="true">
      <div class="absolute inset-x-0 top-1/2 h-10 -rotate-12 bg-[#CFE3F5]" />
      <span
        v-for="(pin, index) in pins"
        :key="index"
        class="absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#FFA51F] text-xs font-extrabold text-[#2B1A00] shadow"
        :style="pin"
      >
        {{ index + 1 }}
      </span>
    </div>
  </div>
</template>
```

`Trips.vue`:

```vue
<template>
  <section id="viajes" class="scroll-mt-20 bg-elevated/50 py-16 lg:py-24">
    <div class="container mx-auto grid items-center gap-10 px-4 lg:grid-cols-2">
      <div class="reveal">
        <UBadge color="primary" variant="subtle" size="lg" class="rounded-full">
          Viajes con IA
        </UBadge>
        <h2 class="mt-4 text-3xl font-extrabold tracking-tight text-highlighted sm:text-4xl">
          ¿Viaje más largo? Tu itinerario día por día
        </h2>
        <p class="mt-4 text-lg text-muted">
          Cuéntanos la duración, quiénes viajan, el estilo y el presupuesto, y
          recibe un itinerario con cada actividad en el mapa.
        </p>
        <UButton to="/trips" size="lg" class="mt-8 font-extrabold">
          Planear un viaje
        </UButton>
      </div>
      <LandingTripDemo class="reveal" />
    </div>
  </section>
</template>
```

- [ ] **Step 4: `Faq.vue`, `FinalCta.vue` y `Footer.vue`**

`Faq.vue`:

```vue
<script setup lang="ts">
import type { AccordionItem } from "@nuxt/ui";

const items: AccordionItem[] = [
  { label: "¿Mis amigos necesitan cuenta?", content: "No. Se unen y votan desde el link que compartes." },
  { label: "¿Por qué me pide entrar con Google?", content: "Para usar la IA (proponer planes o crear un viaje) y guardar tus planes en tu cuenta." },
  { label: "¿Cuánto cuesta?", content: "Puedes empezar gratis." },
  { label: "¿De dónde salen los lugares?", content: "De Google Places y de lugares que recomendamos." },
];
</script>

<template>
  <section class="py-16 lg:py-24">
    <div class="container mx-auto max-w-3xl px-4">
      <h2 class="reveal text-center text-3xl font-extrabold tracking-tight text-highlighted sm:text-4xl">
        Antes de empezar
      </h2>
      <UAccordion :items="items" class="reveal mt-10" />
    </div>
  </section>
</template>
```

`FinalCta.vue`:

```vue
<template>
  <section class="bg-[#1C1917] py-16 text-center lg:py-24">
    <div class="container mx-auto px-4">
      <h2 class="reveal text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        El próximo plan del grupo empieza aquí
      </h2>
      <UButton to="/e/new" size="xl" class="mt-8 font-extrabold">
        Empieza gratis
      </UButton>
    </div>
  </section>
</template>
```

`Footer.vue`:

```vue
<template>
  <footer class="border-t border-default">
    <div class="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
      <AppLogo :size="24" />
      <p class="text-sm text-muted">© {{ new Date().getFullYear() }} MapMyTrip</p>
      <UButton
        icon="i-simple-icons-github"
        color="neutral"
        variant="ghost"
        to="https://github.com/Kevin-Curruchich/map-my-trip"
        target="_blank"
        aria-label="GitHub"
      />
    </div>
  </footer>
</template>
```

- [ ] **Step 5: Imagen para compartir y página final**

`layers/marketing/app/components/OgImage/Landing.takumi.vue`:

```vue
<template>
  <div
    class="w-full h-full flex flex-col justify-between p-16"
    style="background-color: #FFA51F; font-family: Manrope; color: #1C1917"
  >
    <div class="flex items-center">
      <svg width="72" height="72" viewBox="0 0 64 64">
        <path
          d="M14 6h36a10 10 0 0 1 10 10v22a10 10 0 0 1-10 10H41l-9 12-9-12h-9A10 10 0 0 1 4 38V16A10 10 0 0 1 14 6z"
          fill="#1C1917"
        />
        <circle cx="19" cy="27" r="4.5" fill="#FFA51F" />
        <circle cx="32" cy="27" r="4.5" fill="#12A150" />
        <circle cx="45" cy="27" r="4.5" fill="#FFA51F" />
      </svg>
      <span class="ml-4 text-5xl font-extrabold" style="letter-spacing: -0.03em">MapMyTrip</span>
    </div>
    <h1 class="text-[88px] leading-none font-extrabold" style="letter-spacing: -0.035em">
      Decidan juntos qué hacer
    </h1>
    <p class="text-4xl font-bold" style="color: #2B1A00">
      Planes en grupo con IA · se vota desde WhatsApp
    </p>
  </div>
</template>
```

Si en la Task 7 el `<svg>` no se dibujó en takumi, aplica aquí la misma alternativa con `<img>`.

`layers/marketing/app/pages/index.vue`:

```vue
<script setup lang="ts">
useSeoMeta({
  title: "MapMyTrip · Decidan juntos qué hacer",
  description:
    "Crea un plan, compártelo en WhatsApp y la IA propone opciones con lugares reales. El grupo vota y tú cierras la decisión.",
  ogTitle: "MapMyTrip · Decidan juntos qué hacer",
  ogDescription:
    "Planes en grupo con IA: la IA propone, el grupo vota desde WhatsApp.",
});

defineOgImage("Landing");
</script>

<template>
  <div>
    <LandingHero />
    <LandingHowItWorks />
    <LandingFeatures />
    <LandingTrips />
    <LandingFaq />
    <LandingFinalCta />
    <LandingFooter />
  </div>
</template>
```

- [ ] **Step 6: Verificar la landing completa**

Run: `pnpm lint && pnpm typecheck && pnpm build`
Expected: los tres sin errores.

Luego, con `pnpm dev`:
- A 375 px y a 1280 px: todas las secciones en orden, sin scroll horizontal (`document.documentElement.scrollWidth === innerWidth` → `true` en ambos anchos).
- En el header, "Cómo funciona" y "Viajes con IA" bajan a su sección sin quedar tapadas por el header (`scroll-mt-20`).
- Las preguntas frecuentes se abren y cierran.
- Con "Emular prefers-reduced-motion: reduce" en las DevTools (Rendering), las secciones aparecen sin animación.
- Con el sistema en modo oscuro, el texto sigue siendo legible en todas las secciones. Las demos mantienen su aspecto claro a propósito.
- La URL de `og:image` de `/` muestra la imagen mango con "Decidan juntos qué hacer".
- No queda texto en inglés en la landing ni en el header (`grep -rnE "Sign|Get Started|Why|Plan Your" layers/marketing layers/base` no devuelve nada).

- [ ] **Step 7: Commit**

```bash
git add layers/marketing
git commit -m "feat(marketing): full Spanish landing with features, trips, FAQ and share image"
```

---

### Task 10: Verificación final contra el spec

**Files:** ninguno (solo verificación; si algo falla, se corrige en la tarea correspondiente y se hace un commit aparte).

- [ ] **Step 1: Checks de compilación**

Run: `pnpm lint && pnpm typecheck && pnpm build`
Expected: sin errores.

- [ ] **Step 2: Recorrido de la lista de verificación del spec**

Recorre, con `pnpm dev` y en este orden, cada punto de "Verificación" del spec (`docs/superpowers/specs/2026-10-08-landing-identidad-design.md`):
1. Landing, `/login`, `/e/new` y `/e/[slug]` a 375 px y a 1280 px, sin scroll horizontal.
2. El flujo completo de login antes de la IA (los pasos de la Task 6, paso 4).
3. `curl` sin sesión a `/api/events/<slug>/proposals` → `401`.
4. `/login?redirect=https://evil.com` y `/login?redirect=//evil.com` → `/plans` después de entrar.
5. Favicon en pestañas claras y oscuras; vista previa del link de un plan con el diseño nuevo.
6. `/trips` sin sesión pasa por el login y regresa a `/trips`.

Expected: todos se cumplen. Anota cualquier desviación y corrígela antes de dar la rama por terminada.
