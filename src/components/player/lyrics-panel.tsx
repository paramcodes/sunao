"use client";

import { Music2 } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useSongs } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/stores/player";
import type { Song } from "@/types";

export type LyricLine = {
  time: number;
  text: string;
};

const PLACEHOLDER_LYRICS: Record<number, LyricLine[]> = {
  1: [
    { time: 0, text: "Here come old flat top" },
    { time: 4, text: "He come groovin' up slowly" },
    { time: 8, text: "He got joo joo eyeball" },
    { time: 12, text: "He one holy roller" },
    { time: 16, text: "He got hair down to his knee" },
    { time: 20, text: "Got to be a joker, he just do what he please" },
    { time: 24, text: "Come together, right now" },
    { time: 28, text: "Over me" },
  ],
  2: [
    { time: 0, text: "Something in the way she moves" },
    { time: 5, text: "Attracts me like no other lover" },
    { time: 10, text: "Something in the way she woos me" },
    { time: 15, text: "I don't wanna leave her now" },
    { time: 20, text: "You know I believe and how" },
    { time: 25, text: "Somewhere in her smile she knows" },
    { time: 30, text: "That I don't need no other lover" },
  ],
  3: [
    { time: 0, text: "Here comes the sun, doo-da-doo-doo" },
    { time: 5, text: "Here comes the sun, and I say" },
    { time: 10, text: "It's alright" },
    { time: 14, text: "Little darlin', it's been a long, cold, lonely winter" },
    { time: 20, text: "Little darlin', it feels like years since it's been here" },
    { time: 25, text: "Here comes the sun, doo-da-doo-doo" },
    { time: 30, text: "It's alright" },
  ],
  5: [
    { time: 0, text: "Now here you go again, you say you want your freedom" },
    { time: 6, text: "Well, who am I to keep you down?" },
    { time: 11, text: "It's only right that you should play the way you feel it" },
    { time: 17, text: "Listen carefully to the sound of your loneliness" },
    { time: 23, text: "Like a heartbeat, drives you mad" },
    { time: 28, text: "In the stillness of remembering what you had" },
  ],
  8: [
    { time: 0, text: "She was more like a beauty queen from a movie scene" },
    { time: 6, text: "I said don't mind, but what do you mean, I am the one" },
    { time: 11, text: "Who will dance on the floor in the round?" },
    { time: 16, text: "She told me her name was Billie Jean as she caused a scene" },
    { time: 22, text: "Then every head turned with eyes that dreamed of being the one" },
    { time: 28, text: "Who will dance on the floor in the round" },
  ],
};

export function getPlaceholderLyrics(song: Song | null): LyricLine[] {
  if (!song) return [];
  if (PLACEHOLDER_LYRICS[song.id]) {
    return PLACEHOLDER_LYRICS[song.id];
  }
  return [
    { time: 0, text: `♪ ${song.title} ♪` },
    { time: 4, text: `Performed by ${song.artist}` },
    { time: 9, text: "Feel the rhythm moving through the air" },
    { time: 14, text: "Lost inside the melody and sound" },
    { time: 19, text: "Every beat begins to take you higher" },
    { time: 24, text: `Listening to ${song.album || song.title}` },
    { time: 29, text: "♪ Instrumental breakdown ♪" },
  ];
}

interface LyricsPanelProps {
  song?: Song | null;
  className?: string;
}

export function LyricsPanel({ song: propSong, className }: LyricsPanelProps) {
  const currentSongId = usePlayer((s) => s.currentSongId);
  const position = usePlayer((s) => s.position);
  const seek = usePlayer((s) => s.seek);
  const { data: songs = [] } = useSongs();

  const activeLineRef = useRef<HTMLButtonElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const song =
    propSong !== undefined ? propSong : (songs.find((s) => s.id === currentSongId) ?? null);
  const lyrics = useMemo(() => getPlaceholderLyrics(song), [song]);

  const activeIndex = useMemo(() => {
    if (lyrics.length === 0) return -1;
    let index = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (position >= lyrics[i].time) {
        index = i;
      } else {
        break;
      }
    }
    return index;
  }, [lyrics, position]);

  useEffect(() => {
    if (activeIndex >= 0 && activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeIndex]);

  if (!song) {
    return (
      <div
        data-slot="lyrics-panel"
        className={cn(
          "flex flex-col items-center justify-center p-8 text-center text-white/50",
          className,
        )}
      >
        <Music2 className="mb-3 h-10 w-10 text-white/20" />
        <p className="text-sm font-medium">Select a song to see lyrics</p>
      </div>
    );
  }

  return (
    <div
      data-slot="lyrics-panel"
      ref={containerRef}
      role="region"
      aria-label="Lyrics"
      className={cn(
        "scroll-pane flex flex-col items-center overflow-y-auto px-4 py-8 text-center select-none",
        className,
      )}
    >
      <div className="flex w-full max-w-xl flex-col gap-6 py-12">
        {lyrics.map((line, index) => {
          const isActive = index === activeIndex;
          const isPast = index < activeIndex;

          return (
            <button
              key={`${line.time}-${line.text}`}
              ref={isActive ? activeLineRef : null}
              type="button"
              onClick={() => seek(line.time)}
              className={cn(
                "rounded-xl px-4 py-2 text-center transition-all duration-300 ease-out",
                isActive
                  ? "scale-105 font-bold text-white text-xl sm:text-2xl drop-shadow-md"
                  : isPast
                    ? "font-medium text-white/40 text-lg hover:text-white/70 sm:text-xl"
                    : "font-medium text-white/30 text-lg hover:text-white/70 sm:text-xl",
              )}
            >
              {line.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
