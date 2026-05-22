# @tavrik/telegram

## 0.1.7

### Patch Changes

- Updated dependencies [5f38bb5]
  - @tavrik/core@1.0.1

## 0.1.6

### Patch Changes

- d004ac1: Restructure monorepo: rename `@tavrik/lib` to `@tavrik/core`, add Fastify API server (`@tavrik/api`) with Zod validation and Scalar OpenAPI docs, and typed HTTP client SDK (`@tavrik/sdk`) with health-check fail-fast pattern. All extensions now integrate through a central HTTP API layer.

  **AI assistance (Claude Code, Opus 4.6):** Explored codebase structure across all packages to map import dependencies. Designed the three-package architecture (core/api/sdk) through iterative Q&A. Researched Fastify + Zod + OpenAPI ecosystem (fastify-type-provider-zod vs fastify-zod-openapi, @scalar vs swagger-ui) via web search. Resolved Pino logger type mismatch with Fastify's generic `FastifyInstance` by creating a shared `AppInstance` type alias. Handled pnpm `minimumReleaseAge` constraint by finding compatible @scalar/fastify-api-reference version. Code review agent caught production error message leakage and SDK `connect()` not failing on degraded status.

  _Changeset created with help from Claude_

- Updated dependencies [d004ac1]
  - @tavrik/core@1.0.0

## 0.1.5

### Patch Changes

- Updated dependencies [d74dbb8]
  - @tavrik/lib@0.6.0

## 0.1.4

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
