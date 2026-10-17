# sunao verification map

Maintained source for verifying user-facing behavior of sunao.

## Baseline preconditions
- Launch sunao at `http://localhost:3000` via `pnpm dev`.
- Run `pnpm build` first if checking production behavior.
- Never drive an instance not started by this verification run.

## Driving conventions
- Start every recipe from the baseline state.
- Prefer ARIA roles and accessible names over CSS selectors.
- Run browser actions through Playwright (`e2e/` specs or `npx playwright`).

## Proof and skip reporting
- Capture the user action and resulting state.
- UI proof includes a screenshot with the app identity visible.
- Record the feature ID with every artifact.

## Features
- [Home renders](./home-renders.md) covers the home page greeting and app shell.
- [Player bar](./player-bar.md) covers playback controls.
- [Data layer](./data-layer.md) covers songs/albums/playlists loading.
