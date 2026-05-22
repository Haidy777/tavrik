---
"@tavrik/api": minor
"@tavrik/core": patch
---

Add full CRUD reference endpoint for conversations (list with pagination, get, create, patch, delete) with Zod validation and OpenAPI tags. Export database types from `@tavrik/core/database`.

**AI assistance (Claude Code, Opus 4.6):** Built the complete CRUD endpoint as an offline reference pattern. Code review agent caught 8 issues: non-numeric ID params reaching Postgres, count query ignoring the archived filter, `Record<string, unknown>` bypassing Kysely type safety (fixed with `UpdateObject<DB, ...>`), empty PATCH returning 200 instead of 400, and ID fields missing numeric validation. Added shared `numericId` Zod validator and exported `ChatsConversations`/`DB` types from core.

_Changeset created with help from Claude_
