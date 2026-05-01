# Tavrik

An opinionated chat bot interface with tool calling, model selections, and prompts.

## Project Structure

- `src/ui/` — Astro frontend (`@tavrik/ui`)
- `src/lib/` — Shared library (`@tavrik/lib`) — database (Kysely), logger (Pino), provider layer, chat handler
  - `database/` — Kysely setup, migrations, helpers, generated types, overrides
  - `provider/` — LLM provider abstraction (base, openai, anthropic, google, openrouter, openai-compatible, mistral)
  - `chat-handler/` — Conversation management, system prompt composition, rolling summaries
  - `consts/` — Provider model definitions and seed data
- `src/telegram/` — Telegram bot
- `docker/` — Dockerfiles and compose configs
- `scripts/` — Development utility scripts

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
- `pnpm test` — run all tests (vitest, unit + database)
- `pnpm test:unit` — run unit tests only
- `pnpm test:database` — run database tests only
- `pnpm types-check` — typescript type checking
- `pnpm dev:db` — start postgres, run migrations, and generate types
- `pnpm dev:db:down` — stop postgres
- `pnpm db:codegen` — run migrations + kysely-codegen (types from DB schema)
- `pnpm db:regen` — full cycle: start db, codegen, run tests, migrate down, stop db

## Conventions

- **Commits**: use conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`)
- **Language**: all code, comments, commits, and docs in English
- **Dependencies**: always pinned (no `^` or `~`), shared versions via pnpm catalog
- **Logging**: always use `@tavrik/lib/logger` (pino) — never `console.log`
- **Database**: always use Kysely — raw SQL only via `sql` template tag for DDL (schemas, triggers, comments, custom types)
- **Database types**: use `Kysely<Record<string, never>>` in migrations (not `any`), `Selectable<>` for unwrapping query results
- **Database schemas**: each domain gets its own Postgres schema (provider, personas, chats, system); codegen uses `--default-schema public` with `--include-pattern *.*` for prefixed types
- **Tests**: write tests when they add value, not for every change; database tests use `.test.database.ts`, unit tests use `.test.unit.ts`
- **Workflow**: working on main branch directly (solo dev for now)

## Tooling

- **Runtime**: Node 24+
- **Package manager**: pnpm 10 (via corepack)
- **Linter/Formatter**: Biome
- **Test runner**: Vitest
- **Versioning**: Changesets
- **Git hooks**: Husky
- **Dependency updates**: Renovate
