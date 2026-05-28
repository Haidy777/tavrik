# @tavrik/api

## 0.3.0

### Minor Changes

- 95a5fba: Migrate Telegram bot to use SDK exclusively, add message endpoint, and restructure core.
  - **API**: Add `/init` endpoint for centralized migrations/model loading, add `POST /conversations/:id/messages` endpoint with full chat logic (prompt composition, summarization, LLM calls), move startup logic out of `server.ts`
  - **SDK**: Add `conversations.messages(id).send()` method, typed HTTP method literals, message source enum, init/message schemas
  - **Core**: Move `chat-handler/` to `summarize/`, export `autoSummarize` via `@tavrik/core/summarize`, remove old `chat-handler` module
  - **Telegram**: Fully migrated to SDK — only imports `@tavrik/core/logger`, all data access through `@tavrik/sdk`

  _Changeset created with help from Claude_

### Patch Changes

- Updated dependencies [95a5fba]
  - @tavrik/sdk@0.2.0
  - @tavrik/core@1.1.0

## 0.2.0

### Minor Changes

- 5f38bb5: Add full CRUD reference endpoint for conversations (list with pagination, get, create, patch, delete) with Zod validation and OpenAPI tags. Export database types from `@tavrik/core/database`.

  **AI assistance (Claude Code, Opus 4.6):** Built the complete CRUD endpoint as an offline reference pattern. Code review agent caught 8 issues: non-numeric ID params reaching Postgres, count query ignoring the archived filter, `Record<string, unknown>` bypassing Kysely type safety (fixed with `UpdateObject<DB, ...>`), empty PATCH returning 200 instead of 400, and ID fields missing numeric validation. Added shared `numericId` Zod validator and exported `ChatsConversations`/`DB` types from core.

  _Changeset created with help from Claude_

### Patch Changes

- Updated dependencies [5f38bb5]
  - @tavrik/core@1.0.1

## 0.1.2

### Patch Changes

- 82d607a: Restructure API routes to match resource hierarchy: nest messages under conversations, models under providers, settings under system. Group all routes under a shared `/api/v1` prefix plugin.

  **AI assistance (Claude Code, Opus 4.6):** Renamed exported route functions to avoid naming collisions (`conversationMessageRoutes`, `providerModelRoutes`), updated Fastify route prefixes to reflect nested resource paths, and wrapped all v1 routes in a shared prefix plugin to eliminate repeated `/api/v1` prefixes.

  _Changeset created with help from Claude_

## 0.1.1

### Patch Changes

- Updated dependencies [d004ac1]
  - @tavrik/core@1.0.0
