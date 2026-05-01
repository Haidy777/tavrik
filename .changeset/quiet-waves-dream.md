---
"@tavrik/lib": minor
"@tavrik/ui": patch
---

Add rolling conversation summaries with bilingual prompt templates (EN/DE), usage tracking migration, and automatic model loading on Astro build. Summaries are generated when message count exceeds a configurable threshold, with cumulative updates for ongoing conversations.

**AI assistance (Claude Code, claude-opus-4-6):** Wrote English translations for all summary prompt templates. Fixed TypeScript errors with Kysely `Selectable<>` types vs raw `ColumnType` wrappers. Identified and fixed array-to-string coercion bug (`.join('')`), wrong model ID passed to `sendMessage` (`summaryModel.name` → `summaryModel.id`), redundant DB query replaced with in-memory filtering, message ordering issue (`desc` → `asc`), and user message double-counting in summary input. Designed `SummaryResult` return type to control which messages get sent to the LLM. Added `astro:build:done` hooks for production support. Removed unnecessary model DB lookup in auto-summarize since `rollingSummaryModelId` is already a DB ID.

_Changeset created with help from Claude_
