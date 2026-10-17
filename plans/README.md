# Animation & UI plans

Execution order: 001 → 002 → 003 → 004 → 005. All applied.

| # | Plan | Status |
|---|---|---|
| 001 | MobileProgress width → scaleX | Done |
| 002 | Like heart pop on save | Done |
| 003 | Home album grid stagger | Done |
| 004 | Empty state entrance | Done |
| 005 | break-ui fixes | Done |
| 006 | Deferred fixes (virtualization, max-w, hover gating, duration tokens) | Done |

Verification: `pnpm typecheck`, `pnpm lint`, `pnpm test`, Playwright smoke + reduced-motion + queue-renders — all green; `next build --webpack` succeeds.