export type Song = {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: number;
  color: string;
};

export type Playlist = {
  id: string;
  name: string;
  songIds: number[];
  cover: string;
  system: boolean;
};
