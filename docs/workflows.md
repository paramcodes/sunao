# Workflows

## Dev
- `pnpm dev` — dev server (Turbopack).
- `pnpm build` — production build.
- `pnpm start` — run the production build.

## Quality
- `pnpm typecheck` — TypeScript strict check.
- `pnpm lint` / `pnpm lint:fix` — Biome check / autofix.
- `pnpm format` — Biome format.
- `pnpm check:comments` — comment allowlist check.
- `node scripts/check-seo.mjs [url]` — audits a running server for per-route metadata, `robots.txt`, `sitemap.xml`, and share images (default `http://localhost:3000`).
- `pnpm test` / `pnpm test:watch` — Vitest (unit and component).
- `pnpm test:e2e` — Playwright. The config starts `pnpm dev` on :3000 and reuses an existing server if one is already up.

## E2E specs
- `smoke` — home renders.
- `queue-renders` — the desktop queue lists items.
- `queue-toggle` — the queue collapses to a rail and back, and asserts the `inert` and opacity contract.
- `reduced-motion` — transitions stay scoped to color/opacity under `prefers-reduced-motion`.
- `verify-phase4` — screenshot capture helper (writes to `artifacts/verify-phase4/`), not an assertion suite.

## README media
`scripts/capture-readme.mjs` drives a running server with Playwright and writes the screenshots plus the demo video into `artifacts/readme/`. It needs `ffmpeg` on `PATH` for the `demo.mp4` and `demo.gif` derived from `demo.webm`.

```bash
pnpm build && pnpm start          # or: pnpm dev
node scripts/capture-readme.mjs   # CAPTURE_BASE=http://localhost:3000, CAPTURE_OUT=artifacts/readme
```

`CAPTURE_SHOTS=0` records only the video. Screenshots are 1280×720 (mobile 390×844 at 2x); the video is 1280×720.

## Git
- Pre-commit (Husky + lint-staged): Biome on staged files.
- Commit message: conventional commits (`feat:`, `fix:`, `chore:`, ...).
- One focused change per commit so reverts stay cheap.

## PR flow
- Push the branch, open a PR. CI must pass (typecheck, lint, comments, test, build).
- After CI is green, squash-merge and delete the branch.
- For UI phases, attach a screenshot, GIF, or video to the PR.

## Verification
- The verification skill lives at `.opencode/skills/verify-sunao/`. Its `features/` map has recipes for driving the app.
- Regenerate the README media with the capture script above when the UI changes.
