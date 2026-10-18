# Design system

Source of truth: `docs/prototype.html` (throwaway UI reference, red theme).

## Tokens (CSS variables)
- `--red: oklch(0.59 0.25 27)` (primary accent, replaces Spotify green) and `--red-dark: oklch(0.47 0.22 27)`.
- Surfaces: `--bg: oklch(0.12 0 0)`, `--bg-elev: oklch(0.18 0 0)`, `--bg-card: oklch(0.24 0 0)`.
- Text: `--foreground: oklch(0.985 0 0)`, `--fg-muted: oklch(0.72 0 0)`.
- Border: `--border: oklch(1 0 0 / 10%)` (dark theme). The shadcn `--background` / `--card` / `--primary` variables live alongside these in `globals.css`; `--primary` is the red (`oklch(0.59 0.25 27)`) with white foreground, so `bg-primary` and `text-primary` resolve to the accent.

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
- Mobile: below `lg`, a bottom nav replaces the sidebar and the queue opens in a bottom sheet (`ui/sheet.tsx`, side `bottom`, slide + backdrop fade). The player bar keeps art, transport, and like; the seek bar and speed control appear from `md` up, and on mobile the player's top edge carries a draggable 1px-track seek slider (`data-slot="mobile-seek"`). Touch targets are at least 44px (nav items use `min-h-11`).
- Collapsible panels: a panel that collapses narrows to a rail rather than unmounting, so its toggle never becomes unreachable. The rail button is a `PanelRightClose`/`PanelRightOpen` icon pair, the content fades out as the panel narrows over `--duration-drawer`, and the collapsed content goes `inert` instead of being removed from the DOM.
- Toasts: `sonner`, themed to the `#1f1f1f` surface and offset above the player bar (higher on mobile to clear the nav). Removing a liked song offers an **Undo** action; saving just confirms. The Undo is the part that earns the toast — the heart alone already confirms a save.
- Loading and empty: the home route renders a skeleton layout (pulse) that matches the real grid, and empty states fade in over 240ms with `sunao-fade-in`. `EmptyState` takes an optional `action` slot — an empty state that offers the obvious next step is a feature, not a dead end.
- Reduced motion: keep opacity/color feedback, drop movement — animations are removed outright (`animation: none`) and transitions are scoped to named properties at 100ms.
- Cursors: `button { cursor: pointer }` is set once in `globals.css`; Base UI resets the native pointer, so this is the one rule to restore the affordance.
- Pulse on now-playing album art while playing (subtle).

## Typography
- Sans: **Figtree** (Google Fonts, via `next/font`) — closest free match to Spotify's Circular Std. Mono: Geist Mono.
- Wired through `--font-figtree` → `--font-sans` in `globals.css`; `font-sans` is applied on `body`.
- Font smoothing: antialiased on root.
- `text-wrap: balance` on headings, `text-wrap: pretty` on body.
- `tabular-nums` on all time/number displays (no layout shift).

### Type scale
| Role | Size | Weight | Usage |
|---|---|---|---|
| Display | `text-3xl` (30px) | bold | Hero title on a detail page (playlist name) |
| Page title | `text-2xl` (24px) | bold | Top-level heading of a route (Home greeting, Search, Library) |
| Section | `text-lg` (18px) | semibold | In-page section heading ("Songs") |
| Body | `text-sm` (14px) | medium/semibold | Row title, button label |
| Caption | `text-xs` (12px) | normal/medium | Artist, duration, meta, eyebrows (sentence case) |

Never skip a level; never introduce sizes outside this scale. Eyebrows are sentence case, not all caps.

## Scrollbars
- `.scroll-pane` on every scrollable region (main content, queue, sidebar): thin, transparent track, translucent rounded thumb that brightens on hover. Overrides the native default look.

## Long lists
- `.song-row` uses `contain: layout style` + `content-visibility: auto` with a known intrinsic height, so off-screen rows skip layout and paint — a cheap always-on virtualization for lists that don't need the full `TanStack Virtual` treatment the queue gets.

## Icons
- Lucide, one stroke weight (1.5) per surface, `currentColor`, outline default / fill active.
- RTL: flip directional icons only.
