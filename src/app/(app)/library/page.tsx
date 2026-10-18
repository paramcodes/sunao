"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlaylistForm } from "@/components/features/playlist-form";
import { EmptyState } from "@/components/ui/empty-state";
import { usePlaylists } from "@/lib/queries";

export default function LibraryPage() {
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const { data: playlists = [], isError } = usePlaylists();

  return (
    <main className="scroll-pane flex-1 overflow-y-auto p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Library</h1>
        <button
          onClick={() => setCreating(true)}
          className="rounded-full bg-red-600 px-4 py-1.5 text-sm text-white transition-[background-color,transform] duration-150 ease-out hover:bg-red-700 active:scale-95"
        >
          + New playlist
        </button>
      </div>
      {creating && (
        <div className="mt-4 rounded-lg border border-white/10 bg-[var(--bg-card)] p-4">
          <PlaylistForm
            autoFocus
            onDone={() => setCreating(false)}
            onCancel={() => setCreating(false)}
          />
        </div>
      )}
      {isError ? (
        <EmptyState
          title="Couldn't load playlists"
          description="Check your connection and try again."
        />
      ) : playlists.length === 0 ? (
        <EmptyState
          title="No playlists yet"
          description="Create your first playlist to get started."
          action={
            <button
              onClick={() => setCreating(true)}
              className="rounded-full bg-red-600 px-4 py-1.5 text-sm text-white transition-colors duration-150 ease-out hover:bg-red-700 active:scale-95"
            >
              + New playlist
            </button>
          }
        />
      ) : (
        <div className="mt-6 space-y-2">
          {playlists.map((p) => (
            <button
              key={p.id}
              onClick={() => router.push(`/playlist/${p.id}`)}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors duration-150 ease-out hover:bg-white/5"
            >
              <div className="h-12 w-12 shrink-0 rounded" style={{ background: p.cover }} />
              <div>
                <p className="text-sm font-semibold">{p.name}</p>
                <p className="text-xs text-white/60">
                  {p.songIds.length} songs{p.system ? " · by sunao" : ""}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
