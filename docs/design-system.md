# Design system

Source of truth: `docs/prototype.html` (throwaway UI reference, red theme).

## Tokens (CSS variables)
- `--red: oklch(0.59 0.25 27)` (primary accent, replaces Spotify green).
- `--red-dark: oklch(0.47 0.22 27)`.
- `--bg: oklch(0.14 0 0)`, `--bg-elev: oklch(0.17 0 0)`, `--bg-card: oklch(0.20 0 0)`.
- `--fg: oklch(1 0 0)`, `--fg-muted: oklch(0.72 0 0)`, `--border: oklch(0.25 0 0)`.

## Components
- shadcn/ui primitives (button, dialog, slider, input, dropdown-menu, tooltip, scroll-area, separator).
- Ghost button: transparent, rounded, border appears on hover (`.btn-ghost`).
- Primary button: solid red, white text.
- Play button: red circle with play triangle shifted right 2px for optical centering.

## Motion
- Transitions: named properties only, 100-150ms, ease-out. Never `transition: all`.
- Press: `scale(0.96)` on active (never below 0.95).
- Hover: only inside `@media (hover: hover) and (pointer: fine)`.
- Reduced motion: neutralize animations/transitions.
- Pulse on now-playing album art while playing (subtle).

## Typography
- Font smoothing: antialiased on root.
- `text-wrap: balance` on headings, `text-wrap: pretty` on body.
- `tabular-nums` on all time/number displays (no layout shift).

## Icons
- Lucide, one stroke weight (1.5) per surface, `currentColor`, outline default / fill active.
- RTL: flip directional icons only.
