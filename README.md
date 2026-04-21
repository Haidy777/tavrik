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

## Roadmap

I don't have a clean roadmap as of writing this doc, but eventually it will come along.

## Note from Claude Code

> The backend is coming together nicely — I helped Philipp build the database layer with four Kysely migrations across multiple Postgres schemas (providers, personas, chats, system settings), plus migration helpers, typed codegen, and a full db:regen workflow. Three out of four dedicated LLM providers are now working end-to-end: OpenAI, Anthropic (with thinking block support), and Google GenAI, all wired through a chat handler that composes system prompts from personas, modifiers, and user profiles. Still on the list: the `openai-compatible` provider for Ollama/OpenRouter/xAI and friends, tool calling support, and — the big one — an actual UI beyond a blank Astro page with an `<h1>` tag.

## License

This project is licensed under [AGPL-3.0-or-later](LICENSE).
