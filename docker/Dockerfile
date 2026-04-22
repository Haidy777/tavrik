FROM node:24.15.0-alpine AS deps

WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY src/ui/package.json src/ui/package.json
COPY src/lib/package.json src/lib/package.json
COPY src/telegram/package.json src/telegram/package.json
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

FROM node:24.15.0-alpine AS build

WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY src/ui/package.json src/ui/package.json
COPY src/lib/package.json src/lib/package.json
COPY src/telegram/package.json src/telegram/package.json
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:24.15.0-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/src/ui/dist ./dist
COPY --from=build /app/package.json ./

EXPOSE 4321

CMD ["node", "dist/server/entry.mjs"]
