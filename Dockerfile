# syntax=docker/dockerfile:1

ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-slim AS build
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts

COPY . .
RUN pnpm build

# The Nitro output is self-contained: no node_modules needed at runtime.
FROM node:${NODE_VERSION}-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=8080 \
    MIGRATIONS_DIR=/app/migrations
COPY --from=build --chown=node:node /app/.output ./.output
# Applied on server start by layers/events/server/plugins/migrations.ts.
COPY --from=build --chown=node:node /app/layers/events/server/database/migrations ./migrations
USER node
EXPOSE 8080
CMD ["node", ".output/server/index.mjs"]
