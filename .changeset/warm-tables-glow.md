---
"@tavrik/lib": minor
---

Add database foundation with Kysely migrations, codegen, and provider integration

- Database setup: Kysely migrations with helpers (`createTable`, `withPrimaryKey`, `withTimestamps`, `addComment`, auto `updated_at` trigger), codegen config with multi-schema support (`provider`, `personas`, `chats`, `system`), and typed DB overrides for JSONB columns
- Migration scripts: `db:migrate`, `db:migrate:down`, `db:codegen`, `db:regen` workflow with Docker Compose health checks
- Schema: providers/models with enum types and seed data, personas with modifiers and user profiles, chat conversations/messages with token tracking and generated columns, system settings with typed `SettingsMap`
- Provider layer: abstract `BaseLLMProvider` with OpenAI implementation, provider registry with hot caching, capability checks
- Chat handler: conversation management with system prompt composition from personas, modifiers, and user profiles
- Testing: Vitest projects setup (unit/database), migration tests with `tsx/esm` loader for Kysely's `FileMigrationProvider`
- Environment: centralized `env.ts` with dotenv loading, CamelCasePlugin for Kysely

**AI assistance (Claude Code, claude-opus-4-6):** Database migration helpers and structure, Kysely codegen configuration (multi-schema, camelCase, config file setup), Vitest project setup with `tsx/esm` for dynamic imports, Docker Compose health check (`--wait`), provider registry architecture, type fixes (`Selectable<>` unwrapping, `Record<string, never>` for migrations, `Omit`-based DB overrides), and general TypeScript/Kysely/Postgres guidance throughout.

_Changeset created with help from Claude_
