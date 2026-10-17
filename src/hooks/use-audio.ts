import { useEffect, useRef } from "react";
import { fetchPreviewUrl } from "@/lib/itunes";
import { useSongs } from "@/lib/queries";
import { usePlayer } from "@/stores/player";

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastUpdateRef = useRef(0);

  const currentSongId = usePlayer((state) => state.currentSongId);
  const isPlaying = usePlayer((state) => state.isPlaying);
  const speed = usePlayer((state) => state.speed);
  const position = usePlayer((state) => state.position);
  const volume = usePlayer((state) => state.volume);
  const isMuted = usePlayer((state) => state.isMuted);
  const { data: songs = [] } = useSongs();
  const lastLoadKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof Audio === "undefined") return;
    const audio = new Audio();
    audio.volume = Math.min(1, Math.max(0, usePlayer.getState().volume));
    audio.muted = usePlayer.getState().isMuted;
    audioRef.current = audio;

    const handleEnded = () => {
      const { repeatMode, currentSongId, queue } = usePlayer.getState();
      if (repeatMode === "one") {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          void audioRef.current.play().catch(() => {});
        }
        usePlayer.getState().seek(0);
        return;
      }

      if (currentSongId === null || queue.length === 0) return;
      const index = queue.indexOf(currentSongId);
      if (index === -1) return;

      const nextIndex = index + 1;
      if (nextIndex < queue.length) {
        usePlayer.getState().play(queue[nextIndex]);
      } else if (repeatMode === "all") {
        const nextId = queue[0];
        if (nextId === currentSongId) {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            void audioRef.current.play().catch(() => {});
          }
          usePlayer.getState().seek(0);
        } else {
          usePlayer.getState().play(nextId);
        }
      } else {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        usePlayer.setState({ isPlaying: false, position: 0 });
      }
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
      currentSongId === null ? null : (songs.find((item) => item.id === currentSongId) ?? null);
    if (!song) {
      lastLoadKeyRef.current = null;
      audio.src = "";
      usePlayer.getState().setBuffering(false);
      usePlayer.getState().setDuration(null);
      return;
    }
    const loadKey = `${currentSongId}:${songs.length}`;
    if (lastLoadKeyRef.current === loadKey) return;
    lastLoadKeyRef.current = loadKey;
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
  }, [currentSongId, songs]);

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
    audio.volume = Math.min(1, Math.max(0, volume));
    audio.muted = isMuted;
  }, [volume, isMuted]);

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
