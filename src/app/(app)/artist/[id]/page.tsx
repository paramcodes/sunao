"use client";

import { ArrowLeft, Disc3, Mic2, Music, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchItunesArtist } from "@/lib/itunes";
import { usePlayer } from "@/stores/player";
import type { Album, Artist, Song } from "@/types";

const SKELETON_ROWS = [1, 2, 3, 4, 5];

export default function ArtistDetailPage({
  params,
}: {
  params?: { id: string } | Promise<{ id: string }>;
}) {
  const resolvedParams = params && "then" in params ? use(params) : params;
  const id = resolvedParams?.id ?? "";
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ artist: Artist; songs: Song[]; albums: Album[] } | null>(null);

  const play = usePlayer((s) => s.play);
  const setQueue = usePlayer((s) => s.setQueue);
  const registerSongs = usePlayer((s) => s.registerSongs);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setData(null);

    void fetchItunesArtist(id)
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setData(null);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="scroll-pane flex-1 overflow-y-auto p-4 sm:p-6">
        <Skeleton className="mb-4 h-8 w-24" />
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <Skeleton className="h-36 w-36 shrink-0 rounded-full" />
          <div className="space-y-3 text-center sm:text-left">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-2 h-9 w-28 rounded-full" />
          </div>
        </div>
        <div className="mt-8 space-y-2">
          {SKELETON_ROWS.map((i) => (
            <Skeleton key={`row-${i}`} className="h-12 w-full rounded" />
          ))}
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="scroll-pane flex-1 overflow-y-auto p-4 sm:p-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <EmptyState
          title="Artist not found"
          description="We couldn't locate this artist. Check the link or try searching again."
          action={
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-full bg-red-600 px-4 py-1.5 text-sm text-white transition-colors hover:bg-red-700 active:scale-95"
            >
              Go back
            </button>
          }
        />
      </main>
    );
  }

  const { artist, songs, albums } = data;

  const playTopSongs = () => {
    if (songs.length === 0) return;
    registerSongs(songs);
    setQueue(songs.map((s) => s.id));
    play(songs[0]);
  };

  const handlePlaySong = (song: Song) => {
    registerSongs(songs);
    setQueue(songs.map((s) => s.id));
    play(song);
  };

  return (
    <main className="scroll-pane flex-1 overflow-y-auto p-4 sm:p-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-full bg-white/10 shadow-2xl sm:h-44 sm:w-44">
          {artist.artwork ? (
            <Image
              src={artist.artwork}
              alt={artist.name}
              fill
              sizes="176px"
              priority
              className="object-cover"
            />
          ) : (
            <Mic2 className="m-auto h-16 w-16 text-white/40" />
          )}
        </div>
        <div className="text-center sm:text-left">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
            Artist
          </span>
          <h1 className="mt-1 text-2xl font-bold sm:text-4xl">{artist.name}</h1>
          <p className="mt-1 text-sm text-white/60">{artist.genre ?? "Artist"}</p>
          {songs.length > 0 && (
            <button
              type="button"
              onClick={playTopSongs}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-[background-color,transform] hover:bg-red-700 active:scale-95"
            >
              <Play className="h-4 w-4 fill-white" /> Play
            </button>
          )}
        </div>
      </div>

      {songs.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-bold">Top Songs</h2>
          <div className="space-y-1">
            {songs.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handlePlaySong(s)}
                className="song-row group flex w-full items-center gap-3 rounded px-3 py-2 text-left transition-colors duration-150 hover:bg-white/5"
              >
                <span className="w-5 text-right text-xs tabular-nums text-white/40 group-hover:hidden">
                  {i + 1}
                </span>
                <Play className="hidden h-3.5 w-3.5 text-white group-hover:block" />
                <div
                  className="relative h-10 w-10 shrink-0 overflow-hidden rounded"
                  style={{ background: s.color }}
                >
                  {s.artwork ? (
                    <Image
                      src={s.artwork}
                      alt={s.title}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    <Music className="m-auto h-4 w-4 text-white/30" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.title}</p>
                  <p className="truncate text-xs text-white/50">{s.album}</p>
                </div>
                <span className="text-xs tabular-nums text-white/50">
                  {Math.floor(s.duration / 60)}:{String(s.duration % 60).padStart(2, "0")}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {albums.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-bold">Albums</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {albums.map((album) => (
              <Link
                key={album.id}
                href={`/album/${album.id}`}
                className="group rounded-2xl bg-[var(--bg-card)] p-3 text-left transition-colors duration-150 hover:bg-[var(--bg-elev)]"
              >
                <div
                  className="relative mb-2 aspect-square w-full overflow-hidden rounded-lg"
                  style={{ background: album.color }}
                >
                  {album.artwork ? (
                    <Image
                      src={album.artwork}
                      alt={album.title}
                      fill
                      sizes="180px"
                      className="object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <Disc3 className="m-auto h-8 w-8 text-white/30" />
                  )}
                </div>
                <p className="truncate text-sm font-semibold">{album.title}</p>
                <p className="truncate text-xs text-white/60">
                  {album.year ? album.year : "Album"}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
