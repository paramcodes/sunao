# sunao

A Spotify-like music player. Red theme, dark UI.

## Docs
See [docs/README.md](docs/README.md) for the wiki (stack, architecture, design system, workflows, roadmap).

## Feature map
<!-- Updated after each phase via /maintain-verification-skill -->

```mermaid
flowchart LR
  A[Home] --> B[App shell]
  B --> C[Sidebar]
  B --> D[Main content]
  B --> E[Queue panel]
  B --> F[Player bar]
```

| Phase | Status | Evidence |
|---|---|---|
| 0 Scaffold | ✅ done | ![home](artifacts/verify-home/home.png) |
| 1 Audio playback core | ✅ done | ![home](artifacts/verify-phase1/home.png) |
| 2 Data layer (Supabase) | ⬜ | — |
| 3 Library & playlists | ⬜ | — |
| 4 Auth | ⬜ | — |
| 5 Polish & perf | ⬜ | — |
| 6 Deploy | ⬜ | — |

## Dev
```bash
pnpm install
pnpm dev
```
