# Home renders

The home route greets the user and shows the album grid, the song list, and the app shell (sidebar, queue panel, player bar; a bottom nav below `lg`).

## Sub-features
- `home-greeting` — time-of-day greeting heading ("Good morning" / "Good afternoon" / "Good evening"), derived from the browser clock.
- `home-shell` — sidebar, queue panel, and player bar at `>= lg`; bottom nav below `lg`.
- `home-albums` — album grid; clicking a card queues the album and plays its first song.
- `home-songs` — numbered song list; clicking a row queues every song and plays it.

## How to get to it (user POV)
- Open `http://localhost:3000/`.

## Driving it with Playwright
Preconditions
- Dev server healthy. Viewport 1280x800 for the desktop shell, ~390x844 for the mobile shell.

- **Load home.** `page.goto("/")` and wait for network idle. `getByRole("heading", { level: 1 })` matches `/Good (morning|afternoon|evening)/`.
- **Shell.** The sidebar link `Home` has `aria-current="page"`; `Search` and `Your Library` links are visible. `[data-slot="queue-panel"]` is visible with a `Now playing` heading.
- **Content.** `getByRole("button", { name: /Abbey Road/ })` is visible; the `Songs` heading is visible; scoped to `main`, `getByRole("button", { name: /Come Together/ })` is visible.
- **Play from a song row.** Click that row; `[data-slot="player-bar"]` shows `Come Together` / `The Beatles` and its toggle becomes `Pause`.
- **Play from an album card.** Click `getByRole("main").getByRole("button", { name: /Rumours/ })`; the bar shows `Dreams` / `Fleetwood Mac` (the album's first track) and the toggle becomes `Pause`.
- **Proof.** `page.screenshot({ path: "artifacts/verify-home/home-desktop.png" })` at the default state.

## Gotchas
- The player bar is never empty: the store seeds `currentSongId: 1` and the queue with every song id, so the bar shows `Come Together` paused on first load.
- Assertions on song titles must be scoped to `main`; the queue panel renders the same titles as buttons.
- The greeting is client-clock derived and wrapped in `suppressHydrationWarning`, so assert by pattern, not by a fixed string.
