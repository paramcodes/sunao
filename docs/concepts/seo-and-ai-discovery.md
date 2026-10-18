# Concept: SEO and AI discovery

The app ships HTML that search and answer engines can consume without executing the player.
This page records what exists, and the part people usually skip: how to measure it for real.

## What is shipped

| Surface | File | What it does |
|---|---|---|
| Base metadata | `src/app/layout.tsx` | title + description for every route without its own |
| Per-route metadata | `src/app/about/page.tsx` | canonical URL, OpenGraph title/description |
| `robots.txt` | `src/app/robots.ts` | allow/deny rules per crawler, sitemap pointer |
| `sitemap.xml` | `src/app/sitemap.ts` | `/`, `/search`, `/about`, every bundled `/playlist/[id]` |
| Structured data | `src/app/about/about-client.tsx` | `FAQPage` + `WebApplication` JSON-LD |
| AI-friendly summary | `public/llms.txt`, `public/llms-full.txt` | what the app is, for answer engines |
| Feature index | `public/features.md` | plain-text feature list |

Two robots decisions are opinionated and easy to miss:

- **AI search crawlers (OAI-SearchBot, PerplexityBot, Claude-SearchBot) are explicitly
  allowed.** Being quotable in answers is discovery.
- **Model-training crawlers (GPTBot, ClaudeBot, Google-Extended) are denied — by default.**
  Being *quoted* and being *trained on* are different consents. Flip each to opt in; these
  are your terms to set.

The JSON-LD lives on the page as `<script type="application/ld+json">` and mirrors the
visible FAQ — structured data must not contradict what a human reads, which is why the
schema is derived from single source of truth (`FAQ`) and cannot drift.

## Lighthouse is not the metric

Chasing the Lighthouse SEO number tells you whether the app *can* rank; it won't tell you
whether it *is* ranked. It checked "indexable" and passed 100/100 while the site was
unindexed (SPA first paint, seed URLs unknown). Real SEO is a funnel:

1. **Crawlability** — robots allows it, links resolve server-side, `sitemap.xml` lists URLs
   crawlers can't guess from links alone. Check: `curl /robots.txt`,
   `curl /sitemap.xml`.
2. **Indexability** — canonical URLs, one `<h1>`, descriptive titles per route.
   Check: `curl` the page's HTML and read the `<head>`.
3. **Indexing** — Google knows the page. This is only measurable in
   [Google Search Console](https://search.google.com/search-console): verify the domain,
   submit `/sitemap.xml`, and watch the Coverage report (indexed / discovered / excluded).
4. **Queries and clicks** — GSC's Performance report. Weeks of signal, not minutes.

Lighthouse is a preflight for step 1-2. GSC is the scoreboard. The rest is waiting.

Submit the sitemap on Search Console *before* you consider SEO done — shipping HTML that can
be crawled is the cheapest half of the work.
