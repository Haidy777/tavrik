Look at the current changes (staged and unstaged) using `git diff` and `git diff --cached`, then create a changeset file.

## Changeset file format

Changeset files live in `.changeset/` and are markdown files with YAML frontmatter. The frontmatter maps package names to bump types (`major`, `minor`, or `patch`). The body is a human-readable summary for the changelog.

Example:

```markdown
---
"@tavrik/ui": minor
---

Add dark mode toggle to the settings page
```

## Rules

- The filename should be a random lowercase kebab-case name (e.g. `bright-dogs-fly.md`)
- Only include packages that were actually changed
- Choose the bump type based on the change:
  - `patch` — bug fixes, small tweaks
  - `minor` — new features, non-breaking changes
  - `major` — breaking changes
- The summary should be concise (1-2 sentences), written from the user's perspective
- Always append a blank line followed by `_Changeset created with help from Claude_` at the end of the body
- If `$ARGUMENTS` is provided, use it as guidance for the summary

## Workspace packages

- `@tavrik/ui` — Astro frontend
- `@tavrik/lib` — shared library (database, logger)
