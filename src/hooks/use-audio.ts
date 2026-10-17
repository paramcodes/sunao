import { useEffect, useRef } from "react";
import { SONGS } from "@/lib/data/songs";
import { fetchPreviewUrl } from "@/lib/itunes";
import { usePlayer } from "@/stores/player";

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastUpdateRef = useRef(0);

  const currentSongId = usePlayer((state) => state.currentSongId);
  const isPlaying = usePlayer((state) => state.isPlaying);
  const speed = usePlayer((state) => state.speed);
  const position = usePlayer((state) => state.position);

  useEffect(() => {
    if (typeof Audio === "undefined") return;
    const audio = new Audio();
    audioRef.current = audio;

    const handleEnded = () => {
      usePlayer.getState().next();
    };

    const handleTimeUpdate = () => {
      const current = audioRef.current;
      if (!current) return;
      const now = Date.now();
      if (now - lastUpdateRef.current < 250) return;
      lastUpdateRef.current = now;
      usePlayer.getState().seek(current.currentTime);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const song =
      currentSongId === null ? null : (SONGS.find((item) => item.id === currentSongId) ?? null);
    if (!song) {
      audio.src = "";
      return;
    }
    const requestId = currentSongId;
    let cancelled = false;
    void (async () => {
      const previewUrl = await fetchPreviewUrl(song.title, song.artist);
      if (cancelled) return;
      if (usePlayer.getState().currentSongId !== requestId) return;
      audio.pause();
      audio.src = previewUrl ?? "/audio/sample.mp3";
      audio.load();
      if (usePlayer.getState().isPlaying) {
        void audio.play().catch(() => {});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentSongId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      void audio.play();
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (Math.abs(audio.currentTime - position) > 0.01) {
      audio.currentTime = position;
    }
  }, [position]);

  return;
}

export default useAudio;
