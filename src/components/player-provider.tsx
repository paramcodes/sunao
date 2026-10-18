"use client";

import { useEffect } from "react";
import { useAudio } from "@/hooks/use-audio";
import { useSongs } from "@/lib/queries";
import { usePlayer } from "@/stores/player";

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  useAudio();
  const { data: songs = [] } = useSongs();
  const queueLength = usePlayer((s) => s.queue.length);
  const setQueue = usePlayer((s) => s.setQueue);

  useEffect(() => {
    if (queueLength === 0 && songs.length > 0) {
      setQueue(songs.map((song) => song.id));
    }
  }, [queueLength, songs, setQueue]);

  return <>{children}</>;
}
