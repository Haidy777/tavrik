---
"@tavrik/lib": minor
---

Add Anthropic and Google GenAI provider implementations with dedicated SDKs

- Anthropic provider using `@anthropic-ai/sdk` with thinking block support
- Google provider using `@google/genai` with Gemini content format mapping
- Updated provider registry to route to new providers
- Fixed `migrateDown` to revert all migrations using `NO_MIGRATIONS`
- Added new model seed data for Anthropic and Google models

**AI assistance (Claude Code, claude-opus-4-6):** Google GenAI SDK guidance (content format with `role: 'model'`, `parts`, `systemInstruction`), token usage metadata field mapping (`promptTokenCount`/`candidatesTokenCount`), Anthropic model ID format (`claude-haiku-4-5-20251001`), fixing `migrateDown` to use `migrator.migrateTo(NO_MIGRATIONS)` for full teardown, and advising to skip xAI dedicated SDK in favor of openai-compatible provider.

_Changeset created with help from Claude_
