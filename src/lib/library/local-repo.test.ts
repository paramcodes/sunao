import { beforeEach, describe, expect, it } from "vitest";
import { createLocalRepo } from "./local-repo";
import { bundledLikedSongIds, createRepo, LIBRARY_STORAGE_KEY } from "./repo";

type StoredDoc = {
  version: number;
  playlists: { id: string; name: string; songIds: number[] }[];
  likedSongIds: number[];
};

function storedDoc(): StoredDoc | null {
  return JSON.parse(localStorage.getItem(LIBRARY_STORAGE_KEY) ?? "null") as StoredDoc | null;
}

describe("local LibraryRepo", () => {
  beforeEach(() => {
    localStorage.clear();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  });

  it("seeds from the bundled playlists when nothing is stored", async () => {
    const repo = createLocalRepo();
    expect((await repo.listPlaylists()).map((p) => p.id)).toEqual(["p1", "p2", "p3"]);
    expect(await repo.likedSongIds()).toEqual(bundledLikedSongIds());
  });

  it("createRepo selects the localStorage adapter with no backend configured", async () => {
    const created = await createRepo().createPlaylist({ name: "Chosen" });
    expect(storedDoc()?.playlists.some((p) => p.id === created.id)).toBe(true);
  });

  it("survives a new repo instance (create, rename, delete)", async () => {
    const created = await createLocalRepo().createPlaylist({ name: "Road trip" });
    expect(await createLocalRepo().getPlaylist(created.id)).toMatchObject({
      name: "Road trip",
      songIds: [],
      system: false,
    });

    await createLocalRepo().renamePlaylist(created.id, "Long drive");
    expect((await createLocalRepo().getPlaylist(created.id))?.name).toBe("Long drive");

    await createLocalRepo().deletePlaylist(created.id);
    expect(await createLocalRepo().getPlaylist(created.id)).toBeNull();
  });

  it("survives a new repo instance (song order and likes)", async () => {
    await createLocalRepo().setPlaylistSongs("p3", [11, 4]);
    expect((await createLocalRepo().getPlaylist("p3"))?.songIds).toEqual([11, 4]);

    await createLocalRepo().setLiked(2, true);
    await createLocalRepo().setLiked(1, false);
    expect(await createLocalRepo().likedSongIds()).toEqual([
      ...bundledLikedSongIds().filter((id) => id !== 1),
      2,
    ]);
  });

  it("does not duplicate a like that is set twice", async () => {
    await createLocalRepo().setLiked(6, true);
    await createLocalRepo().setLiked(6, true);
    expect(await createLocalRepo().likedSongIds()).toEqual([...bundledLikedSongIds(), 6]);
  });

  it("falls back to the bundled seed when the stored document is corrupt", async () => {
    localStorage.setItem(LIBRARY_STORAGE_KEY, "{ this is not json");
    expect((await createLocalRepo().listPlaylists()).map((p) => p.id)).toEqual(["p1", "p2", "p3"]);
  });

  it("falls back to the bundled seed when the stored document is the wrong shape", async () => {
    localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify({ version: 9, playlists: "nope" }));
    expect((await createLocalRepo().listPlaylists()).map((p) => p.id)).toEqual(["p1", "p2", "p3"]);
  });

  it("writes only version, playlists, and likes to the stored document", async () => {
    await createLocalRepo().createPlaylist({ name: "Kept" });
    expect(Object.keys(storedDoc() ?? {}).sort()).toEqual(["likedSongIds", "playlists", "version"]);
    expect(storedDoc()?.version).toBe(1);
  });
});
