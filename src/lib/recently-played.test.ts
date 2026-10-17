import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { addRecentlyPlayed, clearRecentlyPlayed, getRecentlyPlayed } from "./recently-played";

describe("recently-played", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  const sampleSong1 = {
    id: 1,
    title: "Come Together",
    artist: "The Beatles",
    album: "Abbey Road",
    duration: 258,
    color: "#1a1a2e",
  };

  const sampleSong2 = {
    id: 2,
    title: "Something",
    artist: "The Beatles",
    album: "Abbey Road",
    duration: 182,
    color: "#1a1a2e",
  };

  it("starts empty", () => {
    expect(getRecentlyPlayed()).toEqual([]);
  });

  it("records played songs in most recent order", () => {
    addRecentlyPlayed(sampleSong1);
    addRecentlyPlayed(sampleSong2);

    const history = getRecentlyPlayed();
    expect(history).toHaveLength(2);
    expect(history[0].id).toBe(2);
    expect(history[1].id).toBe(1);
  });

  it("deduplicates played songs and moves replayed song to front", () => {
    addRecentlyPlayed(sampleSong1);
    addRecentlyPlayed(sampleSong2);
    addRecentlyPlayed(sampleSong1);

    const history = getRecentlyPlayed();
    expect(history).toHaveLength(2);
    expect(history[0].id).toBe(1);
    expect(history[1].id).toBe(2);
  });

  it("clears recently played songs", () => {
    addRecentlyPlayed(sampleSong1);
    clearRecentlyPlayed();
    expect(getRecentlyPlayed()).toEqual([]);
  });
});
