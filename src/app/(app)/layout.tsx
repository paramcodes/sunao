import { MobileNav } from "@/components/layout/mobile-nav";
import { PlayerBar } from "@/components/layout/player-bar";
import { QueuePanel } from "@/components/layout/queue-panel";
import { Sidebar } from "@/components/layout/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <div id="main-content" tabIndex={-1} className="contents">
          {children}
        </div>
        <QueuePanel />
      </div>
      <PlayerBar />
      <MobileNav />
    </div>
  );
}
