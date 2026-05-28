---
"@tavrik/api": minor
"@tavrik/sdk": minor
"@tavrik/core": minor
---

Migrate Telegram bot to use SDK exclusively, add message endpoint, and restructure core.

- **API**: Add `/init` endpoint for centralized migrations/model loading, add `POST /conversations/:id/messages` endpoint with full chat logic (prompt composition, summarization, LLM calls), move startup logic out of `server.ts`
- **SDK**: Add `conversations.messages(id).send()` method, typed HTTP method literals, message source enum, init/message schemas
- **Core**: Move `chat-handler/` to `summarize/`, export `autoSummarize` via `@tavrik/core/summarize`, remove old `chat-handler` module
- **Telegram**: Fully migrated to SDK — only imports `@tavrik/core/logger`, all data access through `@tavrik/sdk`

_Changeset created with help from Claude_
