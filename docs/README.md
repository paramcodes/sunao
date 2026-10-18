# sunao — docs

Start here. Each doc is short and decision-focused.

## Concepts (read these first)

Each one teaches a pattern this app shipped in real code, not a generic definition.

- [concepts/state-ownership.md](concepts/state-ownership.md) — who owns which state (query, store, or component) and why likes had to leave the player store.
- [concepts/persistence.md](concepts/persistence.md) — the repository seam: one port, two adapters, versioned storage, optimistic updates.
- [concepts/server-and-client.md](concepts/server-and-client.md) — where `"use client"` lives, hydration, and why metadata pages split as thin server pages.
- [concepts/audio-engine.md](concepts/audio-engine.md) — intent vs reality for playback, real duration vs metadata, latency-trimmed feedback.
- [concepts/seo-and-ai-discovery.md](concepts/seo-and-ai-discovery.md) — robots, sitemap, JSON-LD, llms.txt, and why Lighthouse is not the real metric.

## Reference

- [stack.md](stack.md) — what we use and why, per tool.
- [architecture.md](architecture.md) — app structure and data flow.
- [design-system.md](design-system.md) — tokens, components, motion rules.
- [workflows.md](workflows.md) — dev commands, tests, PR flow.
- [roadmap.md](roadmap.md) — multi-phase plan (tasks + subtasks).
- [roadmap-post-mvp.md](roadmap-post-mvp.md) — the plan after the MVP: persistence, likes, discovery.

Prototype (throwaway UI reference): `docs/prototype.html` (moved from root).
