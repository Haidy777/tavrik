# Tavrik UI — Chat Interface Plan

## Context

The `@tavrik/ui` package is currently a bare Astro shell with one placeholder page. Now that the API layer (`@tavrik/api`) is in place with the SDK (`@tavrik/sdk`), the UI can be built as a proper chat interface that consumes the API over HTTP.

**Goal**: A simple, accessible, mobile-and-desktop-friendly chat UI with light/dark/high-contrast themes. Chat-only initially — just conversations and messages.

---

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | React (Astro islands) | Mature ecosystem, shadcn/ui support, SDK works in both browser + Node |
| Components | shadcn/ui (Radix + Tailwind) | Copy-paste components, ARIA-ready, fully customizable |
| Styling | Tailwind CSS 4 | Utility-first, built-in dark mode, Vite plugin |
| Themes | Light / Dark / High Contrast | CSS variables + Tailwind `dark:` prefix, `prefers-color-scheme` default |
| Mobile UX | Bottom tab navigation | Chats / Current / Settings — app-like feel |
| State | `@tavrik/sdk` as data layer | Shared between browser and Node contexts, fetch-based |

---

## Tech Stack — New Dependencies

### Astro integrations
- `@astrojs/react` — React island support
- `@astrojs/tailwind` or Tailwind 4 Vite plugin — styling

### React + Components
- `react`, `react-dom` — React runtime
- `@radix-ui/react-*` — individual Radix primitives (installed per-component via shadcn)
- `tailwind-merge` — merge Tailwind classes (shadcn dependency)
- `clsx` or `class-variance-authority` — conditional class composition (shadcn dependency)
- `lucide-react` — icon set (shadcn default)

### SDK
- `@tavrik/sdk` — workspace dependency for API communication

All deps pinned, no `^` or `~`.

---

## Directory Structure

```
src/ui/src/
├── layouts/
│   └── BaseLayout.astro          # HTML shell, theme script, font loading
├── pages/
│   └── index.astro               # Main chat page (single page app feel)
├── components/
│   ├── ui/                       # shadcn/ui components (copy-paste, owned)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── scroll-area.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── sheet.tsx             # mobile drawer if needed
│   │   ├── tabs.tsx              # bottom tab navigation
│   │   └── ...
│   ├── chat/
│   │   ├── ChatLayout.tsx        # main layout: sidebar + chat area (React island)
│   │   ├── ConversationList.tsx  # list of conversations
│   │   ├── MessageArea.tsx       # message thread display
│   │   ├── MessageInput.tsx      # text input + send button
│   │   ├── MessageBubble.tsx     # single message (user/assistant)
│   │   └── BottomTabs.tsx        # mobile tab navigation
│   └── theme/
│       └── ThemeToggle.tsx       # light/dark/high-contrast switcher
├── lib/
│   ├── api.ts                    # TavrikClient instance (configured for browser)
│   └── utils.ts                  # cn() helper for Tailwind class merging
├── styles/
│   └── globals.css               # Tailwind directives, CSS variables for themes
└── hooks/
    ├── use-conversations.ts      # fetch/cache conversations via SDK
    └── use-messages.ts           # fetch/cache messages via SDK
```

---

## Theme System

### Three themes via CSS variables

```css
:root {
  /* Light theme (default) */
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --primary: ...;
  --muted: ...;
  /* etc — follows shadcn/ui CSS variable convention */
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  /* ... */
}

.high-contrast {
  --background: 0 0% 0%;
  --foreground: 0 0% 100%;
  /* Maximum contrast ratios, bold borders */
}
```

### Theme switching
- Inline `<script>` in BaseLayout.astro (no flash of wrong theme)
- Check `localStorage` first, fall back to `prefers-color-scheme`
- Four options: Light / Dark / High Contrast / System
- Toggle component as a small React island

---

## Chat Layout

### Desktop (>=768px)
```
┌──────────────────────────────────────────┐
│ Header: Tavrik            [Theme] [Menu] │
├────────────┬─────────────────────────────┤
│            │                             │
│ Convo List │       Message Area          │
│            │                             │
│  - Chat 1  │  ┌─────────────────────┐    │
│  - Chat 2  │  │ User: Hello         │    │
│  - Chat 3  │  │ Bot: Hi there!      │    │
│            │  └─────────────────────┘    │
│            │                             │
│ [+ New]    ├─────────────────────────────┤
│            │ [Message input...] [Send]   │
└────────────┴─────────────────────────────┘
```

### Mobile (<768px)
```
┌─────────────────────┐
│ Header: Tavrik      │
├─────────────────────┤
│                     │
│   Message Area      │
│   (full width)      │
│                     │
├─────────────────────┤
│ [Message input...]  │
├─────────────────────┤
│ [Chats] [Chat] [⚙] │  <- Bottom tabs
└─────────────────────┘
```

Bottom tabs:
- **Chats** — conversation list (full screen)
- **Chat** — current conversation (full screen)
- **Settings** — theme toggle, model selection (future)

---

## SDK Integration in Browser

```typescript
// src/ui/src/lib/api.ts
import { TavrikClient } from '@tavrik/sdk'

export const api = new TavrikClient({
  baseUrl: import.meta.env.PUBLIC_API_URL || 'http://localhost:3001',
})
```

### React hooks pattern

```typescript
// src/ui/src/hooks/use-conversations.ts
// Simple fetch + state, no heavy state management library
// Can upgrade to TanStack Query later if needed
```

---

## Implementation Order

### Phase 1: Foundation (scaffold)
1. Install deps: `@astrojs/react`, Tailwind 4, React, shadcn/ui CLI setup
2. Create `BaseLayout.astro` with theme script + Tailwind globals
3. Create `lib/utils.ts` with `cn()` helper
4. Create `lib/api.ts` with SDK client instance
5. Add `PUBLIC_API_URL` to env config

### Phase 2: Theme system
1. Define CSS variables for light / dark / high-contrast
2. Build `ThemeToggle.tsx` component
3. Add inline theme detection script to layout

### Phase 3: Chat UI
1. Build `ChatLayout.tsx` — the main React island
2. Build `ConversationList.tsx` — fetch via SDK
3. Build `MessageArea.tsx` + `MessageBubble.tsx`
4. Build `MessageInput.tsx` — send messages via SDK
5. Build `BottomTabs.tsx` for mobile navigation

### Phase 4: Polish
1. Loading states and error handling
2. Auto-scroll to latest message
3. Responsive breakpoints
4. Keyboard navigation testing
5. Screen reader testing

---

## Key Constraints

- **All deps pinned** — no `^` or `~`, use pnpm catalog for shared deps
- **No console.log** — use `@tavrik/core/logger` server-side only; client-side can use console for dev
- **SDK is the only API interface** — UI never imports `@tavrik/core` for data fetching (the integrations for migrations/model-loading stay as-is for server startup)
- **ARIA compliance** — shadcn/ui handles most of this via Radix primitives
- **Mobile-first** — design for mobile, enhance for desktop

---

## Prerequisite: API Endpoints

The UI depends on these CRUD endpoints being built first:
- `GET /api/v1/conversations` — list conversations
- `POST /api/v1/conversations` — create conversation
- `GET /api/v1/conversations/:id/messages` — list messages
- `POST /api/v1/conversations/:id/messages` — send message
- `GET /api/v1/providers/:id/models` — list available models

---

## Verification

- `pnpm dev:api` + `pnpm dev:ui` — both running
- Open UI in browser, verify theme toggle works
- Send a message via the chat interface
- Test on mobile viewport (Chrome DevTools)
- Run `pnpm lint && pnpm types-check && pnpm build`
- Screen reader check with VoiceOver (macOS)
