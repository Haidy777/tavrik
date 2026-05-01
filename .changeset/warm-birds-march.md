---
"@tavrik/lib": minor
"@tavrik/ui": minor
---

Add dynamic model listing with capabilities parsing for all providers (OpenAI, Anthropic, Google, Mistral, OpenRouter), unique constraint on provider models, expanded model capabilities enum (citation, thinking, stt), and auto-load models on startup via Astro integration and Telegram bot

**AI assistance (Claude Code, claude-opus-4-6):** Researched SDK pagination patterns across all providers (Anthropic async iterable, Google Pager, Mistral plain array, OpenAI async iterable, OpenRouter plain response). Helped resolve TypeScript errors: `Promise<Pager>` needing await before iteration, discriminated union narrowing for Mistral's `ModelListData`, and `private` to `protected` visibility for OpenAI client inheritance. Identified Mistral duplicate model IDs and suggested `Set`-based deduplication. Mapped provider-specific capability fields to unified enum. Fixed pino-pretty blocking WebStorm debugger using `node:inspector` URL check.

_Changeset created with help from Claude_
