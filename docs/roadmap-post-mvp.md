# Post-MVP roadmap (multi-phase)

The MVP (phases 0–6 in `roadmap.md`) is shipped. This plan covers the work that makes
sunao behave like Spotify rather than a demo. It also closes the two correctness bugs the
end-to-end run confirmed.

Conventions (same as `roadmap.md`): **each phase = one PR**, **each task = one commit**,
revertable on its own. Every phase updates `.opencode/skills/verify-sunao/` with a feature
recipe and ends with the verification gate below.

## Current state (from the E2E run — updated after phase 8)

- Player and catalogue are one source of truth (`useSongs()`), covers render everywhere,
  the play/pause flicker is fixed (`use-delayed-flag.ts`).
- **Closed bug B** and half of **bug A**: likes and playlist edits persist (P8 repository
  seam, `src/lib/library/`). Open bug A's remainder — the "Liked Songs" playlist page
  reflecting likes — is phase 9.2, still open.
- The SEO/discoverability surface (PR #10: metadata, robots, sitemap, JSON-LD, llms.txt)
  is merged; the pattern is documented in
  [concepts/seo-and-ai-discovery.md](concepts/seo-and-ai-discovery.md).
- Missing Spotify basics: volume, shuffle, repeat, real search, playlist management,
  now-playing view.

## Dependency graph

```
P7 quick fixes ─┐
P8 persistence ─┼─> P9 likes sync
                └─> P10 playlist management
P11 player controls   (independent)
P12 search/discovery  (independent)
P13 now-playing/mobile (independent)
```

P8 is the keystone: it unblocks P9 and P10 and removes the root cause of both open bugs.
P11–P13 can run in any order once P8 lands (they don't depend on it).

## Verification gate (every phase)

`pnpm typecheck` · `pnpm lint` · `pnpm test` · `pnpm build` · the phase's Playwright recipe in
`e2e/` · updated `verify-sunao` feature recipe. A phase is not done until its acceptance
criteria are proven on the **live surface**, not just in unit tests.

---

## Phase 7 — Quick correctness fixes (S) — done

Small, independent cleanups. One PR.

- [x] 7.1 Don't show a track as "now playing" before the user has played anything
      (`currentSongId: null`). The player bar and queue now render an idle state
      ("Nothing playing"); transport is disabled and Space is a no-op until a track is chosen.
- [x] 7.2 Mobile seek: the top bar is now a draggable Base UI slider (`data-slot="mobile-seek"`).
- [x] 7.3 Deleted dead exports `getSong` / `SONG_BY_ID` in `lib/data/songs.ts`.
- [x] 7.4 Time-of-day greeting on home (`lib/greeting.ts`; `suppressHydrationWarning` avoids the
      SSR/client mismatch since the route is statically prerendered).

**Acceptance:** no track highlighted at idle; mobile seek moves playback; `grep` finds no dead
exports; greeting changes with the clock. Proven by `e2e/full-journey.spec.ts`
(`idle player bar before any playback`, `mobile seek scrubs playback`).

---

## Phase 8 — Persistence foundation (M) — keystone — done

Introduce a **repository seam** so likes and playlists have one contract with two backends,
instead of the current split between an in-memory Set, a module-level array, and Supabase.

The shipped shape lives in `src/lib/library/` (`repo.ts`, `local-repo.ts`,
`supabase-repo.ts`); the design notes below are the record of what was sketched.

- [x] 8.1 Define the `LibraryRepo` port and a `createRepo()` factory keyed on `hasSupabase()`.
- [x] 8.2 `localStorage` adapter (default, no backend). One versioned document
      (`sunao.library.v1`), Zod-validated on read, corrupt/absent value falls back to the
      bundled `PLAYLISTS`. Cached by raw string, invalidated on `storage` and on tab focus,
      so two tabs stay consistent without a channel.
- [x] 8.3 Supabase adapter at parity (`playlists` / `playlist_songs` +
      the new `liked_songs` table + RLS, migration `0003_liked_songs.sql`).
- [x] 8.4 Migrate the queries onto the repo; `lib/local-playlists.ts` deleted.
- [x] 8.5 Optimistic updates via TanStack Query mutations: paint on `onMutate`, roll back
      on `onError`, invalidate on `onSettled` (`lib/queries.ts`).

**Acceptance — proven [act, reload, assert] by `e2e/persistence.spec.ts` (shoots into
`artifacts/persistence/`):** created playlist, song removal, and like/unlike all survive a
hard reload in no-backend mode; seeded likes drive the heart initially.

---

## Phase 9 — Likes ↔ Liked Songs (M) — needs P8 — in progress

Make "Liked Songs" a **projection of likes**, not a static row.

- [x] 9.1 Likes live in the repo (`likedSongIds` / `setLiked`); the in-memory Zustand `Set`
      is gone from the player store.
- [ ] 9.2 "Liked Songs" playlist is derived: its `songIds` = liked ids, ordered by liked-at.
      **Open gap** — `/playlist/p1` still reads the seeded list, so a newly liked song does
      not appear there yet (`e2e/full-journey.spec.ts` tracks this directly).
- [x] 9.3 Heart state derives from the repo; optimistic toggle kept; undo toast preserved
      (removal offers Undo; save confirms with a success toast).
- [ ] 9.4 The playlist is read-only for ordering/removal — removing a row unlikes (`system: true`).

**Acceptance:** like a song from home / player bar / search → it appears in Liked Songs; unlike
removes it; both survive reload; the count shown in the library matches.

**Fixes:** open bug A.

---

## Phase 10 — Playlist management (L) — needs P8

- [ ] 10.1 "Add to playlist" from a track's context menu (home / search / queue) with a picker.
- [ ] 10.2 Persisted remove + drag-reorder inside a playlist.
- [ ] 10.3 Rename and delete (ownership-gated; `system` playlists protected).
- [ ] 10.4 Playlist artwork: derive a 2×2 mosaic from member song covers, replacing the flat color.

**Acceptance:** full CRUD persists across reload; a popover adds a song; reorder sticks; the
mosaic reflects membership; deleting a playlist removes it from the sidebar.

**Fixes:** open bug B.

---

## Phase 11 — Player controls (M)

- [ ] 11.1 Volume: slider + mute toggle, persisted, keyboard `↑`/`↓`.
- [ ] 11.2 Shuffle: context-aware (shuffles remaining queue, keeps current), toggled + persisted.
- [ ] 11.3 Repeat: off / all / one, wired into the `ended` handler.
- [ ] 11.4 Shortcuts: next/prev/like alongside the existing Space, guarded against inputs.

**Acceptance:** controls reflect state and survive reload; shuffle visibly reorders the queue;
repeat-one loops a track; shortcuts work and don't fire while typing.

**Risk:** shuffle/repeat touch the store, the queue, and the audio `ended` path together —
design the queue model first (see `principle-model-the-domain`).

---

## Phase 12 — Search & discovery (L)

Today search is a substring filter over 12 bundled songs.

- [ ] 12.1 Search tabs: Songs / Albums / Artists / Playlists, plus recent searches.
- [ ] 12.2 Real catalog search via the iTunes Search API (extend `lib/itunes.ts`), debounced,
      aborted on new input, error + empty states.
- [ ] 12.3 Artist and Album detail routes (`/artist/[id]`, `/album/[id]`).
- [ ] 12.4 Home sections: Recently played + a "Made for you" row from play history.

**Acceptance:** typing hits the API (network observable), each tab filters correctly, detail
routes render and play, empty/loading states shown, recent searches persist.

**Risk:** external API rate limits and CORS; keep the bundled dataset as an offline fallback.

---

## Phase 13 — Now-playing & mobile (M)

- [ ] 13.1 Now-playing view: expand from the player bar into a full-screen panel (big art,
      controls, queue link) — replaces the current Fullscreen-API button.
- [ ] 13.2 Mobile bottom-sheet player with swipe-up to open and swipe-down to dismiss.
- [ ] 13.3 Lyrics panel (placeholder provider first, real source later).

**Acceptance:** expand/collapse animates without layout shift; swipe gestures work on a touch
profile; focus returns to the trigger on close.

---

## Quick wins to pull forward (optional)

If you want visible progress before the keystone: 7.1, 7.3, 11.1 (volume) are each small and
independent. Volume in particular is the most conspicuous gap and can ship on its own.

## Notes / non-goals

- Full-track playback stays out of scope: the app plays 30 s iTunes previews by design.
- Offline/downloads, social features, and a custom API server remain out of scope for now.
