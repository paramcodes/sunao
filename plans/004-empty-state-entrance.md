# Plan 004 — Empty state entrance

**Commit:** c879eb4
**File:** `src/components/ui/empty-state.tsx`

## Fix
Add a subtle fade+translate entrance for rare/first-time empty states (delight budget).

```tsx
<div className="flex flex-col items-center justify-center gap-2 py-16 text-center motion-safe:animate-[sunao-fade-in_240ms_var(--ease-out)_both]">
```

Keyframes `sunao-fade-in` already defined in globals.css (plan 003). Under reduced motion, global rule sets duration 0.01ms → instant.