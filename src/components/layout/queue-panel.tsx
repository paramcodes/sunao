import { Music2 } from "lucide-react";

const queue = [
  { id: 1, title: "Crimson Tide", artist: "The Hollows" },
  { id: 3, title: "Ember", artist: "Lowlight" },
  { id: 5, title: "Scarlet Letter", artist: "June Park" },
];

export function QueuePanel() {
  return (
    <aside className="hidden w-72 shrink-0 flex-col border-l border-white/5 bg-[#181818] p-4 lg:flex">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white/60">Now playing</h3>
      </div>
      <div className="mb-5 flex items-center gap-3 rounded-lg bg-white/5 p-3">
        <div className="h-12 w-12 shrink-0 rounded-md bg-red-900" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Crimson Tide</p>
          <p className="truncate text-xs text-white/50">The Hollows</p>
        </div>
      </div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white/60">Queue</h3>
        <span className="text-xs text-white/40">{queue.length} songs</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {queue.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-white/5">
            <span className="w-5 text-right text-xs tabular-nums text-white/40">{i + 1}</span>
            <div className="h-8 w-8 shrink-0 rounded bg-white/10" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{s.title}</p>
              <p className="truncate text-xs text-white/50">{s.artist}</p>
            </div>
          </div>
        ))}
      </div>
      <Music2 className="mt-4 h-4 w-4 self-end text-white/20" />
    </aside>
  );
}
