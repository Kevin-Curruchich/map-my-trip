# MapMyTrip

Is an innovative web application designed to transform how users plan and organize their travels. Developed with Nuxt 3 and leveraging the power of Google Maps Platform and Google Places API, MapMyTrip offers an intuitive and highly personalized experience for the modern traveler.

At its core, MapMyTrip is an intelligent travel planning assistant. It allows users to define their destinations and set their preferences (such as interests, cuisine types, budget, or desired activities). Based on this information, the application generates optimized route suggestions, relevant points of interest, restaurant options, tourist attractions, and accommodations, all interactively visualized on a map.

## Key Features:

- Interactive Route Planning: Visualize and adjust routes directly on the map, with smart suggestions based on traffic and distance.
- Personalized Place Discovery: Find restaurants, attractions, hotels, and more, filtered by your preferences and supported by detailed information (reviews, opening hours, photos) from Google Places.
- Itinerary Management: Organize your trip days, add custom events, and manage your bookings within the application.
- Google Services Integration: Potential for future expansion to sync events with Google Calendar or generate Google Meet links for coordinating with travel companions.
- Intuitive User Interface: A clean and responsive design that makes planning easy from any device.

## Benefits of Using MapMyTrip

- Saves Time and Effort: Eliminates the need to jump between multiple websites and applications to research and organize a trip. All information and planning are centralized in one place.
- Optimized Planning: Intelligent suggestions and route visualization help create efficient itineraries, minimizing travel times and maximizing the experience.
- Personalized Discovery: By considering user preferences, MapMyTrip reveals hidden gems and experiences that truly align with the traveler's interests, beyond obvious tourist spots.
- Reduces Stress: The clarity and organization provided by the application decrease the anxiety associated with planning complex trips, allowing travelers to enjoy the process more.
- Flexibility: Allows for quick and easy adjustments to the itinerary on the fly, ideal for adapting to unforeseen circumstances or changes in plans.

## Tech stack

- [Nuxt 4](https://nuxt.com) with [layers](https://nuxt.com/docs/guide/going-further/layers) (`base`, `auth`, `marketing`, `trips`, `events`)
- [Nuxt UI 4](https://ui.nuxt.com) + Tailwind CSS 4
- [LangGraph](https://langchain-ai.github.io/langgraphjs/) + OpenAI for trip generation
- Google Places API (New) and Google Maps JavaScript API
- Postgres with [Drizzle ORM](https://orm.drizzle.team); migrations live in `layers/events/server/database/migrations` and run on server start (`pnpm db:generate` after changing the schema)
- [nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils) for Google OAuth
- Deployed on Google Cloud Run ([setup guide](docs/deploy-cloud-run.md))

## Setup

Requires Node.js 24 (see `.nvmrc`) and pnpm.

```bash
pnpm install
```

Create a `.env.dev` file with:

```bash
NUXT_SESSION_PASSWORD=          # at least 32 characters
NUXT_OAUTH_GOOGLE_CLIENT_ID=
NUXT_OAUTH_GOOGLE_CLIENT_SECRET=
NUXT_OAUTH_GOOGLE_REDIRECT_URL= # e.g. http://localhost:3000/auth/google
NUXT_OPENAI_API_KEY=
NUXT_GOOGLE_PLACES_API_KEY=
NUXT_DATABASE_URL=             # Postgres, e.g. postgresql://postgres:postgres@localhost:5432/mapmytrip
NUXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NUXT_PUBLIC_GOOGLE_MAPS_MAP_ID= # optional
```

> All values are read at runtime, so the same build works in every environment.

## Scripts

```bash
pnpm dev        # development server on http://localhost:3000
pnpm build      # production build (Node server in .output/)
pnpm preview    # preview the production build
pnpm lint       # eslint --fix
pnpm typecheck  # vue-tsc via nuxt typecheck
```
