# Plan 006 — Deferred fixes

**Commit:** c879eb4

## Changes applied
1. Queue virtualization via `@tanstack/react-virtual` (estimateSize 44px, overscan 6) in `queue-panel.tsx`.
2. Player-bar title container `sm:w-44` → `sm:max-w-44`.
3. Speed-control dropdown hover-reveal gated behind `@media (hover: hover)` (keyboard focus-within retained).
4. Duration tokens added to `@theme`: `--duration-fast/normal/slow/drawer` (100/150/200/300ms); migrated button, play button.

## Notes
- Turbopack build hits an internal panic in this environment; webpack build (`next build --webpack`) succeeds. Not a code issue.
- Duration token migration is partial (high-traffic components); remaining `duration-100/150/200` utilities are equivalent values.