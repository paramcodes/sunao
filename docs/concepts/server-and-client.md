# Concept: server and client

Next.js App Router splits rendering: server components render on the server and ship only
HTML; client components (`"use client"`) ship and run JavaScript. Every file in this app
clearly declares which side it is on, and the split follows a rule.

## The rule in this app

Shell code that benefits the whole UI stays on the server; anything that touches the audio
element or local interaction drops to `"use client"`:

| File | Side | Why |
|---|---|---|
| `src/app/layout.tsx` | server | owns metadata + `viewport` (server-only APIs) and composes the client providers |
| `src/app/(app)/layout.tsx` | server shell | renders the client pieces (`Sidebar`, `QueuePanel`, `PlayerBar`, `MobileNav`) |
| `src/app/(app)/*/page.tsx` | client | they call `usePlayer`, the audio engine, and forms |
| `src/app/about/page.tsx` | server page + client island | exports per-route **metadata**, then renders `about-client.tsx` |
| `src/app/robots.ts`, `src/app/sitemap.ts` | server | generated files must come from the server |

Route-specific `metadata` can only be exported from a server component, which is the reason
`about/` splits as a thin server page plus a client island. Want metadata on `/search`?
Same split: move the interactive body to `search-client.tsx` and let `page.tsx` export
metadata before rendering it.

## Hydration: one render, picked up by React

The server renders HTML first; React hydrates it. If server HTML and first client render
disagree, React warns (or worse, silently diverges). Two guards in this app:

- **Seed both sides identically.** Query hooks seed `initialData` from the bundled dataset
  when there is no backend, so the server-rendered list and the client's first paint
  agree. The library queries add `staleTime: 0` + `refetchOnMount` because the server
  cannot read your `localStorage` — the seed paints an agreed picture immediately, and the
  repo's truth replaces it right after mount.
- **suppressHydrationWarning for genuinely unknowable text.** `greetingForHour(new Date())`
  can render "Good morning" on the server and "Good evening" on the client if the clock
  ticks across a boundary — the mismatch is by design, not a bug, so it is suppressed at the
  one heading (`suppressHydrationWarning`), and nowhere else.

## Network hints without JavaScript

`src/app/layout.tsx` calls `prefetchDNS("https://itunes.apple.com")` and preconnects to
Supabase while rendering on the server. Nothing is requested yet — the browser just stops
paying the DNS/TLS handshake cost the first time artwork or a preview is fetched.

## Signed up for later

The route-group layout `(app)/layout.tsx` is what keeps the shell mounted across navigation:
navigate between home, search, and library and only `<main>` swaps, so playback never
restarts. That is also why pages must not mount a second audio element — they don't: the
engine lives one level above in `PlayerProvider` (root layout).
