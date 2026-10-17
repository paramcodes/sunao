"use client";

import { useEffect, useState } from "react";
import { SongSchema } from "@/lib/schemas";
import type { Song } from "@/types";

const RECENTLY_PLAYED_KEY = "sunao:recently_played:v1";
const MAX_RECENTLY_PLAYED = 20;

export function getRecentlyPlayed(): Song[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENTLY_PLAYED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        const res = SongSchema.safeParse(item);
        return res.success ? res.data : null;
      })
      .filter((s): s is Song => s !== null);
  } catch {
    return [];
  }
}

export function addRecentlyPlayed(song: Song): Song[] {
  if (typeof window === "undefined") return [];
  const current = getRecentlyPlayed();
  const next = [song, ...current.filter((s) => s.id !== song.id)].slice(0, MAX_RECENTLY_PLAYED);
  try {
    window.localStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("sunao:recently-played"));
  } catch {}
  return next;
}

export function clearRecentlyPlayed(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(RECENTLY_PLAYED_KEY);
    window.dispatchEvent(new CustomEvent("sunao:recently-played"));
  } catch {}
}

export function useRecentlyPlayed(): Song[] {
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    setSongs(getRecentlyPlayed());
    const onUpdate = () => setSongs(getRecentlyPlayed());
    window.addEventListener("sunao:recently-played", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("sunao:recently-played", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  return songs;
}
