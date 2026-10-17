# Player bar

The bottom player bar shows the current song, play/pause, prev/next, seek, speed, and like.

## Sub-features
- `player-playpause` toggles playback.
- `player-seek` drags the scrubber.
- `player-speed` changes playback rate.
- `player-like` toggles liked state.

## How to get to it (user POV)
- Open `http://localhost:3000/`. The bar is at the bottom.

## Driving it with Playwright
Preconditions:
- sunao dev server healthy at `http://localhost:3000`.

- **Play/pause.** Click the play button. The icon switches to pause.
- **Seek.** Drag the range input. Position updates.
- **Speed.** Hover the speed button, pick a rate. Label updates.
- **Like.** Click the heart. It fills.

## Gotchas
- Audio is a placeholder tone; position advances with real playback.
- Seek uses the audio element's currentTime.
