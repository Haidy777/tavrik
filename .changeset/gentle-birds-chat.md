---
"@tavrik/lib": minor
---

Add Telegram bot with authenticated message handling, Docker dev setup, and shared env config for bot token and user ID

**AI assistance (Claude Code, claude-opus-4-6):** Fixed table name typo (`conversations.conversations` → `chats.conversations`), Kysely camelCase column name (`created_at` → `createdAt`), added `.js` extensions for Node16 module resolution, set up `@tavrik/telegram` package with workspace dependency and `"type": "module"`, moved `dotenv` and `grammy` to correct workspace packages with pinned versions, created `Dockerfile.telegram` after debugging platform-specific esbuild binary issues with bind-mounted `node_modules`, resolved Docker Compose `DATABASE_URL` interpolation by using `$$` escaping to defer variable expansion to the container shell.

_Changeset created with help from Claude_
