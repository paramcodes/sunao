# Player bar

The persistent bottom bar: current song, play/pause, previous/next, seek, speed, full screen, and like.

## Sub-features
- `player-playpause` — toggles playback; shows a spinner while loading.
- `player-skip` — previous / next track; auto-advance when a track ends.
- `player-seek` — scrubber bound to the audio element's real duration.
- `player-speed` — 0.5x, 1x, 1.25x, 1.5x, 2x.
- `player-like` — session-only liked toggle with a toast.

## How to get to it (user POV)
- Open `http://localhost:3000/`. The bar is pinned to the bottom of every in-app screen.

## Driving it with Playwright
Preconditions
- Dev server healthy, viewport >= `md` for the seek bar and speed control.
- Audio output is irrelevant: assert DOM/ARIA state, never sound. A headless `audio.play()` may be rejected, but the store's `isPlaying` still flips.

- **Initial state.** Scoped to `[data-slot="player-bar"]`, the bar shows `Come Together` / `The Beatles` and the primary button is named `Play` (loaded but paused). There is no empty-bar state.
- **Start playback.** Click a song row in `main`; the bar's text contains the title and artist and the primary button becomes `Pause`.
- **Skip.** `Previous track` and `Next track` are enabled; `Next track` moves the bar to the next queued song.
- **Seek.** `getByRole("slider", { name: "Seek" })` (scoped to the bar): focus it and press `ArrowRight`; `aria-valuenow` increases and the elapsed label moves off `0:00`.
- **Speed.** Hover or focus the `1x` button; the menu (plain buttons in the same group) becomes visible. Click `1.5x`; the trigger label becomes `1.5x`.
- **Like.** The heart's name is `Unlike` when the current song is liked, `Like` otherwise. Click it; the name flips and a sonner toast appears (`Saved to Liked Songs`, or `Removed from Liked Songs` with an `Undo` action).
- **Keyboard.** Press `Space` (with focus outside an input); the play/pause name flips.
- **Proof.** Screenshots to `artifacts/verify-player-bar/`: bar in the playing state, after liking.

## Gotchas
- Audio is a real 30-second iTunes preview fetched per title + artist, cached, falling back to the bundled `public/audio/sample.mp3` sample. It is not a synthesized tone. Do not assert sound.
- Songs 1, 3, and 5 are pre-liked, and the bar's song on first load is id 1, so the heart starts as `Unlike`. Assert whichever flip you actually observe.
- The buffering spinner only shows when `isBuffering && isPlaying`, delayed 200ms; do not assert its presence.
- The bar always renders a song (it falls back to the first song), so it never shows a "Nothing playing" placeholder.
- `like` is in-memory: a reload resets it, and it is not connected to the `Liked Songs` playlist.
- Multiple buttons share the accessible name `Play`, so every query in this recipe must be scoped to `[data-slot="player-bar"]`.
