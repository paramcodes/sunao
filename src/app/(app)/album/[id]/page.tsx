"use client";

import { ArrowLeft, Disc3, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchItunesAlbum } from "@/lib/itunes";
import { usePlayer } from "@/stores/player";
import type { Album, Song } from "@/types";

const SKELETON_ROWS = [1, 2, 3, 4, 5];

export default function AlbumDetailPage({
  params,
}: {
  params?: { id: string } | Promise<{ id: string }>;
}) {
  const resolvedParams = params && "then" in params ? use(params) : params;
  const id = resolvedParams?.id ?? "";
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ album: Album; songs: Song[] } | null>(null);

  const play = usePlayer((s) => s.play);
  const setQueue = usePlayer((s) => s.setQueue);
  const registerSongs = usePlayer((s) => s.registerSongs);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setData(null);

    void fetchItunesAlbum(id)
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
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Skeleton className="h-44 w-44 shrink-0 rounded-xl" />
          <div className="space-y-3">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-4 h-9 w-28 rounded-full" />
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
          title="Album not found"
          description="We couldn't locate this album. Check the link or try searching again."
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

  const { album, songs } = data;

  const playAll = () => {
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

  const artistHref = album.artistId
    ? `/artist/${album.artistId}`
    : `/artist/${encodeURIComponent(album.artist.toLowerCase().replace(/\s+/g, "-"))}`;

  return (
    <main className="scroll-pane flex-1 overflow-y-auto p-4 sm:p-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div
          className="relative h-44 w-44 shrink-0 overflow-hidden rounded-xl shadow-2xl"
          style={{ background: album.color }}
        >
          {album.artwork ? (
            <Image
              src={album.artwork}
              alt={album.title}
              fill
              sizes="176px"
              priority
              className="object-cover"
            />
          ) : (
            <Disc3 className="m-auto h-16 w-16 text-white/30" />
          )}
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
            Album
          </span>
          <h1 className="mt-1 text-2xl font-bold sm:text-4xl">{album.title}</h1>
          <p className="mt-2 text-sm text-white/70">
            <Link href={artistHref} className="font-semibold text-white hover:underline">
              {album.artist}
            </Link>
            {album.year ? ` · ${album.year}` : ""}
            {songs.length > 0 ? ` · ${songs.length} tracks` : ""}
          </p>
          {songs.length > 0 && (
            <button
              type="button"
              onClick={playAll}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition-[background-color,transform] hover:bg-red-700 active:scale-95"
            >
              <Play className="h-4 w-4 fill-white" /> Play all
            </button>
          )}
        </div>
      </div>

      {songs.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No tracks available" description="This album has no preview tracks." />
        </div>
      ) : (
        <div className="mt-8 space-y-1">
          {songs.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handlePlaySong(s)}
              className="song-row group flex w-full items-center gap-3 rounded px-3 py-2.5 text-left transition-colors duration-150 hover:bg-white/5"
            >
              <span className="w-6 text-right text-xs tabular-nums text-white/40 group-hover:hidden">
                {i + 1}
              </span>
              <Play className="hidden h-3.5 w-3.5 text-white group-hover:block" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{s.title}</p>
                <p className="truncate text-xs text-white/50">{s.artist}</p>
              </div>
              <span className="text-xs tabular-nums text-white/50">
                {Math.floor(s.duration / 60)}:{String(s.duration % 60).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
