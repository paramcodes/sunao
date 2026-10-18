# sunao — features (machine-readable)

sunao is a free, Spotify-like music player for the web (Next.js 16 + React 19). No pricing, no paid tiers.

## Core capabilities

- Play / pause, previous / next, auto-advance on track end
- Seek scrubber bound to real audio duration, with position and total labels
- Playback speed: 0.5x, 1x, 1.25x, 1.5x, 2x
- Like / unlike current track (session-only, in memory)
- Buffering spinner (debounced 200ms)
- Audio: 30-second previews from iTunes Search API (no key), cached per title + artist, fallback to bundled sample tone
- Artwork from iTunes CDN via next/image
- Home: album grid (click to play) + full song list
- Search: filter songs by title or artist, empty state
- Library: list playlists, create new (Supabase or local store)
- Playlist detail: cover, song count, play all, remove song, empty state
- Now playing card + virtualized queue; click row to jump
- Collapsible queue panel (desktop, 40px rail, inert when collapsed, scroll survives)
- Mobile queue in bottom sheet
- Auth (optional): email/password sign in/up, /auth/callback, session refresh via proxy.ts, protects /library and /playlist/*
- Runs without backend: static seed data, in-memory playlists, no auth
- Mobile bottom nav (Home/Search/Library/Queue), compact player bar, safe-area padding
- Accessibility: ARIA labels/states, tooltips with keyboard hints, Space toggles play/pause, focus-visible ring, inert panels, skip-to-main link
- Motion: shared easing tokens, pointer-gated hover, press feedback, staggered entrance, heart pop, artwork pulse, reduced-motion support
- Performance: optimizePackageImports (lucide-react, react-query), virtualized queue

## Stack

Next.js 16, React 19, TypeScript (strict), Tailwind v4, shadcn/ui (Base UI), Zustand, TanStack Query + Virtual, Supabase (optional), Zod, Vitest, Playwright, Biome.

## Links

- Home: /
- About / FAQ: /about
- llms.txt: /llms.txt
- llms-full.txt: /llms-full.txt
