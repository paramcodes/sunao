import { cn } from "@/lib/utils";

export function Kbd({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "inline-flex h-4 min-w-4 items-center justify-center rounded-[4px] border border-background/20 bg-background/10 px-1 font-sans text-[10px] font-medium text-background",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
