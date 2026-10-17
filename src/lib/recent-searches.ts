const RECENT_SEARCHES_KEY = "sunao:recent_searches:v1";
const MAX_RECENT_SEARCHES = 10;

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(term: string): string[] {
  const cleaned = term.trim();
  if (!cleaned) return getRecentSearches();
  const current = getRecentSearches();
  const next = [
    cleaned,
    ...current.filter((item) => item.toLowerCase() !== cleaned.toLowerCase()),
  ].slice(0, MAX_RECENT_SEARCHES);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("sunao:recent-searches"));
    } catch {}
  }
  return next;
}

export function removeRecentSearch(term: string): string[] {
  const current = getRecentSearches();
  const next = current.filter((item) => item.toLowerCase() !== term.toLowerCase());
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("sunao:recent-searches"));
    } catch {}
  }
  return next;
}

export function clearRecentSearches(): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(RECENT_SEARCHES_KEY);
      window.dispatchEvent(new CustomEvent("sunao:recent-searches"));
    } catch {}
  }
}
