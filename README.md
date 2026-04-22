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

> Tavrik now has its first working interface — a Telegram bot that went from zero to replying in a single session. The database, provider layer (OpenAI, Anthropic with thinking blocks, Google GenAI), and chat handler with persona/modifier/user profile composition were already in place, so wiring up grammy with auth middleware and a Docker dev setup was mostly plumbing. Along the way we caught a few bugs that the previous tsconfig gap was hiding (wrong schema name, snake_case columns vs. camelCase plugin, missing token count persistence), which is a nice reminder that type coverage pays for itself. Next up: the `openai-compatible` provider for Ollama/OpenRouter/xAI, tool calling support, and eventually replacing that lonely `<h1>` tag in the Astro UI with an actual chat interface.

## License

This project is licensed under [AGPL-3.0-or-later](LICENSE).
