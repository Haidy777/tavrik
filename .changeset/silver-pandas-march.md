---
"@tavrik/core": major
"@tavrik/ui": patch
"@tavrik/telegram": patch
---

Restructure monorepo: rename `@tavrik/lib` to `@tavrik/core`, add Fastify API server (`@tavrik/api`) with Zod validation and Scalar OpenAPI docs, and typed HTTP client SDK (`@tavrik/sdk`) with health-check fail-fast pattern. All extensions now integrate through a central HTTP API layer.

**AI assistance (Claude Code, Opus 4.6):** Explored codebase structure across all packages to map import dependencies. Designed the three-package architecture (core/api/sdk) through iterative Q&A. Researched Fastify + Zod + OpenAPI ecosystem (fastify-type-provider-zod vs fastify-zod-openapi, @scalar vs swagger-ui) via web search. Resolved Pino logger type mismatch with Fastify's generic `FastifyInstance` by creating a shared `AppInstance` type alias. Handled pnpm `minimumReleaseAge` constraint by finding compatible @scalar/fastify-api-reference version. Code review agent caught production error message leakage and SDK `connect()` not failing on degraded status.

_Changeset created with help from Claude_
