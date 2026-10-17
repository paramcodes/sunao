---
name: verify-sunao
description: Verify the sunao web app by launching it locally, driving the UI with Playwright, and capturing evidence. Use when asked to verify, smoke-test, or prove a sunao feature works.
---

# Verify sunao

## Launch
- Command: `pnpm dev` (Next.js dev server, Turbopack).
- Ready when: `http://localhost:3000` responds (log line "Ready in").
- Teardown: kill the process you started (Ctrl-C / kill the PID). Never kill by process name.

## Doctor
- `curl -s http://localhost:3000 | head` returns HTML containing "sunao".
- Port 3000 owned by the dev server you started.
- Build revision matches `git rev-parse HEAD`.

## Drive
- Harness: Playwright (config in `playwright.config.ts`).
- Prefer ARIA roles/accessible names over CSS selectors.
- Base URL: `http://localhost:3000`.

## Evidence
- Screenshots and ARIA snapshots go to `artifacts/<feature-id>/`.
- Capture the action and the resulting state, not just the final screen.
- A passing unit test is not live-surface proof.

## Cleanup
- Kill the dev server you started. Remove scratch state only; keep evidence.

## Features
See `features/README.md` for the index and `features/*.md` for recipes.
