# @tavrik/ui

## 0.2.1

### Patch Changes

- d74dbb8: Add rolling conversation summaries with bilingual prompt templates (EN/DE), usage tracking migration, and automatic model loading on Astro build. Summaries are generated when message count exceeds a configurable threshold, with cumulative updates for ongoing conversations.

  **AI assistance (Claude Code, claude-opus-4-6):** Wrote English translations for all summary prompt templates. Fixed TypeScript errors with Kysely `Selectable<>` types vs raw `ColumnType` wrappers. Identified and fixed array-to-string coercion bug (`.join('')`), wrong model ID passed to `sendMessage` (`summaryModel.name` → `summaryModel.id`), redundant DB query replaced with in-memory filtering, message ordering issue (`desc` → `asc`), and user message double-counting in summary input. Designed `SummaryResult` return type to control which messages get sent to the LLM. Added `astro:build:done` hooks for production support. Removed unnecessary model DB lookup in auto-summarize since `rollingSummaryModelId` is already a DB ID.

  _Changeset created with help from Claude_

- Updated dependencies [d74dbb8]
  - @tavrik/lib@0.6.0

## 0.2.0

### Minor Changes

- 7e575d5: Add dynamic model listing with capabilities parsing for all providers (OpenAI, Anthropic, Google, Mistral, OpenRouter), unique constraint on provider models, expanded model capabilities enum (citation, thinking, stt), and auto-load models on startup via Astro integration and Telegram bot

  **AI assistance (Claude Code, claude-opus-4-6):** Researched SDK pagination patterns across all providers (Anthropic async iterable, Google Pager, Mistral plain array, OpenAI async iterable, OpenRouter plain response). Helped resolve TypeScript errors: `Promise<Pager>` needing await before iteration, discriminated union narrowing for Mistral's `ModelListData`, and `private` to `protected` visibility for OpenAI client inheritance. Identified Mistral duplicate model IDs and suggested `Set`-based deduplication. Mapped provider-specific capability fields to unified enum. Fixed pino-pretty blocking WebStorm debugger using `node:inspector` URL check.

  _Changeset created with help from Claude_

### Patch Changes

- Updated dependencies [7e575d5]
  - @tavrik/lib@0.5.0

## 0.1.3

### Patch Changes

- Updated dependencies [bcabf26]
  - @tavrik/lib@0.4.0

## 0.1.2

### Patch Changes

- Updated dependencies [7da9114]
  - @tavrik/lib@0.3.0

## 0.1.1

### Patch Changes

- Updated dependencies [0ef7a8a]
- Updated dependencies [dc1f962]
- Updated dependencies [3b9ef72]
  - @tavrik/lib@0.2.0
