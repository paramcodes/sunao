import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { PLAYLISTS } from "@/lib/data/songs";
import { SITE_URL } from "@/lib/site";
import PlaylistPage from "./playlist-client";

export function generateStaticParams() {
  return PLAYLISTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params;
  const playlist = PLAYLISTS.find((p) => p.id === id);
  if (!playlist) return { title: "Playlist not found", robots: { index: false, follow: false } };
  const n = playlist.songIds.length;
  const description = `${playlist.name} playlist, ${n} tracks. Play the full list on sunao.`;
  const { openGraph: inherited } = await parent;
  return {
    title: playlist.name,
    description,
    alternates: { canonical: `/playlist/${id}` },
    openGraph: {
      ...inherited,
      title: playlist.name,
      description,
      url: `/playlist/${id}`,
      images: inherited?.images,
    },
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const playlist = PLAYLISTS.find((p) => p.id === id);
  if (!playlist) notFound();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicPlaylist",
    name: playlist.name,
    numTracks: playlist.songIds.length,
    url: `${SITE_URL}/playlist/${id}`,
  };
  const jsonLdScript = { __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") };
  return (
    <>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD, < scrubbed to \u003c */}
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript} />
      <PlaylistPage id={id} />
    </>
  );
}
