# Plan 001 — MobileProgress: width → scaleX

**Commit:** c879eb4
**File:** `src/components/layout/player-bar.tsx` (`MobileProgress`, lines 24-31)

## Problem
`MobileProgress` updates `style={{ width: `${pct}%` }}` on every position tick (~4-10Hz). Animating `width` triggers layout + paint + composite on the main thread, causing jank on low-end devices.

## Fix
Replace width animation with a compositor-only transform. Set the bar to full width and scale it horizontally.

Current:
```tsx
<div className="absolute inset-x-0 top-0 h-0.5 bg-white/10 md:hidden">
  <div className="h-full bg-white" style={{ width: `${pct}%` }} />
</div>
```

Target:
```tsx
<div className="absolute inset-x-0 top-0 h-0.5 bg-white/10 md:hidden">
  <div
    className="h-full w-full origin-left bg-white"
    style={{ transform: `scaleX(${pct / 100})` }}
  />
</div>
```

## Verification
- `pnpm typecheck`, `pnpm lint`
- Visually: progress bar still fills left→right; no layout shift.
- Playwright: mobile viewport screenshot before/after.