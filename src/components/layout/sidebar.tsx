"use client";

import type { User } from "@supabase/supabase-js";
import { Home, Info, Library, LogIn, Plus, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PlaylistForm } from "@/components/features/playlist-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePlaylists } from "@/lib/queries";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/library", label: "Your Library", icon: Library },
  { href: "/about", label: "About", icon: Info },
];

export function Sidebar() {
  const [user, setUser] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);
  const pathname = usePathname();
  const { data: playlists = [] } = usePlaylists();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  return (
    <aside className="hidden w-56 shrink-0 flex-col gap-2 bg-black p-4 lg:flex">
      <div className="mb-4 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 font-black">
          S
        </div>
        <span className="text-lg font-bold tracking-tight">sunao</span>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition-colors duration-150 ease-out",
                active
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="h-[18px] w-[18px]" /> {label}
            </Link>
          );
        })}
      </nav>
      {!user && (
        <Link
          href="/login"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-red-400 transition-colors duration-150 ease-out hover:bg-white/5 hover:text-red-300"
        >
          <LogIn className="h-[18px] w-[18px]" /> Sign in
        </Link>
      )}
      <div className="scroll-pane mt-4 flex-1 overflow-y-auto border-t border-white/5 pt-4">
        <p className="mb-2 px-2 text-xs font-medium text-white/40">Playlists</p>
        {playlists.map((p) => {
          const active = pathname === `/playlist/${p.id}`;
          return (
            <Link
              key={p.id}
              href={`/playlist/${p.id}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "block w-full truncate rounded px-2 py-1.5 text-left text-sm transition-colors duration-150 ease-out",
                active
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white",
              )}
            >
              {p.name}
            </Link>
          );
        })}
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogTrigger
            render={
              <button className="mt-1 w-full rounded px-2 py-1.5 text-left text-sm text-red-400 transition-colors duration-150 ease-out hover:bg-white/5" />
            }
          >
            <Plus className="mr-1 inline h-4 w-4" /> New playlist
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New playlist</DialogTitle>
            </DialogHeader>
            <PlaylistForm
              autoFocus
              onDone={() => setCreating(false)}
              onCancel={() => setCreating(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </aside>
  );
}
