---
name: verify-sunao
description: Verify the sunao web app by launching it locally, driving the UI with Playwright, and capturing evidence. Use when asked to verify, smoke-test, or prove a sunao feature works.
---

# Verify sunao

## Launch
- Command: `pnpm dev` (Next.js dev server, Turbopack). Default base: `http://localhost:3000`.
- If port 3000 is held by a process you did not start, launch yours explicitly instead: `pnpm exec next dev --turbopack --port 3001`, and use that base in every recipe.
- Ready when: the base URL responds with HTML containing "sunao".
- For metadata/SEO checks, set `NEXT_PUBLIC_SITE_URL` to the base you serve on.
- Teardown: kill the process you started (Ctrl-C / kill the PID). Never kill by process name.

## Doctor
- `curl -s http://localhost:3000 | head` returns HTML containing "sunao".
- The port is owned by the dev server you started: `readlink /proc/$(ss -ltnp | grep ':3000' | grep -o 'pid=[0-9]*' | head -1 | cut -d= -f2)/cwd` points at your working tree.
- Build revision matches `git rev-parse HEAD` of the tree you launched.

## Drive
- Harness: Playwright (config in `playwright.config.ts`); `@playwright/test` is installed, `playwright` is not a direct dependency.
- Prefer ARIA roles and accessible names over CSS selectors, and scope them (`main`, `[data-slot="player-bar"]`, `#queue-panel-content`): the queue panel and sidebar repeat song and playlist names.
- Base URL: `http://localhost:3000` (or the port from Launch).

## Evidence
- Screenshots and ARIA snapshots go to `artifacts/verify-<feature-id>/`; server-only checks save text dumps there.
- Capture the action and the resulting state, not just the final screen.
- A passing unit test is not live-surface proof.

## Cleanup
- Kill the dev server you started. Remove scratch state only; keep evidence.

## Features
See `features/README.md` for the index, baseline preconditions, and the known product gaps, and `features/*.md` for the per-feature recipes.
