# Plan 005 — break-ui fixes (pluralization, color fallback, empty guard, NaN guard)

**Commit:** c879eb4

## Changes applied
1. `queue-panel.tsx`: pluralize count (`1 song` / `N songs`).
2. `player-bar.tsx` + `queue-panel.tsx`: fallback color `#282828` when `song.color` missing.
3. `player-bar.tsx` + `queue-panel.tsx`: guard empty `SONGS` array (return null).
4. `player-bar.tsx` `SeekBar`: guard non-finite duration → fallback.

## Deferred
- Queue virtualization at 100+ rows (big; revisit if needed).
- Player-bar title fixed `sm:w-44` → `max-w` (minor; deferred).