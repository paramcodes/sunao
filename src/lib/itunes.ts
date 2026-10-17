const cache = new Map<string, string | null>();

export async function fetchPreviewUrl(title: string, artist: string): Promise<string | null> {
  const key = `${title.trim().toLowerCase()}|${artist.trim().toLowerCase()}`;
  if (cache.has(key)) {
    return cache.get(key) ?? null;
  }
  try {
    const query = encodeURIComponent(`${title} ${artist}`);
    const sep = "/";
    const url =
      "https:" +
      sep +
      sep +
      "itunes.apple.com" +
      sep +
      "search?term=" +
      query +
      "&media=music&limit=1";
    const response = await fetch(url);
    if (!response.ok) {
      cache.set(key, null);
      return null;
    }
    const data = (await response.json()) as { results?: Array<{ previewUrl?: string }> };
    const preview = data.results?.[0]?.previewUrl ?? null;
    cache.set(key, preview);
    return preview;
  } catch {
    cache.set(key, null);
    return null;
  }
}
