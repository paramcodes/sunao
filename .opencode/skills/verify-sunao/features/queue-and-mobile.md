# Queue and mobile shell

The right-hand queue panel (desktop) and the bottom nav plus queue sheet (mobile), including the collapsible rail.

## Sub-features
- `queue-panel` — `Now playing` card, a live song count, and a virtualized list of queue rows.
- `queue-jump` — clicking a row (or the now-playing card) plays that song.
- `queue-collapse` — the desktop panel collapses to a 40px rail and back; the content goes `inert`.
- `mobile-nav` — Home / Search / Library links plus a `Queue` button below `lg`.
- `mobile-queue-sheet` — the `Queue` button opens the queue in a bottom sheet.

## How to get to it (user POV)
- Desktop: the queue panel is the right column at `>= lg` (1024px).
- Mobile: the bottom nav is visible below `lg`; `Queue` opens the sheet.

## Driving it with Playwright
Preconditions
- Dev server healthy. Desktop viewport 1280x800, mobile 390x844.
- The queue is seeded with all 12 songs on mount, so rows exist before anything plays.

- **Panel.** `[data-slot="queue-panel"]` and `#queue-panel-content` are visible; `#queue-panel-content button[data-index]` has at least one row; the `Now playing` heading is visible; the open panel is about 288px wide.
- **Jump from a row.** Click `#queue-panel-content button[data-index]` (first); the player bar's toggle becomes `Pause`.
- **Jump from the now-playing card.** The card is the first button inside `#queue-panel-content`; click it and the bar's toggle becomes `Pause`.
- **Collapse.** Click `Hide queue`; the panel narrows to ~40px, `#queue-panel-content` gains `inert` and `opacity: 0`, and the toggle is now `Show queue`. Click `Show queue`; the rail expands and `inert` is cleared.
- **Mobile nav.** At 390x844, `[data-slot="mobile-nav"]` is visible, the desktop panel is hidden, and its `Home` / `Search` / `Library` links are visible.
- **Mobile sheet.** Click the nav's `Queue` button; `[data-slot="sheet-content"]` is visible with the queue inside. Press `Escape`; it closes.
- **Proof.** Screenshots to `artifacts/verify-queue-and-mobile/`: queue open, collapsed rail, mobile sheet, mobile home.

## Gotchas
- The queue is virtualized: only visible rows are in the DOM, so always use `.first()` and never assert a full row count.
- Scope mobile selectors to `[data-slot="mobile-nav"]`; the sidebar also has a library link (named `Your Library`, versus the nav's `Library`).
- The collapsed panel is `opacity: 0` rather than unmounted, so visibility assertions need the width or `inert` checks, not `toBeHidden()`.
- `e2e/queue-toggle.spec.ts` already covers the desktop collapse contract (rail width, `inert`, `opacity`); reuse it rather than re-deriving the selectors.
