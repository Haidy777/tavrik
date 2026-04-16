# Tavrik

An opinionated chat bot interface with tool calling, model selections, and prompts.

## Project Structure

- `src/ui/` — Astro frontend (`@tavrik/ui`)
- `src/lib/` — Shared library (`@tavrik/lib`) — database (Kysely), logger (Pino)
- `src/telegram/` — Telegram bot (planned)
- `docker/` — Dockerfiles and compose configs

This is a pnpm workspace monorepo. Each package in `src/` has its own `package.json`.

## Development

```bash
corepack enable
pnpm install
pnpm dev:db        # start postgres via docker compose
pnpm dev:ui        # start astro dev server
```

## Key Commands

- `pnpm build` — build all packages
- `pnpm lint` / `pnpm lint:fix` — biome linting
- `pnpm test` — run tests (vitest)
- `pnpm types-check` — typescript type checking
- `pnpm db:codegen` — generate types from database schema
- `pnpm dev:db` / `pnpm dev:db:down` — manage dev postgres

## Conventions

- **Commits**: use conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`)
- **Language**: all code, comments, commits, and docs in English
- **Dependencies**: always pinned (no `^` or `~`), shared versions via pnpm catalog
- **Logging**: always use `@tavrik/lib/logger` (pino) — never `console.log`
- **Database**: always use Kysely — no raw SQL
- **Tests**: write tests when they add value, not for every change
- **Workflow**: working on main branch directly (solo dev for now)

## Tooling

- **Runtime**: Node 24+
- **Package manager**: pnpm 10 (via corepack)
- **Linter/Formatter**: Biome
- **Test runner**: Vitest
- **Versioning**: Changesets
- **Git hooks**: Husky
- **Dependency updates**: Renovate
