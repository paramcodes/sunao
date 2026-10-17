import { z } from "zod";

export const SongSchema = z.object({
  id: z.number(),
  title: z.string(),
  artist: z.string(),
  album: z.string(),
  duration: z.number(),
  color: z.string(),
  artwork: z.string().optional(),
  previewUrl: z.string().optional(),
  artistId: z.number().optional(),
  albumId: z.number().optional(),
});

export type Song = z.infer<typeof SongSchema>;

export const AlbumSchema = z.object({
  id: z.string(),
  title: z.string(),
  artist: z.string(),
  year: z.number(),
  color: z.string(),
  artwork: z.string().optional(),
  songs: z.array(z.number()),
  artistId: z.number().optional(),
});

export type Album = z.infer<typeof AlbumSchema>;

export const ArtistSchema = z.object({
  id: z.string(),
  name: z.string(),
  genre: z.string().optional(),
  artwork: z.string().optional(),
});

export type Artist = z.infer<typeof ArtistSchema>;

export const PlaylistSchema = z.object({
  id: z.string(),
  name: z.string(),
  songIds: z.array(z.number()),
  cover: z.string(),
  system: z.boolean(),
});

export type Playlist = z.infer<typeof PlaylistSchema>;
