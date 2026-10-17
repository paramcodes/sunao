import { PlayerBar } from "@/components/layout/player-bar";
import { QueuePanel } from "@/components/layout/queue-panel";
import { Sidebar } from "@/components/layout/sidebar";

export default function Home() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold">Good evening</h1>
          <p className="mt-2 text-white/60">Your music, your way.</p>
        </main>
        <QueuePanel />
      </div>
      <PlayerBar />
    </div>
  );
}
