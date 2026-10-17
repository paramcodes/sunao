# Home renders

The home page greets the user and shows the app shell (sidebar, main, queue panel, player bar).

## Sub-features
- `home-greeting` shows "Good evening".
- `home-shell` renders sidebar, main, queue panel, player bar.

## How to get to it (user POV)
- Open `http://localhost:3000/` in a browser.

## Driving it with Playwright
Preconditions:
- sunao dev server healthy at `http://localhost:3000`.
- `pnpm build` succeeds (for production check).

- **Load home.** Navigate to `/`. Run `page.goto("/")`. The page shows "Good evening".
- **Proof.** Capture screenshot. Run `page.screenshot({ path: "artifacts/verify-home/home.png" })`. The screenshot shows the greeting and app shell.

## Gotchas
- Dev server must be started before driving; never reuse an unknown instance.
- Keep evidence after cleanup.
