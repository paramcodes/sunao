import type { MetadataRoute } from "next";
import { PLAYLISTS } from "@/lib/data/songs";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, priority: 1 },
    { url: `${SITE_URL}/search`, priority: 0.6 },
    { url: `${SITE_URL}/about`, priority: 0.8 },
    ...PLAYLISTS.map((p) => ({ url: `${SITE_URL}/playlist/${p.id}`, priority: 0.7 })),
  ];
}
