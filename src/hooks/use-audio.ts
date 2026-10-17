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

    const handleWaiting = () => usePlayer.getState().setBuffering(true);
    const handleReady = () => usePlayer.getState().setBuffering(false);
    const handleDuration = () => {
      const current = audioRef.current;
      if (!current) return;
      const value = current.duration;
      usePlayer.getState().setDuration(Number.isFinite(value) ? value : null);
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
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handleReady);
    audio.addEventListener("canplay", handleReady);
    audio.addEventListener("loadeddata", handleReady);
    audio.addEventListener("error", handleReady);
    audio.addEventListener("loadedmetadata", handleDuration);
    audio.addEventListener("durationchange", handleDuration);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handleReady);
      audio.removeEventListener("canplay", handleReady);
      audio.removeEventListener("loadeddata", handleReady);
      audio.removeEventListener("error", handleReady);
      audio.removeEventListener("loadedmetadata", handleDuration);
      audio.removeEventListener("durationchange", handleDuration);
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
      usePlayer.getState().setBuffering(false);
      usePlayer.getState().setDuration(null);
      return;
    }
    const requestId = currentSongId;
    let cancelled = false;
    usePlayer.getState().setBuffering(true);
    usePlayer.getState().setDuration(null);
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
      void audio.play().catch(() => {});
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
    const limit = Number.isFinite(audio.duration) ? audio.duration : position;
    const target = Math.min(position, limit);
    if (Math.abs(audio.currentTime - target) > 0.01) {
      audio.currentTime = target;
    }
  }, [position]);

  return;
}

export default useAudio;
