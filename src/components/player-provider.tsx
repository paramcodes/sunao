"use client";

import { useAudio } from "@/hooks/use-audio";

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  useAudio();
  return <>{children}</>;
}
