"use client";

import { Home, Library, ListMusic, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { QueueContent } from "@/components/layout/queue-panel";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/library", label: "Library", icon: Library },
];

export function MobileNav() {
  const pathname = usePathname();
  const [queueOpen, setQueueOpen] = useState(false);

  return (
    <>
      <nav
        data-slot="mobile-nav"
        className="flex shrink-0 items-stretch border-t border-white/5 bg-black pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors duration-150 ease-out active:scale-[0.96]",
                active ? "text-white" : "text-white/55",
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setQueueOpen(true)}
          className="flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium text-white/55 transition-colors duration-150 ease-out active:scale-[0.96]"
        >
          <ListMusic className="h-5 w-5" />
          Queue
        </button>
      </nav>

      <Sheet open={queueOpen} onOpenChange={setQueueOpen}>
        <SheetContent side="bottom" className="p-4" showCloseButton={false}>
          <SheetTitle className="sr-only">Queue</SheetTitle>
          <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-white/20" />
          <QueueContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
