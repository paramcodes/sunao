"use client";

const FAQ = [
  {
    q: "What is sunao?",
    a: "sunao is a Spotify-like music player for the web, built with Next.js 16 and React 19. It streams 30-second previews from the iTunes Search API, shows album artwork, and supports search, playlists, a virtualized queue, and playback speed control. It runs with or without a Supabase backend.",
  },
  {
    q: "Does sunao require a backend?",
    a: "No. With the Supabase environment variables unset, sunao runs on static seed data with in-memory playlists and no authentication.",
  },
  {
    q: "What audio does sunao play?",
    a: "30-second previews from the iTunes Search API (no API key required), cached per title and artist, falling back to a bundled sample tone.",
  },
  {
    q: "Is sunao free?",
    a: "sunao is a free demo/portfolio project. There is no pricing and no paid tiers.",
  },
  {
    q: "How do I run sunao locally?",
    a: "Prerequisites: Node 20+ and pnpm 12+. Run pnpm install, then cp .env.example .env.local (optional), then pnpm dev, and open http://localhost:3000.",
  },
  {
    q: "Does sunao work on mobile?",
    a: "Yes. It has a bottom navigation bar, a compact player bar, and a mobile queue bottom sheet, with safe-area padding.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "sunao",
  description: "A Spotify-like music player for the web.",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function AboutClient() {
  return (
    <main className="scroll-pane flex-1 overflow-y-auto p-4 sm:p-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />

      <h1 className="text-2xl font-bold">About sunao</h1>

      <section className="mt-6 max-w-3xl space-y-4">
        <h2 className="text-lg font-semibold">What is sunao?</h2>
        <p className="text-sm leading-relaxed text-white/80">
          sunao is a Spotify-like music player for the web, built with Next.js 16 and React 19. It
          streams 30-second previews from the iTunes Search API, shows album artwork from the iTunes
          CDN, and supports search, playlists, a virtualized queue, and playback speed control. It
          runs with or without a Supabase backend.
        </p>
        <p className="text-sm leading-relaxed text-white/80">
          It is a free, open demo and portfolio project: a reference implementation of a modern,
          accessible, motion-polished music player on the Next.js App Router.
        </p>
      </section>

      <section className="mt-8 max-w-3xl">
        <h2 className="text-lg font-semibold">sunao vs. Spotify</h2>
        <div className="mt-3 overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/70">
              <tr>
                <th className="px-4 py-2 font-medium">Feature</th>
                <th className="px-4 py-2 font-medium">sunao</th>
                <th className="px-4 py-2 font-medium">Spotify</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="px-4 py-2">Price</td>
                <td className="px-4 py-2">Free (demo)</td>
                <td className="px-4 py-2">Freemium / Premium</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Audio</td>
                <td className="px-4 py-2">30s iTunes previews</td>
                <td className="px-4 py-2">Full tracks</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Account required</td>
                <td className="px-4 py-2">No (optional)</td>
                <td className="px-4 py-2">Yes</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Playlists</td>
                <td className="px-4 py-2">Yes (local / Supabase)</td>
                <td className="px-4 py-2">Yes (cloud)</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Offline playback</td>
                <td className="px-4 py-2">No</td>
                <td className="px-4 py-2">Yes (Premium)</td>
              </tr>
              <tr>
                <td className="px-4 py-2">Open source</td>
                <td className="px-4 py-2">Yes (demo)</td>
                <td className="px-4 py-2">No</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 max-w-3xl">
        <h2 className="text-lg font-semibold">Frequently asked questions</h2>
        <dl className="mt-3 space-y-4">
          {FAQ.map((f) => (
            <div key={f.q} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <dt className="text-sm font-semibold">{f.q}</dt>
              <dd className="mt-1 text-sm text-white/70">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-8 max-w-3xl text-sm text-white/60">
        <h2 className="text-lg font-semibold text-white">Attribution</h2>
        <p className="mt-2">
          Preview audio and artwork come from the iTunes Search API and the iTunes CDN. sunao is a
          demo project with no pricing and no paid tiers.
        </p>
      </section>
    </main>
  );
}
