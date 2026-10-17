# Plan 003 — Home album grid entrance stagger

**Commit:** c879eb4
**Files:** `src/app/(app)/page.tsx` (album grid render)

## Problem
Album grid appears all at once on home load — a jarring pop-in on an occasional surface.

## Fix
Add a staggered fade+scale entrance to album cards. Use CSS animation with `animation-delay` per index, gated for reduced motion and first paint only.

In the grid map, add index and style:
```tsx
<div
  key={album.id}
  className="motion-safe:animate-[sunao-fade-in_200ms_var(--ease-out)_both]"
  style={{ animationDelay: `${i * 40}ms` }}
>
```
Add keyframes in globals.css:
```css
@keyframes sunao-fade-in {
  from { opacity: 0; transform: scale(0.97); }
  to   { opacity: 1; transform: scale(1); }
}
```

Ensure `animation-fill-mode: both` so initial state is hidden (opacity 0) before animation starts. Under reduced motion, global rule sets duration 0.01ms → effectively instant. Fine.

## Verification
- Typecheck + lint.
- Home load shows stagger; navigation back to home re-triggers (acceptable).