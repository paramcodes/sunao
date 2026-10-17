import { z } from "zod";

export const SongSchema = z.object({
  id: z.number(),
  title: z.string(),
  artist: z.string(),
  album: z.string(),
  duration: z.number(),
  color: z.string(),
  artwork: z.string().optional(),
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
});

export type Album = z.infer<typeof AlbumSchema>;

export const PlaylistSchema = z.object({
  id: z.string(),
  name: z.string(),
  songIds: z.array(z.number()),
  cover: z.string(),
  system: z.boolean(),
});

export type Playlist = z.infer<typeof PlaylistSchema>;
