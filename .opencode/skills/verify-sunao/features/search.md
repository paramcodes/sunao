# Search

The user types into one box and the song library filters client-side by title or artist, with an empty state when nothing matches.

## Sub-features
- `search-filter` — case-insensitive substring match against title OR artist; an empty query shows every song.
- `search-empty` — "No results" / "Try a different search term." when the query matches nothing.
- `search-play` — clicking a result queues the current (filtered) results and plays that song.

## How to get to it (user POV)
- Open `http://localhost:3000/search` (sidebar or bottom-nav `Search`).

## Driving it with Playwright
Preconditions
- Dev server healthy. No auth and no Supabase needed.

- **Load search.** `page.goto("/search")`. The `Search` heading is visible and `getByPlaceholder("What do you want to listen to?")` is visible and empty. With an empty query the full list is shown, e.g. `getByRole("main").getByRole("button", { name: /Come Together/ })`.
- **Filter by title.** `box.fill("sun")`; `Here Comes the Sun` is visible and `Come Together` is not.
- **Filter by artist.** `box.fill("beatles")`; several results whose row text contains `The Beatles` are visible.
- **Empty state.** `box.fill("zzzzzzzz")`; `No results` and `Try a different search term.` are visible and no result buttons remain.
- **Restore.** `box.fill("")`; the full list returns.
- **Play a result.** Filter to one song, click its row, and the player bar shows that song with the toggle as `Pause`.
- **Proof.** Screenshots to `artifacts/verify-search/`: default list, filtered results, empty state.

## Gotchas
- Scope result assertions to `main`. The queue panel lists every song too, so `Come Together` is visible even while the search list has filtered it out.
- The input has no label or `aria-label`; address it by placeholder. The results are not a listbox, just buttons.
