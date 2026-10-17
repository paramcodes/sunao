import { Music2 } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center motion-safe:animate-[sunao-fade-in_240ms_var(--ease-out)_both]">
      <Music2 className="h-10 w-10 text-white/20" />
      <p className="text-sm font-semibold text-white/70">{title}</p>
      {description && <p className="text-xs text-white/40">{description}</p>}
    </div>
  );
}
