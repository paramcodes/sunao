# Player bar

The bottom player bar shows the current song, play/pause, prev/next, seek, speed, shuffle, repeat, volume, and like.
It starts **idle** ("Nothing playing", transport disabled) until a track is played.

## Sub-features
- `player-idle` shows "Nothing playing" with disabled transport before any playback.
- `player-playpause` toggles playback.
- `player-seek` drags the desktop scrubber.
- `player-mobile-seek` drags the thin bar at the top of the bar on mobile.
- `player-speed` changes playback rate.
- `player-shuffle` context-aware queue shuffle.
- `player-repeat` 3-state repeat mode (off/all/one).
- `player-volume` slider and mute toggle.
- `player-like` toggles liked state.

## How to get to it (user POV)
- Open `http://localhost:3000/`. The bar is at the bottom, idle.

## Driving it with Playwright
Preconditions:
- sunao dev server healthy at `http://localhost:3000`.

- **Idle.** On a fresh `/`, the bar shows "Nothing playing" and the Play button is `disabled`.
  Pressing Space must not change that.
- **Start playing.** Click a song row (e.g. "Come Together") → the button becomes enabled Pause.
- **Play/pause.** Click the play button. The icon switches to pause.
- **Seek.** Drag the desktop range input. Position updates.
- **Mobile seek.** At a mobile viewport, drag `[data-slot="mobile-seek"] [data-slot="slider-thumb"]`;
  `aria-valuenow` increases.
- **Speed.** Use `[data-slot="player-bar"] div.group button` first, then dispatch a click on the rate.
- **Like.** Click the heart. It fills (appears only once a song is active).

## Gotchas
- Audio is a 30-second iTunes preview; position advances with real playback.
- Seek uses the audio element's currentTime, and the total time is the preview's duration (~0:30),
  not the song metadata duration.
- The bar is idle until `currentSongId` is set; there is no default track.
