---
"@tavrik/api": patch
---

Restructure API routes to match resource hierarchy: nest messages under conversations, models under providers, settings under system. Group all routes under a shared `/api/v1` prefix plugin.

**AI assistance (Claude Code, Opus 4.6):** Renamed exported route functions to avoid naming collisions (`conversationMessageRoutes`, `providerModelRoutes`), updated Fastify route prefixes to reflect nested resource paths, and wrapped all v1 routes in a shared prefix plugin to eliminate repeated `/api/v1` prefixes.

_Changeset created with help from Claude_
