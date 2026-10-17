"use client";

import { ArrowLeft, Play, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { usePlaylist, useSongs } from "@/lib/queries";
import { usePlayer } from "@/stores/player";
import type { Song } from "@/types";

export default function PlaylistPage({ params }: { params?: Promise<{ id: string }> }) {
  const { id } = use(params ?? Promise.resolve({ id: "" }));
  const router = useRouter();
  const { data: playlist, isLoading, isError } = usePlaylist(id);
  const { data: allSongs = [] } = useSongs();
  const play = usePlayer((s) => s.play);
  const setQueue = usePlayer((s) => s.setQueue);
  const [removed, setRemoved] = useState<Set<number>>(new Set());

  if (isLoading) {
    return (
      <main className="scroll-pane flex-1 overflow-y-auto p-4 sm:p-6">
        <p className="text-white/60">Loading...</p>
      </main>
    );
  }

  if (isError || !playlist) {
    return (
      <main className="scroll-pane flex-1 overflow-y-auto p-4 sm:p-6">
        <button
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors duration-150 ease-out hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <p className="text-lg font-semibold text-red-500">Playlist not found</p>
      </main>
    );
  }

  const songIds = playlist.songIds.filter((sid) => !removed.has(sid));
  const songs = songIds
    .map((sid) => allSongs.find((s) => s.id === sid))
    .filter((s): s is Song => Boolean(s));

  const playAll = () => {
    if (songs.length === 0) return;
    setQueue(songs.map((s) => s.id));
    play(songs[0]);
  };

  const remove = (songId: number) => {
    setRemoved((prev) => {
      const next = new Set(prev);
      next.add(songId);
      return next;
    });
  };

  return (
    <main className="scroll-pane flex-1 overflow-y-auto p-4 sm:p-6">
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors duration-150 ease-out hover:bg-white/5 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <div className="flex items-center gap-6">
        <div className="h-40 w-40 shrink-0 rounded-lg" style={{ background: playlist.cover }} />
        <div>
          <h1 className="text-3xl font-bold">{playlist.name}</h1>
          <p className="mt-1 text-sm text-white/60">{songs.length} songs</p>
          <button
            onClick={playAll}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-2 text-sm font-semibold text-white transition-[background-color,transform] duration-150 ease-out hover:bg-red-700 active:scale-95"
          >
            <Play className="h-4 w-4" /> Play all
          </button>
        </div>
      </div>
      {songs.length === 0 ? (
        <EmptyState title="Empty playlist" description="Add songs to get started." />
      ) : (
        <div className="mt-8 space-y-1">
          {songs.map((s, i) => (
            <div
              key={s.id}
              className="group/row flex w-full items-center gap-3 rounded px-3 py-2 transition-colors duration-150 ease-out hover:bg-white/5"
            >
              <button onClick={() => play(s)} className="flex flex-1 items-center gap-3 text-left">
                <span className="w-6 text-right text-sm tabular-nums text-white/40">{i + 1}</span>
                <div className="h-10 w-10 shrink-0 rounded" style={{ background: s.color }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.title}</p>
                  <p className="truncate text-xs text-white/50">{s.artist}</p>
                </div>
                <span className="text-xs text-white/50 tabular-nums">
                  {Math.floor(s.duration / 60)}:{String(s.duration % 60).padStart(2, "0")}
                </span>
              </button>
              <button
                onClick={() => remove(s.id)}
                aria-label="Remove"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/40 opacity-0 transition-[color,background-color,opacity,transform] duration-150 ease-out group-hover/row:opacity-100 focus-visible:opacity-100 hover:bg-white/10 hover:text-red-500 active:scale-90"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
