# Workflows

## Dev
- `pnpm dev` — run dev server (Turbopack).
- `pnpm build` — production build.
- `pnpm start` — run production build.

## Quality
- `pnpm typecheck` — TypeScript strict check.
- `pnpm lint` / `pnpm lint:fix` — Biome check / autofix.
- `pnpm format` — Biome format.
- `pnpm check:comments` — comment allowlist check.
- `pnpm test` / `pnpm test:watch` — Vitest.
- `pnpm test:e2e` — Playwright.

## Git
- Pre-commit (Husky + lint-staged): Biome on staged files.
- Commit message: conventional commits (`feat:`, `fix:`, `chore:`, ...).
- One focused change per commit so reverts stay cheap.

## PR flow
- Push branch, open PR. CI must pass (typecheck, lint, comments, test, build).
- After CI green, squash-merge. Delete branch.
- For big phases: raise PR, attach screenshot/gif/video (UI) or perf stats (backend), auto-merge if CI green.

## Verification skill
- First phase: run `/create-verification-skill` to generate the feature map.
- Later phases: run `/maintain-verification-skill` to keep it honest.
- Feature map diagram lives in README.md and is updated each phase.
