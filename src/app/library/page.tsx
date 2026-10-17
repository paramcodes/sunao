"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlayerBar } from "@/components/layout/player-bar";
import { QueuePanel } from "@/components/layout/queue-panel";
import { Sidebar } from "@/components/layout/sidebar";
import { usePlaylists } from "@/lib/queries";

export default function LibraryPage() {
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const { data: playlists = [] } = usePlaylists();

  const handleCreate = () => {
    if (!name.trim()) return;
    setCreating(false);
    setName("");
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Your Library</h1>
            <button
              onClick={() => setCreating(true)}
              className="rounded-full bg-red-600 px-4 py-1.5 text-sm text-white hover:bg-red-700"
            >
              + New playlist
            </button>
          </div>
          {creating && (
            <div className="mt-4 rounded-lg border border-white/10 bg-[#181818] p-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Playlist name"
                className="w-full rounded bg-white/10 px-3 py-2 text-sm outline-none"
              />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleCreate}
                  className="rounded-full bg-red-600 px-4 py-1.5 text-sm text-white hover:bg-red-700"
                >
                  Create
                </button>
                <button
                  onClick={() => setCreating(false)}
                  className="px-4 py-1.5 text-sm text-white/60"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <div className="mt-6 space-y-2">
            {playlists.map((p) => (
              <button
                key={p.id}
                onClick={() => router.push(`/playlist/${p.id}`)}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-white/5"
              >
                <div className="h-12 w-12 shrink-0 rounded" style={{ background: p.cover }} />
                <div>
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-white/60">
                    {p.songIds.length} songs{p.system ? " · system" : ""}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </main>
        <QueuePanel />
      </div>
      <PlayerBar />
    </div>
  );
}
