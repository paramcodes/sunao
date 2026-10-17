# Roadmap (multi-phase)

Each phase = one PR. Tasks/subtasks = small commits. Revert any single commit safely.

Status: phases 0–6 are complete and shipped (production: https://sunao-omega.vercel.app).
Phases below are kept as the historical plan; unchecked boxes reflect scope that was
deliberately descoped, not outstanding work.

## Phase 0 — Scaffold (done)
- [x] Init repo, Next.js 16, Tailwind v4, shadcn/ui.
- [x] Biome, Husky, lint-staged, CI workflow.
- [x] Design tokens, app shell skeleton.
- [x] Docs wiki + roadmap.

## Phase 1 — Audio playback core (done)
- [x] 1.1 `useAudio` hook syncing HTMLAudioElement ↔ store.
- [x] 1.2 Player bar controls (play/pause/prev/next/seek/speed).
- [x] 1.3 Now-playing card in the queue panel.
- [x] 1.4 Queue panel interactions (click to play).

## Phase 2 — Data layer (Supabase) (done)
- [x] 2.1 Supabase schema (songs, albums, playlists, playlist_songs, profiles).
- [x] 2.2 RLS policies.
- [x] 2.3 Supabase client + Zod schemas.
- [x] 2.4 Seed data (sample songs/playlists), aligned with static dataset.
- [x] 2.5 TanStack Query hooks (useSongs, usePlaylists, usePlaylist).

## Phase 3 — Library & playlists (done)
- [x] 3.1 Home (album grid + song list).
- [x] 3.2 Search (filter songs/artists, empty state).
- [x] 3.3 Library (list playlists, create playlist).
- [x] 3.4 Playlist detail (play all, remove a song, empty state).
- [ ] 3.5 Like/unlike songs persisted to Supabase — **descoped**: likes are session-only (in-memory Zustand Set). Revisit if persistence is needed.

## Phase 4 — Auth (done)
- [x] 4.1 Supabase auth (email + password).
- [x] 4.2 Login/signup pages.
- [x] 4.3 Protected routes / proxy.
- [ ] 4.4 User profile + persisted liked songs — **descoped**: no profile page; likes session-only. OAuth descoped (email+password only).

## Phase 5 — Polish & perf (done)
- [x] 5.1 Image optimization (next/image, album art).
- [x] 5.2 Loading states / skeletons (home route).
- [x] 5.3 Empty states.
- [x] 5.4 Accessibility pass (keyboard, focus, ARIA).
- [x] 5.5 Performance (bundle, Lighthouse).

## Phase 6 — Deploy (done)
- [x] 6.1 Vercel project + env vars.
- [x] 6.2 Preview deploys per PR.
- [x] 6.3 Production deploy + smoke test.

## Post-plan work (done)
Shipped after the original plan, outside the phase/PR structure:
- Real artwork and 30-second previews from the iTunes Search API, with a bundled sample fallback and a Supabase artwork migration.
- Motion polish: shared easing tokens, pointer-gated hover, press feedback, reduced-motion support.
- Queue virtualization (TanStack Virtual) and the collapsible desktop queue panel.
- Mobile shell: bottom nav, queue bottom sheet, compact player bar.
- README and docs refresh with freshly recorded screenshots, GIF, and video.

## Orchestration
- Each phase is a separate PR. Subtasks are separate commits.
- Verification skill + feature map updated after each phase (see `.opencode/skills/verify-sunao/`).

## Descoped / future work
- Shuffle, repeat, and volume controls (prototype only; not in product scope).
- Persisted likes and a user profile page.
- OAuth providers (only email+password shipped).
- Loading skeletons for search/library/playlist routes.
- SEO metadata + server/client route split (in progress on `feat/seo-discoverability`).
