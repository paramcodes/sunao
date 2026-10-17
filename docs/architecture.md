# Architecture

## App shell
```
┌─────────────────────────────────────────────┐
│ Sidebar │        Main content        │ Queue │
│ (nav +  │  (pages: home/search/      │ (now │
│  lists) │   library/playlist)        │ play │
│         │                            │ +q)  │
├─────────┴────────────────────────────┴──────┤
│               Player bar (fixed)            │
└─────────────────────────────────────────────┘
```

## Folders
- `src/app/` — routes (App Router), layout, globals.css.
- `src/components/ui/` — shadcn primitives.
- `src/components/layout/` — app shell pieces (sidebar, player bar, queue panel).
- `src/components/features/` — feature components (song row, album card, ...).
- `src/stores/` — Zustand stores (player, ui).
- `src/hooks/` — reusable hooks (usePlayer, useAudio).
- `src/lib/` — utils, query client, supabase client.
- `src/types/` — shared types.
- `docs/` — this wiki.

## Data flow
- Player state (current song, play/pause, position, speed, queue, liked) lives in Zustand (`stores/player.ts`).
- Server state (songs, playlists, user) via TanStack Query + Supabase.
- Audio element controlled by a `useAudio` hook that syncs with the store (play/pause/seek/rate).
- UI state (sidebar collapsed, now-playing open, active view) in Zustand or local component state.

## Boundaries
- Supabase is the only backend. Client talks to Supabase directly via RLS; no custom API server for MVP.
- Validation of Supabase responses happens with Zod at the query layer.
