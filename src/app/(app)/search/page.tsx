"use client";

import { Play, Search as SearchIcon } from "lucide-react";
import Image from "next/image";
import { useDeferredValue, useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { useSongs } from "@/lib/queries";
import { usePlayer } from "@/stores/player";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const play = usePlayer((s) => s.play);
  const setQueue = usePlayer((s) => s.setQueue);
  const { data: songs = [], isError, isLoading } = useSongs();

  const deferredQuery = useDeferredValue(q);
  const results = useMemo(() => {
    if (!deferredQuery) return songs;
    const needle = deferredQuery.toLowerCase();
    return songs.filter(
      (s) => s.title.toLowerCase().includes(needle) || s.artist.toLowerCase().includes(needle),
    );
  }, [songs, deferredQuery]);
  const isStale = q !== deferredQuery;

  return (
    <main className="scroll-pane flex-1 overflow-y-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold">Search</h1>
      <div className="mt-4 flex items-center gap-2 rounded-full bg-white/10 px-5 py-3">
        <SearchIcon className="h-4 w-4 text-white/60" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="What do you want to listen to?"
          aria-label="Search songs"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-red-500"
        />
      </div>
      {isLoading ? (
        <div className="mt-6 h-48 animate-pulse rounded-lg bg-white/5" aria-busy="true" />
      ) : isError ? (
        <EmptyState
          title="Couldn't load songs"
          description="Check your connection and try again."
        />
      ) : results.length === 0 ? (
        <EmptyState
          title="No results"
          description="Try a different search term."
          action={
            q ? (
              <button
                onClick={() => setQ("")}
                className="rounded-full bg-white/10 px-4 py-1.5 text-sm text-white transition-colors duration-150 ease-out hover:bg-white/20 active:scale-95"
              >
                Clear search
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="mt-6 space-y-1" style={{ opacity: isStale ? 0.7 : 1 }}>
          {results.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setQueue(results.map((song) => song.id));
                play(s);
              }}
              className="song-row flex w-full items-center gap-3 rounded px-3 py-2 text-left transition-colors duration-150 ease-out hover:bg-white/5"
            >
              <div
                className="relative h-10 w-10 shrink-0 overflow-hidden rounded"
                style={{ background: s.color }}
              >
                {s.artwork ? (
                  <Image src={s.artwork} alt={s.title} fill sizes="40px" className="object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{s.title}</p>
                <p className="truncate text-xs text-white/60">{s.artist}</p>
              </div>
              <span className="text-xs text-white/50 tabular-nums">
                {Math.floor(s.duration / 60)}:{String(s.duration % 60).padStart(2, "0")}
              </span>
              <Play className="h-4 w-4 text-white/40" />
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
