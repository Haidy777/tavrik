---
"@tavrik/lib": minor
---

Add OpenAI-compatible and OpenRouter provider implementations with dynamic API key resolution, refactor OpenAI provider to extend the compatible base, and introduce module-scoped loggers

**AI assistance (Claude Code, claude-opus-4-6):** Resolved TypeScript generic type errors in the provider registry by applying `as unknown as P` double-cast pattern for runtime provider lookups returning generic `BaseLLMProvider` subtypes.

_Changeset created with help from Claude_
