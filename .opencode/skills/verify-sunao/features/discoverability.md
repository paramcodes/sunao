# Discoverability

Per-route metadata, `robots.txt`, `sitemap.xml`, generated share images, and playlist structured data. This one is verified against the server, not the UI.

## Sub-features
- `seo-metadata` — every route has a unique `<title>`, description, absolute canonical, and Open Graph / Twitter tags.
- `seo-noindex` — `/library`, `/login`, and `/signup` emit `noindex`; unknown playlist ids are `noindex, nofollow`.
- `seo-robots` — `/robots.txt` allows crawling, disallows `/auth/`, and advertises the sitemap.
- `seo-sitemap` — `/sitemap.xml` lists the indexable routes and excludes the `noindex` ones.
- `seo-share-image` — the `og:image` URL resolves with an image content type (`next/og`, 1200x630).
- `seo-jsonld` — `/playlist/<id>` emits `MusicPlaylist` JSON-LD.

## How to get to it (user/bot POV)
- A crawler or a link unfurler fetches the HTML head, `/robots.txt`, `/sitemap.xml`, and the share image.

## Driving it with Playwright (or curl)
Preconditions
- Dev server healthy, started with `NEXT_PUBLIC_SITE_URL` set to the origin you are serving, e.g. `NEXT_PUBLIC_SITE_URL=http://localhost:3001 pnpm exec next dev --turbopack --port 3001`. The default `SITE_URL` is the production Vercel origin, so canonical checks fail against localhost without it.

- **Run the project's SEO check.** `node scripts/check-seo.mjs [base]` (default `http://localhost:3001`; there is no npm alias). It exits 0 only when every check passes and prints `N/N checks passed against <base>`.
- **The raw requests it makes**, if you need to inspect a failure:
  - `curl -s -D - <base>/robots.txt`
  - `curl -s <base>/sitemap.xml`
  - `curl -s <base>/ | grep -Eo '<title>[^<]*</title>|<link rel="canonical"[^>]*>|<meta property="og:[^"]*"[^>]*>'`
  - `curl -s <base>/library | grep -io '<meta name="robots" content="noindex[^"]*"'`
  - `IMG=$(curl -s <base>/ | grep -o 'property="og:image" content="[^"]*"' | sed 's/.*content="//;s/"//'); curl -s -o /dev/null -w '%{http_code} %{content_type}\n' "$IMG"`
  - `curl -s <base>/playlist/p1 | grep -o '"@type":"[^"]*"'`
- **Assert.** Each route returns 200 with a unique title/description; canonicals are absolute and start with `<base>`; `og:image` resolves 200 with an image content type; `/robots.txt` has `User-agent: *` and a `Sitemap:` line; `/sitemap.xml` contains `/`, `/search`, and `/playlist/p1` and excludes `/library`, `/login`, `/signup`; the `noindex` routes emit the robots meta; `/playlist/p1` has ≥1 JSON-LD block with `@context` and `@type: MusicPlaylist`.
- **Proof.** Text dumps, not screenshots, in `artifacts/verify-discoverability/`: `check-seo.txt`, `robots.txt`, `sitemap.xml`, `home.html`, `library.html`, `playlist-p1.html`.

## Gotchas
- Without `NEXT_PUBLIC_SITE_URL`, `metadataBase` points at the Vercel origin, so absolute-canonical assertions fail against a local server while the pages themselves look correct.
- `og:image` is a generated route (`/opengraph-image?...`), so assert its content type after resolving the URL from the head; do not hardcode the hashed path.
- The playlist JSON-LD type is `MusicPlaylist`, not `MusicRecording`.
