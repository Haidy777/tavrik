# @tavrik/lib

## 0.6.0

### Minor Changes

- d74dbb8: Add rolling conversation summaries with bilingual prompt templates (EN/DE), usage tracking migration, and automatic model loading on Astro build. Summaries are generated when message count exceeds a configurable threshold, with cumulative updates for ongoing conversations.

  **AI assistance (Claude Code, claude-opus-4-6):** Wrote English translations for all summary prompt templates. Fixed TypeScript errors with Kysely `Selectable<>` types vs raw `ColumnType` wrappers. Identified and fixed array-to-string coercion bug (`.join('')`), wrong model ID passed to `sendMessage` (`summaryModel.name` → `summaryModel.id`), redundant DB query replaced with in-memory filtering, message ordering issue (`desc` → `asc`), and user message double-counting in summary input. Designed `SummaryResult` return type to control which messages get sent to the LLM. Added `astro:build:done` hooks for production support. Removed unnecessary model DB lookup in auto-summarize since `rollingSummaryModelId` is already a DB ID.

  _Changeset created with help from Claude_

## 0.5.0

### Minor Changes

- 7e575d5: Add dynamic model listing with capabilities parsing for all providers (OpenAI, Anthropic, Google, Mistral, OpenRouter), unique constraint on provider models, expanded model capabilities enum (citation, thinking, stt), and auto-load models on startup via Astro integration and Telegram bot

  **AI assistance (Claude Code, claude-opus-4-6):** Researched SDK pagination patterns across all providers (Anthropic async iterable, Google Pager, Mistral plain array, OpenAI async iterable, OpenRouter plain response). Helped resolve TypeScript errors: `Promise<Pager>` needing await before iteration, discriminated union narrowing for Mistral's `ModelListData`, and `private` to `protected` visibility for OpenAI client inheritance. Identified Mistral duplicate model IDs and suggested `Set`-based deduplication. Mapped provider-specific capability fields to unified enum. Fixed pino-pretty blocking WebStorm debugger using `node:inspector` URL check.

  _Changeset created with help from Claude_

## 0.4.0

### Minor Changes

- bcabf26: Add Mistral as a native LLM provider with API key support, database migration, and provider registry integration

  **AI assistance (Claude Code, claude-opus-4-6):** Created changeset for the Mistral provider addition. Flagged unpinned dependency version (`^2.2.1`) violating project conventions.

  _Changeset created with help from Claude_

## 0.3.0

### Minor Changes

- 7da9114: Add OpenAI-compatible and OpenRouter provider implementations with dynamic API key resolution, refactor OpenAI provider to extend the compatible base, and introduce module-scoped loggers

  **AI assistance (Claude Code, claude-opus-4-6):** Resolved TypeScript generic type errors in the provider registry by applying `as unknown as P` double-cast pattern for runtime provider lookups returning generic `BaseLLMProvider` subtypes.

  _Changeset created with help from Claude_

## 0.2.0

### Minor Changes

- 0ef7a8a: Add Telegram bot with authenticated message handling, Docker dev setup, and shared env config for bot token and user ID

  **AI assistance (Claude Code, claude-opus-4-6):** Fixed table name typo (`conversations.conversations` → `chats.conversations`), Kysely camelCase column name (`created_at` → `createdAt`), added `.js` extensions for Node16 module resolution, set up `@tavrik/telegram` package with workspace dependency and `"type": "module"`, moved `dotenv` and `grammy` to correct workspace packages with pinned versions, created `Dockerfile.telegram` after debugging platform-specific esbuild binary issues with bind-mounted `node_modules`, resolved Docker Compose `DATABASE_URL` interpolation by using `$$` escaping to defer variable expansion to the container shell.

  _Changeset created with help from Claude_

- dc1f962: Add Anthropic and Google GenAI provider implementations with dedicated SDKs
  - Anthropic provider using `@anthropic-ai/sdk` with thinking block support
  - Google provider using `@google/genai` with Gemini content format mapping
  - Updated provider registry to route to new providers
  - Fixed `migrateDown` to revert all migrations using `NO_MIGRATIONS`
  - Added new model seed data for Anthropic and Google models

  **AI assistance (Claude Code, claude-opus-4-6):** Google GenAI SDK guidance (content format with `role: 'model'`, `parts`, `systemInstruction`), token usage metadata field mapping (`promptTokenCount`/`candidatesTokenCount`), Anthropic model ID format (`claude-haiku-4-5-20251001`), fixing `migrateDown` to use `migrator.migrateTo(NO_MIGRATIONS)` for full teardown, and advising to skip xAI dedicated SDK in favor of openai-compatible provider.

  _Changeset created with help from Claude_

- 3b9ef72: Add database foundation with Kysely migrations, codegen, and provider integration
  - Database setup: Kysely migrations with helpers (`createTable`, `withPrimaryKey`, `withTimestamps`, `addComment`, auto `updated_at` trigger), codegen config with multi-schema support (`provider`, `personas`, `chats`, `system`), and typed DB overrides for JSONB columns
  - Migration scripts: `db:migrate`, `db:migrate:down`, `db:codegen`, `db:regen` workflow with Docker Compose health checks
  - Schema: providers/models with enum types and seed data, personas with modifiers and user profiles, chat conversations/messages with token tracking and generated columns, system settings with typed `SettingsMap`
  - Provider layer: abstract `BaseLLMProvider` with OpenAI implementation, provider registry with hot caching, capability checks
  - Chat handler: conversation management with system prompt composition from personas, modifiers, and user profiles
  - Testing: Vitest projects setup (unit/database), migration tests with `tsx/esm` loader for Kysely's `FileMigrationProvider`
  - Environment: centralized `env.ts` with dotenv loading, CamelCasePlugin for Kysely

  **AI assistance (Claude Code, claude-opus-4-6):** Database migration helpers and structure, Kysely codegen configuration (multi-schema, camelCase, config file setup), Vitest project setup with `tsx/esm` for dynamic imports, Docker Compose health check (`--wait`), provider registry architecture, type fixes (`Selectable<>` unwrapping, `Record<string, never>` for migrations, `Omit`-based DB overrides), and general TypeScript/Kysely/Postgres guidance throughout.

  _Changeset created with help from Claude_
