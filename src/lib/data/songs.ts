import type { Playlist, Song } from "@/types";

export type Album = {
  id: string;
  title: string;
  artist: string;
  year: number;
  color: string;
  artwork?: string;
  songs: number[];
};

export const SONGS: Song[] = [
  {
    id: 1,
    title: "Come Together",
    artist: "The Beatles",
    album: "Abbey Road",
    duration: 258,
    color: "#1a1a2e",
    artwork:
      "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/df/db/61/dfdb615d-47f8-06e9-9533-b96daccc029f/18UMGIM31076.rgb.jpg/600x600bb.jpg",
  },
  {
    id: 2,
    title: "Something",
    artist: "The Beatles",
    album: "Abbey Road",
    duration: 182,
    color: "#1a1a2e",
    artwork:
      "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/df/db/61/dfdb615d-47f8-06e9-9533-b96daccc029f/18UMGIM31076.rgb.jpg/600x600bb.jpg",
  },
  {
    id: 3,
    title: "Here Comes the Sun",
    artist: "The Beatles",
    album: "Abbey Road",
    duration: 185,
    color: "#1a1a2e",
    artwork:
      "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/df/db/61/dfdb615d-47f8-06e9-9533-b96daccc029f/18UMGIM31076.rgb.jpg/600x600bb.jpg",
  },
  {
    id: 4,
    title: "Octopus's Garden",
    artist: "The Beatles",
    album: "Abbey Road",
    duration: 170,
    color: "#1a1a2e",
    artwork:
      "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/df/db/61/dfdb615d-47f8-06e9-9533-b96daccc029f/18UMGIM31076.rgb.jpg/600x600bb.jpg",
  },
  {
    id: 5,
    title: "Dreams",
    artist: "Fleetwood Mac",
    album: "Rumours",
    duration: 254,
    color: "#2d4a3e",
    artwork:
      "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/d2/48/f4/d248f4ae-a7e4-a48e-1588-6617de3e8d76/mzi.izeorbmm.jpg/600x600bb.jpg",
  },
  {
    id: 6,
    title: "Go Your Own Way",
    artist: "Fleetwood Mac",
    album: "Rumours",
    duration: 223,
    color: "#2d4a3e",
    artwork:
      "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/4d/13/ba/4d13bac3-d3d5-7581-2c74-034219eadf2b/081227970949.jpg/600x600bb.jpg",
  },
  {
    id: 7,
    title: "Don't Stop",
    artist: "Fleetwood Mac",
    album: "Rumours",
    duration: 193,
    color: "#2d4a3e",
    artwork:
      "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/dd/77/35/dd773533-06a7-4566-bef4-2c43c24d08f6/603497925759.jpg/600x600bb.jpg",
  },
  {
    id: 8,
    title: "Billie Jean",
    artist: "Michael Jackson",
    album: "Thriller",
    duration: 293,
    color: "#3b1f1f",
    artwork:
      "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/32/4f/fd/324ffda2-9e51-8f6a-0c2d-c6fd2b41ac55/074643811224.jpg/600x600bb.jpg",
  },
  {
    id: 9,
    title: "Beat It",
    artist: "Michael Jackson",
    album: "Thriller",
    duration: 258,
    color: "#3b1f1f",
    artwork:
      "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/32/4f/fd/324ffda2-9e51-8f6a-0c2d-c6fd2b41ac55/074643811224.jpg/600x600bb.jpg",
  },
  {
    id: 10,
    title: "Thriller",
    artist: "Michael Jackson",
    album: "Thriller",
    duration: 358,
    color: "#3b1f1f",
    artwork:
      "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/32/4f/fd/324ffda2-9e51-8f6a-0c2d-c6fd2b41ac55/074643811224.jpg/600x600bb.jpg",
  },
  {
    id: 11,
    title: "Back In Black",
    artist: "AC/DC",
    album: "Back In Black",
    duration: 256,
    color: "#1f1f1f",
    artwork:
      "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/1e/14/58/1e145814-281a-58e0-3ab1-145f5d1af421/886443673441.jpg/600x600bb.jpg",
  },
  {
    id: 12,
    title: "You Shook Me All Night Long",
    artist: "AC/DC",
    album: "Back In Black",
    duration: 210,
    color: "#1f1f1f",
    artwork:
      "https://is1-ssl.mzstatic.com/image/thumb/Features114/v4/12/ec/14/12ec1405-f963-4f7c-b107-356fb229f091/dj.sehkbvta.jpg/600x600bb.jpg",
  },
];

export const ALBUMS: Album[] = [
  {
    id: "a1",
    title: "Abbey Road",
    artist: "The Beatles",
    year: 1969,
    color: "#1a1a2e",
    artwork:
      "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/df/db/61/dfdb615d-47f8-06e9-9533-b96daccc029f/18UMGIM31076.rgb.jpg/600x600bb.jpg",
    songs: [1, 2, 3, 4],
  },
  {
    id: "a2",
    title: "Rumours",
    artist: "Fleetwood Mac",
    year: 1977,
    color: "#2d4a3e",
    artwork:
      "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/4d/13/ba/4d13bac3-d3d5-7581-2c74-034219eadf2b/081227970949.jpg/600x600bb.jpg",
    songs: [5, 6, 7],
  },
  {
    id: "a3",
    title: "Thriller",
    artist: "Michael Jackson",
    year: 1982,
    color: "#3b1f1f",
    artwork:
      "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/32/4f/fd/324ffda2-9e51-8f6a-0c2d-c6fd2b41ac55/074643811224.jpg/600x600bb.jpg",
    songs: [8, 9, 10],
  },
  {
    id: "a4",
    title: "Back In Black",
    artist: "AC/DC",
    year: 1980,
    color: "#1f1f1f",
    artwork:
      "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/1e/14/58/1e145814-281a-58e0-3ab1-145f5d1af421/886443673441.jpg/600x600bb.jpg",
    songs: [11, 12],
  },
];

export const PLAYLISTS: Playlist[] = [
  { id: "p1", name: "Liked Songs", songIds: [1, 3, 5, 8, 10], cover: "#e50914", system: true },
  { id: "p2", name: "Late Night Drives", songIds: [2, 6, 9], cover: "#b20710", system: false },
  { id: "p3", name: "Workout", songIds: [4, 11, 1], cover: "#7f1d1d", system: false },
];

export function getSong(id: number): Song | undefined {
  return SONGS.find((song) => song.id === id);
}

export const SONG_BY_ID = new Map(SONGS.map((song) => [song.id, song]));
