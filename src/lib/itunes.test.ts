import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchItunesAlbum,
  fetchItunesArtist,
  searchItunesAlbums,
  searchItunesArtists,
  searchItunesSongs,
} from "./itunes";

describe("itunes", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("falls back to bundled songs when iTunes search fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network offline"));

    const songs = await searchItunesSongs("Beatles");
    expect(songs.length).toBeGreaterThan(0);
    expect(songs.every((s) => s.artist.toLowerCase().includes("beatles"))).toBe(true);
  });

  it("falls back to bundled albums when iTunes search fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network offline"));

    const albums = await searchItunesAlbums("Abbey Road");
    expect(albums.length).toBeGreaterThan(0);
    expect(albums[0].title).toBe("Abbey Road");
  });

  it("falls back to bundled artists when iTunes search fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network offline"));

    const artists = await searchItunesArtists("Fleetwood");
    expect(artists.length).toBe(1);
    expect(artists[0].name).toBe("Fleetwood Mac");
  });

  it("resolves bundled album directly by id without network request", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const result = await fetchItunesAlbum("a1");

    expect(result).not.toBeNull();
    expect(result?.album.title).toBe("Abbey Road");
    expect(result?.songs.length).toBe(4);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("resolves bundled artist directly by slug without network request", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const result = await fetchItunesArtist("the-beatles");

    expect(result).not.toBeNull();
    expect(result?.artist.name).toBe("The Beatles");
    expect(result?.songs.length).toBe(4);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
