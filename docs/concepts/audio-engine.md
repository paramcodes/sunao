# Concept: the audio engine

One `<audio>` element, mounted once; the store is the only thing that talks to it through
`useAudio`. Reading `src/hooks/use-audio.ts` alongside this page is the point.

## Intent vs reality

The store holds *intent* — what the user asked for:

`currentSongId`, `isPlaying`, `position`, `speed`, `duration`.

The audio element is *reality* — what the browser is actually decoding. The engine's whole
job is pulling reality back into the store (playback position, real duration, buffering),
and pushing intent into the element (`src`, `play()`, `pause()`, `currentTime`, `playbackRate`).
State flows one way at a time; two components never poke the element directly.

The element is created lazily inside a client-side effect and shared through a ref, so
pages and the shell can never accidentally mount a second audio source.

## Real duration vs metadata duration

Every song row says a track is, say, 3 minutes. The app plays a 30-second iTunes preview.
The seek bar would be wrong by 150 seconds if it trusted either source blindly, so:

- the scrubber's `max` and the total-time label come from `loadedmetadata` /
  `durationchange`, stored as `duration` — reality;
- the list rows keep the metadata duration — for display only.

`max={max || 1}` guards against a 0/N duration state that would make the slider unusable.

## Sourcing the preview

`lib/itunes.ts` (`fetchPreviewUrl`) looks up the track on the iTunes Search API by title +
artist, gets a `previewUrl` (a 30s m4a — no key needed), and caches it per title + artist.
Failure is not fatal: it falls back to a bundled tone. `next/image` gets its artwork from
the same CDN, and the root layout `prefetchDNS`es both hosts.

## Latency kills small affordances

Two de-parents of "loading" state:

- **loadKey dedupe** — the loading effect keys on `${currentSongId}:${songs.length}` so a
  catalogue re-derivation (asynchronous songs list changing identity) does not restart an
  already-loading preview.
- **Buffering is debounced 200ms** (`use-delayed-flag.ts`). A preview that loads in 40ms
  never flashes a spinner. Show feedback for long work; avoid announcing work that finished
  before the user noticed it started.

## Dragging a slider without killing playback

Committing `audio.currentTime` on every input event can stop the preview mid-scrub. The
mobile seek bar keeps a *local* scrub value while dragging (`scrub` state) and only seeks
the store on `onValueCommitted` — "drag a replica, commit on release".

## Registering a listener once

The Space-bar shortcut stops working if it re-registers per render with a stale closure —
a classic React footgun. The fix is a ref that always points at the freshest callback and
an effect that registers once with `[]` (see `keyboard-shortcuts.tsx`). Copy this shape for
any global listener.
