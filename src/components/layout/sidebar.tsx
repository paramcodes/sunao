import { Home, Library, Plus, Search } from "lucide-react";

const playlists = ["Liked Songs", "Late Night Drives", "Workout"];

export function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 flex-col gap-2 bg-black p-4 lg:flex">
      <div className="mb-4 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 font-black">
          S
        </div>
        <span className="text-lg font-bold tracking-tight">sunao</span>
      </div>
      <nav className="flex flex-col gap-1">
        <button className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-white/70 hover:bg-white/5 hover:text-white">
          <Home className="h-[18px] w-[18px]" /> Home
        </button>
        <button className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-white/70 hover:bg-white/5 hover:text-white">
          <Search className="h-[18px] w-[18px]" /> Search
        </button>
        <button className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-white/70 hover:bg-white/5 hover:text-white">
          <Library className="h-[18px] w-[18px]" /> Your Library
        </button>
      </nav>
      <div className="mt-4 flex-1 overflow-y-auto border-t border-white/5 pt-4">
        <p className="mb-2 px-2 text-xs uppercase tracking-wider text-white/40">Playlists</p>
        {playlists.map((p) => (
          <button
            key={p}
            className="w-full truncate rounded px-2 py-1.5 text-left text-sm text-white/70 hover:bg-white/5 hover:text-white"
          >
            {p}
          </button>
        ))}
        <button className="mt-1 w-full rounded px-2 py-1.5 text-left text-sm text-red-400 hover:bg-white/5">
          <Plus className="mr-1 inline h-4 w-4" /> New playlist
        </button>
      </div>
    </aside>
  );
}
