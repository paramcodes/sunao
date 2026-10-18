import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
  removeRecentSearch,
} from "./recent-searches";

describe("recent-searches", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("starts empty", () => {
    expect(getRecentSearches()).toEqual([]);
  });

  it("adds and deduplicates searches", () => {
    addRecentSearch("Beatles");
    addRecentSearch("Queen");
    addRecentSearch("beatles");

    const result = getRecentSearches();
    expect(result).toEqual(["beatles", "Queen"]);
  });

  it("limits recent searches to 10", () => {
    for (let i = 1; i <= 15; i++) {
      addRecentSearch(`Artist ${i}`);
    }
    const result = getRecentSearches();
    expect(result).toHaveLength(10);
    expect(result[0]).toBe("Artist 15");
  });

  it("removes a single term", () => {
    addRecentSearch("Radiohead");
    addRecentSearch("Nirvana");
    removeRecentSearch("radiohead");

    expect(getRecentSearches()).toEqual(["Nirvana"]);
  });

  it("clears all recent searches", () => {
    addRecentSearch("AC/DC");
    clearRecentSearches();
    expect(getRecentSearches()).toEqual([]);
  });
});
