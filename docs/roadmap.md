# Roadmap (multi-phase)

Each phase = one PR. Tasks/subtasks = small commits. Revert any single commit safely.

## Phase 0 — Scaffold (done)
- [x] Init repo, Next.js 15, Tailwind v4, shadcn/ui.
- [x] Biome, Husky, lint-staged, CI workflow.
- [x] Design tokens, app shell skeleton.
- [x] Docs wiki + roadmap.

## Phase 1 — Audio playback core
- [ ] 1.1 `useAudio` hook syncing HTMLAudioElement ↔ store.
  - [ ] 1.1.1 Create hook with play/pause/seek/speed.
  - [ ] 1.1.2 Wire to Zustand player store.
  - [ ] 1.1.3 Tests: play, pause, seek, speed.
- [ ] 1.2 Player bar controls (play/pause/prev/next/seek/speed).
  - [ ] 1.2.1 Wire seek slider to position.
  - [ ] 1.2.2 Wire speed dropdown.
  - [ ] 1.2.3 Tests.
- [ ] 1.3 Now-playing overlay.
- [ ] 1.4 Queue panel interactions (click to play).
- PR + verification skill (create).

## Phase 2 — Data layer (Supabase)
- [ ] 2.1 Supabase project + schema (songs, albums, playlists, playlist_songs, profiles).
- [ ] 2.2 RLS policies.
- [ ] 2.3 Supabase client + Zod schemas.
- [ ] 2.4 Seed data (sample songs/playlists).
- [ ] 2.5 TanStack Query hooks (useSongs, usePlaylists, usePlaylist).
- PR + maintain verification skill.

## Phase 3 — Library & playlists
- [ ] 3.1 Home (recently played, albums grid).
- [ ] 3.2 Search (filter songs/artists).
- [ ] 3.3 Library (list playlists, create playlist).
- [ ] 3.4 Playlist detail (add/remove songs, play all).
- [ ] 3.5 Like/unlike songs.
- PR + maintain verification skill.

## Phase 4 — Auth
- [ ] 4.1 Supabase auth (email + OAuth).
- [ ] 4.2 Login/signup pages.
- [ ] 4.3 Protected routes / middleware.
- [ ] 4.4 User profile + liked songs persisted.
- PR + maintain verification skill.

## Phase 5 — Polish & perf
- [ ] 5.1 Image optimization (next/image, album art).
- [ ] 5.2 Loading states / skeletons.
- [ ] 5.3 Empty states.
- [ ] 5.4 Accessibility pass (keyboard, focus, ARIA).
- [ ] 5.5 Performance (bundle, Lighthouse).
- PR + maintain verification skill.

## Phase 6 — Deploy
- [ ] 6.1 Vercel project + env vars.
- [ ] 6.2 Preview deploys per PR.
- [ ] 6.3 Production deploy + smoke test.
- PR + maintain verification skill.

## Orchestration
- Each phase is a separate PR. Subtasks are separate commits.
- Use orchestrating agents per phase to keep context small: one agent per task, parent aggregates.
- Verification skill + feature map updated in README after each phase.
