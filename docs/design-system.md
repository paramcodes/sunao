# Design system

Source of truth: `docs/prototype.html` (throwaway UI reference, red theme).

## Tokens (CSS variables)
- `--red: oklch(0.59 0.25 27)` (primary accent, replaces Spotify green) and `--red-dark: oklch(0.47 0.22 27)`.
- Surfaces: `--bg: oklch(0.14 0 0)`, `--bg-elev: oklch(0.17 0 0)`, `--bg-card: oklch(0.20 0 0)`.
- Text: `--foreground: oklch(0.985 0 0)`, `--fg-muted: oklch(0.72 0 0)`.
- Border: `--border: oklch(1 0 0 / 10%)` (dark theme). The shadcn `--background` / `--card` / `--primary` variables live alongside these in `globals.css`.

## Components
- shadcn/ui primitives on Base UI (button, dialog, sheet, slider, input, tooltip, kbd, skeleton, empty-state).
- Ghost button: transparent, rounded, border appears on hover (`.btn-ghost`).
- Primary button: solid red, white text.
- Play button: red circle with play triangle shifted right 2px for optical centering.

## Motion
- Easing tokens: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` (enters/exits and press feedback), `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)` (on-screen movement), `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)`. These override Tailwind's weak built-in `ease-out`/`ease-in-out` utilities.
- Transitions: named properties only, 100-150ms, `ease-out`. Never `transition: all`.
- Press: `scale(0.96)` on active (never below 0.95).
- Hover: only inside `@media (hover: hover) and (pointer: fine)` (sticky hover on touch).
- Tooltips: Base UI tooltip on player controls; content shows the action and its shortcut (`<Kbd>`). The provider sets `delay={0}`, so tooltips open immediately.
- Buffering: the play button swaps to a spinner (`Loader2`) while audio is loading. The flag is debounced 200ms (`use-delayed-flag.ts`) so a preview that loads instantly never flashes.
- Stagger: the home album grid fades and scales in with a 40ms per-item delay (`sunao-fade-in`), so a cold load reads as content arriving rather than a pop.
- Like: the heart scales to 1.25 for 200ms on like (a small pop that confirms the tap), then settles; removal raises an Undo toast instead.
- Mobile: below `lg`, a bottom nav replaces the sidebar and the queue opens in a bottom sheet (`ui/sheet.tsx`, side `bottom`, slide + backdrop fade). The player bar keeps art, transport, and like; the seek bar and speed control appear from `md` up, and a 2px progress line sits on the player's top edge on mobile.
- Collapsible panels: a panel that collapses narrows to a rail rather than unmounting, so its toggle never becomes unreachable. The rail button is a `PanelRightClose`/`PanelRightOpen` icon pair, the content fades out as the panel narrows over `--duration-drawer`, and the collapsed content goes `inert` instead of being removed from the DOM.
- Toasts: `sonner`, themed to the `#1f1f1f` surface and offset above the player bar (higher on mobile to clear the nav). Removing a liked song offers an **Undo** action; saving just confirms. The Undo is the part that earns the toast — the heart alone already confirms a save.
- Loading and empty: the home route renders a skeleton layout (pulse) that matches the real grid, and empty states fade in over 240ms with `sunao-fade-in`.
- Reduced motion: keep opacity/color feedback, drop movement (`transition-property` scoped, durations shortened).
- Pulse on now-playing album art while playing (subtle).

## Typography
- Sans: **Figtree** (Google Fonts, via `next/font`) — closest free match to Spotify's Circular Std. Mono: Geist Mono.
- Wired through `--font-figtree` → `--font-sans` in `globals.css`; `font-sans` is applied on `body`.
- Font smoothing: antialiased on root.
- `text-wrap: balance` on headings, `text-wrap: pretty` on body.
- `tabular-nums` on all time/number displays (no layout shift).

## Scrollbars
- `.scroll-pane` on every scrollable region (main content, queue, sidebar): thin, transparent track, translucent rounded thumb that brightens on hover. Overrides the native default look.

## Icons
- Lucide, one stroke weight (1.5) per surface, `currentColor`, outline default / fill active.
- RTL: flip directional icons only.
