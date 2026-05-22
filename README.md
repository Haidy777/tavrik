# Tavrik

An opinionated chat bot interface, with tool calling, model selections, prompts and stuff. (Well, when they are implemented.)

Over the last couple of months I've implemented a personal chat bot with access to apple health data, home assistant with tools to ingest my diary and [blog posts](https://blog.phaidenbauer.com/posts/20260410_claude-code-over-the-last-weeks), and several other things I can't remember right now while writing this doc lol.
The idea of this repository is to give you access to a cleanroom implementation and eventually migrate my own chatbot to this repo.
Thanks to claude code, the original chat bot was up and running within weeks and it serves me and my mental health quite well tbh.

## On "Vibe Coding"
> I've been mainly backend dev for the last couple of years, I'm heavily lacking CSS and frontend dev skills, the idea is to get a basic ui up and running with a simple css framework but eventually I'll have claude handle stuff.
> Also, Claude might implement some other features, but I'll make sure you can see vibed code in commits and changelogs.

## Getting Started

```bash
corepack enable
pnpm install
cp .env.example .env
pnpm dev:db         # start postgres
pnpm dev:api        # start fastify api server
pnpm dev:ui         # start astro dev server
```

### Telegram Bot (quickest way to start chatting)

If you just want to talk to Tavrik without building the full UI, the Telegram bot is the fastest path (and the only way currently lol):

1. Create a bot via [@BotFather](https://t.me/BotFather) and grab the token
2. Get your Telegram user ID (e.g. via [@userinfobot](https://t.me/userinfobot))
3. Add both to your `.env`:
   ```
   TELEGRAM_BOT_TOKEN=your-bot-token
   TELEGRAM_USER_ID=your-user-id
   ```
4. Start everything:
   ```bash
   pnpm dev:db          # start postgres (if not already running)
   pnpm dev:telegram    # build & start the bot in docker
   ```

The bot runs database migrations on startup, so it's fully self-contained. Only the configured `TELEGRAM_USER_ID` can interact with it.

## Roadmap

I don't have a clean roadmap as of writing this doc, but eventually it will come along.

### Ideas floating in my mind

- Claude code like "Memory" System - instead of memory.md -> tool calling and storing to postgres table
- RAG Tools for past Conversations and Conversation Embedding
- Dynamic Tool Enabling per Conversation / Persona / User
- iCal Loading (readonly for starting)
- Apple Health Data Tool via "Health Export" App
- tracking of watched tv shows, movies and read books (goodreads?, plex?)
- spotify listening history?
- content embedding (example blog posts or diary entries)

## Note from Claude Code

> Tavrik now has a proper architecture — I helped Philipp restructure the monorepo around a central Fastify API (`@tavrik/api`) with Zod validation, OpenAPI docs via Scalar at `/docs`, and a typed HTTP client SDK (`@tavrik/sdk`) so all extensions talk through one API layer. The routes are nested to match the resource hierarchy (messages under conversations, models under providers, settings under system), all grouped under `/api/v1`. There's a working `/health` endpoint and Ollama is set up locally with qwen2.5:3b for offline testing — Philipp's about to hop on a flight and build out the CRUD endpoints from there. The core infrastructure (database, providers, chat handler) lives in `@tavrik/core` and only the API imports it directly.

## My other Projects

- [cc-tweaked-typescript](https://github.com/Haidy777/cc-tweaked-typescript) - TypeScript-first CC:Tweaked (ComputerCraft) development — type-safe turtle automation, utilities, and scripts compiled to Lua 5.1 via typescript-to-lua. Includes an in-game installer. (Worth checking out if you play Modded Minecraft.)
- [Personal Blog and CV](https://blog.phaidenbauer.com/)
- [Haidy777](https://www.youtube.com/@Haidy777) - YouTube channel

## License

This project is licensed under [AGPL-3.0-or-later](LICENSE).
