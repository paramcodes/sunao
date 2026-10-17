import type { Playlist, Song } from "@/types";

export type Album = {
  id: string;
  title: string;
  artist: string;
  year: number;
  color: string;
  songs: number[];
};

export const SONGS: Song[] = [
  {
    id: 1,
    title: "Crimson Tide",
    artist: "The Hollows",
    album: "Afterglow",
    duration: 214,
    color: "#8b1a1a",
  },
  {
    id: 2,
    title: "Red Sky at Night",
    artist: "Maren Voss",
    album: "Horizon",
    duration: 187,
    color: "#a32020",
  },
  {
    id: 3,
    title: "Ember",
    artist: "Lowlight",
    album: "Ash & Air",
    duration: 243,
    color: "#c0392b",
  },
  {
    id: 4,
    title: "Blood Moon",
    artist: "The Hollows",
    album: "Afterglow",
    duration: 198,
    color: "#7f1d1d",
  },
  {
    id: 5,
    title: "Scarlet Letter",
    artist: "June Park",
    album: "Margins",
    duration: 221,
    color: "#991b1b",
  },
  {
    id: 6,
    title: "Rust & Gold",
    artist: "Lowlight",
    album: "Ash & Air",
    duration: 176,
    color: "#b91c1c",
  },
  {
    id: 7,
    title: "Vermilion",
    artist: "Maren Voss",
    album: "Horizon",
    duration: 205,
    color: "#dc2626",
  },
  {
    id: 8,
    title: "Heartbeat",
    artist: "June Park",
    album: "Margins",
    duration: 169,
    color: "#ef4444",
  },
  {
    id: 9,
    title: "After the Fire",
    artist: "The Hollows",
    album: "Afterglow",
    duration: 232,
    color: "#f87171",
  },
  {
    id: 10,
    title: "Quiet Riot",
    artist: "Lowlight",
    album: "Ash & Air",
    duration: 191,
    color: "#fecaca",
  },
];

export const ALBUMS: Album[] = [
  {
    id: "a1",
    title: "Afterglow",
    artist: "The Hollows",
    year: 2024,
    color: "#8b1a1a",
    songs: [1, 4, 9],
  },
  { id: "a2", title: "Horizon", artist: "Maren Voss", year: 2025, color: "#a32020", songs: [2, 7] },
  {
    id: "a3",
    title: "Ash & Air",
    artist: "Lowlight",
    year: 2023,
    color: "#c0392b",
    songs: [3, 6, 10],
  },
  { id: "a4", title: "Margins", artist: "June Park", year: 2025, color: "#991b1b", songs: [5, 8] },
];

export const PLAYLISTS: Playlist[] = [
  { id: "p1", name: "Liked Songs", songIds: [1, 3, 5, 7, 9], cover: "#e50914", system: true },
  { id: "p2", name: "Late Night Drives", songIds: [2, 6, 8], cover: "#b20710", system: false },
  { id: "p3", name: "Workout", songIds: [4, 10, 1], cover: "#7f1d1d", system: false },
];

export function getSong(id: number): Song | undefined {
  return SONGS.find((song) => song.id === id);
}

export const SONG_BY_ID = new Map(SONGS.map((song) => [song.id, song]));
