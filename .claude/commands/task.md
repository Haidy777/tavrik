Read CLAUDE.md before doing anything.

Ask questions instead of assuming anything!

## Before implementing

**Understand the context:**
- Identify which package this task belongs to (`src/ui`, `src/lib`, `src/telegram`)
- Check existing code patterns in that package before writing new code
- If the task involves architecture or tooling choices, ask — don't assume

**Plan before writing code:**
- Outline your approach
- If choosing between multiple valid approaches, ask rather than assume
- Flag any ambiguity before starting

**Database tasks:**
- Write Kysely migration files in the migrations directory
- Do NOT run migrations or codegen — the user handles that manually

## While implementing

- Only modify files directly related to the task — don't clean up unrelated code
- Use Kysely for all database access — no raw SQL
- Use `@tavrik/lib/logger` for logging — never `console.log`
- All code, comments, and docs in English
- Write tests when they add value, not for every change

## Verification — prove your work, don't just claim it

- **New feature:** show it works (curl, screenshot, or test output)
- **Bug fix:** reproduce the bug first, then show it's resolved
- **Build:** run `pnpm build` and show it completes without errors
- **Types:** run `pnpm types-check` and show it passes

If you cannot verify something, say so explicitly.

Task: $ARGUMENTS
